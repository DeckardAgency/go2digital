<template>
  <section class="billboard-section">
    <div class="billboard-section__image-wrapper" ref="imageWrapperRef" role="img" :aria-label="billboard?.imageAlt ?? $t('homepage.billboard.imageAlt')">
      <!-- Fallback image (hidden when WebGL active) -->
      <img v-if="billboardImage && !webglActive" :src="billboardImage" :alt="billboard?.imageAlt ?? ''" class="billboard-section__image" />
      <div v-if="!billboardImage" class="billboard-section__image billboard-section__image--placeholder"></div>
    </div>
    <div class="billboard-section__content">
      <div class="billboard-section__header">
        <h2
          ref="titleRef"
          class="billboard-section__title"
        >{{ billboard?.title ?? $t('homepage.billboard.title') }}</h2>
        <BtnAnimated
          :text="billboard?.buttonText ?? $t('homepage.billboard.buttonText')"
          :to="billboardUrl"
          :external="isExternalUrl(billboardUrl)"
          variant="on-dark"
        />
      </div>
      <div class="billboard-section__footer">
        <h3 class="billboard-section__subtitle">{{ billboard?.subtitle ?? $t('homepage.billboard.subtitle') }}</h3>
        <p class="billboard-section__description">{{ billboard?.description ?? $t('homepage.billboard.description') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import type { HomepageBillboard } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'
import type { WebGLHoverInstance } from '~/composables/useWebGLHover'

const { data: billboard } = useApi<HomepageBillboard>('/api/singletons/homepage-billboard', { lazy: true, server: false })

const billboardImage = computed(() => resolveMediaUrl((billboard.value as any)?.image, 'large'))
const billboardUrl = computed(() => billboard.value?.buttonUrl || '/kontakt')

const titleRef = ref<HTMLElement | null>(null)
const imageWrapperRef = ref<HTMLElement | null>(null)
const webglActive = ref(false)
let webglInstance: WebGLHoverInstance | null = null

watch(billboardImage, async (src) => {
  if (!src || !imageWrapperRef.value || webglInstance) return
  if (window.matchMedia('(hover: none)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  try {
    const { useWebGLHover } = await import('~/composables/useWebGLHover')
    webglInstance = useWebGLHover(imageWrapperRef.value!, src)
    webglActive.value = true
  } catch {
    webglActive.value = false
  }
}, { flush: 'post' })

onUnmounted(() => {
  if (webglInstance) { webglInstance.destroy(); webglInstance = null }
})

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
  min-height: 100dvh;
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

  // #2: Use SCSS variable instead of hardcoded color
  &__title {
    font-size: clamp(1.5rem, 2.5vw, 2.5rem);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03rem;
    color: $billboard-text-color;
    margin: 0;
  }


  &__footer {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__subtitle {
    font-size: clamp(1.25rem, 2.5vw, 2rem);
    font-weight: 400;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: $billboard-text-color;
    margin: 0;
  }

  // #4: Increased opacity from 0.4 to 0.6 for WCAG AA contrast
  &__description {
    font-size: $font-size-base;
    font-weight: 400;
    line-height: 1.3;
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
