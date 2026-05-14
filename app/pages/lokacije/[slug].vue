<template>
  <div class="location-detail">
    <!-- Hero -->
    <section class="location-detail__hero" ref="heroRef">
      <div class="location-detail__hero-image-wrapper" ref="imageWrapperRef">
        <template v-if="heroImage">
          <img
            :src="heroImageWebp || heroImageLarge"
            :alt="totem?.name"
            class="location-detail__hero-image location-detail__hero-image--desktop"
            :style="{ objectPosition: `${focalX}% ${focalY}%` }"
          >
          <img
            :src="heroImageWebp || heroImageLarge"
            :alt="totem?.name"
            class="location-detail__hero-image location-detail__hero-image--mobile"
            :style="{ objectPosition: `${focalMobileX}% ${focalMobileY}%` }"
          >
        </template>
        <FocalPointEditor
          v-if="isAdmin && totem?.id"
          ref="focalEditorRef"
          :image-url="heroImageLarge || ''"
          :initial-x="focalX"
          :initial-y="focalY"
          :initial-mobile-x="focalMobileX"
          :initial-mobile-y="focalMobileY"
          :totem-id="totem.id"
          :token="adminToken!"
          @saved="onFocalSaved"
          @close="() => {}"
        />
        <button
          v-if="isAdmin"
          class="location-detail__focal-btn"
          @click="focalEditorRef?.open()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ $t('location.detail.focalPoint') }}
        </button>
      </div>

      <div class="location-detail__hero-info" ref="heroInfoRef">
        <h1 class="location-detail__title" ref="titleRef">{{ totem?.name || locationName }}</h1>

        <div class="location-detail__specs" ref="specsRef" v-if="totem">
          <div class="location-detail__spec">
            <span class="location-detail__spec-label">{{ $t('location.detail.spec.city') }}</span>
            <span class="location-detail__spec-value">{{ cityName }}</span>
          </div>
          <div class="location-detail__spec" v-if="totem.screen_width && totem.screen_height">
            <span class="location-detail__spec-label">{{ $t('location.detail.spec.resolution') }}</span>
            <span class="location-detail__spec-value">{{ totem.screen_width }}x{{ totem.screen_height }} px</span>
          </div>
          <div class="location-detail__spec" v-if="totem.postbuy_category">
            <span class="location-detail__spec-label">{{ $t('location.detail.spec.environment') }}</span>
            <span class="location-detail__spec-value">{{ capitalize(totem.postbuy_category) }}</span>
          </div>
          <div class="location-detail__spec" v-if="totem.ad_duration">
            <span class="location-detail__spec-label">{{ $t('location.detail.spec.duration') }}</span>
            <span class="location-detail__spec-value">{{ totem.ad_duration }} {{ $t('location.detail.spec.minutes') }}</span>
          </div>
          <div class="location-detail__spec" v-if="totem.totem_motion">
            <span class="location-detail__spec-label">{{ $t('location.detail.spec.type') }}</span>
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
          {{ $t('location.detail.back') }}
        </button>
        <button class="location-detail__action" @click="shareLocation">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 9l4-2M6 7l4 2M14 5a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM14 11a2 2 0 11-4 0 2 2 0 014 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('location.detail.share') }}
        </button>
        <label class="location-detail__action location-detail__action--save" :class="{ 'location-detail__action--active': isSaved }">
          <input type="checkbox" :checked="isSaved" @change="toggleSaveToCollection">
          {{ isSaved ? $t('location.detail.saved') : $t('location.detail.save') }}
        </label>
      </div>
    </section>

    <div class="location-detail__divider"></div>

    <!-- About -->
    <section class="location-detail__about" v-if="totem?.description">
      <div class="location-detail__about-label">
        <span class="location-detail__dot"></span>
        {{ $t('location.detail.about') }}
      </div>
      <p class="location-detail__about-text">{{ totem.description }}</p>
    </section>

    <!-- Location Map -->
    <section class="location-detail__maps" v-if="totem?.location?.[0]">
      <div class="location-detail__maps-grid location-detail__maps-grid--single">
        <div class="location-detail__map-item location-detail__map-item--full">
          <span class="location-detail__map-label">{{ $t('location.detail.map.indoor') }}</span>
          <div class="location-detail__map-container" ref="indoorMapRef"></div>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="location-detail__gallery" v-if="galleryImages.length > 0">
      <div class="location-detail__gallery-carousel">
        <!-- Previous image (peek) -->
        <div
          class="location-detail__gallery-peek location-detail__gallery-peek--prev"
          :class="{ 'location-detail__gallery-peek--hidden': galleryImages.length <= 1 }"
          @click="prevGalleryImage"
        >
          <img
            :src="galleryImages[(activeGalleryIndex - 1 + galleryImages.length) % galleryImages.length]"
            :alt="`${totem?.name} - prev`"
          >
        </div>

        <!-- Active image -->
        <div
          class="location-detail__gallery-viewport"
          ref="galleryViewportRef"
          @click="nextGalleryImage"
        >
          <img
            :src="galleryImages[activeGalleryIndex]"
            :alt="`${totem?.name} - ${activeGalleryIndex + 1}`"
            class="location-detail__gallery-image"
          >
        </div>

        <!-- Next image (peek) -->
        <div
          class="location-detail__gallery-peek location-detail__gallery-peek--next"
          :class="{ 'location-detail__gallery-peek--hidden': galleryImages.length <= 1 }"
          @click="nextGalleryImage"
        >
          <img
            :src="galleryImages[(activeGalleryIndex + 1) % galleryImages.length]"
            :alt="`${totem?.name} - next`"
          >
        </div>
      </div>

      <div class="location-detail__gallery-controls" v-if="galleryImages.length > 1">
        <div class="location-detail__gallery-label">
          <span class="location-detail__gallery-bullet"></span>
          {{ $t('location.detail.gallery') }}
        </div>
        <div class="location-detail__gallery-track">
          <div
            class="location-detail__gallery-progress"
            :style="{ width: `${((activeGalleryIndex + 1) / galleryImages.length) * 100}%` }"
          ></div>
        </div>
        <span class="location-detail__gallery-counter">{{ String(activeGalleryIndex + 1).padStart(2, '0') }}</span>
      </div>
    </section>

    <!-- Statistics -->
    <section class="location-detail__statistics" v-if="totem">
      <!-- Header -->
      <div class="location-detail__stats-header">
        <h2 class="location-detail__stats-title">
          {{ $t('location.detail.statistics.title') }}
          <span class="location-detail__stats-period">{{ $t('location.detail.statistics.period') }}</span>
        </h2>
        <div class="location-detail__stats-type">{{ $t('location.detail.statistics.primary') }}</div>
      </div>

      <!-- Stat: Approximate Traffic -->
      <div class="location-detail__stat-row" v-if="totem.reach">
        <div class="location-detail__stat-label">
          <span class="location-detail__dot"></span>
          {{ $t('location.detail.statistics.traffic.label') }}
        </div>
        <div class="location-detail__stat-value">{{ formatNumber(totem.reach) }}</div>
        <div class="location-detail__stat-desc">
          {{ $t('location.detail.statistics.traffic.description', { count: totem.reach?.toLocaleString() || '0' }) }}
        </div>
      </div>

      <!-- Stat: Pedestrian Footfall -->
      <div class="location-detail__stat-row" v-if="totem.pedestrian_count">
        <div class="location-detail__stat-label">
          <span class="location-detail__dot"></span>
          {{ $t('location.detail.statistics.pedestrian.label') }}
        </div>
        <div class="location-detail__stat-value">{{ formatNumber(totem.pedestrian_count) }}</div>
        <div class="location-detail__stat-desc">
          {{ $t('location.detail.statistics.pedestrian.description', { count: totem.pedestrian_count?.toLocaleString() || '0' }) }}
        </div>
      </div>

      <!-- Secondary label -->
      <div class="location-detail__stats-secondary">
        <div class="location-detail__stats-type">{{ $t('location.detail.statistics.secondary') }}</div>
      </div>

      <!-- Stat: Screens -->
      <div class="location-detail__stat-row">
        <div class="location-detail__stat-label">
          <span class="location-detail__dot"></span>
          {{ getLocSetting('location.detail.statistics.screens.label') || $t('location.detail.statistics.screens.label') }}
        </div>
        <div class="location-detail__stat-value">{{ screensCount }}</div>
        <div class="location-detail__stat-desc">
          {{ getLocSetting('location.detail.statistics.screens.description')
              ? fillCount(getLocSetting('location.detail.statistics.screens.description'), screensCount)
              : $t('location.detail.statistics.screens.description', { count: screensCount }) }}
        </div>
      </div>
    </section>

    <!-- Nearby Locations -->
    <section class="location-detail__nearby" v-if="nearbyLocations.length > 0">
      <h2 class="location-detail__nearby-title">
        {{ $t('location.detail.nearby.title') }}
        <span class="location-detail__nearby-count">({{ nearbyLocations.length }})</span>
      </h2>
      <div class="location-detail__nearby-grid">
        <div
          v-for="loc in nearbyLocations"
          :key="loc.totem_id"
          class="location-detail__nearby-card"
          @click="navigateToLocation(loc)"
        >
          <div class="location-detail__nearby-image">
            <img
              v-if="loc.images?.[0]"
              :src="resolveUrl(loc.images[0].main || loc.images[0].thumbnail)"
              :alt="loc.name"
              loading="lazy"
            >
          </div>
          <div class="location-detail__nearby-info">
            <span class="location-detail__nearby-city">{{ cityName }}</span>
            <span class="location-detail__nearby-name">{{ loc.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="isToastVisible" class="location-detail-toast">{{ toastMessage }}</div>
      </Transition>
    </Teleport>
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

// CMS-editable translations via settings API
const { locale: i18nLocale } = useI18n()
const { data: locSettingsData } = useApi<any>('/api/settings?group=location', { lazy: true, server: false })

function getLocSetting(key: string): string {
  const raw = locSettingsData.value
  const settings = Array.isArray(raw)
    ? raw
    : (raw?.member ?? raw?.['hydra:member'] ?? [])
  const s = settings.find((s: any) => s.key === key)
  if (!s?.value) return ''
  if (s.value[i18nLocale.value]) return s.value[i18nLocale.value]
  if (s.value.value !== undefined) return s.value.value
  return ''
}

function fillCount(s: string, count: number | string): string {
  const c = String(count)
  return s.replace(/\{count\}/g, c).replace(/\{\}/g, c)
}

// Admin auth for focal point editor
const { isAdmin, adminToken, checkAdmin } = useAdminAuth()
const focalEditorRef = ref<{ open: () => void } | null>(null)

// Initialize focal point from transition data (prevents jump when clone is removed)
const storedFocalX = import.meta.client ? parseFloat(sessionStorage.getItem('locationTransitionFocalX') || '50') : 50
const storedFocalY = import.meta.client ? parseFloat(sessionStorage.getItem('locationTransitionFocalY') || '50') : 50

const focalX = ref(storedFocalX)
const focalY = ref(storedFocalY)
const focalMobileX = ref(50)
const focalMobileY = ref(50)

onMounted(() => {
  checkAdmin()
  // Clean up transition data
  sessionStorage.removeItem('locationTransitionFocalX')
  sessionStorage.removeItem('locationTransitionFocalY')
})

function onFocalSaved(dx: number, dy: number, mx: number, my: number) {
  focalX.value = dx
  focalY.value = dy
  focalMobileX.value = mx
  focalMobileY.value = my
}

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

const { data: locData } = useFetch<any[]>(`${apiBase}/api/locations`, {
  key: 'locations-detail-data',
  lazy: true,
  server: false,
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
const screensCount = computed(() => totem.value?.screens ?? 0)

// Sync focal point from totem data
watch(totem, (t) => {
  if (t) {
    focalX.value = t.image_focal_x ?? 50
    focalY.value = t.image_focal_y ?? 50
    focalMobileX.value = t.image_focal_mobile_x ?? 50
    focalMobileY.value = t.image_focal_mobile_y ?? 50
  }
}, { immediate: true })

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

// WebP proxy URL for hero image
const heroImageWebp = computed(() => {
  const img = totem.value?.images?.[0]
  const path = img?.large || img?.main
  if (!path) return null
  return `${apiBase}/api/image-proxy?url=${encodeURIComponent(path)}`
})

const galleryImages = computed(() => {
  if (!totem.value?.images) return []
  return totem.value.images.map((img: any) => resolveUrl(img.main || img.large || img.thumbnail || ''))
})

const indoorMapRef = ref<HTMLElement | null>(null)

let detailMaps: any[] = []

async function initDetailMaps() {
  const t = totem.value
  if (!t?.location?.[0] || !indoorMapRef.value) return

  const { useMapboxToken } = await import('~/composables/useMapboxToken')
  const token = await useMapboxToken()
  const mapboxgl = await import('mapbox-gl')
  await import('mapbox-gl/dist/mapbox-gl.css')
  mapboxgl.default.accessToken = token

  const lat = t.location[0]
  const lng = t.location[1]

  const isMobile = window.matchMedia('(max-width: 575px)').matches

  const map = new mapboxgl.default.Map({
    container: indoorMapRef.value,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [lng, lat],
    zoom: 15,
    attributionControl: false,
    // Require Ctrl/Cmd + scroll to zoom on desktop so page scroll isn't
    // hijacked by the map. Shows a helper overlay on plain scroll/touch.
    cooperativeGestures: true,
    // On mobile, disable touch gestures so a finger drag scrolls the page
    // instead of the map. Users can still zoom via the +/- control buttons.
    dragPan: !isMobile,
    scrollZoom: !isMobile,
    touchZoomRotate: !isMobile,
    touchPitch: !isMobile,
    doubleClickZoom: !isMobile,
  })

  map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), 'top-right')

  const markerEl = document.createElement('div')
  markerEl.style.cssText = `
    width: 16px; height: 16px; border-radius: 50%;
    background-color: #0CD459; border: 2px solid #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  `
  new mapboxgl.default.Marker({ element: markerEl })
    .setLngLat([lng, lat])
    .addTo(map)

  detailMaps.push(map)
}

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
const COLLECTION_KEY = 'selectedLocations'
const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimeout: number | null = null

function showToast(msg: string) {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = msg
  isToastVisible.value = true
  toastTimeout = window.setTimeout(() => { isToastVisible.value = false }, 3000)
}

function loadSavedState() {
  try {
    const data = localStorage.getItem(COLLECTION_KEY)
    if (!data) return
    const locations = JSON.parse(data) as any[]
    const t = totem.value
    if (!t) return
    isSaved.value = locations.some(loc => loc.slug === slug || loc.id === t.totem_id || loc.externalId === t.external_id)
  } catch {}
}

function toggleSaveToCollection() {
  try {
    const data = localStorage.getItem(COLLECTION_KEY)
    const locations: any[] = data ? JSON.parse(data) : []
    const t = totem.value
    if (!t) return

    const idx = locations.findIndex(loc => loc.slug === slug || loc.id === t.totem_id || loc.externalId === t.external_id)

    const name = t.name || locationName.value
    if (idx >= 0) {
      // Remove from collection
      locations.splice(idx, 1)
      isSaved.value = false
      showToast(`Uklonjeno "${name}" iz kolekcije`)
    } else {
      // Add to collection
      const img = t.images?.[0]
      locations.push({
        id: t.totem_id || slug,
        slug,
        externalId: t.external_id || '',
        name: t.name || locationName.value,
        city: cityName.value,
        environments: [t.postbuy_category || ''].filter(Boolean),
        lat: t.location?.[0] || 0,
        lng: t.location?.[1] || 0,
        image: img ? resolveUrl(img.main || img.large || img.thumbnail || '') : '',
        screens: t.screens || 0,
      })
      isSaved.value = true
      showToast(`Dodano "${name}" u kolekciju`)
    }

    localStorage.setItem(COLLECTION_KEY, JSON.stringify(locations))
  } catch (e) {
    console.error('Error toggling collection:', e)
  }
}

const galleryViewportRef = ref<HTMLElement | null>(null)
const isGalleryTransitioning = ref(false)

let distortionInstance: any = null

async function initGalleryEffect() {
  if (distortionInstance) return // already initialized
  if (!galleryViewportRef.value || galleryImages.value.length <= 1) return
  const { createDistortionTransition } = await import('~/composables/useDistortionTransition')
  distortionInstance = createDistortionTransition(galleryViewportRef.value)
}

// Watch for gallery viewport to become available (v-if delays it until data loads)
watch(galleryViewportRef, (el) => {
  if (el && !distortionInstance) {
    nextTick(() => initGalleryEffect())
  }
})

// Also watch galleryImages in case data loads after viewport is rendered
watch(galleryImages, (imgs) => {
  if (imgs.length > 1 && galleryViewportRef.value && !distortionInstance) {
    nextTick(() => initGalleryEffect())
  }
})

// Initialize detail maps and load saved state when totem data loads
watch(totem, (t) => {
  if (t) {
    loadSavedState()
    if (t.location?.[0] && detailMaps.length === 0) {
      nextTick(() => { requestAnimationFrame(() => initDetailMaps()) })
    }
  }
})

async function transitionGalleryTo(newIndex: number) {
  if (isGalleryTransitioning.value || galleryImages.value.length <= 1) return
  const fromSrc = galleryImages.value[activeGalleryIndex.value]
  const toSrc = galleryImages.value[newIndex]
  if (fromSrc === toSrc) return

  // Try to init if not yet (in case watch didn't fire)
  if (!distortionInstance) await initGalleryEffect()

  if (distortionInstance) {
    isGalleryTransitioning.value = true
    const { playDistortionTransition } = await import('~/composables/useDistortionTransition')
    await playDistortionTransition(distortionInstance, fromSrc, toSrc, 700)
    activeGalleryIndex.value = newIndex
    isGalleryTransitioning.value = false
  } else {
    activeGalleryIndex.value = newIndex
  }
}

function nextGalleryImage() {
  endGalleryHover()
  const next = (activeGalleryIndex.value + 1) % galleryImages.value.length
  transitionGalleryTo(next)
}

function prevGalleryImage() {
  endGalleryHover()
  const prev = (activeGalleryIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
  transitionGalleryTo(prev)
}

function endGalleryHover() {}

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
    initGalleryEffect()
  })
})

