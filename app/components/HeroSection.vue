<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const { t } = useI18n()

// Split text composable (for accessing split elements in scroll animation)
const { getSplitElements } = useSplitText()

// Refs
const sectionRef = ref<HTMLElement | null>(null)
const mediaRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const badgeTextRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)
const scrollTextRef = ref<HTMLElement | null>(null)

// Animation state
let timeline: gsap.core.Timeline | null = null
let scrollTriggerInstance: ScrollTrigger | null = null

// Figma dimensions
const figmaWidth = 1512
const windowConfig = {
  width: 827,
  height: 472,
  top: 40,
  right: 40,
  borderRadius: 16
}

const mobileWindowConfig = {
  width: 200,
  height: 200,
  borderRadius: 16
}

const mobileBreakpoint = 768

// Helpers
const isMobile = () => window.innerWidth < mobileBreakpoint

const getClipPathInset = (state: 'initial' | 'expandedWidth' | 'fullscreen' = 'initial') => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = isMobile()
  const maxWindowHeight = vh * 0.5

  if (state === 'initial') {
    if (mobile) {
      const windowWidth = Math.min(mobileWindowConfig.width, vw - 48)
      const windowHeight = Math.min(mobileWindowConfig.height, maxWindowHeight)
      const horizontalPadding = (vw - windowWidth) / 2
      const verticalPadding = (vh - windowHeight) / 2

      return {
        top: verticalPadding,
        right: horizontalPadding,
        bottom: verticalPadding,
        left: horizontalPadding,
        borderRadius: mobileWindowConfig.borderRadius
      }
    } else {
      const scale = vw / figmaWidth
      const windowWidth = windowConfig.width * scale
      const scaledHeight = windowConfig.height * scale
      const windowHeight = Math.min(scaledHeight, maxWindowHeight)
      const windowTop = windowConfig.top * scale
      const windowRight = windowConfig.right * scale

      return {
        top: windowTop,
        right: windowRight,
        bottom: vh - windowTop - windowHeight,
        left: vw - windowRight - windowWidth,
        borderRadius: windowConfig.borderRadius
      }
    }
  }

  if (state === 'expandedWidth') {
    if (mobile) {
      const windowHeight = Math.min(mobileWindowConfig.height, maxWindowHeight)
      const verticalPadding = (vh - windowHeight) / 2

      return {
        top: verticalPadding,
        right: 0,
        bottom: verticalPadding,
        left: 0,
        borderRadius: 0 // Remove radius during width expansion
      }
    } else {
      const scale = vw / figmaWidth
      const scaledHeight = windowConfig.height * scale
      const windowHeight = Math.min(scaledHeight, maxWindowHeight)
      const windowTop = windowConfig.top * scale

      return {
        top: windowTop,
        right: 0,
        bottom: vh - windowTop - windowHeight,
        left: 0,
        borderRadius: 0 // Remove radius during width expansion
      }
    }
  }

  // Fullscreen
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 0
  }
}

const insetToClipPath = (inset: ReturnType<typeof getClipPathInset>) => {
  return `inset(${inset.top}px ${inset.right}px ${inset.bottom}px ${inset.left}px round ${inset.borderRadius}px)`
}

const setVideoWindowBoundaries = () => {
  if (!sectionRef.value) return

  const vw = window.innerWidth
  const vh = window.innerHeight
  const mobile = isMobile()
  const maxWindowHeight = vh * 0.5
  const contentGap = 40

  if (mobile) {
    const windowHeight = Math.min(mobileWindowConfig.height, maxWindowHeight)
    const videoWindowBottom = vh / 2 + windowHeight / 2
    sectionRef.value.style.setProperty('--video-window-bottom', `${videoWindowBottom}px`)
    sectionRef.value.style.setProperty('--content-start-y', `${videoWindowBottom + contentGap}px`)
  } else {
    const scale = vw / figmaWidth
    const scaledHeight = windowConfig.height * scale
    const windowHeight = Math.min(scaledHeight, maxWindowHeight)
    const windowTop = windowConfig.top * scale
    const videoWindowBottom = windowTop + windowHeight
    const containerOffset = 40 + 100
    const contentPaddingTop = Math.max(0, videoWindowBottom + contentGap - containerOffset)
    sectionRef.value.style.setProperty('--content-start-y', `${contentPaddingTop}px`)
  }
}

const setupInitialState = () => {
  const initial = getClipPathInset('initial')

  if (mediaRef.value) {
    gsap.set(mediaRef.value, {
      clipPath: insetToClipPath(initial),
      willChange: 'clip-path'
    })
  }

  if (videoRef.value) {
    gsap.set(videoRef.value, { willChange: 'transform' })
  }

  setVideoWindowBoundaries()
}

