<template>
  <section class="billboard-section">
    <div class="billboard-section__image-wrapper" role="img" :aria-label="billboard?.imageAlt ?? $t('homepage.billboard.imageAlt')">
      <img v-if="billboardImage" :src="billboardImage" :alt="billboard?.imageAlt ?? ''" class="billboard-section__image" />
      <div v-else class="billboard-section__image billboard-section__image--placeholder"></div>
    </div>
    <div class="billboard-section__content">
      <div class="billboard-section__header">
        <h2
          ref="titleRef"
          :class="['billboard-section__title', typoClass('title')]"
        >{{ billboard?.title ?? $t('homepage.billboard.title') }}</h2>
        <BtnAnimated
          :text="billboard?.buttonText ?? $t('homepage.billboard.buttonText')"
          :to="billboardUrl"
          :external="isExternalUrl(billboardUrl)"
          variant="on-dark"
        />
      </div>
      <div class="billboard-section__footer">
        <h3 :class="['billboard-section__subtitle', typoClass('subtitle')]">{{ billboard?.subtitle ?? $t('homepage.billboard.subtitle') }}</h3>
        <p :class="['billboard-section__description', typoClass('description')]">{{ billboard?.description ?? $t('homepage.billboard.description') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HomepageBillboard } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

const { data: billboard } = useApi<HomepageBillboard>('/api/singletons/homepage-billboard', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  title: 'billboard-title',
  subtitle: 'billboard-subtitle',
  description: 'body-sm',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (billboard.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}

const billboardImage = computed(() => resolveMediaUrl((billboard.value as any)?.image, 'large'))
const billboardUrl = computed(() => billboard.value?.buttonUrl || '/kontakt')

const titleRef = ref<HTMLElement | null>(null)

function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}
</script>

<style scoped lang="scss">
// Component-specific color for dark section text
$billboard-text-color: #FAFAFA;

.billboard-section {
  contain: layout paint;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  min-height: 100svh;
  width: 100%;
  background-color: $color-primary;
  padding: $spacing-2xl;
  position: relative;
  z-index: 30;
  @include tablet { padding: $spacing-lg; }
  @include mobile { grid-template-columns: 1fr; padding: $spacing-md; }

  // #1: Image wrapper with aria-label for accessibility
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
    object-fit: cover;

    &--placeholder {
      background: linear-gradient(135deg, #1a2a1f 0%, #2a3a2f 50%, #1a2a1f 100%);
    }
  }

  &__content {
    grid-column: 7 / -1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: $spacing-2xl 0 $spacing-2xl $spacing-2xl;
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
    color: $billboard-text-color;
    margin: 0;
  }


  &__footer {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__subtitle {
    color: $billboard-text-color;
    margin: 0;
  }

  // #4: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__description {
    color: rgba($billboard-text-color, 0.6);
    margin: 0;
  }
}

// #7: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .billboard-section__button {
    transition: none;
  }
}
</style>