onUnmounted(() => {
  if (distortionInstance) { distortionInstance.destroy(); distortionInstance = null }
  detailMaps.forEach(m => m.remove()); detailMaps = []
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
  goBackWithTransition('/lokacije', slug, heroImage.value, imageWrapperRef.value, { x: focalX.value, y: focalY.value })
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

// SEO — use CMS seo data with fallback
const { locale } = useI18n()

const seo = computed(() => {
  const s = totem.value?.seo
  if (!s) return null
  const t = s.translations?.[locale.value] || s.translations?.hr || null
  return { ...s, ...t }
})

useHead({
  title: () => seo.value?.title || `${locationName.value} - Lokacije`,
  meta: () => [
    ...(seo.value?.description ? [{ name: 'description', content: seo.value.description }] : []),
    ...(seo.value?.keywords ? [{ name: 'keywords', content: seo.value.keywords }] : []),
    ...(seo.value?.robots ? [{ name: 'robots', content: seo.value.robots }] : []),
    // Open Graph
    { property: 'og:title', content: seo.value?.ogTitle || seo.value?.title || `${locationName.value} - Lokacije` },
    ...(seo.value?.ogDescription ? [{ property: 'og:description', content: seo.value.ogDescription }] : []),
    ...(seo.value?.ogType ? [{ property: 'og:type', content: seo.value.ogType }] : []),
    // Twitter
    ...(seo.value?.twitterCard ? [{ name: 'twitter:card', content: seo.value.twitterCard }] : []),
  ],
  ...(seo.value?.canonicalUrl ? { link: [{ rel: 'canonical', href: seo.value.canonicalUrl }] } : {}),
})

</script>

<style scoped lang="scss">
.location-detail {
  min-height: 100dvh; // dvh accounts for mobile browser chrome (URL bar, toolbar)
  background-color: #FAFAFA;
}

// Hero
.location-detail__hero {
  height: 100dvh; // dvh so the actions row never slips under the mobile browser chrome
  display: flex;
  flex-direction: column;
  overflow: hidden; // clip info/actions when image expands past them
}

.location-detail__hero-image-wrapper {
  position: relative;
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

.location-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  &--mobile {
    display: none;
  }
}

@media (max-width: 767px) {
  .location-detail__hero-image--desktop {
    display: none;
  }
  .location-detail__hero-image--mobile {
    display: block;
  }
}

.location-detail__focal-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
}

.location-detail__hero-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;
  padding: $spacing-md $spacing-2xl 0;
  flex: 1;
  align-content: start;
  @include tablet { grid-template-columns: 1fr; gap: $spacing-lg; padding: $spacing-lg $spacing-lg 0; }
  @include mobile { padding: $spacing-md $spacing-md 0; }
}

