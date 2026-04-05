<template>
  <section class="custom-image" ref="sectionRef">
    <div class="custom-image__inner" ref="innerRef">
      <!-- Static image always present for natural sizing -->
      <img
        ref="imageRef"
        :src="desktopImageSrc"
        :alt="customImage?.alt ?? $t('homepage.customImage.alt')"
        class="custom-image__image"
        :class="{ 'custom-image__image--hidden': webglActive }"
        loading="lazy"
        @load="onImageLoad"
      >
      <!-- WebGL canvas overlays on top -->
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageCustomImage } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'
import type { WebGLHoverInstance } from '~/composables/useWebGLHover'

gsap.registerPlugin(ScrollTrigger)

const { data: customImage } = useApi<HomepageCustomImage>('/api/singletons/homepage-custom-image', { lazy: true, server: false })

const desktopImageSrc = computed(() =>
  resolveMediaUrl(customImage.value?.desktopImage, 'large') || '/images/G2D_HomepagePhoto_Slavonska.jpg'
)

const sectionRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const webglActive = ref(false)

let scrollTriggerInstance: ScrollTrigger | null = null
let webglInstance: WebGLHoverInstance | null = null

function initWebGL() {
  if (!innerRef.value || webglInstance) return
  if (typeof window === 'undefined') return
  if (window.matchMedia('(hover: none)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const src = desktopImageSrc.value
  if (!src) return

  import('~/composables/useWebGLHover').then(({ useWebGLHover }) => {
    if (webglInstance || !innerRef.value) return
    webglInstance = useWebGLHover(innerRef.value, src)
    webglActive.value = true
  }).catch(() => {
    webglActive.value = false
  })
}

function initParallax() {
  if (!sectionRef.value || !innerRef.value) return
  if (scrollTriggerInstance) scrollTriggerInstance.kill()

  const target = innerRef.value
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      const scale = 1.25 - (self.progress * 0.25)
      const yPercent = -10 + (self.progress * 20)
      gsap.set(target, { scale, yPercent, force3D: true })
    }
  })
}

function onImageLoad() {
  initParallax()
  initWebGL()
  ScrollTrigger.refresh()
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    initParallax()
    // If image already cached/loaded, init WebGL
    if (imageRef.value?.complete) initWebGL()
  })
})

onUnmounted(() => {
  if (scrollTriggerInstance) { scrollTriggerInstance.kill(); scrollTriggerInstance = null }
  if (webglInstance) { webglInstance.destroy(); webglInstance = null }
  if (innerRef.value) gsap.set(innerRef.value, { clearProps: 'all' })
})
</script>

<style lang="scss" scoped>
$custom-image-bg: #FAFAFA;
$custom-image-padding-desktop: $spacing-2xl;
$custom-image-padding-mobile: $spacing-md;
$custom-image-radius-desktop: 2rem;
$custom-image-radius-mobile: $radius-xl;

.custom-image {
  position: relative;
  z-index: $z-sticky + 10;
  padding: $custom-image-padding-desktop;
  background-color: $custom-image-bg;

  @include tablet {
    padding: $custom-image-padding-mobile;
  }

  &__inner {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: $custom-image-radius-desktop;
    @include gpu-accelerate;

    @include tablet {
      border-radius: $custom-image-radius-mobile;
    }
  }

  &__image {
    width: 100%;
    height: auto;
    display: block;

    // When WebGL is active, image stays for sizing but is invisible
    &--hidden {
      visibility: hidden;
    }
  }
}
</style>
