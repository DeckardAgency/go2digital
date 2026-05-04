<template>
  <div class="lab">
    <!-- Header Section -->
    <header class="lab__header">
      <div :class="['lab__label', typoClass('label')]">
        <span class="lab__dot"></span>
        <span
          data-split-text
          data-split-type="lines"
          data-split-duration="0.5"
          data-split-stagger="0.08"
        >{{ $t('lab.breadcrumb') }}</span>
      </div>

      <p
        :class="['lab__intro', typoClass('intro')]"
        data-split-text
        data-split-type="lines"
        data-split-duration="0.6"
        data-split-delay="0.2"
        data-split-stagger="0.1"
      >{{ $t('lab.intro') }}</p>
    </header>

    <!-- Hero Section -->
    <section class="lab__hero">
      <nav class="lab__filters" aria-label="Category filters">
        <button
          v-for="category in categories"
          :key="category.slug"
          :class="['lab__filter', typoClass('filter'), { 'lab__filter--active': selectedCategory === category.slug }]"
          @click="filterByCategory(category.slug)"
        >
          <span v-if="selectedCategory === category.slug" class="lab__filter-dot"></span>
          <span>{{ category.name }}</span>
        </button>
      </nav>

      <div class="lab__title-group">
        <h1
          :class="['lab__title', typoClass('pageTitle')]"
          data-split-text
          data-split-type="chars"
          data-split-duration="0.6"
          data-split-stagger="0.03"
          data-split-delay="0.3"
        >{{ $t('lab.title') }}</h1>
        <span :class="['lab__count', typoClass('count')]">({{ filteredLabs.length }})</span>
      </div>
    </section>

    <!-- Items Section -->
    <section class="lab__items">
      <article
        v-for="lab in filteredLabs"
        :key="lab.id"
        class="lab-card"
        :data-slug="lab.slug"
        @mouseenter="onLabHover"
        @mouseleave="onLabLeave"
      >
        <div class="lab-card__link" @click="onCardClick(lab, $event)">
          <h2 :class="['lab-card__title', typoClass('cardTitle')]">{{ lab.shortTitle || lab.title }}</h2>
          <p :class="['lab-card__description', typoClass('cardDescription')]">{{ lab.subtitle }}</p>
          <ul class ="lab-card__tags">
            <li
              v-for="cat in getLabCategoryNames(lab)"
              :key="cat.slug"
              :class="['lab-card__tag', typoClass('cardTag')]"
            >{{ cat.name }}</li>
          </ul>
          <figure class="lab-card__media">
            <img
              :src="getLabImage(lab)"
              :alt="lab.title"
              loading="lazy"
            >
          </figure>
        </div>
      </article>

      <!-- Empty State -->
      <div v-if="filteredLabs.length === 0" class="lab__empty">
        <p :class="['lab__empty-text', typoClass('emptyText')]">{{ $t('lab.noResults') }}</p>
        <button class="lab__empty-action" @click="filterByCategory('')">
          {{ $t('lab.viewAll') }}
        </button>
      </div>
    </section>

    <!-- Custom Cursor (teleported to body to avoid transform issues) -->
    <Teleport to="body">
      <div ref="labCursor" class="lab-cursor">
        <span class="lab-cursor__text">{{ $t('lab.viewProject') }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { gsap } from 'gsap'
import { animateCardToDetail, playReturnToCardAnimation } from '~/composables/useCardTransition'
import type { LabProject, LabCategory } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

const { locale, t } = useI18n()

useSeo('singleton/lab-page', null, t('lab.seo.title'))

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  label: 'eyebrow',
  intro: 'hero-heading',
  filter: 'label-micro',
  pageTitle: 'display-huge',
  count: 'body-sm',
  cardTitle: 'card-title',
  cardDescription: 'body',
  cardTag: 'body-sm',
  emptyText: 'body',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['lab-list'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}

// Custom cursor ref
const labCursor = ref<HTMLElement | null>(null)

// Selected category
const selectedCategory = ref('')

// Fetch categories from API
const { data: categoriesData } = await useApi<LabCategory[]>('/api/lab_categories')

const categories = computed(() => {
  const all = { id: '', slug: '', sortOrder: 0, locale: locale.value, name: t('lab.filterAll') }
  return [all, ...(categoriesData.value ?? [])]
})

// Fetch lab projects from API — re-fetches when category changes
const categoryQuery = computed(() => {
  const query: Record<string, any> = { status: 'published', itemsPerPage: 200 }
  if (selectedCategory.value) {
    query['categories.slug'] = selectedCategory.value
  }
  return query
})

const { data: labsData } = await useApi<LabProject[]>('/api/lab_projects', {
  query: categoryQuery
})

const filteredLabs = computed(() => labsData.value ?? [])

// Helper to get lab image URL
function getLabImage(lab: LabProject): string {
  return resolveMediaUrl(lab.image, 'large') || '/images/placeholder-lab.svg'
}

// Helper to get category display name for lab.
// /api/lab_projects serializes categories as IRI strings (e.g. /api/lab_categories/{uuid}),
// so resolve each IRI against the already-fetched category list.
function getLabCategoryNames(lab: LabProject): Array<{ slug: string; name: string }> {
  const raw = lab.categories
  if (!Array.isArray(raw)) return []

  const all = categoriesData.value ?? []
  const byId = new Map(all.map(c => [c.id, c]))
  const bySlug = new Map(all.map(c => [c.slug, c]))

  return raw.flatMap((cat: any) => {
    if (cat && typeof cat === 'object' && (cat.slug || cat.id)) {
      return [{ slug: cat.slug ?? '', name: cat.name || cat.slug || '' }]
    }
    if (typeof cat === 'string') {
      const key = cat.split('/').pop() ?? ''
      const found = byId.get(key) ?? bySlug.get(key)
      if (found) return [{ slug: found.slug, name: found.name || found.slug }]
    }
    return []
  })
}

// Filter by category
function filterByCategory(slug: string) {
  selectedCategory.value = slug
}

// Custom cursor state
const isCursorVisible = ref(false)

// Initialize cursor position tracking + handle return animation
onMounted(() => {
  nextTick(() => {
    const cursor = labCursor.value
    if (cursor) {
      // Initialize cursor state
      gsap.set(cursor, {
        opacity: 0,
        scale: 0.5,
        xPercent: -50,
        yPercent: -50
      })
    }
    document.addEventListener('mousemove', moveCursor)

    // Check if returning from a detail page
    const returnSlug = sessionStorage.getItem('returnSlug')
    const returnImage = sessionStorage.getItem('returnImage')
    sessionStorage.removeItem('returnSlug')
    sessionStorage.removeItem('returnImage')

    if (returnSlug && returnImage) {
      playReturnToCardAnimation(
        returnSlug,
        returnImage,
        '.lab-card',
        '.lab-card__media img'
      )
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', moveCursor)
  isCursorVisible.value = false
  // Kill any running GSAP animations on the cursor
  const cursor = labCursor.value
  if (cursor) {
    gsap.killTweensOf(cursor)
  }
})

// Custom cursor handlers
function onCardClick(lab: LabProject, event: MouseEvent) {
  const cats = getLabCategoryNames(lab)
  animateCardToDetail(event, {
    slug: lab.slug,
    basePath: '/lab',
    image: getLabImage(lab),
    title: lab.title,
    meta: cats[0]?.name || ''
  }, '.lab-card', '.lab-card__media img')
}

function onLabHover(e: MouseEvent) {
  isCursorVisible.value = true
  const cursor = labCursor.value
  if (!cursor) return

  // Set initial position immediately (centered on cursor)
  gsap.set(cursor, {
    x: e.clientX,
    y: e.clientY,
    xPercent: -50,
    yPercent: -50
  })

  gsap.to(cursor, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: 'power2.out'
  })
}

function onLabLeave() {
  isCursorVisible.value = false
  const cursor = labCursor.value
  if (!cursor) return

  gsap.to(cursor, {
    opacity: 0,
    scale: 0.5,
    duration: 0.3,
    ease: 'power2.out'
  })
}

function moveCursor(e: MouseEvent) {
  const cursor = labCursor.value
  if (!cursor || !isCursorVisible.value) return

  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    xPercent: -50,
    yPercent: -50,
    duration: 0.15,
    ease: 'power2.out'
  })
}
</script>

<style lang="scss" scoped>
// Variables and mixins are now globally available via nuxt.config.ts
// Page-specific grid settings
$grid-columns: 12;
$grid-gap: 1.25rem;
$grid-padding: 2.5rem;
$grid-padding-mobile: 1rem;

@mixin grid-container {
  display: grid;
  grid-template-columns: repeat($grid-columns, 1fr);
  gap: $grid-gap;
  padding-left: $grid-padding;
  padding-right: $grid-padding;

  @include mobile {
    padding-left: $grid-padding-mobile;
    padding-right: $grid-padding-mobile;
  }
}

// ==========================================================================
// Block: Lab (Main Page)
// ==========================================================================
.lab {
  width: 100%;
  min-height: 100dvh;
  background-color: $color-background;
  color: $color-primary;
  contain: layout style;

  @include mobile {
    padding-top: 6rem;
    border-top: 1px solid $color-border;
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    @include grid-container;
    padding-top: 3.75rem;
    padding-bottom: $grid-padding;

    @include mobile {
      padding-top: 1.5rem;
      padding-bottom: 3rem;
      gap: 0.5rem;
    }
  }

  // ==========================================================================
  // Element: Label (Breadcrumb)
  // ==========================================================================
  &__label {
    grid-column: 1 / 4;
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
    text-transform: capitalize;

    @include mobile {
      grid-column: 1 / -1;
    }
  }

  // ==========================================================================
  // Element: Dot (Reusable)
  // ==========================================================================
  &__dot {
    width: 0.375rem;
    height: 0.375rem;
    background-color: $color-primary;
    border-radius: 50%;
    margin-top: 0.35rem;
    flex-shrink: 0;
  }

  // ==========================================================================
  // Element: Intro Text
  // ==========================================================================
  &__intro {
    grid-column: 4 / -1;
    margin: 0;

    @include mobile {
      grid-column: 1 / -1;
      font-size: calc(var(--typo-lab-intro-size, var(--typo-hero-heading-size, 1.5rem)) * 1.3);
    }
  }

  // ==========================================================================
  // Element: Hero Section
  // ==========================================================================
  &__hero {
    @include grid-container;
    align-items: end;
    padding-top: 8rem;
    padding-bottom: 5rem;

    @include tablet {
      padding-top: 4rem;
      padding-bottom: 4rem;
    }

    @include mobile {
      padding-top: 2rem;
      padding-bottom: 2.5rem;
      grid-template-rows: auto auto;
    }
  }

  // ==========================================================================
  // Element: Filters
  // ==========================================================================
  &__filters {
    grid-column: 1 / 6;
    display: flex;
    flex-wrap: wrap;
    gap: $grid-gap;

    @include mobile {
      grid-column: 1 / -1;
      grid-row: 2;
      gap: 0.5rem;
    }
  }

  // ==========================================================================
  // Element: Filter Button
  // ==========================================================================
  &__filter {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: 1px solid $color-border;
    border-radius: 999px;
    font-family: inherit;
    color: $color-primary;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:hover:not(&--active) {
      border-color: $color-primary;
    }

    // Modifier: Active state
    &--active {
      .lab__filter-dot {
        background-color: $color-accent;
      }

      span:last-child {
        opacity: 1;
      }
    }

    &:not(&--active) span:last-child {
      opacity: 0.4;
    }
  }

  &__filter-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.3s ease;
  }

  // ==========================================================================
  // Element: Title Group
  // ==========================================================================
  &__title-group {
    grid-column: 6 / -1;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 0.625rem;

    @include mobile {
      grid-column: 1 / -1;
      grid-row: 1;
      justify-content: flex-start;
    }
  }

  // ==========================================================================
  // Element: Title
  // ==========================================================================
  &__title {
    display: flex;
    margin: 0;
  }

  // ==========================================================================
  // Element: Count
  // ==========================================================================
  &__count {
    margin-bottom: auto;
  }

  // ==========================================================================
  // Element: Items Container
  // ==========================================================================
  &__items {
    display: flex;
    flex-direction: column;
  }

  // ==========================================================================
  // Element: Empty State
  // ==========================================================================
  &__empty {
    padding: 3.75rem $grid-padding;
    text-align: center;
  }

  &__empty-text {
    color: $color-muted;
    margin: 0 0 1.25rem;
  }

  &__empty-action {
    font-family: inherit;
    font-size: 1rem;
    color: $color-primary;
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.7;
    }
  }
}