.location-detail__title {
  // old .location-show__title: 3.125rem/400/1/-0.0625rem (mobile 1.75rem/1.1)
  font-size: clamp(1.75rem, 4vw, 3.125rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.0625rem;
  margin: 0;
  @include tablet { line-height: 1.1; }
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
  font-size: 0.875rem;              // old .location-hero__detail-label: 0.875rem
  font-weight: 400;
  letter-spacing: 0.01875rem;
  color: $color-muted;
  margin-bottom: $spacing-xs;
  opacity: .4;
}

.location-detail__spec-value {
  display: block;
  font-size: 1rem;                  // old .location-hero__detail-value: 1rem
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
  @include mobile {
    // Add the iOS home-indicator inset to the bottom padding so the row sits
    // above the safe area on devices that report it.
    padding: $spacing-md $spacing-md calc(#{$spacing-md} + env(safe-area-inset-bottom)) $spacing-md;
  }
}

.location-detail__action {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.875rem;              // old .location-hero__action-btn: 0.875rem
  font-weight: 500;
  font-family: inherit;
  color: $color-primary;
  cursor: pointer;
  transition: opacity $transition-base;
  @include tablet { font-size: 0.8125rem; }
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
  font-size: 0.75rem;               // old .location-info__about-title: 0.75rem/400 capitalize
  font-weight: 400;
  line-height: 0.975rem;
  text-transform: capitalize;
  color: $color-muted;
  align-self: start;
}

.location-detail__about-text {
  // old .location-info__about-description: 2.125rem/400/2.3375rem  (tablet 1.125rem)
  font-size: clamp(1.125rem, 3vw, 2.125rem);
  line-height: 1.1;
  letter-spacing: -0.02125rem;
  font-weight: 400;
  margin: 0;
  text-indent: 20rem;

  @include desktop { text-indent: 12rem; }
  @include tablet { font-size: 1.125rem; text-indent: 6rem; }
  @include mobile { text-indent: 0; }
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
// Location Maps
.location-detail__maps {
  padding: 6rem $spacing-5xl;
  @include tablet { padding: $spacing-2xl 0; }
}

.location-detail__maps-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 0;

  &--single {
    grid-template-columns: 1fr;
  }

  @include mobile { grid-template-columns: 1fr; }
}

.location-detail__map-item {
  position: relative;

  &--full {
    grid-column: 1 / -1;
  }
}

.location-detail__map-label {
  display: block;
  font-size: 0.8125rem;             // old .location-info__map-label: 0.8125rem/500 (mobile 0.75rem)
  font-weight: 500;
  color: $color-primary;
  padding: 0 $spacing-2xl $spacing-md;
  @include tablet { padding: 0 $spacing-lg $spacing-sm; }
  @include mobile { font-size: 0.75rem; }
}

.location-detail__map-container {
  width: 100%;
  height: 500px;
  border-radius: 2rem;
  overflow: hidden;
  @include tablet { height: 350px; }
  @include mobile { height: 280px; }
}

// Gallery
// Gallery carousel
.location-detail__gallery {
  padding: 6rem 0 4rem;
  overflow: hidden;
  @include tablet { padding: 3rem 0 2rem; }
}

.location-detail__gallery-carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0 0;
  margin-bottom: 2rem;
  @include tablet { gap: 0.75rem; }
}

.location-detail__gallery-viewport {
  width: 60%;
  max-width: 800px;
  aspect-ratio: 16/10;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  z-index: 2;

  @include tablet { width: 75%; }
  @include mobile { width: 85%; border-radius: $radius-lg; }
}

.location-detail__gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  .location-detail__gallery-viewport:hover & {
    transform: scale(1.02);
  }
}

