<template>
  <section class="interactive">
    <div class="interactive__indicator">
      <span class="interactive__indicator-dot"></span>
      <span class="interactive__indicator-text">{{ displayProduct?.indicatorText ?? $t('homepage.interactiveDisplay.indicatorText') }}</span>
    </div>
    <header class="interactive__header">
      <h2 class="interactive__title">{{ displayProduct?.description ?? $t('homepage.interactiveDisplay.description') }}</h2>
    </header>
  </section>
</template>

<script setup lang="ts">
import type { HomepageProduct } from '~/types/api'

const { data: displayProducts } = await useApi<HomepageProduct[]>('/api/homepage_products?productType=display')
const displayProduct = computed(() => displayProducts.value?.[0] ?? null)
</script>

<style scoped lang="scss">
.interactive {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
  padding: 6rem 4rem;
  width: 100%;
  background-color: #FAFAFA;
  position: relative;
  z-index: 30;
  @include mobile { padding: 1rem; }

  &__indicator {
    grid-column: 1 / 5;
    display: flex;
    align-items: flex-start;

    &-dot {
      width: 0.5rem;
      height: 0.5rem;
      background-color: $color-primary;
      border-radius: 50%;
      margin-top: 0.1rem;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    &-text {
      font-size: $font-size-sm;
      font-weight: 400;
      line-height: 0.9;
      color: $color-primary;
      text-transform: uppercase;
    }
  }

  &__header {
    grid-column: 6 / 13;
    margin-bottom: 4rem;
    @include mobile { grid-column: 1 / -1; margin-bottom: 2.5rem; }
  }

  &__title {
    font-size: 3.125rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    color: $color-primary;
    text-indent: 20rem;
    margin: 0;
    @include tablet { text-indent: 10rem; }
    @include mobile { text-indent: 0; font-size: 2rem; }
  }
}
</style>