// ==========================================================================
// Block: Lab Card
// ==========================================================================
.lab-card {
  position: relative;
  border-top: 1px solid $color-border;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba($color-primary, 0.02);

    .lab-card__media img {
      transform: scale(1.05);
    }
  }

  // ==========================================================================
  // Element: Link (Full card clickable)
  // ==========================================================================
  &__link {
    @include grid-container;
    grid-template-columns: 3fr 2fr 2fr 3fr;
    align-items: start;
    padding-top: 2.5rem;
    padding-bottom: 5rem;
    cursor: none;
    text-decoration: none;
    color: inherit;

    @include mobile {
      display: flex;
      flex-direction: column;
      padding-top: 0;
      padding-bottom: 0;
      cursor: pointer;
    }
  }

  // ==========================================================================
  // Element: Title
  // ==========================================================================
  &__title {
    margin: 0;

    @include mobile {
      order: 1;
      padding: 2rem 0 0;
    }
  }

  // ==========================================================================
  // Element: Description
  // ==========================================================================
  &__description {
    color: $color-muted;
    margin: 0;

    @include mobile {
      order: 2;
      padding: 1rem 0;
    }
  }

  // ==========================================================================
  // Element: Tags List
  // ==========================================================================
  &__tags {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;

    @include mobile {
      order: 3;
      flex-direction: row;
      gap: 0.75rem;
    }
  }

  // ==========================================================================
  // Element: Tag
  // ==========================================================================
  &__tag {
    // typography provided via preset
  }

  // ==========================================================================
  // Element: Media (Image container)
  // ==========================================================================
  &__media {
    margin: 0;
    border-radius: 1rem;
    overflow: hidden;

    @include mobile {
      order: 4;
      width: 10.25rem;
      margin: 2.5rem 0;
    }

    img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }
}

</style>

<!-- Global styles for teleported cursor -->
<style lang="scss">
.lab-cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  will-change: transform, opacity;

  @media (max-width: 576px) {
    display: none;
  }

  &__text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    background-color: #03120F;
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 999px;
  }
}
</style>
