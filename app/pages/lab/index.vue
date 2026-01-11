<template>
  <div class="lab-page">
    <div class="lab-page__container">
      <!-- Header -->
      <header class="lab-page__header">
        <div class="lab-page__breadcrumb">
          <span class="lab-page__breadcrumb-dot"></span>
          <span
            data-split-text
            data-split-type="lines"
            data-split-duration="0.5"
            data-split-stagger="0.08"
          >{{ $t('lab.breadcrumb') }}</span>
        </div>

        <p
          class="lab-page__intro"
          data-split-text
          data-split-type="lines"
          data-split-duration="0.6"
          data-split-delay="0.2"
          data-split-stagger="0.1"
          data-split-indent="20rem"
        >{{ $t('lab.intro') }}</p>
      </header>

      <!-- Hero Section -->
      <section class="lab-page__hero">
        <div class="lab-page__hero-row">
          <!-- Filters -->
          <div class="lab-page__filters">
            <nav class="lab-page__tags" aria-label="Category filters">
              <button
                v-for="category in categories"
                :key="category.slug"
                class="lab-page__tag"
                :class="{ 'lab-page__tag--active': selectedCategory === category.slug }"
                @click="filterByCategory(category.slug)"
              >
                <span v-if="selectedCategory === category.slug" class="lab-page__tag-dot"></span>
                <span>{{ category.title }}</span>
              </button>
            </nav>
          </div>

          <div class="lab-page__title-wrapper">
            <h1 class="lab-page__title">{{ $t('lab.title') }}</h1>
            <span class="lab-page__count">({{ filteredLabs.length }})</span>
          </div>
        </div>
      </section>

      <!-- Lab Items -->
      <section class="lab-page__items">
        <article
          v-for="lab in filteredLabs"
          :key="lab.id"
          class="lab-item"
          @mouseenter="onLabHover"
          @mouseleave="onLabLeave"
        >
          <h2 class="lab-item__title">{{ lab.shortTitle || lab.title }}</h2>

          <div class="lab-item__content-row">
            <p class="lab-item__description">{{ lab.subtitle }}</p>

            <div class="lab-item__categories">
              <span
                v-for="cat in lab.categories"
                :key="cat.slug"
                class="lab-item__category"
              >{{ cat.title }}</span>
            </div>
          </div>

          <div class="lab-item__image">
            <img
              :src="lab.image"
              :alt="lab.title"
              loading="lazy"
            >
          </div>

          <div class="lab-item__actions">
            <NuxtLink :to="`/lab/${lab.slug}`" class="lab-item__button"></NuxtLink>
          </div>
        </article>

        <!-- Empty state -->
        <div v-if="filteredLabs.length === 0" class="lab-page__empty">
          <p>{{ $t('lab.noResults') }}</p>
          <button class="lab-page__reset-link" @click="filterByCategory('')">
            {{ $t('lab.viewAll') }}
          </button>
        </div>
      </section>
    </div>

    <!-- Custom cursor -->
    <div ref="labCursor" class="lab-cursor">
      <span class="lab-cursor__text">{{ $t('lab.viewProject') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'

useHead({
  title: 'Go2Labs - Go2Digital'
})

// Custom cursor ref
const labCursor = ref<HTMLElement | null>(null)

// Categories
const categories = [
  { slug: '', title: 'Sve' },
  { slug: 'web', title: 'Web' },
  { slug: 'mobile', title: 'Mobile' },
  { slug: 'branding', title: 'Branding' },
  { slug: 'ai', title: 'AI' }
]

// Selected category
const selectedCategory = ref('')

// Mockup lab data
const labs = ref([
  {
    id: 1,
    title: 'AI-Powered Analytics Dashboard',
    shortTitle: 'AI Analytics',
    subtitle: 'Real-time data visualization with machine learning insights',
    slug: 'ai-analytics-dashboard',
    image: 'https://picsum.photos/seed/lab1/800/600',
    categories: [
      { slug: 'ai', title: 'AI' },
      { slug: 'web', title: 'Web' }
    ]
  },
  {
    id: 2,
    title: 'E-Commerce Mobile Experience',
    shortTitle: 'Mobile Shop',
    subtitle: 'Native iOS and Android shopping application with AR features',
    slug: 'mobile-shop',
    image: 'https://picsum.photos/seed/lab2/800/600',
    categories: [
      { slug: 'mobile', title: 'Mobile' }
    ]
  },
  {
    id: 3,
    title: 'Brand Identity System',
    shortTitle: 'Brand System',
    subtitle: 'Complete visual identity including logo, typography, and guidelines',
    slug: 'brand-identity',
    image: 'https://picsum.photos/seed/lab3/800/600',
    categories: [
      { slug: 'branding', title: 'Branding' }
    ]
  },
  {
    id: 4,
    title: 'Interactive Web Platform',
    shortTitle: 'Web Platform',
    subtitle: 'Modern web application with real-time collaboration features',
    slug: 'web-platform',
    image: 'https://picsum.photos/seed/lab4/800/600',
    categories: [
      { slug: 'web', title: 'Web' }
    ]
  },
  {
    id: 5,
    title: 'Smart City IoT Dashboard',
    shortTitle: 'IoT Dashboard',
    subtitle: 'Connected city infrastructure monitoring and management',
    slug: 'iot-dashboard',
    image: 'https://picsum.photos/seed/lab5/800/600',
    categories: [
      { slug: 'ai', title: 'AI' },
      { slug: 'web', title: 'Web' }
    ]
  },
  {
    id: 6,
    title: 'Fitness Tracking App',
    shortTitle: 'Fitness App',
    subtitle: 'Health and wellness mobile application with wearable integration',
    slug: 'fitness-app',
    image: 'https://picsum.photos/seed/lab6/800/600',
    categories: [
      { slug: 'mobile', title: 'Mobile' }
    ]
  }
])

// Filtered labs based on selected category
const filteredLabs = computed(() => {
  if (!selectedCategory.value) {
    return labs.value
  }
  return labs.value.filter(lab =>
    lab.categories.some(cat => cat.slug === selectedCategory.value)
  )
})

// Filter by category
function filterByCategory(slug: string) {
  selectedCategory.value = slug
}

// Custom cursor handlers
function onLabHover(e: MouseEvent) {
  const cursor = labCursor.value
  if (!cursor) return

  gsap.to(cursor, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: 'power2.out'
  })

  // Follow mouse
  document.addEventListener('mousemove', moveCursor)
  moveCursor(e)
}

function onLabLeave() {
  const cursor = labCursor.value
  if (!cursor) return

  gsap.to(cursor, {
    opacity: 0,
    scale: 0.5,
    duration: 0.3,
    ease: 'power2.out'
  })

  document.removeEventListener('mousemove', moveCursor)
}

function moveCursor(e: MouseEvent) {
  const cursor = labCursor.value
  if (!cursor) return

  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.15,
    ease: 'power2.out'
  })
}

