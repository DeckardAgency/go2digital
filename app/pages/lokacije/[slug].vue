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

        <!-- YouTube video overlay (PiP in bottom-right of hero) -->
        <!-- Hidden on initial load; fades in once the user starts scrolling, -->
        <!-- mirroring the old /lokacije/{slug} where it appears only when the -->
        <!-- pinned hero is in its expanded/fullscreen state. -->
        <div v-if="youtubeVideoId" class="location-detail__video" :class="{ 'location-detail__video--visible': isHeroScrolled }">
          <iframe
            v-if="isVideoActivated"
            :src="`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`"
            :title="`${totem?.name} - video`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="location-detail__video-iframe"
          ></iframe>
          <button
            v-else
            type="button"
            class="location-detail__video-btn"
            :aria-label="$t('location.detail.video.watch')"
            @click.stop="isVideoActivated = true"
          >
            <img
              :src="`https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`"
              :alt="`${totem?.name} - video`"
              class="location-detail__video-thumb"
              loading="lazy"
            >
            <span class="location-detail__video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
              </svg>
            </span>
            <span class="location-detail__video-label">{{ $t('location.detail.video.watch') }}</span>
          </button>
        </div>
      </div>

      <div class="location-detail__hero-info" ref="heroInfoRef">
        <h1 class="location-detail__title" ref="titleRef">{{ totem?.name || transitionName || locationName }}</h1>

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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 8.6665C13.1667 10.3332 13.1667 12.9165 11.5 14.5832L9.16667 16.9165C7.5 18.5832 4.91667 18.5832 3.25 16.9165C1.58333 15.2498 1.58333 12.6665 3.25 10.9998L5.33333 8.99984" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.16797 11C7.5013 9.3333 7.5013 6.75 9.16797 5.08333L11.5013 2.75C13.168 1.08333 15.7513 1.08333 17.418 2.75C19.0846 4.41667 19.0846 7 17.418 8.66667L15.3346 10.6667" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
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
          <div class="location-detail__map-container" ref="indoorMapRef"></div>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="location-detail__gallery" v-if="galleryImages.length > 0">
      <div class="location-detail__gallery-carousel">
        <!-- Prev arrow -->
        <button
          type="button"
          class="location-detail__gallery-arrow location-detail__gallery-arrow--prev"
          v-if="galleryImages.length > 1"
          @click="prevGalleryImage"
          :aria-label="$t('location.detail.gallery')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Next arrow -->
        <button
          type="button"
          class="location-detail__gallery-arrow location-detail__gallery-arrow--next"
          v-if="galleryImages.length > 1"
          @click="nextGalleryImage"
          :aria-label="$t('location.detail.gallery')"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

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
            <span class="location-detail__nearby-city">{{ loc._cityName }}</span>
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
const { t: tr, locale: i18nLocale } = useI18n()
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

// Initial title from the listing card (via sessionStorage) so the H1 doesn't
// flash from slug-derived Title Case to the real DB name once the API resolves.
const transitionName = ref(import.meta.client ? (sessionStorage.getItem('locationTransitionName') || '') : '')
const transitionCity = ref(import.meta.client ? (sessionStorage.getItem('locationTransitionCity') || '') : '')

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
const cityName = computed(() => matchedData.value?.cityName || transitionCity.value || '')

// YouTube video — extract ID from totem.video_url (supports watch?v=, youtu.be, embed)
const youtubeVideoId = computed<string | null>(() => {
  const url = totem.value?.video_url
  if (!url) return null
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
})

const isVideoActivated = ref(false)
watch(youtubeVideoId, () => { isVideoActivated.value = false })

// Reveal the PiP video only after the user starts scrolling — matches the
// old /lokacije/{slug} where the overlay only appears when the hero is in its
// pinned/expanded state. Threshold > 80px to ignore inertia jitter.
const isHeroScrolled = ref(false)
function onWindowScroll() {
  isHeroScrolled.value = window.scrollY > 80
}
onMounted(() => {
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  onWindowScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onWindowScroll)
})
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

