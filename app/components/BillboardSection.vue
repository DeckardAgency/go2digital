<template>
  <section class="billboard-section">
    <div class="billboard-section__image-wrapper">
      <div class="billboard-section__image"></div>
    </div>
    <div class="billboard-section__content">
      <div class="billboard-section__header">
        <h2
          class="billboard-section__title"
          data-split-text
          data-split-type="lines"
          data-split-trigger="view"
          data-split-duration="1.2"
        >{{ $t('homepage.billboard.title') }}</h2>
        <NuxtLink to="/kontakt" class="billboard-section__button">
          <span class="billboard-section__button-text">{{ $t('homepage.billboard.buttonText') }}</span>
          <span class="billboard-section__button-icon">
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 0.5L13.5 5.5L8.5 10.5M13 5.5H0.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </NuxtLink>
      </div>
      <div class="billboard-section__footer">
        <h3 class="billboard-section__subtitle">{{ $t('homepage.billboard.subtitle') }}</h3>
        <p class="billboard-section__description">{{ $t('homepage.billboard.description') }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.billboard-section {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100dvh;
  width: 100%;
  background-color: $color-primary;
  padding: $spacing-2xl;
  position: relative;
  z-index: 30;
  @include tablet { padding: $spacing-lg; }
  @include mobile { grid-template-columns: 1fr; padding: $spacing-md; }

  &__image-wrapper {
    grid-column: 1 / 7;
    position: relative;
    height: 56.25rem;
    border-radius: $radius-lg;
    overflow: hidden;
    @include tablet { grid-column: 1 / -1; height: 25rem; }
    @include mobile { height: 18rem; }
  }

  &__image {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a2a1f 0%, #2a3a2f 50%, #1a2a1f 100%);
  }

  &__content {
    grid-column: 8 / 12;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: $spacing-2xl 0;
    height: 56.25rem;
    @include tablet { grid-column: 1 / -1; height: auto; padding: $spacing-xl 0; gap: $spacing-2xl; }
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $spacing-xl;
    align-items: flex-start;
  }

  &__title {
    font-size: clamp(1.5rem, 3vw, 3.125rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.0625rem;
    color: #FAFAFA;
    margin: 0;
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

  &__footer {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__subtitle {
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: #FAFAFA;
    margin: 0;
  }

  &__description {
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
    color: rgba(#FAFAFA, 0.4);
    margin: 0;
  }
}
</style>