.location-detail__gallery-peek {
  width: 18%;
  aspect-ratio: 16/10;
  overflow: hidden;
  border-radius: 0.75rem;
  opacity: 0.5;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity 0.3s ease;
  position: relative;
  z-index: 1;

  &:hover { opacity: 0.7; }
  &--hidden { visibility: hidden; pointer-events: none; }

  @include tablet { width: 12%; }
  @include mobile { width: 8%; border-radius: $radius-sm; }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.location-detail__gallery-controls {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  max-width: 500px;
  margin: 0 auto;
  padding: 0 $spacing-2xl;

  @include tablet { padding: 0 $spacing-lg; }
}

.location-detail__gallery-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.875rem;              // old .gallery__label: 0.875rem/500
  font-weight: 500;
  white-space: nowrap;
  color: $color-primary;
}

.location-detail__gallery-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: $color-primary;
}

.location-detail__gallery-track {
  flex: 1;
  height: 1px;
  background: $color-border;
  border-radius: 1px;
  overflow: hidden;
}

.location-detail__gallery-progress {
  height: 100%;
  background: $color-accent;
  transition: width 0.3s ease;
}

.location-detail__gallery-counter {
  font-size: 0.75rem;               // old .location-show__gallery-counter: 0.75rem/400/1.3
  font-weight: 400;
  line-height: 1.3;
  color: $color-muted;
  min-width: 1.5rem;
  text-align: right;
}

