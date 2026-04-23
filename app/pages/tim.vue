<template>
  <div class="page page--tim">
    <section class="tim-hero">
      <div class="tim-hero__container">
        <h1 :class="['tim-hero__title', typoClass('heroTitle')]">{{ t('nav.about') }}</h1>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useSeo('singleton/team-page', null, `${t('nav.about')} - Go2Digital`)

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  heroTitle: 'display-xl',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['team'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}
</script>

<style scoped lang="scss">
.page--tim {
  min-height: 100vh;
}

.tim-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 120px 24px 80px;

  &__container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  &__title {
    color: var(--color-text, #fff);
  }
}
</style>