// Cleanup
onUnmounted(() => {
  document.removeEventListener('mousemove', moveCursor)
})
</script>

<style lang="scss" scoped>
// Design tokens
$lab-color-primary: #03120F;
$lab-color-accent: #0CD459;
$lab-color-background: #ffffff;
$lab-color-border: #E5E5E5;

$lab-mobile-breakpoint: 576px;
$lab-tablet-breakpoint: 1024px;

@mixin lab-mobile {
  @media (max-width: $lab-mobile-breakpoint) {
    @content;
  }
}

@mixin lab-tablet {
  @media (max-width: $lab-tablet-breakpoint) {
    @content;
  }
}

// Lab Page Styles
.lab-page {
  width: 100%;
  min-height: 100dvh;
  background-color: $lab-color-background;
  color: $lab-color-primary;

  &__container {
    margin: 0 auto;

    @include lab-mobile {
      margin-top: 6rem;
      padding: 0;
      border-top: 0.0625rem solid $lab-color-border;
    }
  }

  // Header
  &__header {
    padding: 2.5rem;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;

    @include lab-mobile {
      padding: 1.5rem 1rem 3rem 1rem;
      gap: 0.5rem 0.5rem;
    }
  }

  &__breadcrumb {
    grid-column: 1 / 4;
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
    font-size: 0.75rem;
    text-transform: capitalize;

    @include lab-mobile {
      grid-column: 1 / 13;
    }

    &-dot {
      width: 0.375rem;
      height: 0.375rem;
      background-color: $lab-color-primary;
      border-radius: 50%;
      margin-top: 0.35rem;
      flex-shrink: 0;
    }
  }

  &__intro {
    grid-column: 4 / 13;
    font-size: 3.125rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    margin: 0;

    @include lab-tablet {
      font-size: 2rem;
    }

    @include lab-mobile {
      font-size: 1.375rem;
      line-height: 1.2;
      letter-spacing: -0.0425rem;
    }
  }

  // Hero section
  &__hero {
    padding: 8rem 2.5rem 8.75rem;

    @include lab-mobile {
      padding: 2rem 1rem 2.5rem 1rem;
    }
  }

  &__hero-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    @include lab-tablet {
      flex-direction: column;
      align-items: flex-start;
      gap: 2rem;
    }

    @include lab-mobile {
      flex-direction: column-reverse;
      align-items: flex-start;
      gap: 2rem;
    }
  }

  &__title-wrapper {
    margin-right: 12rem;
    display: flex;
    align-items: baseline;
    gap: 0.625rem;

    @include lab-mobile {
      margin-right: 0;
    }
  }

  &__title {
    font-size: 17.5rem;
    line-height: 0.8;
    letter-spacing: -1.05rem;
    font-weight: 400;
    margin: 0;

    @include lab-tablet {
      font-size: 10rem;
      letter-spacing: -0.5rem;
    }

    @include lab-mobile {
      font-size: 3.125rem;
      letter-spacing: -0.0625rem;
      line-height: 1;
    }
  }

  &__count {
    font-size: 1rem;
    line-height: 1.3;
  }

  // Filters
  &__filters {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;

    @include lab-mobile {
      width: 100%;
    }
  }

  &__tags {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;

    @include lab-mobile {
      gap: 0.25rem;
    }
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 1.25rem;
    border: 0.0625rem solid $lab-color-border;
    border-radius: 999px;
    font-size: 0.75rem;
    line-height: 1.3;
    background: transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    color: $lab-color-primary;

    &:not(&--active) span:not(.lab-page__tag-dot) {
      opacity: 0.4;
    }

    &--active {
      .lab-page__tag-dot {
        background-color: $lab-color-accent;
      }
    }

    &:hover:not(&--active) {
      border-color: $lab-color-primary;
    }

    &-dot {
      width: 0.5rem;
      height: 0.5rem;
      background-color: transparent;
      border-radius: 50%;
      transition: background-color 0.3s ease;
    }
  }

  // Items section
  &__items {
    position: relative;
    min-height: 12.5rem;
  }

  // Empty state
  &__empty {
    text-align: center;
    padding: 3.75rem;
    font-size: 1rem;
    color: rgba($lab-color-primary, 0.6);
  }

  &__reset-link {
    display: inline-block;
    margin-top: 1.25rem;
    color: $lab-color-primary;
    text-decoration: underline;
    cursor: pointer;
    background: none;
    border: none;
    font-family: inherit;
    font-size: inherit;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.7;
    }
  }
}

