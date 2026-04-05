<template>
  <div class="location-detail">
    <!-- Hero -->
    <section class="location-detail__hero" ref="heroRef">
      <div class="location-detail__hero-image-wrapper" ref="imageWrapperRef">
        <picture v-if="heroImage" class="location-detail__hero-picture">
          <source media="(min-width: 1024px)" :srcset="heroImageOriginal">
          <source media="(min-width: 768px)" :srcset="heroImageLarge">
          <img :src="heroImageMedium" :alt="totem?.name" class="location-detail__hero-image">
        </picture>
      </div>

      <div class="location-detail__hero-info" ref="heroInfoRef">
        <h1 class="location-detail__title" ref="titleRef">{{ totem?.name || locationName }}</h1>

        <div class="location-detail__specs" ref="specsRef" v-if="totem">
          <div class="location-detail__spec">
            <span class="location-detail__spec-label">City</span>
            <span class="location-detail__spec-value">{{ cityName }}</span>
          </div>
          <div class="location-detail__spec" v-if="totem.screen_width && totem.screen_height">
            <span class="location-detail__spec-label">Resolution</span>
            <span class="location-detail__spec-value">{{ totem.screen_width }}x{{ totem.screen_height }} px</span>
          </div>
          <div class="location-detail__spec" v-if="totem.postbuy_category">
            <span class="location-detail__spec-label">Environment</span>
            <span class="location-detail__spec-value">{{ capitalize(totem.postbuy_category) }}</span>
          </div>
          <div class="location-detail__spec" v-if="totem.ad_duration">
            <span class="location-detail__spec-label">Duration</span>
            <span class="location-detail__spec-value">{{ totem.ad_duration }} minutes</span>
          </div>
          <div class="location-detail__spec" v-if="totem.totem_motion">
            <span class="location-detail__spec-label">Type</span>
            <span class="location-detail__spec-value">{{ capitalize(totem.totem_motion.replace('_', ' ')) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions (inside hero so they're pinned together) -->
      <div class="location-detail__actions" ref="actionsRef">
        <button class="location-detail__action" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M3 8l4-4M3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to locations
        </button>
        <button class="location-detail__action" @click="shareLocation">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 9l4-2M6 7l4 2M14 5a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM14 11a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Share Location
        </button>
        <label class="location-detail__action location-detail__action--save">
          <input type="checkbox" v-model="isSaved">
          Save to collection
        </label>
      </div>
    </section>

    <div class="location-detail__divider"></div>

    <!-- About -->
    <section class="location-detail__about" v-if="totem?.description">
      <div class="location-detail__about-label">
        <span class="location-detail__dot"></span>
        About The Location
      </div>
      <p class="location-detail__about-text">{{ totem.description }}</p>
    </section>

    <!-- Floor Plans -->
    <section class="location-detail__floorplans" v-if="floorPlans.length > 0">
      <div class="location-detail__floorplans-grid">
        <div v-for="plan in floorPlans" :key="plan.floor_plan_id" class="location-detail__floorplan">
          <span class="location-detail__floorplan-label">{{ plan.name || 'Floor Plan' }}</span>
          <img :src="resolveUrl(plan.plan)" :alt="plan.name" loading="lazy">
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="location-detail__gallery" v-if="galleryImages.length > 0">
      <div class="location-detail__gallery-viewport">
        <img
          :src="galleryImages[activeGalleryIndex]"
          :alt="`${totem?.name} - ${activeGalleryIndex + 1}`"
          class="location-detail__gallery-image"
        >
      </div>
      <div class="location-detail__gallery-controls" v-if="galleryImages.length > 1">
        <div class="location-detail__gallery-label">
          <span class="location-detail__dot"></span>
          Gallery
        </div>
        <div class="location-detail__gallery-track">
          <div
            class="location-detail__gallery-progress"
            :style="{ width: `${((activeGalleryIndex + 1) / galleryImages.length) * 100}%` }"
          ></div>
        </div>
        <span class="location-detail__gallery-counter">{{ String(activeGalleryIndex + 1).padStart(2, '0') }}</span>
      </div>
      <div class="location-detail__gallery-dots" v-if="galleryImages.length > 1">
        <button
          v-for="(_, i) in galleryImages"
          :key="i"
          class="location-detail__gallery-dot"
          :class="{ 'location-detail__gallery-dot--active': i === activeGalleryIndex }"
          @click="activeGalleryIndex = i"
        ></button>
      </div>
    </section>

    <!-- Statistics -->
    <section class="location-detail__statistics" v-if="totem?.reach">
      <h2 class="location-detail__section-title">
        Location Statistics
        <span class="location-detail__section-subtitle">(Monthly)</span>
      </h2>

      <div class="location-detail__stats-grid">
        <div class="location-detail__stats-column">
          <div class="location-detail__stats-label">Primary</div>

          <div class="location-detail__stat-row">
            <div class="location-detail__stat-name">
              <span class="location-detail__dot"></span>
              Approximate Traffic
            </div>
            <div class="location-detail__stat-big">{{ formatNumber(totem.reach) }}</div>
            <div class="location-detail__stat-desc" v-if="totem.postbuy_category === 'roadside'">
              Vehicles pass monthly, ensuring strong impressions from daily commuters and tourists alike.
            </div>
          </div>

          <div class="location-detail__stat-row" v-if="totem.screens > 1">
            <div class="location-detail__stat-name">
              <span class="location-detail__dot"></span>
              Active Screens
            </div>
            <div class="location-detail__stat-big">{{ totem.screens }}</div>
          </div>
        </div>

        <div class="location-detail__stats-column" v-if="totem.postbuy_category">
          <div class="location-detail__stats-label">Secondary</div>
          <div class="location-detail__stat-row">
            <div class="location-detail__stat-name">
              <span class="location-detail__dot"></span>
              Neighbourhood
            </div>
            <div class="location-detail__stat-desc">
              {{ capitalize(totem.postbuy_category) }} location in {{ cityName }}.
              {{ totem.totem_type === 'indoor' ? 'Indoor placement with high foot traffic.' : 'Outdoor placement with strong vehicle and pedestrian visibility.' }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Nearby Locations -->
    <section class="location-detail__nearby" v-if="nearbyLocations.length > 0">
      <h2 class="location-detail__section-title">
        Nearby locations
        <span class="location-detail__section-subtitle">({{ nearbyLocations.length }})</span>
      </h2>
      <div class="location-detail__nearby-grid">
        <div
          v-for="loc in nearbyLocations"
          :key="loc.totem_id"
          class="location-detail__nearby-card"
          @click="navigateToLocation(loc)"
        >
          <div class="location-detail__nearby-image-wrapper">
            <img
              v-if="loc.images?.[0]"
              :src="resolveUrl(loc.images[0].main || loc.images[0].thumbnail)"
              :alt="loc.name"
              loading="lazy"
            >
          </div>
          <div class="location-detail__nearby-info">
            <span class="location-detail__nearby-type">{{ capitalize(loc.postbuy_category || '') }}</span>
            <span class="location-detail__nearby-name">{{ loc.name }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { goBackWithTransition } from '~/composables/useCardTransition'

gsap.registerPlugin(ScrollTrigger)

const CDN_BASE = 'https://cdn.go2digital.hr'

const route = useRoute()
const slug = route.params.slug as string

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/č/g, 'c').replace(/ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z').replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function resolveUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${CDN_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

// Fetch from API (replaces CDN)
const config = useRuntimeConfig()
const apiBase = config.public.apiBase as string

const { data: locData } = await useFetch<any[]>(`${apiBase}/api/locations`, {
  key: 'locations-detail-data',
  getCachedData: () => undefined,
})

const matchedData = computed(() => {
  if (!locData.value) return null
  for (const city of locData.value) {
    for (const t of city.totems) {
      if (toSlug(t.name) === slug) {
        return { totem: t, cityName: city.name }
      }
    }
  }
  return null
})

const totem = computed(() => matchedData.value?.totem || null)
const cityName = computed(() => matchedData.value?.cityName || '')

// Responsive hero images — full quality on desktop, smaller on mobile
const heroImageOriginal = computed(() => {
  const t = totem.value
  if (t?.images?.length) {
    const img = t.images[0]
    return resolveUrl(img.main || img.large || img.thumbnail || '')
  }
  return sessionImage.value || ''
})

const heroImageLarge = computed(() => {
  const t = totem.value
  if (t?.images?.length) {
    const img = t.images[0]
    return resolveUrl(img.large || img.main || img.thumbnail || '')
  }
  return heroImageOriginal.value
})

const heroImageMedium = computed(() => {
  const t = totem.value
  if (t?.images?.length) {
    const img = t.images[0]
    return resolveUrl(img.thumbnail || img.large || img.main || '')
  }
  return heroImageOriginal.value
})

// Backward compat alias
const heroImage = computed(() => heroImageOriginal.value)

const galleryImages = computed(() => {
  if (!totem.value?.images) return []
  return totem.value.images.map((img: any) => resolveUrl(img.main || img.large || img.thumbnail || ''))
})

const floorPlans = computed(() => totem.value?.floor_plans || [])

const locationName = computed(() =>
  totem.value?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
)

// Nearby locations (same city, excluding current)
const nearbyLocations = computed(() => {
  if (!locData.value || !totem.value) return []
  for (const city of locData.value) {
    const found = city.totems.find((t: any) => toSlug(t.name) === slug)
    if (found) {
      return city.totems
        .filter((t: any) => t.totem_id !== found.totem_id)
        .slice(0, 4)
    }
  }
  return []
})

// Gallery state
const activeGalleryIndex = ref(0)
const isSaved = ref(false)

// Refs for animation
const heroRef = ref<HTMLElement | null>(null)
const imageWrapperRef = ref<HTMLElement | null>(null)
const heroInfoRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const specsRef = ref<HTMLElement | null>(null)
const actionsRef = ref<HTMLElement | null>(null)

// Session fallback
const sessionImage = ref('')

let heroTimeline: gsap.core.Timeline | null = null

onMounted(() => {
  const img = sessionStorage.getItem('locationTransitionImage')
  if (img) sessionImage.value = img
  sessionStorage.removeItem('locationTransitionImage')
  sessionStorage.removeItem('locationTransitionName')
  sessionStorage.removeItem('locationTransitionCity')
  sessionStorage.removeItem('locationTransitionEnv')

  nextTick(() => {
    setupEntranceAnimation()
    setupScrollAnimation()
  })
})

onUnmounted(() => {
  if (heroTimeline) {
    heroTimeline.kill()
    heroTimeline = null
  }
  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === heroRef.value) st.kill()
  })
})

function setupEntranceAnimation() {
  // Entrance: fade in title, specs, actions with stagger
  const tl = gsap.timeline({ delay: 0.15 })

  if (titleRef.value) {
    gsap.set(titleRef.value, { opacity: 0, y: 20 })
    tl.to(titleRef.value, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
  }

  if (specsRef.value) {
    const specs = specsRef.value.querySelectorAll('.location-detail__spec')
    gsap.set(specs, { opacity: 0, y: 15 })
    tl.to(specs, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.15)
  }

  if (actionsRef.value) {
    gsap.set(actionsRef.value, { opacity: 0, y: 10 })
    tl.to(actionsRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.3)
  }
}

function setupScrollAnimation() {
  if (!heroRef.value || !imageWrapperRef.value) return

  // Set initial clipPath so elements can be clipped on scroll
  const clipTargets = [titleRef.value, specsRef.value, actionsRef.value].filter(Boolean)
  gsap.set(clipTargets, { clipPath: 'inset(0 0 0 0)' })

  heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: '+=100%',
      scrub: 1,
      pin: true,
      pinSpacing: true
    }
  })

  // Image expands to full viewport
  heroTimeline.to(imageWrapperRef.value, {
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    marginLeft: 0,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)

  // Clip-path hide title (same style as homepage hero)
  if (titleRef.value) {
    heroTimeline.to(titleRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.05)
  }

  // Clip-path hide specs with stagger
  if (specsRef.value) {
    const specs = specsRef.value.querySelectorAll('.location-detail__spec')
    heroTimeline.to(specs, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      stagger: 0.02,
      ease: 'power2.in'
    }, 0.08)
  }

  // Clip-path hide actions
  if (actionsRef.value) {
    heroTimeline.to(actionsRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.11)
  }
}

