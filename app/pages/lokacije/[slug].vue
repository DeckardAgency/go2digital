<template>
  <div class="location-detail">
    <!-- Hero Image -->
    <div class="location-detail__hero" ref="heroRef">
      <img
        v-if="heroImage"
        :src="heroImage"
        :alt="locationName"
        class="location-detail__hero-image"
      >
      <div class="location-detail__hero-overlay">
        <div class="location-detail__hero-content">
          <div class="location-detail__meta" v-if="locationCity || locationEnv">
            <span v-if="locationCity" class="location-detail__city">{{ locationCity }}</span>
            <template v-if="locationEnv">
              <span class="location-detail__dot">&bull;</span>
              <span class="location-detail__env">{{ locationEnv }}</span>
            </template>
          </div>
          <h1 class="location-detail__name">{{ locationName }}</h1>
        </div>
      </div>
      <button class="location-detail__back" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ $t('location.backToLocations') || 'Sve lokacije' }}
      </button>
    </div>

    <!-- Content -->
    <section class="location-detail__content">
      <div class="location-detail__grid">
        <div class="location-detail__map-placeholder"></div>
        <div class="location-detail__info">
          <h2>{{ $t('location.detail.info') || 'Informacije' }}</h2>
          <div class="location-detail__info-item">
            <strong>{{ $t('location.detail.address') || 'Adresa' }}</strong>
            <p>{{ locationName }}, {{ locationCity }}, Hrvatska</p>
          </div>
          <div class="location-detail__info-item">
            <strong>{{ $t('location.detail.type') || 'Tip' }}</strong>
            <p>{{ locationEnv || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const route = useRoute()
const slug = route.params.slug as string

// Get transition data from sessionStorage (set by the card animation)
const heroImage = ref('')
const locationName = ref(slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
const locationCity = ref('')
const locationEnv = ref('')

onMounted(() => {
  const img = sessionStorage.getItem('locationTransitionImage')
  const name = sessionStorage.getItem('locationTransitionName')
  const city = sessionStorage.getItem('locationTransitionCity')
  const env = sessionStorage.getItem('locationTransitionEnv')

  if (img) heroImage.value = img
  if (name) locationName.value = name
  if (city) locationCity.value = city
  if (env) locationEnv.value = env

  // Clean up
  sessionStorage.removeItem('locationTransitionImage')
  sessionStorage.removeItem('locationTransitionName')
  sessionStorage.removeItem('locationTransitionCity')
  sessionStorage.removeItem('locationTransitionEnv')
})

const heroRef = ref<HTMLElement | null>(null)

function goBack() {
  const heroImg = heroRef.value?.querySelector('.location-detail__hero-image') as HTMLImageElement
  if (!heroImg) {
    ;(window as any).__skipPageTransition = true
    navigateTo('/lokacije')
    return
  }

  const imgRect = heroImg.getBoundingClientRect()

  // Clone the hero image
  const clone = heroImg.cloneNode(true) as HTMLImageElement
  clone.style.cssText = `
    position: fixed;
    top: ${imgRect.top}px;
    left: ${imgRect.left}px;
    width: ${imgRect.width}px;
    height: ${imgRect.height}px;
    object-fit: cover;
    z-index: 10001;
    pointer-events: none;
    border-radius: 0;
  `
  document.body.appendChild(clone)

  // White overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #ffffff;
    z-index: 10000;
    opacity: 0;
    pointer-events: none;
  `
  document.body.appendChild(overlay)

  // Target: approximate card size in the sidebar (centered)
  const targetWidth = 220
  const targetHeight = targetWidth * 0.75 // 4:3 aspect ratio
  const targetTop = window.innerHeight / 2 - targetHeight / 2
  const targetLeft = 260 - targetWidth / 2 // approximate sidebar center

  const tl = gsap.timeline({
    onComplete: () => {
      ;(window as any).__skipPageTransition = true
      navigateTo('/lokacije')
      setTimeout(() => {
        clone.remove()
        overlay.remove()
      }, 100)
    }
  })

  tl.to(overlay, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.inOut'
  })
  .to(clone, {
    top: targetTop,
    left: targetLeft,
    width: targetWidth,
    height: targetHeight,
    borderRadius: '0.65rem',
    duration: 0.5,
    ease: 'power3.inOut'
  }, 0)
}

useHead({
  title: `${locationName.value} - Lokacije`
})

definePageMeta({
  showFooter: false
})
</script>

<style scoped lang="scss">
.location-detail {
  min-height: 100vh;
  background-color: $color-background;
}

.location-detail__hero {
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 320px;
  overflow: hidden;
}

.location-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.location-detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
}

.location-detail__hero-content {
  padding: $spacing-xl $spacing-2xl;
  color: #ffffff;

  @include tablet {
    padding: $spacing-lg;
  }
}

.location-detail__meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: $spacing-sm;
  font-size: $font-size-sm;
  opacity: 0.8;
}

.location-detail__name {
  font-size: 2.5rem;
  font-weight: 400;
  line-height: 1.1;
  margin: 0;

  @include tablet {
    font-size: 1.75rem;
  }
}

.location-detail__back {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: $radius-full;
  font-size: $font-size-sm;
  color: $color-primary;
  text-decoration: none;
  transition: background $transition-base;
  z-index: 1;

  &:hover {
    background: #ffffff;
  }
}

.location-detail__content {
  max-width: 1000px;
  margin: 0 auto;
  padding: $spacing-2xl;

  @include tablet {
    padding: $spacing-lg;
  }
}

.location-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;

  @include tablet {
    grid-template-columns: 1fr;
  }
}

.location-detail__map-placeholder {
  height: 300px;
  background: $color-surface;
  border-radius: $radius-lg;
}

.location-detail__info {
  h2 {
    font-size: $font-size-lg;
    font-weight: 400;
    margin-bottom: $spacing-lg;
  }
}

.location-detail__info-item {
  margin-bottom: $spacing-lg;

  strong {
    display: block;
    font-size: $font-size-sm;
    color: $color-muted;
    font-weight: 400;
    margin-bottom: $spacing-xs;
  }

  p {
    font-size: $font-size-base;
  }
}
</style>