// Lab Item
.lab-item {
  display: grid;
  grid-template-columns: 3fr 2fr 3fr 2fr;
  gap: 2rem;
  padding: 2.5rem 2.5rem 5rem 2.5rem;
  border-top: 0.0625rem solid $lab-color-border;
  align-items: start;
  cursor: none;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba($lab-color-primary, 0.02);

    .lab-item__image img {
      transform: scale(1.05);
    }
  }

  @include lab-mobile {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    cursor: pointer;
  }

  &__title {
    font-size: 2.125rem;
    line-height: 1.2;
    letter-spacing: -0.0425rem;
    color: $lab-color-primary;
    font-weight: 400;
    margin: 0;

    @include lab-mobile {
      order: 1;
      padding: 2rem 1rem 0;
    }
  }

  &__content-row {
    display: contents;

    @include lab-mobile {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      order: 2;
      padding: 1rem;
      width: 100%;
    }
  }

  &__description {
    font-size: 1rem;
    line-height: 1.3;
    opacity: 0.4;
    margin: 0;

    @include lab-mobile {
      padding: 0;
      flex: 1;
    }
  }

  &__categories {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    @include lab-mobile {
      padding: 0;
      flex: 1;
    }
  }

  &__category {
    font-size: 1rem;
    line-height: 1.3;

    @include lab-mobile {
      font-size: 0.75rem;
    }
  }

  &__image {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    position: relative;

    @include lab-mobile {
      order: 4;
      width: 10.25rem;
      margin: 2.5rem 1rem 2.5rem;
    }

    img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 2rem;

    @include lab-mobile {
      order: 3;
      padding: 0 1rem;
      gap: 2rem;
    }
  }

  &__button {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 1;
  }
}

// Custom Cursor
.lab-cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
  will-change: transform, opacity;

  @include lab-mobile {
    display: none;
  }

  &__text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    background-color: $lab-color-primary;
    color: #FAFAFA;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 999px;
  }
}
</style>
