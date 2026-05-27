<template>
  <!-- Mobile Navigation - Only visible on mobile -->
  <nav class="mobile-nav" :class="{ 'mobile-nav--active': isMenuOpen, 'mobile-nav--hidden': isHidden }" role="navigation" aria-label="Mobile navigation">
    <div class="mobile-nav__overlay" @click="closeMenu"></div>
    <div class="mobile-nav__wrapper">
      <!-- Logo -->
      <NuxtLink to="/" class="mobile-nav__logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M15 30C8.45256 30 3.04711 24.6566 3.04711 18.0154C3.04711 11.3743 8.45256 6.1072 15 6.1072C21.6236 6.1072 26.9529 11.4506 26.9529 18.0918C26.9529 24.7329 21.6236 30 15 30ZM15 6.87055C8.83323 6.87055 3.80844 11.9087 3.80844 18.0918C3.80844 24.2749 8.83323 29.313 15 29.313C21.1668 29.313 26.1916 24.2749 26.1916 18.0918C26.1916 11.9087 21.1668 6.87055 15 6.87055Z"/>
          <path d="M15 23.8928C8.45256 23.8928 3.04711 18.5494 3.04711 11.9082C3.04711 5.2671 8.45256 0 15 0C21.6236 0 26.9529 5.34344 26.9529 11.9846C26.9529 18.6257 21.6236 23.8928 15 23.8928ZM15 0.763348C8.83323 0.763348 3.80844 5.80145 3.80844 11.9846C3.80844 18.1677 8.83323 23.2058 15 23.2058C21.1668 23.2058 26.1916 18.1677 26.1916 11.9846C26.1916 5.80145 21.1668 0.763348 15 0.763348Z"/>
          <path d="M18.0471 26.9468C11.4997 26.9468 6.09423 21.6033 6.09423 14.9622C6.09423 8.32107 11.4997 3.05396 18.0471 3.05396C24.6707 3.05396 30 8.3974 30 15.0385C30 21.6797 24.6707 26.9468 18.0471 26.9468ZM18.0471 3.81731C11.8803 3.81731 6.85556 8.85541 6.85556 15.0385C6.85556 21.2216 11.8803 26.2597 18.0471 26.2597C24.2139 26.2597 29.2387 21.2216 29.2387 15.0385C29.2387 8.85541 24.2139 3.81731 18.0471 3.81731Z"/>
          <path d="M11.9529 26.946C5.40545 26.946 0 21.6026 0 14.9615C0 8.32034 5.40545 3.05324 11.9529 3.05324C18.5765 3.05324 23.9058 8.39668 23.9058 15.0378C23.9058 21.6789 18.5765 26.946 11.9529 26.946ZM11.9529 3.81659C5.78612 3.81659 0.761332 8.85469 0.761332 15.0378C0.761332 21.2209 5.78612 26.259 11.9529 26.259C18.1197 26.259 23.1444 21.2209 23.1444 15.0378C23.1444 8.85469 18.1197 3.81659 11.9529 3.81659Z"/>
          <path d="M18.4995 19.7711H10.9623V18.168L14.3883 14.504C14.8451 13.9696 15.1496 13.5879 15.378 13.1299C15.6064 12.6719 15.6825 12.3666 15.6825 12.1376C15.6825 11.7559 15.6064 11.3742 15.378 11.1452C15.1496 10.9162 14.8451 10.7636 14.4644 10.7636C14.0837 10.7636 13.7792 10.9162 13.5508 11.2216C13.3224 11.5269 13.2463 11.9086 13.2463 12.4429H10.81V12.3666C10.81 11.3742 11.1146 10.5345 11.7998 9.84753C12.4849 9.16052 13.3985 8.77885 14.4644 8.77885C15.6064 8.77885 16.5961 9.08419 17.2052 9.61853C17.8143 10.1529 18.1949 10.9926 18.1949 11.9849C18.1949 12.6719 18.0427 13.2826 17.662 13.8169C17.2813 14.3513 16.6723 15.1146 15.7587 16.107L14.3121 17.6337V17.71H18.4995V19.7711Z"/>
        </svg>
      </NuxtLink>

      <!-- Menu Container -->
      <div class="mobile-nav__menu-container">
        <!-- Nav Button (Menu + Locations) -->
        <div class="mobile-nav__nav-button">
          <button class="mobile-nav__menu-toggle" :aria-expanded="isMenuOpen" aria-controls="mobile-nav-links" @click="toggleMenu">
            <span class="mobile-nav__menu-text mobile-nav__menu-text--menu">{{ $t('nav.menu') }}</span>
            <span class="mobile-nav__menu-text mobile-nav__menu-text--close">{{ $t('nav.close') }}</span>
          </button>

          <NuxtLink :to="localePath('/lokacije')" class="mobile-nav__locations-btn">
            <span>{{ $t('nav.locations') }}</span>
          </NuxtLink>
        </div>

        <!-- Dropdown Menu -->
        <div class="mobile-nav__dropdown" id="mobile-nav-links">
          <NuxtLink :to="localePath('/')" class="mobile-nav__dropdown-link" @click="closeMenu">{{ $t('nav.homepage') }}</NuxtLink>
          <NuxtLink :to="localePath('/lab')" class="mobile-nav__dropdown-link" @click="closeMenu">{{ $t('nav.labs') }}</NuxtLink>
          <NuxtLink :to="localePath('/blog')" class="mobile-nav__dropdown-link" @click="closeMenu">{{ $t('nav.articles') }}</NuxtLink>
          <NuxtLink :to="localePath('/kontakt')" class="mobile-nav__dropdown-link" @click="closeMenu">{{ $t('nav.contactPage') }}</NuxtLink>
          <NuxtLink :to="localePath('/esg')" class="mobile-nav__dropdown-link" @click="closeMenu">{{ $t('nav.esg') }}</NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Use shared navigation composable — same state as HeroNav and app.vue transitions
