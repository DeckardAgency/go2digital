<template>
  <div ref="appRoot">
    <PageLoader v-if="showLoader" @complete="onLoaderComplete" />
    <NuxtRouteAnnouncer />
    <MobileNav />
    <HeroNav />
    <div class="page-wrapper" ref="pageWrapper">
      <NuxtPage />
      <FooterSection v-if="showFooter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const appRoot = ref<HTMLElement | null>(null)
const pageWrapper = ref<HTMLElement | null>(null)
const isAnimating = ref(false)
let transitionOverlay: HTMLElement | null = null
let depthOverlay: HTMLElement | null = null

const router = useRouter()
const route = useRoute()
const nuxtApp = useNuxtApp()
const { isMenuOpen, closeMenu } = useNavigation()

// Page loader
const showLoader = ref(true)
function onLoaderComplete() { showLoader.value = false }

const showFooter = computed(() => route.meta.showFooter !== false)

const MENU_CLOSE_DURATION = 300
const OVERLAY_SLIDES_UP = true
const OVERLAY_SLIDES_AWAY = false

// Helper: restart Lenis + refresh ScrollTrigger after components are ready.
function restartScrollSystem() {
  window.scrollTo(0, 0)

  const { $lenis } = useNuxtApp()

  // Start Lenis immediately so it can process scroll events
  if ($lenis) {
    $lenis.scrollTo(0, { immediate: true, force: true })
    $lenis.start()
  }

  // Refresh ScrollTrigger multiple times to catch all component initializations.
  // Components use different async patterns (nextTick, rAF, setTimeout) so a
  // single refresh is never enough on client navigation.
  const doRefresh = () => ScrollTrigger.refresh(true)

  // Immediate refresh
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(doRefresh)
    })
  })

  // Delayed refreshes to catch late-initializing components
  setTimeout(doRefresh, 300)
  setTimeout(doRefresh, 800)
}

// Create overlay elements on client side only
onMounted(() => {
  depthOverlay = document.createElement('div')
  depthOverlay.className = 'transition-depth-overlay'
  gsap.set(depthOverlay, { opacity: 0 })
  document.body.appendChild(depthOverlay)

  transitionOverlay = document.createElement('div')
  transitionOverlay.className = 'transition-depth'
  gsap.set(transitionOverlay, { yPercent: 100 })
  document.body.appendChild(transitionOverlay)
})

onUnmounted(() => {
  transitionOverlay?.parentNode?.removeChild(transitionOverlay)
  depthOverlay?.parentNode?.removeChild(depthOverlay)
})

// Reset transition state — ensures we never get stuck
function resetTransitionState() {
  isAnimating.value = false
  document.documentElement.classList.remove('is-transitioning')

  if (transitionOverlay) {
    gsap.set(transitionOverlay, { visibility: 'hidden', yPercent: 100 })
  }
  if (depthOverlay) {
    gsap.set(depthOverlay, { visibility: 'hidden', opacity: 0 })
  }
  if (pageWrapper.value) {
    gsap.set(pageWrapper.value, { clearProps: 'all' })
  }
}

// ── LEAVE ANIMATION ──
router.beforeEach(async (to, from) => {
  if (!from.name) return

  if ((window as any).__skipPageTransition) {
    ;(window as any).__skipPageTransition = false
    // Clean up any stale transition state from a previous navigation
    resetTransitionState()
    return
  }

  if (isAnimating.value) return

  const wrapper = pageWrapper.value
  if (!transitionOverlay || !wrapper || !depthOverlay) return

  if (isMenuOpen.value) {
    closeMenu()
    await new Promise(resolve => setTimeout(resolve, MENU_CLOSE_DURATION))
  }

  isAnimating.value = true

  // iOS WebKit detaches the body scroll context whenever a `filter` is applied
  // to an ancestor (it creates a containing block), and doesn't re-attach it
  // after the filter is cleared. Skip the blur on mobile so /lokacije & co.
  // stay scrollable after in-app navigation; scale/y still carry the transition.
  const isMobileTransition = window.matchMedia('(max-width: 767px)').matches

  await new Promise<void>((resolve) => {
    document.documentElement.classList.add('is-transitioning')

    const tl = gsap.timeline({ onComplete: resolve })

    tl.set(depthOverlay, { visibility: 'visible' })
      .to(wrapper, {
        scale: 0.85,
        y: -80,
        filter: isMobileTransition ? 'none' : 'blur(4px)',
        duration: 0.6,
        ease: 'power3.inOut'
      })
      .to(depthOverlay, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      }, '<')

    if (OVERLAY_SLIDES_UP) {
      tl.set(transitionOverlay, { yPercent: 100, visibility: 'visible' }, 0)
        .to(transitionOverlay, {
          yPercent: 0,
          duration: 0.7,
          ease: 'power4.inOut'
        }, '<0.15')
    }

    tl.set(wrapper, { opacity: 0 })
  })
})

