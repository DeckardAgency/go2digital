<template>
  <section class="custom-image" ref="sectionRef">
    <div class="custom-image__inner" ref="innerRef">
      <picture>
        <source
          media="(min-width: 768px)"
          :srcset="desktopImageSrc"
        >
        <source
          media="(max-width: 767px)"
          :srcset="mobileImageSrc"
        >
        <img
          ref="imageRef"
          :src="mobileImageSrc"
          :alt="customImage?.alt ?? $t('homepage.customImage.alt')"
          class="custom-image__image"
          loading="lazy"
          @load="onImageLoad"
        >
      </picture>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageCustomImage } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

gsap.registerPlugin(ScrollTrigger)

const { data: customImage } = useApi<HomepageCustomImage>('/api/singletons/homepage-custom-image', { lazy: true, server: false })

const desktopImageSrc = computed(() =>
  resolveMediaUrl(customImage.value?.desktopImage, 'large') || '/images/G2D_HomepagePhoto_Slavonska.jpg'
)
const mobileImageSrc = computed(() =>
  resolveMediaUrl(customImage.value?.mobileImage, 'medium') || '/images/G2D_HomepagePhoto_Slavonska_mobile.jpg'
)

// Template refs
const sectionRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)

// Store ScrollTrigger instance for cleanup
let scrollTriggerInstance: ScrollTrigger | null = null

function initParallax() {
  if (!sectionRef.value || !imageRef.value) return

  // Kill existing instance if any
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
  }

  // Parallax effect: scale zoom + vertical movement
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      // Scale from 1.25 to 1 as you scroll through
      const scale = 1.25 - (self.progress * 0.25)
      // Move from -10% to +10% for depth effect
      const yPercent = -10 + (self.progress * 20)
      gsap.set(imageRef.value, { scale, yPercent, force3D: true })
    }
  })
}

// Handle image load
function onImageLoad() {
  ScrollTrigger.refresh()
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    initParallax()
  })
})

onUnmounted(() => {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }
  if (imageRef.value) {
    gsap.set(imageRef.value, { clearProps: 'all' })
  }
})
</script>

<style lang="scss" scoped>
// ==========================================================================
// Custom Image Section
// Full-width responsive image with rounded corners
// Overlaps on top of the previous section (WhySection)
// ==========================================================================

// Component-specific variables
// --------------------------------------------------------------------------
$custom-image-bg: #ffffff;
$custom-image-padding-desktop: $spacing-2xl;
$custom-image-padding-mobile: $spacing-md;
$custom-image-radius-desktop: 2rem;
$custom-image-radius-mobile: $radius-xl;

.custom-image {
  position: relative;
  z-index: $z-sticky + 10; // Higher than WhySection (z-sticky)
  padding: $custom-image-padding-desktop;
  background-color: $custom-image-bg;

  @include tablet {
    padding: $custom-image-padding-mobile;
  }

  // ==========================================================================
  // Element: Inner
  // ==========================================================================
  &__inner {
    width: 100%;
    overflow: hidden;
    border-radius: $custom-image-radius-desktop;

    @include tablet {
      border-radius: $custom-image-radius-mobile;
    }
  }

  // ==========================================================================
  // Element: Image
  // ==========================================================================
  &__image {
    @include gpu-accelerate;
    width: 100%;
    height: auto;
    display: block;
    border-radius: $custom-image-radius-desktop;

    @include tablet {
      border-radius: $custom-image-radius-mobile;
    }
  }
}
</style>