const createAnimation = () => {
  if (!sectionRef.value || !mediaRef.value) return

  const initial = getClipPathInset('initial')
  const expandedWidth = getClipPathInset('expandedWidth')
  const fullscreen = getClipPathInset('fullscreen')
  const mobile = isMobile()

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=150%',
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })

  scrollTriggerInstance = timeline.scrollTrigger as ScrollTrigger

  if (mobile) {
    timeline.fromTo(mediaRef.value, {
      clipPath: insetToClipPath(initial)
    }, {
      clipPath: insetToClipPath(fullscreen),
      duration: 1,
      ease: 'power3.inOut',
      immediateRender: false
    }, 0)
  } else {
    // Phase 1: Expand width
    timeline.fromTo(mediaRef.value, {
      clipPath: insetToClipPath(initial)
    }, {
      clipPath: insetToClipPath(expandedWidth),
      duration: 0.5,
      ease: 'power3.inOut',
      immediateRender: false
    }, 0)

    // Phase 2: Expand height
    timeline.to(mediaRef.value, {
      clipPath: insetToClipPath(fullscreen),
      duration: 0.5,
      ease: 'power3.inOut'
    }, 0.5)
  }

  // Text hide using reverse split text animation (clip-path)
  const splitTextElements = [
    titleRef.value,
    badgeTextRef.value,
    headingRef.value,
    descriptionRef.value,
    scrollTextRef.value
  ].filter(Boolean) as HTMLElement[]

  splitTextElements.forEach((el, index) => {
    const splitEls = getSplitElements(el)

    if (splitEls && splitEls.length > 0) {
      // Reverse of the reveal animation - clip from top, move up
      timeline!.to(splitEls, {
        clipPath: 'inset(100% 0 0 0)',
        y: -30,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power2.in'
      }, 0.05 + (index * 0.03))
    }
  })

  // Hide badge dot with scale
  const badgeDot = badgeRef.value?.querySelector('.hero-section__badge-dot')
  if (badgeDot) {
    timeline.to(badgeDot, {
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in'
    }, 0.08)
  }

  // Hide logo with clip-path
  if (logoRef.value) {
    timeline.to(logoRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      y: -20,
      duration: 0.15,
      ease: 'power2.in'
    }, 0.05)
  }
}

// Resize handler
let resizeTimeout: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

const handleResize = () => {
  if (rafId) cancelAnimationFrame(rafId)

  rafId = requestAnimationFrame(() => {
    setupInitialState()
  })

  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    scrollTriggerInstance?.refresh()
  }, 150)
}

// Lifecycle
onMounted(() => {
  // Wait for global splitText plugin to process elements (runs at 150ms)
  setTimeout(() => {
    // Animate badge dot fade in
    const badgeDot = badgeRef.value?.querySelector('.hero-section__badge-dot')
    if (badgeDot) {
      gsap.fromTo(badgeDot,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.15, ease: 'back.out(2)' }
      )
    }

    setupInitialState()
    createAnimation()
    window.addEventListener('resize', handleResize, { passive: true })

    // Refresh ScrollTrigger after everything is set up
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)
  }, 200)
})

onUnmounted(() => {
  // Clear pending timers
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeTimeout) clearTimeout(resizeTimeout)

  window.removeEventListener('resize', handleResize)

  // Kill GSAP instances
  if (timeline) {
    timeline.kill()
    timeline = null
  }

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill()
    scrollTriggerInstance = null
  }

  // Clear animated elements
  if (mediaRef.value) {
    gsap.set(mediaRef.value, { clearProps: 'all' })
  }

  if (videoRef.value) {
    gsap.set(videoRef.value, { clearProps: 'all' })
  }

  if (logoRef.value) {
    gsap.set(logoRef.value, { clearProps: 'all' })
  }
})
</script>