function goBack() {
  goBackWithTransition('/lokacije', slug, heroImage.value, imageWrapperRef.value)
}

function shareLocation() {
  const url = window.location.href
  if (navigator.share) {
    navigator.share({ title: totem.value?.name, url })
  } else {
    navigator.clipboard.writeText(url)
  }
}

function navigateToLocation(loc: any) {
  const locSlug = toSlug(loc.name)
  const img = loc.images?.[0]
  const imgUrl = resolveUrl(img?.main || img?.large || img?.thumbnail || '')

  sessionStorage.setItem('locationTransitionImage', imgUrl)
  sessionStorage.setItem('locationTransitionName', loc.name)
  sessionStorage.setItem('locationTransitionCity', cityName.value)
  sessionStorage.setItem('locationTransitionEnv', loc.postbuy_category || '')

  ;(window as any).__skipPageTransition = true
  navigateTo(`/lokacije/${locSlug}`)
}

useHead({
  title: () => `${locationName.value} - Lokacije`
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

// Hero
.location-detail__hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; // clip info/actions when image expands past them
}

.location-detail__hero-image-wrapper {
  width: calc(100vw - #{$spacing-2xl} * 2);
  margin-left: $spacing-2xl;
  height: 35vh;
  min-height: 250px;
  overflow: hidden;
  border-radius: 0 0 $radius-lg $radius-lg;
  will-change: width, height, border-radius;
  flex-shrink: 0; // prevent flex from compressing when GSAP animates to 100vh
  @include tablet {
    width: calc(100vw - #{$spacing-lg} * 2);
    margin-left: $spacing-lg;
  }
  @include mobile {
    width: 100vw;
    margin-left: 0;
    border-radius: 0;
  }
}

.location-detail__hero-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.location-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.location-detail__hero-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;
  padding: $spacing-2xl $spacing-2xl 0;
  flex: 1;
  align-content: start;
  @include tablet { grid-template-columns: 1fr; gap: $spacing-lg; padding: $spacing-lg $spacing-lg 0; }
  @include mobile { padding: $spacing-md $spacing-md 0; }
}

.location-detail__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
}

.location-detail__specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg $spacing-xl;
  align-content: start;
  @include mobile { grid-template-columns: repeat(2, 1fr); }
}

