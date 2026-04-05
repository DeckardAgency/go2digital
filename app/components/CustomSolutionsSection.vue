<template>
  <section class="custom-solutions">
    <div class="custom-solutions__indicator">
      <span class="custom-solutions__indicator-dot"></span>
      <span class="custom-solutions__indicator-text">
        {{ customSolution?.indicator ?? $t('homepage.customSolutions.indicator') }}
      </span>
    </div>

    <header class="custom-solutions__header">
      <h2
        class="custom-solutions__title"
        data-split-text
        data-split-type="lines"
        data-split-duration="1.2"
        data-split-y="80"
        data-split-stagger="0.10"
        data-split-indent="30%"
      >
        {{ customSolution?.title ?? $t('homepage.customSolutions.title') }}
      </h2>
    </header>

    <div class="custom-solutions__content">
      <div class="custom-solutions__block custom-solutions__block--left">
        <p class="custom-solutions__block-text">
          {{ customSolution?.block1 ?? $t('homepage.customSolutions.block1') }}
        </p>
      </div>

      <div class="custom-solutions__block custom-solutions__block--right">
        <p class="custom-solutions__block-text">
          {{ customSolution?.block2 ?? $t('homepage.customSolutions.block2') }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageCustomSolution } from '~/types/api'

const { data: customSolution } = useApi<HomepageCustomSolution>('/api/singletons/homepage-custom-solution', { lazy: true, server: false })
</script>

<style lang="scss" scoped>
// ==========================================================================
// Custom Solutions Section
// Two-column text layout with indicator and title
// ==========================================================================

// Component-specific variables
// --------------------------------------------------------------------------
$solutions-bg: #FAFAFA;
$solutions-text-color: $color-primary;
$solutions-muted-color: rgba($color-primary, 0.6);
$solutions-title-size-desktop: 3.5rem;
$solutions-title-size-tablet: 2.125rem;
$solutions-title-size-mobile: 1.75rem;
$solutions-title-indent: 55%;
$solutions-title-indent-desktop: 40%;
$solutions-block-text-size: $font-size-lg;
$solutions-padding-top: 6rem;
$solutions-padding-bottom: 7.5rem;
$solutions-content-margin-top: 5rem;
$solutions-dot-size: 6px;

.custom-solutions {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-2xl;
  padding: $solutions-padding-top $spacing-2xl $solutions-padding-bottom;
  width: 100%;
  position: relative;
  background-color: $solutions-bg;
  z-index: $z-sticky + 10;

  @include tablet {
    padding: $spacing-2xl $spacing-md;
    gap: $spacing-md;
  }

  // ==========================================================================
  // Element: Indicator
  // ==========================================================================
  &__indicator {
    grid-column: 1 / 4;
    grid-row: 1;
    @include flex-start;
    align-items: flex-start;

    @include tablet {
      grid-column: 1 / 13;
      margin-bottom: $spacing-sm;
    }
  }

  &__indicator-dot {
    width: $solutions-dot-size;
    height: $solutions-dot-size;
    background-color: $solutions-text-color;
    border-radius: $radius-full;
    margin-top: 0.35rem;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__indicator-text {
    font-size: $font-size-sm;
    color: $solutions-text-color;
    font-weight: 400;
    line-height: 1.3;
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    grid-column: 4 / 13;
    grid-row: 1;

    @include tablet {
      grid-column: 1 / 13;
      grid-row: 2;
    }
  }

  // ==========================================================================
  // Element: Title
  // First line indented via data-split-indent, rest flows normally
  // ==========================================================================
  &__title {
    font-size: $solutions-title-size-desktop;
    line-height: 1.15;
    font-weight: 400;
    color: $solutions-text-color;
    margin: 0;
    letter-spacing: -0.02em;

    @include desktop {
      font-size: $solutions-title-size-tablet;
    }

    @include tablet {
      font-size: $solutions-title-size-mobile;
      line-height: 1.3;
    }
  }

  // ==========================================================================
  // Element: Content
  // ==========================================================================
  &__content {
    grid-column: 1 / 13;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: $spacing-2xl;
    margin-top: $solutions-content-margin-top;

    @include tablet {
      grid-row: 3;
      margin-top: $spacing-xl;
      gap: $spacing-md;
    }
  }

  // ==========================================================================
  // Element: Block
  // ==========================================================================
  &__block {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    // ------------------------------------------
    // Modifier: Left block
    // ------------------------------------------
    &--left {
      grid-column: 4 / 7;

      @include tablet {
        grid-column: 1 / 13;
      }
    }

    // ------------------------------------------
    // Modifier: Right block
    // ------------------------------------------
    &--right {
      grid-column: 7 / 10;

      @include tablet {
        grid-column: 1 / 13;
      }
    }
  }

  &__block-text {
    font-size: $solutions-block-text-size;
    line-height: 1.6;
    color: $solutions-muted-color;
    margin: 0;
    font-weight: 300;

    @include tablet {
      font-size: $font-size-base;
    }
  }
}
</style>
