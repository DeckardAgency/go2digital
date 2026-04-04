<template>
  <section class="featured-labs">
    <div class="featured-labs__container">
      <!-- Header Section -->
      <div class="featured-labs__header">
        <!-- Label -->
        <div class="featured-labs__label">
          <span class="featured-labs__label-dot"></span>
          <span class="featured-labs__label-text">{{ $t('homepage.featuredLabs.label') }}</span>
        </div>

        <!-- Title Row -->
        <div class="featured-labs__title-row">
          <div class="featured-labs__title-wrapper">
            <h1
              class="featured-labs__title"
              data-split-text
              data-split-type="lines"
              data-split-duration="1.2"
              data-split-y="80"
              data-split-stagger="0.10"
            >
              {{ $t('homepage.featuredLabs.title') }}
            </h1>
            <span class="featured-labs__count">({{ labItems.length }})</span>
          </div>

          <div class="featured-labs__button-wrapper">
            <NuxtLink to="/lab" class="featured-labs__button">
              <span class="featured-labs__button-text">{{ $t('homepage.featuredLabs.buttonText') }}</span>
              <span class="featured-labs__button-icon">
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 0.5L13.5 5.5L8.5 10.5M13 5.5H0.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="featured-labs__description">
        <p class="featured-labs__text">
          {{ $t('homepage.featuredLabs.description') }}
        </p>
      </div>
    </div>

    <!-- Lab Items -->
    <div class="featured-labs__items">
      <article
        v-for="(item, index) in labItems"
        :key="index"
        class="lab-item"
      >
        <div class="lab-item__header">
          <h2 class="lab-item__title">{{ item.title }}</h2>
          <div class="lab-item__actions">
            <NuxtLink :to="`/lab/${item.slug}`" class="lab-item__button">
              <span class="lab-item__button-icon lab-item__button-icon--arrow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 15L15 5M15 5H8M15 5V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </NuxtLink>
          </div>
        </div>

        <p class="lab-item__description">{{ item.subtitle }}</p>

        <div class="lab-item__categories">
          <span
            v-for="(category, catIndex) in item.categories"
            :key="catIndex"
            class="lab-item__category"
          >
            {{ category }}
          </span>
        </div>

        <div class="lab-item__image">
          <img :src="item.image" :alt="item.title" loading="lazy">
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HomepageFeaturedLabItem } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

const { t } = useI18n()

const { data: featuredLabItems } = await useApi<HomepageFeaturedLabItem[]>('/api/homepage_featured_lab_items')

// Default fallback items
const defaultItems = [
  {
    title: 'Interactive Billboard',
    slug: 'interactive-billboard',
    subtitle: t('homepage.featuredLabs.items.item1.subtitle'),
    categories: ['Interactive', 'DOOH'],
    image: '/images/lab-item-1.jpg'
  },
  {
    title: 'AR Experience',
    slug: 'ar-experience',
    subtitle: t('homepage.featuredLabs.items.item2.subtitle'),
    categories: ['Augmented Reality', 'Mobile'],
    image: '/images/lab-item-2.jpg'
  },
  {
    title: 'Dynamic Content',
    slug: 'dynamic-content',
    subtitle: t('homepage.featuredLabs.items.item3.subtitle'),
    categories: ['Real-time', 'Data-driven'],
    image: '/images/lab-item-3.jpg'
  }
]

const labItems = computed(() => {
  if (featuredLabItems.value && featuredLabItems.value.length > 0) {
    return featuredLabItems.value.map((item, index) => ({
      title: item.title ?? defaultItems[index]?.title ?? '',
      slug: item.slug ?? defaultItems[index]?.slug ?? '',
      subtitle: item.subtitle ?? defaultItems[index]?.subtitle ?? '',
      categories: item.categories ?? defaultItems[index]?.categories ?? [],
      image: resolveMediaUrl(item.image, 'medium') || defaultItems[index]?.image || ''
    }))
  }
  return defaultItems
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
$labs-title-size-desktop: 5.375rem;
$labs-title-size-wide: 4.5rem;
$labs-title-size-desktop-small: 4rem;
$labs-title-size-tablet: 3.5rem;
$labs-title-size-mobile: 2.5rem;
$labs-title-size-small: 2rem;
$labs-count-size: 1.25rem;
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
    font-size: $font-size-sm;
    line-height: 0.9;
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
    font-size: $labs-title-size-desktop;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.03em;
    color: $labs-text-color;
    margin: 0;

    @include wide {
      font-size: $labs-title-size-wide;
    }

    @include desktop {
      font-size: $labs-title-size-desktop-small;
    }

    @include tablet {
      font-size: $labs-title-size-mobile;
    }

    @include mobile {
      font-size: $labs-title-size-small;
    }
  }

  &__count {
    font-size: $labs-count-size;
    font-weight: 400;
    line-height: 1.3;
    color: $labs-text-color;

    @include mobile {
      font-size: $font-size-base;
    }
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

  &__button {
    @include flex-center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    background-color: $labs-text-color;
    color: $labs-bg;
    border-radius: $radius-full;
    text-decoration: none;
    font-size: $font-size-sm;
    transition: opacity $transition-base;

    @include hover {
      opacity: 0.9;
    }
  }

  &__button-text {
    white-space: nowrap;
  }

  &__button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
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
    font-size: $font-size-base;
    line-height: 1.3;
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
.lab-item {
  display: grid;
  grid-template-columns: 3fr 2fr 3fr 2fr;
  gap: $spacing-xl;
  padding: $spacing-xl $spacing-xl 3rem;
  border-top: 1px solid $labs-border-color;
  align-items: start;
  transition: background-color $transition-base;

  @include hover {
    background-color: rgba($labs-text-color, 0.02);

    .lab-item__image img {
      transform: scale(1.05);
    }
  }

  @include tablet {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    display: contents;

    @include tablet {
      display: contents;
    }
  }

  // ==========================================================================
  // Element: Title
  // ==========================================================================
  &__title {
    font-size: 2.125rem;
    line-height: 1.2;
    letter-spacing: -0.0425rem;
    color: $labs-text-color;
    font-weight: 400;
    margin: 0;

    @include tablet {
      order: 1;
      padding: $spacing-xl $spacing-md 0;
    }
  }

  // ==========================================================================
  // Element: Actions
  // ==========================================================================
  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-xl;

    @include tablet {
      order: 5;
      display: none;
    }
  }

  &__button {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    font-size: $font-size-base;
    line-height: 1.3;
    color: $labs-text-color;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  &__button-icon {
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &--arrow {
      transform: rotate(0deg);
    }
  }

  // ==========================================================================
  // Element: Description
  // ==========================================================================
  &__description {
    font-size: $font-size-base;
    line-height: 1.3;
    opacity: $labs-muted-opacity;
    margin: 0;

    @include tablet {
      order: 2;
      padding: $spacing-md;
    }
  }

  // ==========================================================================
  // Element: Categories
  // ==========================================================================
  &__categories {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;

    @include tablet {
      order: 3;
      padding: 0 $spacing-md;
    }
  }

  &__category {
    font-size: $font-size-base;
    line-height: 1.3;

    @include tablet {
      font-size: $font-size-sm;
    }
  }

  // ==========================================================================
  // Element: Image
  // ==========================================================================
  &__image {
    width: 100%;
    border-radius: $radius-xl;
    overflow: hidden;
    position: relative;
    background-color: rgba($labs-text-color, 0.05);

    @include tablet {
      order: 4;
      width: 10.25rem;
      height: 8.125rem;
      margin: $spacing-xl $spacing-md;
    }

    img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      transition: transform $transition-slow;
    }
  }
}
</style>
