<template>
  <div class="page page--privacy">
    <section class="privacy">
      <div class="privacy__container">
        <h1 class="privacy__title">{{ $t('privacyPolicy.title') }}</h1>
        <div class="privacy__content">
          <p>{{ $t('privacyPolicy.placeholder') }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
useHead({
  title: () => t('privacyPolicy.seo.title')
})
</script>

<style scoped lang="scss">
.page--privacy {
  min-height: 100vh;
}

.privacy {
  padding: 120px 24px 80px;

  &__container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
  }

  &__title {
    font-size: clamp(2rem, 4vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text, #fff);
    margin-bottom: 48px;
  }

  &__content {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--color-text-secondary, #999);

    p {
      margin-bottom: 1.5em;
    }
  }
}
</style>
