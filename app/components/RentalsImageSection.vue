<template>
  <section class="rentals-image" ref="sectionRef">
    <div class="rentals-image__inner">
      <img v-if="rentalsImageSrc" :src="rentalsImageSrc" alt="" class="rentals-image__bg" ref="imgRef" />
      <div v-else class="rentals-image__placeholder" ref="imgRef"></div>
      <div class="rentals-image__overlay">
        <span :class="['rentals-image__text', typoClass('text')]" ref="textRef">{{ rentalsImage?.text ?? 'RENTALS' }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageRentalsImage } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

gsap.registerPlugin(ScrollTrigger)

const { data: rentalsImage } = useApi<HomepageRentalsImage>('/api/singletons/homepage-rentals-image', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  text: 'display-outline',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (rentalsImage.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}

const rentalsImageSrc = computed(() => resolveMediaUrl((rentalsImage.value as any)?.image, 'large'))

const sectionRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLElement | null>(null)

let st: ScrollTrigger | null = null

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    if (!sectionRef.value || !textRef.value) return

    // Set the constant scale once, not on every scroll frame
    gsap.set(imgRef.value, { scale: 1.15, force3D: true })

    st = ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.6,
      onUpdate: (self) => {
        // Text moves up, image moves down (opposite)
        const textY = 40 - (self.progress * 80)
        const imgY = -10 + (self.progress * 20)
        gsap.set(textRef.value, { yPercent: textY })
        gsap.set(imgRef.value, { yPercent: imgY })
      }
    })
  })
})

onUnmounted(() => {
  if (st) { st.kill(); st = null }
  if (textRef.value) gsap.set(textRef.value, { clearProps: 'all' })
  if (imgRef.value) gsap.set(imgRef.value, { clearProps: 'all' })
})
</script>

<style scoped lang="scss">
.rentals-image {
  contain: layout paint;
  width: 100%;
  padding: $spacing-2xl;
  background-color: #FAFAFA;
  z-index: 30;
  @include mobile { padding: $spacing-md; }

  &__inner {
    position: relative;
    width: 100%;
    min-height: 60svh;
    border-radius: 2rem;
    overflow: hidden;
    @include mobile { border-radius: $radius-xl; }
  }

  &__bg {
    width: 100%;
    height: 100%;
    min-height: 60svh;
    object-fit: cover;
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    min-height: 60svh;
    background: linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a2e 100%);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
  }

  &__text {
    color: transparent;
    -webkit-text-stroke: 2px rgba(#FAFAFA, 0.6);
    text-transform: uppercase;
    white-space: nowrap;
    will-change: transform;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rentals-image__text {
    transform: none !important;
  }
}
</style>