// Statistics — borders edge-to-edge, content padded
.location-detail__statistics {
  padding: 6rem 0;
  @include tablet { padding: $spacing-2xl 0; }
}

.location-detail__stats-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 $spacing-2xl 2rem;
  @include tablet { padding: 0 $spacing-lg $spacing-lg; }
}

.location-detail__stats-title {
  // old .location-statistics__title: 2.625rem/300 (tablet 2rem)
  font-size: clamp(2rem, 4vw, 2.625rem);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;
  @include tablet { font-size: 2rem; }
}

.location-detail__stats-period {
  font-size: 1rem;                  // old: 1rem/400
  color: $color-muted;
  vertical-align: super;
  font-weight: 400;
}

.location-detail__stats-type {
  display: none;
  font-size: 0.875rem;              // old .location-statistics__metric-label: 0.875rem/500 capitalize
  font-weight: 500;
  text-transform: capitalize;
  color: $color-primary;
  flex-shrink: 0;
}

.location-detail__stats-secondary {
  display: flex;
  justify-content: flex-end;
  padding: 6rem $spacing-2xl 0;
  @include tablet { padding: 3rem $spacing-lg 0; }
}

.location-detail__stat-row {
  display: grid;
  grid-template-columns: 200px 1fr 300px;
  gap: $spacing-2xl;
  align-items: start;
  padding: 2.5rem $spacing-2xl;
  border-top: 1px solid $color-border;

  @include desktop {
    grid-template-columns: 180px 1fr 260px;
  }

  @include tablet {
    grid-template-columns: 1fr;
    gap: $spacing-md;
    padding: $spacing-xl $spacing-lg;
  }

  &--no-value {
    .location-detail__stat-value { display: none; }
    grid-template-columns: 200px 1fr;
    @include desktop { grid-template-columns: 180px 1fr; }
    @include tablet { grid-template-columns: 1fr; }
  }
}

