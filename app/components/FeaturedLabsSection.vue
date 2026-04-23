<template>
  <section class="featured-labs">
    <div class="featured-labs__container">
      <!-- Header Section -->
      <div class="featured-labs__header">
        <!-- Label -->
        <div class="featured-labs__label">
          <span class="featured-labs__label-dot"></span>
          <span :class="['featured-labs__label-text', typoClass('label')]">{{ sectionLabel }}</span>
        </div>

        <!-- Title Row -->
        <div class="featured-labs__title-row">
          <div class="featured-labs__title-wrapper">
            <h1
              :class="['featured-labs__title', typoClass('title')]"
            >
              {{ sectionTitle }}
            </h1>
            <span :class="['featured-labs__count', typoClass('count')]">({{ labItems.length }})</span>
          </div>

          <div class="featured-labs__button-wrapper">
            <BtnAnimated
              :text="sectionButtonText"
              :to="sectionButtonUrl"
              variant="on-light"
              size="small"
            />
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="featured-labs__description">
        <p :class="['featured-labs__text', typoClass('text')]">
          {{ sectionDescription }}
        </p>
      </div>
    </div>

    <!-- Lab Cards (same layout as /lab page) -->
    <div class="featured-labs__items">
      <article
        v-for="(item, index) in labItems"
        :key="index"
        class="featured-labs__card"
      >
        <NuxtLink :to="`/lab/${item.slug}`" class="featured-labs__card-link">
          <h2 :class="['featured-labs__card-title', typoClass('cardTitle')]">{{ item.title }}</h2>
          <p :class="['featured-labs__card-description', typoClass('cardDescription')]">{{ item.subtitle }}</p>
          <ul class="featured-labs__card-tags">
            <li v-for="(cat, i) in item.categories" :key="i" :class="['featured-labs__card-tag', typoClass('cardTag')]">{{ cat }}</li>
          </ul>
          <figure class="featured-labs__card-media">
            <img :src="item.image" :alt="item.title" loading="lazy">
          </figure>
        </NuxtLink>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { LabProject } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

const { t, locale } = useI18n()

// Fetch from the smart endpoint (handles auto/manual mode on the API side)
const { data: featuredData } = useApi<{ mode: string; projects: LabProject[] }>('/api/homepage/featured-labs', { lazy: true, server: false })

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  label: 'eyebrow-tight',
  title: 'featured-labs-title',
  count: 'number-responsive',
  text: 'body-sm',
  cardTitle: 'card-title',
  cardDescription: 'body-sm',
  cardTag: 'card-tag',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['featured-labs'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}

// Fetch section text settings
const { data: settingsData } = useApi<any[]>('/api/settings?group=homepage', { lazy: true, server: false })

function getSetting(key: string): string {
  const settings = Array.isArray(settingsData.value) ? settingsData.value : (settingsData.value as any)?.['hydra:member'] ?? []
  const s = settings.find((s: any) => s.key === key)
  if (!s?.value) return ''
  // Translation value: { hr: '...', en: '...' }
  if (s.value[locale.value]) return s.value[locale.value]
  // Simple value: { value: '...' }
  if (s.value.value !== undefined) return s.value.value
  return ''
}

const sectionLabel = computed(() => getSetting('homepage.featuredLabs.label') || t('homepage.featuredLabs.label'))
const sectionTitle = computed(() => getSetting('homepage.featuredLabs.title') || t('homepage.featuredLabs.title'))
const sectionDescription = computed(() => getSetting('homepage.featuredLabs.description') || t('homepage.featuredLabs.description'))
const sectionButtonText = computed(() => getSetting('homepage.featuredLabs.buttonText') || t('homepage.featuredLabs.buttonText'))
const sectionButtonUrl = computed(() => getSetting('homepage.featuredLabs.buttonUrl') || '/lab')

const labItems = computed(() => {
  const projects = featuredData.value?.projects ?? []
  if (projects.length > 0) {
    return projects.map(project => ({
      title: project.shortTitle || project.title || '',
      slug: project.slug || '',
      subtitle: project.subtitle || '',
      categories: Array.isArray(project.categories)
        ? project.categories.map((c: any) => c.name || c.slug || c)
        : [],
      image: resolveMediaUrl(project.image, 'medium') || `/images/lab-item-1.jpg`
    }))
  }
  // Fallback
  return [
    { title: 'Interactive Billboard', slug: 'interactive-billboard', subtitle: t('homepage.featuredLabs.items.item1.subtitle'), categories: ['Interactive', 'DOOH'], image: '/images/lab-item-1.jpg' },
    { title: 'AR Experience', slug: 'ar-experience', subtitle: t('homepage.featuredLabs.items.item2.subtitle'), categories: ['Augmented Reality', 'Mobile'], image: '/images/lab-item-2.jpg' },
    { title: 'Dynamic Content', slug: 'dynamic-content', subtitle: t('homepage.featuredLabs.items.item3.subtitle'), categories: ['Real-time', 'Data-driven'], image: '/images/lab-item-3.jpg' },
  ]
})
</script>