// ── ENTER ANIMATION (for normal page transitions) ──
nuxtApp.hook('page:finish', async () => {
  const wrapper = pageWrapper.value

  // Normal transition: run enter animation
  if (transitionOverlay && wrapper && depthOverlay && isAnimating.value) {
    await nextTick()

    // Reset scroll
    window.scrollTo(0, 0)
    const { $lenis } = useNuxtApp()
    if ($lenis) $lenis.scrollTo(0, { immediate: true, force: true })

    // Remove overflow:hidden so ScrollTrigger can measure correctly
    document.documentElement.classList.remove('is-transitioning')

    // CRITICAL: Clear all transforms from the leave animation (scale, y, filter)
    // BEFORE components create ScrollTriggers. Only keep opacity: 0 for the fade-in.
    gsap.set(wrapper, { clearProps: 'transform,scale,y' })

    // Enter animation: fade in page, hide overlays
    await new Promise<void>((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Ensure everything is clean even if timeline had issues
          gsap.set(wrapper, { clearProps: 'all' })
          gsap.set(transitionOverlay!, { visibility: 'hidden', yPercent: 100 })
          gsap.set(depthOverlay!, { visibility: 'hidden', opacity: 0 })
          isAnimating.value = false
          resolve()
        }
      })

      // Skip filter blur on mobile — see leave animation comment above.
      const isMobileEnter = window.matchMedia('(max-width: 767px)').matches

      // Hide white overlay immediately (it covered the leave animation)
      tl.set(transitionOverlay, { visibility: 'hidden', yPercent: 100 }, 0)
        // Fade out dark overlay
        .to(depthOverlay, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut'
        }, 0)
        // Fade in page content
        .fromTo(wrapper,
          { opacity: 0, filter: isMobileEnter ? 'none' : 'blur(4px)' },
          { opacity: 1, filter: isMobileEnter ? 'none' : 'blur(0px)', duration: 0.6, ease: 'power2.out' },
          0.1
        )
    })

    // Restart scroll system AFTER enter animation + clearProps
    restartScrollSystem()
    return
  }

  // No transition (initial load, __skipPageTransition, card return):
  // Ensure wrapper is clean — previous transition may have left stale styles
  if (wrapper) gsap.set(wrapper, { clearProps: 'all' })

  const isReturningToCard = sessionStorage.getItem('returnSlug')
  if (!isReturningToCard) {
    window.scrollTo(0, 0)
    const { $lenis } = useNuxtApp()
    if ($lenis) $lenis.scrollTo(0, { immediate: true, force: true })
  }

  // Restart scroll system after components mount
  restartScrollSystem()
})

// Safety net: force-reset after 3s if stuck
router.afterEach(() => {
  setTimeout(() => {
    if (isAnimating.value) {
      console.warn('[transition] Force-resetting stuck transition state')
      resetTransitionState()
      restartScrollSystem()
    }
  }, 3000)
})
</script>

<style>
.transition-depth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9997;
  pointer-events: none;
  visibility: hidden;
}

.transition-depth {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 9998;
  pointer-events: none;
  visibility: hidden;
}

.page-wrapper {
  will-change: auto;
}

html.is-transitioning .page-wrapper {
  will-change: transform, opacity, filter;
}

html.is-transitioning,
html.is-transitioning body {
  overflow: hidden !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

html.is-transitioning::-webkit-scrollbar,
html.is-transitioning body::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
</style>
