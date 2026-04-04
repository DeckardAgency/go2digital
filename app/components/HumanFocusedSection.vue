<template>
  <section class="human-focused">
    <div class="human-focused__indicator">
      <span class="human-focused__indicator-dot"></span>
      <span class="human-focused__indicator-text">{{ humanFocused?.indicator ?? $t('homepage.humanFocused.indicator') }}</span>
    </div>
    <header class="human-focused__header">
      <h2 class="human-focused__title">{{ humanFocused?.title ?? $t('homepage.humanFocused.title') }}</h2>
    </header>
    <div class="human-focused__content">
      <div class="human-focused__block human-focused__block--left">
        <h3 class="human-focused__block-heading">{{ humanFocused?.blockLeft ?? $t('homepage.humanFocused.blockLeft') }}</h3>
      </div>
      <div class="human-focused__block human-focused__block--right">
        <p class="human-focused__block-text">{{ humanFocused?.blockRight ?? $t('homepage.humanFocused.blockRight') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HomepageHumanFocused } from '~/types/api'

const { data: humanFocused } = await useApi<HomepageHumanFocused>('/api/singletons/homepage-human-focused')
</script>

<style scoped lang="scss">
.human-focused {
  contain: layout paint;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-2xl;
  padding: 6rem $spacing-2xl 7.5rem;
  width: 100%;
  position: relative;
  background-color: #FAFAFA;
  z-index: 30;

  @include tablet {
    padding: $spacing-2xl $spacing-md;
    gap: $spacing-md;
  }

  &__indicator {
    grid-column: 1 / 4;
    grid-row: 1;
    display: flex;
    align-items: flex-start;

    @include tablet {
      grid-column: 1 / 13;
      margin-bottom: $spacing-sm;
    }
  }

  &__indicator-dot {
    width: 6px;
    height: 6px;
    background-color: $color-primary;
    border-radius: $radius-full;
    margin-top: 0.35rem;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__indicator-text {
    font-size: $font-size-sm;
    color: $color-primary;
    font-weight: 400;
    line-height: 1.3;
  }

  &__header {
    grid-column: 4 / 13;
    grid-row: 1;

    @include tablet {
      grid-column: 1 / 13;
      grid-row: 2;
    }
  }

  &__title {
    font-size: 3.5rem;
    line-height: 1.15;
    font-weight: 400;
    color: $color-primary;
    margin: 0;
    letter-spacing: -0.02em;

    @include desktop { font-size: 2.125rem; }
    @include tablet { font-size: 1.75rem; line-height: 1.3; }
  }

  &__content {
    grid-column: 1 / 13;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: $spacing-2xl;
    margin-top: 5rem;

    @include tablet {
      grid-row: 3;
      margin-top: $spacing-xl;
      gap: $spacing-md;
    }
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    &--left {
      grid-column: 4 / 7;
      @include tablet { grid-column: 1 / 13; }
    }

    &--right {
      grid-column: 7 / 10;
      @include tablet { grid-column: 1 / 13; }
    }
  }

  &__block-heading {
    font-size: clamp(1.5rem, 3vw, 2.125rem);
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.04rem;
    color: $color-primary;
    margin: 0;
  }

  &__block-text {
    font-size: $font-size-lg;
    line-height: 1.6;
    color: rgba($color-primary, 0.6);
    margin: 0;
    font-weight: 300;

    @include tablet { font-size: $font-size-base; }
  }
}
</style>