<template>
  <section ref="sectionRef" class="hero-section">
    <!-- Video Background with Mask -->
    <div class="hero-section__media-container">
      <div ref="mediaRef" class="hero-section__media">
        <video
          ref="videoRef"
          class="hero-section__media-video"
          autoplay
          muted
          loop
          playsinline
        >
          <source src="/videos/home-hero.mp4" type="video/mp4">
        </video>
      </div>
    </div>

    <!-- Content Layer -->
    <div class="hero-section__content">
      <!-- Logo -->
      <div ref="logoRef" class="hero-section__logo">
        <NuxtLink to="/">
          <svg xmlns="http://www.w3.org/2000/svg" width="164" height="30" fill="none">
            <g clip-path="url(#hero-logo-clip)">
              <path d="M14.95 21.45c-.61.764-1.525 1.375-2.745 1.985-1.22.535-2.67.84-4.5.84-2.29 0-4.12-.687-5.57-2.137C.688 20.764 0 18.932 0 16.642v-3.893c0-2.214.687-4.046 2.06-5.497 1.373-1.297 3.203-2.06 5.415-2.06 2.365 0 4.196.534 5.34 1.679 1.22 1.068 1.83 2.595 2.06 4.503v.077h-4.043c-.153-.992-.458-1.68-.916-2.214-.457-.534-1.22-.763-2.212-.763-.991 0-1.83.381-2.44 1.221-.61.764-.916 1.832-.916 3.053v3.894c0 1.297.305 2.366.915 3.13.61.763 1.45 1.144 2.518 1.144.762 0 1.373-.076 1.83-.229.458-.152.84-.305 1.068-.534v-2.9H7.781v-2.749h7.246v6.947h-.076ZM32.874 16.413c0 2.29-.687 4.198-2.136 5.648-1.45 1.45-3.356 2.214-5.645 2.214-2.364 0-4.271-.763-5.72-2.214-1.526-1.45-2.213-3.358-2.213-5.648v-3.36c0-2.29.763-4.121 2.212-5.648 1.45-1.45 3.357-2.214 5.721-2.214 2.289 0 4.196.764 5.645 2.214 1.45 1.45 2.212 3.359 2.212 5.649v3.359h-.076Zm-4.272-3.36c0-1.297-.305-2.442-.915-3.282-.61-.84-1.526-1.297-2.67-1.297s-2.06.458-2.67 1.297c-.61.84-.915 1.909-.915 3.283v3.359c0 1.374.305 2.442.915 3.282.61.84 1.526 1.298 2.67 1.298s1.983-.458 2.593-1.298c.61-.84.916-1.908.916-3.282v-3.36h.076ZM75.441 24.045V5.496h5.111c2.136 0 3.967.763 5.416 2.29 1.45 1.527 2.212 3.511 2.212 5.878v2.29c0 2.366-.763 4.351-2.212 5.878-1.45 1.526-3.28 2.29-5.416 2.29h-5.11v-.077Zm.687-17.862v17.175h4.424c1.907 0 3.585-.687 4.958-2.137 1.373-1.45 2.06-3.206 2.06-5.343v-2.29c0-2.138-.687-3.894-2.06-5.268-1.373-1.374-2.975-2.137-4.958-2.137h-4.424ZM93.67 24.045h-.686V5.496h.687v18.55ZM112.359 22.061c-.382.535-1.144 1.07-2.212 1.527-1.144.458-2.441.687-4.043.687-2.136 0-3.814-.763-5.187-2.29-1.297-1.526-1.983-3.511-1.983-5.878v-3.053c0-2.29.61-4.198 1.907-5.725 1.296-1.527 2.974-2.214 5.034-2.214 1.983 0 3.509.535 4.653 1.527 1.144.992 1.755 2.29 1.755 3.893v.076h-.611c-.076-1.45-.61-2.595-1.602-3.511-.991-.916-2.441-1.374-4.271-1.374-1.907 0-3.357.687-4.501 1.985-1.144 1.297-1.678 3.053-1.678 5.19v3.054c0 2.213.61 3.97 1.755 5.42 1.144 1.373 2.746 2.06 4.653 2.06 1.373 0 2.593-.229 3.585-.61.991-.382 1.678-.84 2.059-1.298v-5.42h-5.644v-.687h6.331v6.641ZM118.382 24.045h-.687V5.496h.687v18.55ZM135.932 6.183h-6.713v17.862h-.686V6.183h-6.713v-.687h14.188v.687h-.076ZM147.907 18.473h-9.077l-2.059 5.572h-.763l7.018-18.549h.839l6.941 18.55h-.763l-2.136-5.573Zm-8.772-.687h8.544l-3.891-10.458-.381-1.069h-.076l-.305 1.07-3.891 10.457ZM154.464 23.358h9.535v.687h-10.222V5.496h.687v17.862Z" fill="#03120F"/>
              <path d="M54.007 30c-6.56 0-11.976-5.343-11.976-11.984S47.447 6.107 54.007 6.107a11.952 11.952 0 0 1 11.976 11.985c0 6.641-5.34 11.908-11.976 11.908Zm0-23.13c-6.178 0-11.213 5.039-11.213 11.222s5.035 11.221 11.213 11.221c6.179 0 11.213-5.038 11.213-11.221S60.186 6.87 54.007 6.87Z" fill="#0CD459"/>
              <path d="M54.007 23.893c-6.56 0-11.976-5.344-11.976-11.985C42.031 5.268 47.447 0 54.007 0a11.952 11.952 0 0 1 11.976 11.985c0 6.64-5.34 11.908-11.976 11.908Zm0-23.13c-6.178 0-11.213 5.038-11.213 11.222 0 6.183 5.035 11.22 11.213 11.22 6.179 0 11.213-5.037 11.213-11.22C65.22 5.8 60.186.763 54.007.763Z" fill="#0CD459"/>
              <path d="M57.058 26.947c-6.56 0-11.976-5.343-11.976-11.984S50.498 3.055 57.058 3.055a11.952 11.952 0 0 1 11.976 11.984c0 6.641-5.34 11.908-11.976 11.908Zm0-23.129c-6.179 0-11.213 5.038-11.213 11.221S50.879 26.26 57.058 26.26c6.179 0 11.213-5.038 11.213-11.22 0-6.184-5.034-11.222-11.213-11.222Z" fill="#0CD459"/>
              <path d="M50.953 26.945c-6.56 0-11.976-5.343-11.976-11.984S44.392 3.053 50.953 3.053a11.952 11.952 0 0 1 11.975 11.984c0 6.641-5.34 11.908-11.975 11.908Zm0-23.129c-6.18 0-11.214 5.038-11.214 11.221s5.035 11.221 11.214 11.221c6.178 0 11.213-5.038 11.213-11.22 0-6.184-5.035-11.222-11.213-11.222Z" fill="#0CD459"/>
              <path d="M57.513 19.771H49.96v-1.603l3.433-3.664c.457-.534.763-.916.991-1.374.23-.458.306-.763.306-.992 0-.382-.077-.763-.306-.992a1.263 1.263 0 0 0-.915-.382c-.381 0-.687.153-.915.458-.23.305-.306.687-.306 1.221h-2.44v-.076c0-.992.305-1.832.991-2.519.687-.687 1.602-1.069 2.67-1.069 1.144 0 2.136.306 2.746.84.61.534.992 1.374.992 2.366 0 .687-.153 1.298-.534 1.832-.382.535-.992 1.298-1.907 2.29l-1.45 1.527v.076h4.196v2.061Z" fill="#0CD459"/>
            </g>
            <defs>
              <clipPath id="hero-logo-clip"><path fill="#fff" d="M0 0h164v30H0z"/></clipPath>
            </defs>
          </svg>
        </NuxtLink>
      </div>

      <!-- Main Content Grid -->
      <div class="hero-section__main">
        <!-- Left Column - Big Title -->
        <div class="hero-section__left">
          <h1
            ref="titleRef"
            class="hero-section__title"
            data-split-text
            data-split-trigger="load"
            data-split-duration="0.5"
            data-split-delay="0.1"
          >{{ t('hero.titleLine1') }}<br/>{{ t('hero.titleLine2') }}</h1>
        </div>

        <!-- Middle Column - Badge, Heading, Description -->
        <div class="hero-section__middle">
          <div ref="badgeRef" class="hero-section__badge">
            <span class="hero-section__badge-dot"></span>
            <span
              ref="badgeTextRef"
              class="hero-section__badge-text"
              data-split-text
              data-split-type="lines"
              data-split-trigger="load"
              data-split-duration="0.5"
              data-split-delay="0.15"
            >{{ t('hero.kicker') }}</span>
          </div>

          <h2
            ref="headingRef"
            class="hero-section__heading"
            data-split-text
            data-split-trigger="load"
            data-split-duration="0.5"
            data-split-delay="0.2"
          >
            {{ t('hero.heading') }}
          </h2>

          <p
            ref="descriptionRef"
            class="hero-section__description"
            data-split-text
            data-split-trigger="load"
            data-split-duration="0.5"
            data-split-delay="0.25"
          >
            {{ t('hero.description') }}
          </p>
        </div>

        <!-- Right Column - Scroll Indicator -->
        <div class="hero-section__right">
          <div class="hero-section__scroll">
            <span
              ref="scrollTextRef"
              class="hero-section__scroll-text"
              data-split-text
              data-split-type="lines"
              data-split-trigger="load"
              data-split-duration="0.5"
              data-split-delay="0.3"
            >
              {{ t('hero.scrollDown') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
// Variables
$color-light: #ffffff;
$color-text: #03120F;
$font-family-primary: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-weight-regular: 400;

// Rem function
@function rem($px) {
  @return #{calc($px / 16)}rem;
}

// Responsive mixin
@mixin responsive($breakpoint) {
  @if $breakpoint == 'tablet' {
    @media (max-width: 1024px) { @content; }
  } @else if $breakpoint == 'mobile' {
    @media (max-width: 768px) { @content; }
  } @else if $breakpoint == 'extra-small' {
    @media (max-width: 480px) { @content; }
  }
}

.hero-section {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  background-color: $color-light;

  // Media Container (Video Background)
  &__media-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }

  &__media {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__media-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Content Layer - 12 Column Grid
  &__content {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto 1fr;
    gap: rem(20);
    width: 100%;
    height: 100dvh;
    padding: rem(40);

    @include responsive('tablet') {
      padding: rem(24);
      gap: rem(16);
    }

    @include responsive('mobile') {
      padding: rem(16);
      grid-template-rows: auto 1fr auto;
    }
  }

  // Logo
  &__logo {
    grid-column: 1 / 3;
    grid-row: 1;

    @include responsive('tablet') {
      grid-column: 1 / 4;
    }

    @include responsive('mobile') {
      grid-column: 1 / 6;
    }

    svg {
      display: block;
      width: rem(164);
      height: rem(30);
    }

    a {
      display: block;
    }
  }

  // Main Content Grid
  &__main {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: rem(20);
    align-content: start;
    padding-top: rem(60);

    @include responsive('tablet') {
      gap: rem(16);
      padding-top: rem(40);
      align-content: space-between;
      height: 100%;
    }

    @include responsive('mobile') {
      padding-top: rem(20);
    }
  }

  // Left Column - Big Title
  &__left {
    grid-column: 1 / 6;
    padding-top: var(--content-start-y, rem(312));

    @include responsive('tablet') {
      grid-column: 1 / -1;
      padding-top: 0;
      order: 1;
    }
  }

  &__title {
    font-family: $font-family-primary;
    font-size: rem(50);
    font-weight: $font-weight-regular;
    line-height: 1;
    letter-spacing: -0.02em;
    color: $color-text;
    margin: 0;

    @include responsive('tablet') {
      font-size: rem(40);
    }

    @include responsive('mobile') {
      margin-top: 2rem;
      font-size: rem(32);
    }
  }

  // Middle Column - Badge, Heading, Description
  &__middle {
    grid-column: 6 / 10;
    display: grid;
    grid-template-columns: 1fr;
    align-content: start;
    padding-top: var(--content-start-y, rem(312));

    @include responsive('tablet') {
      grid-column: 1 / -1;
      padding-top: 0;
      gap: rem(16);
      order: 3;
      align-content: end;
      padding-bottom: rem(40);
    }

    @include responsive('mobile') {
      grid-column: 1 / -1;
      padding-top: 0;
      gap: rem(16);
      order: 3;
      align-content: end;
      padding-bottom: rem(10);
    }
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    gap: rem(4);
  }

  &__badge-dot {
    width: rem(6);
    height: rem(6);
    opacity: 0; // Hidden initially, animated in via JS
    background-color: $color-text;
    border-radius: 50%;
  }

  &__badge-text {
    font-family: $font-family-primary;
    font-size: rem(12);
    font-weight: $font-weight-regular;
    line-height: 1.3;
    color: $color-text;
  }

  &__heading {
    font-family: $font-family-primary;
    font-size: rem(16);
    font-weight: $font-weight-regular;
    line-height: 1.3;
    color: $color-text;
    margin: 2.375rem 0 0 0;
    max-width: rem(343);

    @include responsive('extra-small') {
      margin: 0;
    }
  }

  &__description {
    font-family: $font-family-primary;
    font-size: rem(16);
    font-weight: $font-weight-regular;
    line-height: 1.3;
    color: $color-text;
    opacity: 0.4;
    margin: 0.938rem 0 0 0;
    max-width: rem(331);

    @include responsive('extra-small') {
      margin: 0;
    }
  }

  // Right Column - Scroll Indicator
  &__right {
    grid-column: 10 / -1;
    justify-self: end;
    padding-top: var(--content-start-y, rem(312));

    @include responsive('tablet') {
      display: none;
    }
  }

  &__scroll {
    display: grid;
    place-items: start;
  }

  &__scroll-text {
    font-family: $font-family-primary;
    font-size: rem(12);
    font-weight: $font-weight-regular;
    line-height: 1.3;
    color: $color-text;
    text-transform: capitalize;
  }
}

// Accessibility
@media (prefers-reduced-motion: reduce) {
  .hero-section__media-video {
    // Pause video for reduced motion preference
  }
}
</style>