.location-detail__stat-label {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  font-size: 0.75rem;               // old .location-show__stat-label: 0.75rem/400/0.9 capitalize
  font-weight: 400;
  line-height: 0.9;
  text-transform: capitalize;
  color: $color-muted;
  padding-top: 0.25rem;
}

.location-detail__stat-value {
  // old .location-show__stat-value: 7.875rem/400/0.8/-0.315rem (mobile 5rem/-0.2rem)
  font-size: clamp(5rem, 10vw, 7.875rem);
  font-weight: 400;
  line-height: 0.8;
  letter-spacing: -0.315rem;
  color: $color-primary;
  @include mobile { font-size: 5rem; letter-spacing: -0.2rem; }
}

.location-detail__stat-desc {
  font-size: 1rem;                  // old .location-show__stat-desc: 1rem/400/1.3
  font-weight: 400;
  line-height: 1.3;
  color: $color-muted;
  opacity: .4;
  max-width: 300px;

  @include tablet { max-width: 100%; }
}

// Nearby Locations
.location-detail__nearby {
  padding: 4rem $spacing-2xl 6rem;
  @include tablet { padding: $spacing-2xl $spacing-lg 4rem; }
}

.location-detail__nearby-title {
  // old .nearby-locations__title: 2.625rem/300 (tablet 2rem)
  font-size: clamp(2rem, 4vw, 2.625rem);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 2rem;
  @include tablet { font-size: 2rem; }
}

.location-detail__nearby-count {
  font-size: 1rem;                  // old .nearby-locations__count: 1rem/400
  color: $color-muted;
  vertical-align: super;
  font-weight: 400;
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
  &:hover { opacity: 0.85; }
}

.location-detail__nearby-image {
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: $radius-lg;
  background: $color-surface;
  margin-bottom: 0.75rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    .location-detail__nearby-card:hover & { transform: scale(1.03); }
  }
}

.location-detail__nearby-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.location-detail__nearby-city {
  font-size: 0.75rem;               // old .location-show__nearby-city: 0.75rem/400/1.3 capitalize
  font-weight: 400;
  line-height: 1.3;
  text-transform: capitalize;
  color: $color-muted;
}

.location-detail__nearby-name {
  font-size: 1rem;                  // old .location-show__nearby-name: 1rem/400/1.3
  font-weight: 400;
  line-height: 1.3;
  color: $color-primary;
}

// Toast notification
.location-detail-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.875rem 1.5rem;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: 0.875rem;              // old .location-show-toast: 0.875rem/400/1.3
  font-weight: 400;
  line-height: 1.3;
  font-family: $font-family;
  z-index: 10010;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(10px); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