.location-detail__spec-label {
  display: block;
  font-size: $font-size-sm;
  color: $color-muted;
  margin-bottom: $spacing-xs;
}

.location-detail__spec-value {
  display: block;
  font-size: $font-size-base;
  font-weight: 500;
}

// Actions
.location-detail__actions {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-lg $spacing-2xl;
  margin-top: auto;
  @include tablet { padding: $spacing-lg; flex-wrap: wrap; }
  @include mobile { padding: $spacing-md; }
}

.location-detail__action {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 0;
  border: none;
  background: none;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $color-primary;
  cursor: pointer;
  transition: opacity $transition-base;
  &:hover { opacity: 0.6; }

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: $color-accent;
    margin-right: $spacing-xs;
  }
}

.location-detail__divider {
  height: 1px;
  background: $color-border;
  margin: 0 $spacing-2xl;
  @include tablet { margin: 0 $spacing-lg; }
}

// About
.location-detail__about {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;
  padding: 6rem $spacing-2xl;
  @include tablet { grid-template-columns: 1fr; padding: $spacing-2xl $spacing-lg; }
}

.location-detail__about-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-muted;
  align-self: start;
}

.location-detail__about-text {
  font-size: clamp(1.125rem, 2vw, 1.5rem);
  line-height: 1.6;
  font-weight: 400;
  margin: 0;
}

