<template>
  <section class="feature-section">
    <div class="feature-section__container">
      <div class="feature-section__icon-wrapper">
        <span class="feature-section__icon">{{ icon }}</span>
      </div>
      <div class="feature-section__content">
        <h3 class="feature-section__title">{{ title }}</h3>
        <p class="feature-section__description">{{ description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<style scoped lang="scss">
.feature-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  width: 100%;
  background-color: #FAFAFA;
  position: relative;
  z-index: 30;
  border-top: 1px solid $color-border;

  &__container {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: 1.25rem 2.5rem 5rem;
    align-items: start;
    @include tablet { padding: 1.25rem 2rem 3rem; }
    @include mobile { padding: 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
  }

  &__icon-wrapper {
    grid-column: 1 / 2;
    display: flex;
    align-items: flex-start;
    @include mobile { grid-column: unset; }
  }

  &__icon {
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
  }

  &__content {
    grid-column: 6 / 9;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 21.4375rem;
    @include desktop { grid-column: 6 / 11; }
    @include tablet { grid-column: 5 / 12; }
    @include mobile { grid-column: unset; max-width: 100%; gap: 1rem; }
  }

  &__title {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    margin: 0;
    @include mobile { font-size: 0.9375rem; }
  }

  &__description {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    opacity: 0.4;
    margin: 0;
    @include mobile {

    }
  }
}
</style>
