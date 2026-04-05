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

const appRoot = ref<HTMLElement | null>(null)
const pageWrapper = ref<HTMLElement | null>(null)
const isAnimating = ref(false)
let leaveAnimationDone = false // tracks if leave animation has completed
let transitionOverlay: HTMLElement | null = null

const router = useRouter()
const route = useRoute()
const { isMenuOpen, closeMenu } = useNavigation()

// Page loader - show on all pages on initial load
const showLoader = ref(true)

function onLoaderComplete() {
  showLoader.value = false
}

// Show footer by default, unless page meta explicitly sets showFooter: false
const showFooter = computed(() => route.meta.showFooter !== false)

// Menu close animation duration (matches HeroNav CSS transition)
const MENU_CLOSE_DURATION = 300

// Transition options - toggle overlay animations
const OVERLAY_SLIDES_UP = true    // White overlay slides up on leave
const OVERLAY_SLIDES_AWAY = false  // White overlay slides away on enter

let depthOverlay: HTMLElement | null = null

// Create overlay elements on client side only
onMounted(() => {
  // Create the depth overlay (transparent black)
  depthOverlay = document.createElement('div')
  depthOverlay.className = 'transition-depth-overlay'
  gsap.set(depthOverlay, { opacity: 0 })
  document.body.appendChild(depthOverlay)

  // Create the slide overlay (white)
  transitionOverlay = document.createElement('div')
  transitionOverlay.className = 'transition-depth'
  gsap.set(transitionOverlay, { yPercent: 100 })
  document.body.appendChild(transitionOverlay)
})

onUnmounted(() => {
  // Clean up overlay elements
  if (transitionOverlay && transitionOverlay.parentNode) {
    transitionOverlay.parentNode.removeChild(transitionOverlay)
  }
  if (depthOverlay && depthOverlay.parentNode) {
    depthOverlay.parentNode.removeChild(depthOverlay)
  }
})

// Handle route change with GSAP transition
router.beforeEach(async (to, from) => {
  // Skip on initial load
  if (!from.name) return

  // Skip if a custom transition (e.g. location card) is handling it
  if ((window as any).__skipPageTransition) {
    (window as any).__skipPageTransition = false
    return
  }

  // Skip if already animating
  if (isAnimating.value) return

  const wrapper = pageWrapper.value

  if (!transitionOverlay || !wrapper || !depthOverlay) return

  // Close menu first and wait for animation
  if (isMenuOpen.value) {
    closeMenu()
    await new Promise(resolve => setTimeout(resolve, MENU_CLOSE_DURATION))
  }

  isAnimating.value = true
  leaveAnimationDone = false

  // Leave animation
  await new Promise<void>((resolve) => {
    document.documentElement.classList.add('is-transitioning')

    const tl = gsap.timeline({
      onComplete: resolve
    })

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
      }, '<') // Fade in dark overlay with page animation

    // Conditionally add white overlay sliding up
    if (OVERLAY_SLIDES_UP) {
      tl.set(transitionOverlay, { yPercent: 100, visibility: 'visible' }, 0)
        .to(transitionOverlay, {
          yPercent: 0,
          duration: 0.7,
          ease: 'power4.inOut'
        }, '<0.15') // Start white overlay 0.15s after animations begin
    }

    // Hide wrapper at the end so new page content is invisible when Vue swaps the component
    tl.set(wrapper, { opacity: 0 })
  })

  leaveAnimationDone = true
})

// Use page:finish hook instead of router.afterEach — this fires AFTER Suspense
// resolves and the new page component is actually rendered. router.afterEach fires
// immediately when the route changes, but with async components (await useApi),
// Suspense keeps the old page visible until the new one resolves, causing a flash.
const nuxtApp = useNuxtApp()

nuxtApp.hook('page:finish', async () => {
  const wrapper = pageWrapper.value

  if (!transitionOverlay || !wrapper || !depthOverlay || !isAnimating.value) return

  // Wait for leave animation to complete if it hasn't yet
  // (page:finish can fire before beforeEach's leave animation finishes if API responses are cached)
  if (!leaveAnimationDone) {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (leaveAnimationDone) return resolve()
        requestAnimationFrame(check)
      }
      check()
    })
  }

  // Ensure new page content is in the DOM
  await nextTick()

  window.scrollTo(0, 0)

  // Enter animation
  await new Promise<void>((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('is-transitioning')
        isAnimating.value = false
        resolve()
      }
    })

    tl.set(wrapper, {
        scale: 1.1,
        opacity: 0,
        y: 50,
        filter: 'blur(4px)'
      })

    // Conditionally add white overlay sliding away
    if (OVERLAY_SLIDES_AWAY && OVERLAY_SLIDES_UP) {
      tl.to(transitionOverlay, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power3.inOut'
        }, '+=0.1')
    } else if (OVERLAY_SLIDES_UP) {
      // If overlay slid up but shouldn't slide away, just hide it instantly
      tl.set(transitionOverlay, { visibility: 'hidden', yPercent: 100 }, '+=0.1')
    }

    tl.to(depthOverlay, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      }, OVERLAY_SLIDES_AWAY ? '-=0.3' : '-=0.1')
      .to(wrapper, {
        scale: 1,
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4')
      .set(wrapper, { clearProps: 'all' }) // Clear all inline styles to prevent stacking issues
      .set(transitionOverlay, { visibility: 'hidden', yPercent: 100 })
      .set(depthOverlay, { visibility: 'hidden' })
  })
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

/* Ensure smooth transitions */
html.is-transitioning {
  overflow: hidden;
}

/* Force hide scrollbar during transitions */
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