const { isMenuOpen, toggleMenu, closeMenu } = useNavigation()
const localePath = useLocalePath()

const isHidden = ref(false)
let lastScrollY = 0
let consecutiveUpFrames = 0

// ScrollTrigger pin engage/release and the iOS address-bar transition can
// emit a single anomalous backwards-scroll frame, no matter how large. A px
// threshold can't filter these — a magnitude check still passes. Instead,
// require the upward motion to span multiple frames before un-hiding. Real
// user swipes always do; jitter is always a one-frame event.
const REQUIRED_UP_FRAMES = 2

const handleScroll = () => {
  const currentScrollY = window.scrollY

  if (isMenuOpen.value) {
    isHidden.value = false
    consecutiveUpFrames = 0
    lastScrollY = currentScrollY
    return
  }

  if (currentScrollY <= 100) {
    isHidden.value = false
    consecutiveUpFrames = 0
    lastScrollY = currentScrollY
    return
  }

  const delta = currentScrollY - lastScrollY

  if (delta > 0) {
    isHidden.value = true
    consecutiveUpFrames = 0
  } else if (delta < 0) {
    consecutiveUpFrames++
    if (consecutiveUpFrames >= REQUIRED_UP_FRAMES) {
      isHidden.value = false
    }
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
@use "sass:color";

// Variables
$color-dark: #03120f;
$color-light: #f5f5f5;
$color-white: #ffffff;
$color-black: #000000;
$color-primary: #0cd459;
$spacing-1: 0.25rem;
$spacing-2: 0.5rem;
$spacing-2-5: 0.625rem;
$spacing-4: 1rem;
$spacing-5: 1.25rem;
$spacing-10: 2.5rem;
$border-radius-lg: 1rem;
$border-radius-md: 0.75rem;
$transition-duration: 0.4s;
$easing-default: cubic-bezier(0.4, 0, 0.2, 1);

.mobile-nav {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999; // Above transition overlays (9997-9998) so menu button stays clickable
  background-color: transparent;
  padding: $spacing-4;
  transition: transform $transition-duration $easing-default;

  // Hide on desktop
  @media (min-width: 769px) {
    display: none;
  }

  &--hidden {
    transform: translateY(-100%);
  }

  &__wrapper {
    display: flex;
    align-items: flex-start;
    gap: $spacing-1;
  }

  &__logo {
    flex-shrink: 0;
    width: 4.0625rem;
    height: 4.0625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-dark;
    border-radius: $border-radius-lg;
    transition: background-color $transition-duration ease;

    svg {
      fill: $color-primary;
      width: 1.875rem;
      height: 1.875rem;

      path {
        transition: fill $transition-duration ease;
      }
    }
  }

  &__menu-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    min-width: 0;
    position: relative;
  }

  &__nav-button {
    display: flex;
    align-items: center;
    background-color: $color-dark;
    border-radius: $border-radius-lg;
    padding: $spacing-1;
    padding-left: 0;
    height: 4.0625rem;
    transition: background-color $transition-duration ease;
  }

  &__menu-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: none;
    border: none;
    color: $color-light;
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.3;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: color $transition-duration ease;
  }

  &__menu-text {
    transition: transform $transition-duration $easing-default,
                opacity $transition-duration $easing-default;

    &--menu {
      opacity: 1;
      transform: translateY(0);
    }

    &--close {
      position: absolute;
      opacity: 0;
      transform: translateY(1.25rem);
    }
  }

  &__locations-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 $spacing-10;
    background-color: $color-light;
    color: $color-dark;
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.3;
    text-decoration: none;
    border-radius: $border-radius-md;
    border: 0.0625rem solid $color-light;
    transition: background-color $transition-duration ease,
                color $transition-duration ease,
                border-color $transition-duration ease;

    &:hover {
      background-color: color.adjust($color-light, $lightness: -5%);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + #{$spacing-1});
    left: 0;
    width: 100%;
    background-color: $color-dark;
    border-radius: $border-radius-lg;
    padding: $spacing-5;
    display: flex;
    flex-direction: column;
    gap: $spacing-2-5;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-0.625rem);
    transition: opacity $transition-duration $easing-default,
                transform $transition-duration $easing-default,
                visibility 0s linear $transition-duration,
                background-color $transition-duration ease;
    z-index: 10;
  }

  &__dropdown-link {
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.3;
    color: $color-light;
    text-decoration: none;
    padding: 0.125rem 0;
    transition: opacity 0.2s ease, color $transition-duration ease;

    &:hover {
      opacity: 0.7;
    }
  }

  // Overlay
  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba($color-black, 0.5);
    z-index: -1;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity $transition-duration $easing-default,
                visibility 0s linear $transition-duration;
  }

  // Active state (menu open)
  &--active {
    .mobile-nav__menu-text {
      &--menu {
        opacity: 0;
        transform: translateY(-1.25rem);
      }

      &--close {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mobile-nav__dropdown {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0);
      transition: opacity $transition-duration $easing-default,
                  transform $transition-duration $easing-default,
                  visibility 0s linear 0s,
                  background-color $transition-duration ease;
    }

    .mobile-nav__overlay {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition: opacity $transition-duration $easing-default,
                  visibility 0s linear 0s;
    }
  }
}
</style>
