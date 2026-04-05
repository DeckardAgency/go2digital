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

// Show footer unless page explicitly hides it
const showFooter = computed(() => route.meta.showFooter !== false)

const MENU_CLOSE_DURATION = 300
const OVERLAY_SLIDES_UP = true
const OVERLAY_SLIDES_AWAY = false

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
  // Skip on initial load
  if (!from.name) return

  // Skip if custom transition (card animations handle themselves)
  if ((window as any).__skipPageTransition) {
    ;(window as any).__skipPageTransition = false
    return
  }

  // Prevent double-trigger — but don't block forever
  if (isAnimating.value) return

  const wrapper = pageWrapper.value
  if (!transitionOverlay || !wrapper || !depthOverlay) return

  // Close menu first
  if (isMenuOpen.value) {
    closeMenu()
    await new Promise(resolve => setTimeout(resolve, MENU_CLOSE_DURATION))
  }

  isAnimating.value = true

  // Leave animation
  await new Promise<void>((resolve) => {
    document.documentElement.classList.add('is-transitioning')

    const tl = gsap.timeline({ onComplete: resolve })

    tl.set(depthOverlay, { visibility: 'visible' })
      .to(wrapper, {
        scale: 0.85,
        y: -80,
        filter: 'blur(4px)',
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

    // Hide wrapper so new page content is invisible during swap
    tl.set(wrapper, { opacity: 0 })
  })
})

// ── ENTER ANIMATION ──
nuxtApp.hook('page:finish', async () => {
  const wrapper = pageWrapper.value

  // Only run enter animation if we ran a leave animation
  if (!transitionOverlay || !wrapper || !depthOverlay || !isAnimating.value) return

  // Ensure new page content is in the DOM
  await nextTick()

  window.scrollTo(0, 0)

  // Remove is-transitioning BEFORE enter animation so components can create
  // ScrollTriggers with correct measurements (overflow:hidden breaks them)
  document.documentElement.classList.remove('is-transitioning')

  // Enter animation: opacity + filter only — NO transforms that would
  // corrupt ScrollTrigger pin measurements during component initialization
  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.value = false
        resolve()

        // Refresh ScrollTrigger + restart Lenis after wrapper is clean
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true)
          const { $lenis } = useNuxtApp()
          if ($lenis) $lenis.start()
        })
      }
    })

    tl.set(wrapper, { opacity: 0, filter: 'blur(4px)' })

    if (OVERLAY_SLIDES_AWAY && OVERLAY_SLIDES_UP) {
      tl.to(transitionOverlay, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power3.inOut'
      }, '+=0.1')
    } else if (OVERLAY_SLIDES_UP) {
      tl.set(transitionOverlay, { visibility: 'hidden', yPercent: 100 }, '+=0.1')
    }

    tl.to(depthOverlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, OVERLAY_SLIDES_AWAY ? '-=0.3' : '-=0.1')
      .to(wrapper, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4')
      .set(wrapper, { clearProps: 'all' })
      .set(transitionOverlay, { visibility: 'hidden', yPercent: 100 })
      .set(depthOverlay, { visibility: 'hidden' })
  })
})

// Safety net: if transition gets stuck, reset after timeout
router.afterEach(() => {
  setTimeout(() => {
    if (isAnimating.value) {
      console.warn('[transition] Force-resetting stuck transition state')
      resetTransitionState()
      const { $lenis } = useNuxtApp()
      if ($lenis) $lenis.start()
      ScrollTrigger.refresh(true)
    }
  }, 3000)
})
</script>

<style>
/* Dark depth overlay (transparent black) */
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

/* White slide overlay */
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

/* Page wrapper for animations */
.page-wrapper {
  will-change: auto;
}

/* Only apply will-change during transitions */
html.is-transitioning .page-wrapper {
  will-change: transform, opacity, filter;
}

/* Prevent scrolling during transitions */
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