<style lang="scss" scoped>
// ==========================================================================
// Featured Labs Section
// Showcase of lab projects with header, description, and item list
// ==========================================================================

// Component-specific variables
// --------------------------------------------------------------------------
$labs-bg: #FAFAFA;
$labs-border-color: #D9D9D9;
$labs-text-color: $color-primary;
$labs-muted-opacity: 0.4;
$labs-dot-size: 6px;

.featured-labs {
  width: 100%;
  position: relative;
  border-top: 1px solid $labs-border-color;
  background-color: $labs-bg;
  z-index: $z-sticky + 10;

  // ==========================================================================
  // Element: Container
  // ==========================================================================
  &__container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: $spacing-xl $spacing-xl 5rem;
    gap: 3.75rem;
    align-content: center;

    @include tablet {
      padding: $spacing-lg;
      gap: $spacing-xl;
    }
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;

    @include tablet {
      gap: $spacing-lg;
    }
  }

  // ==========================================================================
  // Element: Label
  // ==========================================================================
  &__label {
    @include flex-start;
    gap: $spacing-xs;
  }

  &__label-dot {
    width: $labs-dot-size;
    height: $labs-dot-size;
    background-color: $labs-text-color;
    border-radius: $radius-full;
  }

  &__label-text {
    color: $labs-text-color;
    text-transform: capitalize;
  }

  // ==========================================================================
  // Element: Title Row
  // ==========================================================================
  &__title-row {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    align-items: center;

    @include tablet {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-lg;
    }
  }

  &__title-wrapper {
    grid-column: 1 / 9;
    display: flex;
    gap: 0.625rem;

    @include desktop {
      grid-column: 1 / 10;
    }

    @include tablet {
      grid-column: 1 / -1;
    }
  }

  &__title {
    color: $labs-text-color;
    margin: 0;
  }

  &__count {
    color: $labs-text-color;
  }

  // ==========================================================================
  // Element: Button
  // ==========================================================================
  &__button-wrapper {
    grid-column: 11 / -1;

    @include desktop {
      grid-column: 10 / -1;
    }

    @include tablet {
      width: 100%;
      max-width: 17.5rem;
    }
  }

  // ==========================================================================
  // Element: Description
  // ==========================================================================
  &__description {
    grid-column: 1 / 4;
    display: flex;
    align-items: flex-start;

    @include desktop {
      grid-column: 1 / 5;
    }

    @include tablet {
      grid-column: 1 / -1;
    }
  }

  &__text {
    color: $labs-text-color;
    opacity: $labs-muted-opacity;
    margin: 0;
  }

  // ==========================================================================
  // Element: Items Container
  // ==========================================================================
  &__items {
    color: $labs-text-color;
  }
}

// ==========================================================================
// Lab Item Component
// ==========================================================================
// Lab card — same layout as /lab page
.featured-labs__card {
  border-top: 1px solid $labs-border-color;
  transition: background-color $transition-base;

  @include hover {
    background-color: rgba($labs-text-color, 0.02);

    .featured-labs__card-media img {
      transform: scale(1.05);
    }
  }

  &-link {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 3fr;
    align-items: start;
    padding: 2.5rem $spacing-xl 5rem;
    cursor: pointer;
    text-decoration: none;
    color: inherit;

    @include tablet {
      display: flex;
      flex-direction: column;
      padding: 0;
    }
  }

  &-title {
    color: $labs-text-color;
    margin: 0;

    @include tablet { order: 1; padding: $spacing-xl $spacing-md 0; }
  }

  &-description {
    color: $labs-text-color;
    opacity: $labs-muted-opacity;
    margin: 0;

    @include tablet { order: 2; padding: $spacing-md; }
  }

  &-tags {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    list-style: none;
    margin: 0;
    padding: 0;

    @include tablet { order: 3; flex-direction: row; gap: 0.75rem; padding: 0 $spacing-md; }
  }

  &-tag {
    color: $labs-text-color;
  }

  &-media {
    margin: 0;
    border-radius: $radius-xl;
    overflow: hidden;
    background-color: rgba($labs-text-color, 0.05);

    @include tablet { order: 4; width: 10.25rem; margin: $spacing-xl $spacing-md; }

    img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      transition: transform $transition-slow;
    }
  }
}
</style>
