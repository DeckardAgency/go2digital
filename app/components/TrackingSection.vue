<template>
  <section class="tracking-section">
    <div class="tracking-section__header">
      <h2
        class="tracking-section__title"
        data-split-text
        data-split-type="lines"
        data-split-trigger="view"
        data-split-duration="1.2"
      >{{ $t('homepage.tracking.title') }}</h2>
      <div class="tracking-section__cta">
        <NuxtLink to="/kontakt" class="tracking-section__button">
          <span class="tracking-section__button-text">{{ $t('homepage.tracking.buttonText') }}</span>
          <span class="tracking-section__button-icon">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M8.5 0.5L13.5 5.5L8.5 10.5M13 5.5H0.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </NuxtLink>
      </div>
    </div>
    <div class="tracking-section__list">
      <div
        v-for="(feature, i) in features"
        :key="i"
        class="tracking-section__item"
      >
        <span class="tracking-section__number">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3 class="tracking-section__feature">{{ feature.title }}</h3>
        <p class="tracking-section__description">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { tm, rt } = useI18n()

const features = computed(() => {
  const raw = tm('homepage.tracking.features')
  if (Array.isArray(raw)) {
    return raw.map((f: any) => ({
      title: rt(f.title),
      description: rt(f.description)
    }))
  }
  return []
})
</script>

<style scoped lang="scss">
.tracking-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100dvh;
  width: 100%;
  background-color: $color-primary;
  position: relative;
  border-top: 1px solid #293331;
  z-index: 30;
  @include mobile { padding: 0; }

  &__header {
    grid-column: 1 / 13;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: 15.625rem $spacing-2xl $spacing-2xl;
    align-items: center;
    @include mobile { padding: 5rem $spacing-md $spacing-xl; }
  }

  &__title {
    grid-column: 1 / 6;
    font-size: clamp(1.5rem, 3vw, 3.125rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    color: #FAFAFA;
    margin: 0;
    @include mobile { grid-column: 1 / -1; margin-bottom: $spacing-lg; }
  }

  &__cta {
    grid-column: 11 / 13;
    display: flex;
    justify-content: flex-end;
    @include mobile { grid-column: 1 / -1; justify-content: flex-start; }
  }

  &__button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #FAFAFA;
    border-radius: $radius-full;
    padding: 2px;
    width: 17.5rem;
    height: 3rem;
    text-decoration: none;
    transition: transform 0.3s ease;
    &:hover { transform: translateY(-2px); }
  }

  &__button-text {
    font-size: $font-size-base;
    color: $color-primary;
    padding-left: $spacing-md;
  }

  &__button-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background-color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FAFAFA;
  }

  &__list {
    grid-column: 1 / -1;
  }

  &__item {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    padding: $spacing-lg $spacing-2xl;
    border-top: 1px solid #293331;
    align-items: start;
    @include mobile { padding: $spacing-md; gap: $spacing-sm; }
  }

  &__number {
    grid-column: 1 / 2;
    font-size: $font-size-sm;
    color: rgba(#FAFAFA, 0.4);
    padding-top: 0.25rem;
    @include mobile { grid-column: 1 / 3; }
  }

  &__feature {
    grid-column: 2 / 6;
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: #FAFAFA;
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }

  &__description {
    grid-column: 6 / 10;
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: rgba(#FAFAFA, 0.4);
    margin: 0;
    @include mobile { grid-column: 3 / -1; }
  }
}
</style>
