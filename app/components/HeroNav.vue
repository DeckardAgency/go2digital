<template>
  <!-- Desktop Navigation - Only visible on desktop -->
  <nav class="hero-nav" :class="{ 'hero-nav--active': isMenuOpen, 'hero-nav--hidden': isHidden }" role="navigation" aria-label="Main navigation">
    <div class="hero-nav__container">
      <!-- Menu Toggle Button -->
      <button class="hero-nav__menu-toggle" :aria-expanded="isMenuOpen" aria-controls="hero-nav-links" @click="toggleMenu">
        <span class="hero-nav__menu-text hero-nav__menu-text--open">Izbornik</span>
        <span class="hero-nav__menu-text hero-nav__menu-text--close">Zatvori</span>
      </button>

      <!-- Navigation Links (Hidden by default, shown when menu is active) -->
      <div class="hero-nav__links" id="hero-nav-links">
        <NuxtLink
          v-for="item in mainNavItems"
          :key="item.url"
          :to="localePath(item.url)"
          class="hero-nav__link"
          data-hover-animate
        >{{ item.label }}</NuxtLink>
      </div>

      <!-- Locations Button (Always visible) -->
      <NuxtLink :to="localePath('/lokacije')" class="hero-nav__locations" data-hover-animate>
        <span class="hero-nav__locations-text">{{ $t('location.title') }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { NavigationItem } from '~/types/api'

const { isMenuOpen, toggleMenu } = useNavigation()
const localePath = useLocalePath()

// Fetch main navigation from API
const { data: navData } = useApi<NavigationItem[]>('/api/navigation_items', {
  query: { group: 'main' },
  lazy: true,
  server: false
})

const mainNavItems = computed(() => {
  if (navData.value?.length) {
    return navData.value.map(item => ({ url: item.url, label: item.label }))
  }
  return [
    { url: '/', label: 'Homepage' },
    { url: '/lab', label: 'Go2Labs' },
    { url: '/blog', label: 'Articles' },
    { url: '/kontakt', label: 'Contact' },
    { url: '/esg', label: 'ESG' }
  ]
})
const isHidden = ref(false)
let lastScrollY = 0

const handleScroll = () => {
  const currentScrollY = window.scrollY

  // Don't hide if menu is open
  if (isMenuOpen.value) {
    isHidden.value = false
    return
  }

  // Hide when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
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
$color-white: #ffffff;
$color-black: #000000;
$spacing-2: 0.5rem;
$spacing-3: 0.75rem;
$spacing-4: 1rem;
$spacing-5: 1.25rem;
$spacing-6: 1.5rem;
$spacing-8: 2rem;
$spacing-10: 2.5rem;
$spacing-32: 8rem;
$border-radius-lg: 1rem;
$border-radius-md: 0.75rem;
$transition-duration: 0.3s;
$easing-default: cubic-bezier(0.4, 0, 0.2, 1);

.hero-nav {
  position: fixed;
  bottom: $spacing-8;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  z-index: 9999;
  width: fit-content;
  transition: transform $transition-duration $easing-default;

  // Hide on mobile
  @media (max-width: 768px) {
    display: none;
  }

  // Hidden state - slides down
  &--hidden {
    transform: translateX(-50%) translateY(calc(100% + #{$spacing-8}));
  }

  &__container {
    position: relative;
    display: flex;
    align-items: center;
    background-color: color.adjust($color-dark, $lightness: -3%);
    border-radius: $border-radius-lg;
    padding: 0;
    min-height: 4rem;
    overflow: hidden;
    transition: all $transition-duration $easing-default;
  }

  // Menu Toggle Button
  &__menu-toggle {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 4rem;
    padding: 0 $spacing-8;
    background-color: transparent;
    border: none;
    color: $color-white;
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1.125rem;
    cursor: pointer;
    transition: all $transition-duration $easing-default;
    z-index: 2;
    min-width: 7rem;
  }

  // Menu Text Animation
  &__menu-text {
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    transition: opacity $transition-duration $easing-default,
                transform $transition-duration $easing-default;

    &--open {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    &--close {
      opacity: 0;
      transform: translateX(-50%) translateY($spacing-4);
    }
  }

  // Navigation Links Container
  &__links {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    opacity: 0;
    visibility: hidden;
    transform: translateX(-$spacing-8);
    transition: all $transition-duration $easing-default;
    flex: 1;
    padding: 0 $spacing-4;
    margin-right: 7rem;
    max-width: 0;
    overflow: hidden;
  }

  // Individual Navigation Link
  &__link {
    display: inline-block;
    padding: $spacing-3 $spacing-6;
    color: $color-white;
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    text-decoration: none;
    border-radius: $border-radius-lg;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      background-color: rgba($color-white, 0.1);
    }
  }

  // Locations Button (Always visible)
  &__locations {
    position: absolute;
    right: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3.6rem;
    padding: 0 $spacing-10;
    background-color: $color-white;
    color: $color-dark;
    font-family: 'PP Neue Montreal', sans-serif;
    font-weight: 400;
    font-size: 1.125rem;
    text-decoration: none;
    border-radius: $border-radius-md;
    transition: all 0.2s ease;
    z-index: 1;

    &:hover {
      background-color: color.adjust($color-white, $lightness: -5%);
    }
  }

  &__locations-text {
    display: block;
  }

  // Active State (Menu Open)
  &--active {
    transform: translateX(-50%) translateY(0) !important;

    .hero-nav__container {
      background-color: color.adjust($color-dark, $lightness: -3%);
    }

    .hero-nav__menu-text {
      &--open {
        opacity: 0;
        transform: translateX(-50%) translateY(-$spacing-4);
      }

      &--close {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .hero-nav__links {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      max-width: 50rem;
      margin-right: $spacing-32;
    }
  }
}
</style>