// Dot indicator
.location-detail__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-primary;
  flex-shrink: 0;
}

// Floor plans
.location-detail__floorplans {
  padding: $spacing-2xl;
  @include tablet { padding: $spacing-lg; }
}

.location-detail__floorplans-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg;
  @include mobile { grid-template-columns: 1fr; }
}

.location-detail__floorplan {
  position: relative;
}

.location-detail__floorplan-label {
  display: block;
  font-size: $font-size-sm;
  color: $color-muted;
  margin-bottom: $spacing-sm;
}

.location-detail__floorplan img {
  width: 100%;
  border-radius: $radius-md;
  background: $color-surface;
}

// Gallery
.location-detail__gallery {
  padding: 4rem $spacing-2xl;
  @include tablet { padding: $spacing-2xl $spacing-lg; }
}

.location-detail__gallery-viewport {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
}

.location-detail__gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.location-detail__gallery-controls {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.location-detail__gallery-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  white-space: nowrap;
}

.location-detail__gallery-track {
  flex: 1;
  height: 2px;
  background: $color-border;
  border-radius: 1px;
  overflow: hidden;
}

.location-detail__gallery-progress {
  height: 100%;
  background: $color-primary;
  transition: width 0.3s ease;
}

.location-detail__gallery-counter {
  font-size: $font-size-sm;
  color: $color-muted;
  min-width: 1.5rem;
  text-align: right;
}