// Nearby locations — 4 closest by geographic distance (Haversine), across all cities
const nearbyLocations = computed(() => {
  if (!locData.value || !totem.value) return []
  const current = totem.value
  const lat = current.location?.[0]
  const lng = current.location?.[1]
  if (lat == null || lng == null) return []

  const EARTH_RADIUS_KM = 6371
  const toRad = (d: number) => (d * Math.PI) / 180

  const candidates: Array<{ loc: any; cityName: string; distance: number }> = []
  for (const city of locData.value) {
    for (const t of city.totems) {
      if (t.totem_id === current.totem_id) continue
      const tLat = t.location?.[0]
      const tLng = t.location?.[1]
      if (tLat == null || tLng == null) continue

      const dLat = toRad(tLat - lat)
      const dLng = toRad(tLng - lng)
      const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat)) * Math.cos(toRad(tLat)) *
                Math.sin(dLng / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = EARTH_RADIUS_KM * c

      candidates.push({ loc: { ...t, _cityName: city.name }, cityName: city.name, distance })
    }
  }

  candidates.sort((a, b) => a.distance - b.distance)
  return candidates.slice(0, 4).map(c => c.loc)
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

async function shareLocation() {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    showToast(tr('location.detail.linkCopied'))
  } catch {
    showToast(url)
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

// YouTube PiP overlay (bottom-right of hero)
.location-detail__video {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 343px;
  height: 193px; // 16:9
  z-index: 10;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
  background: #000;

  // Hidden by default — revealed once user starts scrolling (see --visible).
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: opacity 0.4s ease, visibility 0.4s ease, transform 0.4s ease;
  pointer-events: none;

  &--visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  @include mobile {
    width: 200px;
    height: 113px;
    bottom: 0.75rem;
    right: 0.75rem;
    border-radius: 8px;
  }
}

.location-detail__video-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.location-detail__video-btn {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: #000;
  color: #fff;
  cursor: pointer;
  display: block;
  font-family: inherit;

  &:hover .location-detail__video-thumb { opacity: 0.7; }
  &:hover .location-detail__video-play { transform: translate(-50%, -50%) scale(1.08); }
}

.location-detail__video-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.2s ease;
}

.location-detail__video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  transition: transform 0.2s ease;
  pointer-events: none;

  @include mobile {
    width: 40px;
    height: 40px;
    svg { width: 20px; height: 20px; }
  }
}

.location-detail__video-label {
  position: absolute;
  bottom: 0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  pointer-events: none;

  @include mobile { display: none; }
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
  gap: $spacing-4xl $spacing-xl;
  align-content: start;
  @include mobile { grid-template-columns: repeat(2, 1fr); }
}

.location-detail__spec-label {
  display: block;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.01875rem;
  color: $color-muted;
  margin-bottom: $spacing-xs;
  opacity: .4;
}

.location-detail__spec-value {
  display: block;
  font-size: 1rem;
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
  font-size: 1rem;
  font-weight: 500;
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
  position: relative;
  @include tablet { gap: 0.75rem; }
}

.location-detail__gallery-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid $color-border;
  background: $color-background;
  color: $color-primary;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: background-color $transition-base, border-color $transition-base, transform $transition-base;

  &:hover { background-color: #e8e8e8; }
  &:active { transform: translateY(-50%) scale(0.96); }
  &:focus-visible { outline: 2px solid $color-primary; outline-offset: 2px; }

  &--prev { left: $spacing-lg; }
  &--next { right: $spacing-lg; }

  @include mobile {
    width: 2.25rem;
    height: 2.25rem;
    &--prev { left: $spacing-sm; }
    &--next { right: $spacing-sm; }
  }
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
  grid-template-columns: 200px 1fr 480px;
  gap: $spacing-2xl;
  align-items: start;
  padding: 2.5rem $spacing-2xl;
  border-top: 1px solid $color-border;

  @include desktop {
    grid-template-columns: 180px 1fr 480px;
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
  max-width: 480px;

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