.location-detail__gallery-dots {
  display: flex;
  justify-content: center;
  gap: $spacing-xs;
  margin-top: $spacing-md;
}

.location-detail__gallery-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: $color-border;
  cursor: pointer;
  padding: 0;
  transition: background $transition-base;
  &--active { background: $color-primary; }
}

// Statistics
.location-detail__statistics {
  padding: 4rem $spacing-2xl;
  @include tablet { padding: $spacing-2xl $spacing-lg; }
}

.location-detail__section-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 400;
  margin: 0 0 $spacing-2xl;
}

.location-detail__section-subtitle {
  font-size: $font-size-sm;
  color: $color-muted;
  vertical-align: super;
}

.location-detail__stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;
  @include tablet { grid-template-columns: 1fr; }
}

.location-detail__stats-column {
  border-top: 1px solid $color-border;
  padding-top: $spacing-lg;
}

.location-detail__stats-label {
  font-size: $font-size-sm;
  font-weight: 500;
  margin-bottom: $spacing-xl;
}

.location-detail__stat-row {
  margin-bottom: $spacing-xl;
}

.location-detail__stat-name {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: $font-size-sm;
  color: $color-muted;
  margin-bottom: $spacing-sm;
}

.location-detail__stat-big {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.02em;
  margin-bottom: $spacing-sm;
}

.location-detail__stat-desc {
  font-size: $font-size-sm;
  color: $color-muted;
  line-height: 1.6;
  max-width: 400px;
}

// Nearby
.location-detail__nearby {
  padding: 4rem $spacing-2xl 6rem;
  @include tablet { padding: $spacing-2xl $spacing-lg 4rem; }
}

.location-detail__nearby-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-lg;
  @include desktop { grid-template-columns: repeat(3, 1fr); }
  @include tablet { grid-template-columns: repeat(2, 1fr); }
  @include mobile { grid-template-columns: 1fr; }
}

.location-detail__nearby-card {
  cursor: pointer;
  transition: opacity $transition-base;
  &:hover { opacity: 0.8; }
}

.location-detail__nearby-image-wrapper {
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: $radius-md;
  background: $color-surface;
  margin-bottom: $spacing-sm;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.location-detail__nearby-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.location-detail__nearby-type {
  font-size: $font-size-xs;
  color: $color-muted;
}

.location-detail__nearby-name {
  font-size: $font-size-sm;
  font-weight: 500;
}
</style>
