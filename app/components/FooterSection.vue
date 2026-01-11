<script setup lang="ts">
import { gsap } from 'gsap'

const { t } = useI18n()
const route = useRoute()

// Check if current page is ESG
const isEsgPage = computed(() => route.path.includes('/esg'))

// Refs
const eventTitleRef = ref<HTMLElement | null>(null)

// Marquee animation state
let marqueeTimeline: gsap.core.Timeline | null = null
let innerWrapper: HTMLElement | null = null
let isPaused = false

// Marquee options
const marqueeOptions = {
  speed: 50,
  gap: 100,
  direction: 'left' as const
}

// Navigation links
const navLinks = [
  { name: 'nav.home', path: '/' },
  { name: 'nav.lab', path: '/lab' },
  { name: 'nav.blog', path: '/blog' },
  { name: 'nav.about', path: '/tim' },
  { name: 'nav.contact', path: '/kontakt' }
]

// Social links
const socialLinks = [
  { name: 'LinkedIn', url: '#' },
  { name: 'Instagram', url: '#' },
  { name: 'Facebook', url: '#' },
  { name: 'TikTok', url: '#' }
]

// Contact info
const contactInfo = [
  {
    label: 'E-mail',
    value: 'sales@go2digital.com',
    href: 'mailto:sales@go2digital.com'
  },
  {
    label: 'Phone',
    value: '+385 1 483 9192',
    href: 'tel:+38514839192'
  },
  {
    label: 'Location',
    value: 'Radnička cesta 52, 10 000 Zagreb',
    href: 'https://www.google.com/maps/dir/?api=1&destination=Radnička+cesta+52,+10000+Zagreb,+Croatia',
    external: true
  }
]

// Marquee functions
const setupMarquee = () => {
  if (!eventTitleRef.value) return

  const element = eventTitleRef.value
  const originalText = element.textContent || ''

  const wrapper = document.createElement('div')
  wrapper.className = 'footer__marquee-inner'

  const text1 = document.createElement('span')
  text1.className = 'footer__marquee-text'
  text1.textContent = originalText

  const text2 = document.createElement('span')
  text2.className = 'footer__marquee-text'
  text2.textContent = originalText

  wrapper.appendChild(text1)
  wrapper.appendChild(text2)

  element.textContent = ''
  element.appendChild(wrapper)
  innerWrapper = wrapper
}

const animateMarquee = () => {
  if (!innerWrapper) return

  if (marqueeTimeline) {
    marqueeTimeline.kill()
  }

  const wrapperWidth = innerWrapper.scrollWidth / 2

  // Bail if width is 0 (not rendered yet)
  if (wrapperWidth <= 0) {
    setTimeout(animateMarquee, 100)
    return
  }

  const distance = marqueeOptions.direction === 'left' ? -wrapperWidth : wrapperWidth
  const duration = wrapperWidth / marqueeOptions.speed

  gsap.set(innerWrapper, { x: 0 })
  marqueeTimeline = gsap.timeline({ repeat: -1 })
  marqueeTimeline.to(innerWrapper, { x: distance, duration, ease: 'none' })
}

const pauseMarquee = () => {
  if (marqueeTimeline && !isPaused) {
    marqueeTimeline.pause()
    isPaused = true
  }
}

const resumeMarquee = () => {
  if (marqueeTimeline && isPaused) {
    marqueeTimeline.play()
    isPaused = false
  }
}

const resetMarquee = () => {
  if (innerWrapper) gsap.set(innerWrapper, { x: 0 })
  if (marqueeTimeline) marqueeTimeline.kill()
  animateMarquee()
}

// Resize handler
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(resetMarquee, 150)
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    setupMarquee()
    // Wait for layout to complete before calculating widths
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animateMarquee()
      })
    })
    window.addEventListener('resize', handleResize, { passive: true })
  })
})

onUnmounted(() => {
  if (marqueeTimeline) {
    marqueeTimeline.kill()
    marqueeTimeline = null
  }
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', handleResize)
  if (innerWrapper) gsap.set(innerWrapper, { clearProps: 'x' })
})
</script>

<template>
  <footer class="footer" :class="{ 'footer--esg': isEsgPage }">
    <!-- Top Section -->
    <div class="footer__section footer__section--top">
      <div class="footer__container">
        <!-- Navigation -->
        <nav class="footer__nav">
          <ul class="footer__nav-list">
            <li v-for="link in navLinks" :key="link.path" class="footer__nav-item">
              <NuxtLink :to="link.path" class="footer__link">
                {{ t(link.name) }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- Social -->
        <div class="footer__social">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            class="footer__link"
          >
            {{ social.name }}
          </a>
        </div>

        <!-- Newsletter -->
        <div class="footer__newsletter">
          <h3 class="footer__newsletter-title">{{ t('footer.newsletter.title') }}</h3>
          <p class="footer__newsletter-text">{{ t('footer.newsletter.description') }}</p>

          <form class="footer__form" @submit.prevent>
            <input
              type="text"
              class="footer__input footer__input--name"
              :placeholder="t('footer.newsletter.form.placeholder.name')"
            >
            <input
              type="email"
              class="footer__input footer__input--email"
              :placeholder="t('footer.newsletter.form.placeholder.email')"
            >
            <button type="submit" class="footer__submit">
              <svg class="footer__submit-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
                <path d="M0.5 0L0.5 10.5096L10.5 10.5096M10.5 10.5096L7.17881 7.01915M10.5 10.5096L7.17881 14" stroke="currentColor"/>
              </svg>
              <span>{{ t('footer.newsletter.form.button.title') }}</span>
            </button>
          </form>

          <p class="footer__disclaimer">
            <svg class="footer__disclaimer-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="1" y="1" width="20" height="20" rx="4" stroke="currentColor" stroke-opacity="0.2"/>
              <rect x="7" y="7" width="8" height="8" rx="4" fill="currentColor"/>
            </svg>
            {{ t('footer.newsletter.disclaimer') }}
          </p>

          <div class="footer__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="164" height="30" fill="none">
              <g clip-path="url(#footer-logo-clip)">
                <path class="footer__logo-text" d="M14.95 21.45c-.61.764-1.525 1.375-2.745 1.985-1.22.535-2.67.84-4.5.84-2.29 0-4.12-.687-5.57-2.137C.688 20.764 0 18.932 0 16.642v-3.893c0-2.214.687-4.046 2.06-5.497 1.373-1.297 3.203-2.06 5.415-2.06 2.365 0 4.196.534 5.34 1.679 1.22 1.068 1.83 2.595 2.06 4.503v.077h-4.043c-.153-.992-.458-1.68-.916-2.214-.457-.534-1.22-.763-2.212-.763-.991 0-1.83.381-2.44 1.221-.61.764-.916 1.832-.916 3.053v3.894c0 1.297.305 2.366.915 3.13.61.763 1.45 1.144 2.518 1.144.762 0 1.373-.076 1.83-.229.458-.152.84-.305 1.068-.534v-2.9H7.781v-2.749h7.246v6.947h-.076ZM32.874 16.413c0 2.29-.687 4.198-2.136 5.648-1.45 1.45-3.356 2.214-5.645 2.214-2.364 0-4.271-.763-5.72-2.214-1.526-1.45-2.213-3.358-2.213-5.648v-3.36c0-2.29.763-4.121 2.212-5.648 1.45-1.45 3.357-2.214 5.721-2.214 2.289 0 4.196.764 5.645 2.214 1.45 1.45 2.212 3.359 2.212 5.649v3.359h-.076Zm-4.272-3.36c0-1.297-.305-2.442-.915-3.282-.61-.84-1.526-1.297-2.67-1.297s-2.06.458-2.67 1.297c-.61.84-.915 1.909-.915 3.283v3.359c0 1.374.305 2.442.915 3.282.61.84 1.526 1.298 2.67 1.298s1.983-.458 2.593-1.298c.61-.84.916-1.908.916-3.282v-3.36h.076ZM75.441 24.045V5.496h5.111c2.136 0 3.967.763 5.416 2.29 1.45 1.527 2.212 3.511 2.212 5.878v2.29c0 2.366-.763 4.351-2.212 5.878-1.45 1.526-3.28 2.29-5.416 2.29h-5.11v-.077Zm.687-17.862v17.175h4.424c1.907 0 3.585-.687 4.958-2.137 1.373-1.45 2.06-3.206 2.06-5.343v-2.29c0-2.138-.687-3.894-2.06-5.268-1.373-1.374-2.975-2.137-4.958-2.137h-4.424ZM93.67 24.045h-.686V5.496h.687v18.55ZM112.359 22.061c-.382.535-1.144 1.07-2.212 1.527-1.144.458-2.441.687-4.043.687-2.136 0-3.814-.763-5.187-2.29-1.297-1.526-1.983-3.511-1.983-5.878v-3.053c0-2.29.61-4.198 1.907-5.725 1.296-1.527 2.974-2.214 5.034-2.214 1.983 0 3.509.535 4.653 1.527 1.144.992 1.755 2.29 1.755 3.893v.076h-.611c-.076-1.45-.61-2.595-1.602-3.511-.991-.916-2.441-1.374-4.271-1.374-1.907 0-3.357.687-4.501 1.985-1.144 1.297-1.678 3.053-1.678 5.19v3.054c0 2.213.61 3.97 1.755 5.42 1.144 1.373 2.746 2.06 4.653 2.06 1.373 0 2.593-.229 3.585-.61.991-.382 1.678-.84 2.059-1.298v-5.42h-5.644v-.687h6.331v6.641ZM118.382 24.045h-.687V5.496h.687v18.55ZM135.932 6.183h-6.713v17.862h-.686V6.183h-6.713v-.687h14.188v.687h-.076ZM147.907 18.473h-9.077l-2.059 5.572h-.763l7.018-18.549h.839l6.941 18.55h-.763l-2.136-5.573Zm-8.772-.687h8.544l-3.891-10.458-.381-1.069h-.076l-.305 1.07-3.891 10.457ZM154.464 23.358h9.535v.687h-10.222V5.496h.687v17.862Z" fill="currentColor"/>
                <path class="footer__logo-circles" d="M54.007 30c-6.56 0-11.976-5.343-11.976-11.984S47.447 6.107 54.007 6.107a11.952 11.952 0 0 1 11.976 11.985c0 6.641-5.34 11.908-11.976 11.908Zm0-23.13c-6.178 0-11.213 5.039-11.213 11.222s5.035 11.221 11.213 11.221c6.179 0 11.213-5.038 11.213-11.221S60.186 6.87 54.007 6.87Z" fill="#0CD459"/>
                <path class="footer__logo-circles" d="M54.007 23.893c-6.56 0-11.976-5.344-11.976-11.985C42.031 5.268 47.447 0 54.007 0a11.952 11.952 0 0 1 11.976 11.985c0 6.64-5.34 11.908-11.976 11.908Zm0-23.13c-6.178 0-11.213 5.038-11.213 11.222 0 6.183 5.035 11.22 11.213 11.22 6.179 0 11.213-5.037 11.213-11.22C65.22 5.8 60.186.763 54.007.763Z" fill="#0CD459"/>
                <path class="footer__logo-circles" d="M57.058 26.947c-6.56 0-11.976-5.343-11.976-11.984S50.498 3.055 57.058 3.055a11.952 11.952 0 0 1 11.976 11.984c0 6.641-5.34 11.908-11.976 11.908Zm0-23.129c-6.179 0-11.213 5.038-11.213 11.221S50.879 26.26 57.058 26.26c6.179 0 11.213-5.038 11.213-11.22 0-6.184-5.034-11.222-11.213-11.222Z" fill="#0CD459"/>
                <path class="footer__logo-circles" d="M50.953 26.945c-6.56 0-11.976-5.343-11.976-11.984S44.392 3.053 50.953 3.053a11.952 11.952 0 0 1 11.975 11.984c0 6.641-5.34 11.908-11.975 11.908Zm0-23.129c-6.18 0-11.214 5.038-11.214 11.221s5.035 11.221 11.214 11.221c6.178 0 11.213-5.038 11.213-11.22 0-6.184-5.035-11.222-11.213-11.222Z" fill="#0CD459"/>
                <path class="footer__logo-circles" d="M57.513 19.771H49.96v-1.603l3.433-3.664c.457-.534.763-.916.991-1.374.23-.458.306-.763.306-.992 0-.382-.077-.763-.306-.992a1.263 1.263 0 0 0-.915-.382c-.381 0-.687.153-.915.458-.23.305-.306.687-.306 1.221h-2.44v-.076c0-.992.305-1.832.991-2.519.687-.687 1.602-1.069 2.67-1.069 1.144 0 2.136.306 2.746.84.61.534.992 1.374.992 2.366 0 .687-.153 1.298-.534 1.832-.382.535-.992 1.298-1.907 2.29l-1.45 1.527v.076h4.196v2.061Z" fill="#0CD459"/>
              </g>
              <defs>
                <clipPath id="footer-logo-clip">
                  <path fill="#fff" d="M0 0h164v30H0z"/>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Section -->
    <div class="footer__section footer__section--middle">
      <h2
        ref="eventTitleRef"
        class="footer__title"
        @mouseenter="pauseMarquee"
        @mouseleave="resumeMarquee"
      >Go2Digital © 2025</h2>

      <!-- Contact -->
      <address class="footer__contact">
        <div
          v-for="item in contactInfo"
          :key="item.label"
          class="footer__contact-item"
        >
          <span class="footer__contact-label">{{ item.label }}</span>
          <a
            :href="item.href"
            class="footer__contact-value"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener noreferrer' : undefined"
          >
            {{ item.value }}
          </a>
        </div>
      </address>
    </div>

    <!-- Bottom Section -->
    <div class="footer__section footer__section--bottom">
      <div class="footer__container">
        <div class="footer__legal">
          <NuxtLink to="/privacy-policy" class="footer__legal-link">
            Privacy Policy
          </NuxtLink>
          <span class="footer__legal-divider"></span>
          <button type="button" class="footer__legal-link footer__legal-link--button">
            Cookie Settings
          </button>
        </div>
        <div class="footer__credits">
          Design / N3 Studio
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
// ============================================
// Design Tokens (CSS Custom Properties)
// ============================================
.footer {
  // Colors - Default Theme
  --footer-bg: #ffffff;
  --footer-bg-accent: #0CD459;
  --footer-text: #03120F;
  --footer-text-muted: rgba(3, 18, 15, 0.4);
  --footer-border: #E6E6E6;
  --footer-border-light: #f0f0f0;

  // Typography
  --footer-font: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // Spacing
  --footer-gap-sm: 0.375rem;
  --footer-gap-md: 1rem;
  --footer-gap-lg: 2.5rem;
  --footer-gap-xl: 6rem;

  // Transitions
  --footer-transition: 0.3s ease;
}

// ESG Theme Override
.footer--esg {
  --footer-bg: #0CD459;
  --footer-border: #0ab34a;
  --footer-border-light: #0ab34a;
}

// ============================================
// Mixins
// ============================================
@mixin responsive($breakpoint) {
  @if $breakpoint == 'tablet' {
    @media (max-width: 1024px) { @content; }
  } @else if $breakpoint == 'mobile' {
    @media (max-width: 768px) { @content; }
  }
}

@mixin link-base {
  color: var(--footer-text);
  font-family: var(--footer-font);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.3;
  text-decoration: none;
  transition: opacity var(--footer-transition);

  &:hover {
    opacity: 0.7;
  }

  @include responsive('mobile') {
    font-size: 0.75rem;
  }
}

// ============================================
// Block: Footer
// ============================================
.footer {
  position: relative;
  width: 100%;
  border-top: 1px solid var(--footer-border);
  background-color: var(--footer-bg);
  z-index: 30;

  &--esg {
    border-top: none;
  }
}

// ============================================
// Element: Section
// ============================================
.footer__section {
  &--top {
    background-color: var(--footer-bg);
  }

  &--middle {
    background-color: var(--footer-bg-accent);
  }

  &--bottom {
    background-color: var(--footer-bg);
    border-top: 1px solid var(--footer-border-light);
  }
}

// ============================================
// Element: Container
// ============================================
.footer__container {
  margin: 0 auto;
  padding: 0 2rem;

  .footer__section--top & {
    display: flex;
    align-items: flex-start;

    @include responsive('tablet') {
      padding: 0;
      flex-direction: column;
    }
  }

  .footer__section--bottom & {
    padding: 1.25rem 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @include responsive('tablet') {
      padding: 1rem;
    }
  }
}

// ============================================
// Element: Navigation
// ============================================
.footer__nav {
  padding: var(--footer-gap-lg) var(--footer-gap-lg) 5rem;

  @include responsive('tablet') {
    width: 100%;
    padding: 2rem var(--footer-gap-lg) 2rem 1rem;
    border-top: 1px solid var(--footer-border);
  }
}

.footer__nav-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer__nav-item {
  min-width: 10rem;
}

// ============================================
// Element: Link (Shared)
// ============================================
.footer__link {
  @include link-base;
  min-width: 10rem;
  display: block;
}

// ============================================
// Element: Social
// ============================================
.footer__social {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: var(--footer-gap-lg) var(--footer-gap-lg) 5rem;

  @include responsive('tablet') {
    padding: 2rem var(--footer-gap-lg) 2rem 1rem;
    border-top: 1px solid var(--footer-border);
  }
}

// ============================================
// Element: Newsletter
// ============================================
.footer__newsletter {
  width: 100%;
  padding: var(--footer-gap-lg) 1.25rem 8rem;
  position: relative;

  @include responsive('tablet') {
    padding: 2rem 1rem;
    border-top: 1px solid var(--footer-border);
  }
}

.footer__newsletter-title {
  font-family: var(--footer-font);
  font-size: 2.125rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.02rem;
  color: var(--footer-text);
  margin: 0;
}

.footer__newsletter-text {
  margin-top: 1.25rem;
  font-family: var(--footer-font);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.3;
  color: var(--footer-text);
}

// ============================================
// Element: Form
// ============================================
.footer__form {
  display: flex;
  gap: 0.75rem;
  margin-top: var(--footer-gap-lg);
  margin-bottom: 1.7rem;

  @include responsive('tablet') {
    flex-direction: column;
    gap: 1rem;
  }
}

.footer__input {
  flex: 1;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--footer-border);
  outline: none;
  color: var(--footer-text);
  background-color: transparent;
  font-family: var(--footer-font);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.3;
  opacity: 0.4;
  transition: border-color 0.15s ease, opacity 0.15s ease;

  &:focus {
    border-color: #6b6b6b;
    opacity: 1;
  }

  &::placeholder {
    color: #6b6b6b;
  }

  &--name {
    max-width: 30%;

    @include responsive('tablet') {
      max-width: 70%;
    }
  }

  &--email {
    max-width: 70%;

    @include responsive('tablet') {
      max-width: 100%;
    }
  }
}

.footer__submit {
  padding: 0.625rem 1.5rem;
  background-color: transparent;
  border: 1px solid transparent;
  color: var(--footer-text);
  font-size: 0.875rem;
  font-family: var(--footer-font);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;

  @include responsive('mobile') {
    margin-top: 1rem;
    padding: 0;
    font-size: 1rem;
  }
}

.footer__submit-icon {
  width: 1rem;
  height: 1rem;
}

// ============================================
// Element: Disclaimer
// ============================================
.footer__disclaimer {
  font-family: var(--footer-font);
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.3;
  display: flex;
  align-items: center;
  color: var(--footer-text-muted);
  margin: 0;
}

.footer__disclaimer-icon {
  margin-right: var(--footer-gap-sm);
  flex-shrink: 0;
}

// ============================================
// Element: Logo
// ============================================
.footer__logo {
  position: absolute;
  right: 1.25rem;
  top: var(--footer-gap-lg);

  @include responsive('mobile') {
    display: none;
  }
}

.footer__logo-text {
  fill: var(--footer-text);
  transition: fill var(--footer-transition);
}

.footer__logo-circles {
  fill: #0CD459;
}

// ============================================
// Element: Title (Marquee)
// ============================================
.footer__title {
  color: var(--footer-text);
  font-family: var(--footer-font);
  font-size: 17.5rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -1.05rem;
  margin: 0;
  overflow: hidden;
  cursor: default;

  @include responsive('tablet') {
    font-size: 5.375rem;
    letter-spacing: -0.3rem;
  }

  @include responsive('mobile') {
    padding-top: var(--footer-gap-lg);
    font-size: 5.375rem;
    letter-spacing: -0.16rem;
  }
}

// Marquee inner elements (created by JS)
.footer__title :deep(.footer__marquee-inner) {
  display: flex;
  white-space: nowrap;
  width: fit-content;
  will-change: transform;
}

.footer__title :deep(.footer__marquee-text) {
  flex-shrink: 0;
  padding-right: 100px;
}

// ============================================
// Element: Contact
// ============================================
.footer__contact {
  display: flex;
  gap: var(--footer-gap-xl);
  margin-top: 12rem;
  padding: 1.25rem 2.5rem;
  font-style: normal;

  @include responsive('tablet') {
    flex-direction: column;
    gap: 1.5rem;
  }

  @include responsive('mobile') {
    margin-top: var(--footer-gap-lg);
    padding: 1rem;
  }
}

.footer__contact-item {
  display: flex;
  flex-direction: column;
  gap: var(--footer-gap-sm);
}

.footer__contact-label {
  font-size: 0.875rem;
  color: var(--footer-text);
  font-weight: 400;
  opacity: 0.9;
}

.footer__contact-value {
  font-size: 0.9375rem;
  color: var(--footer-text);
  opacity: 0.3;
  text-decoration: none;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.6;
  }
}

// ============================================
// Element: Legal
// ============================================
.footer__legal {
  display: flex;
  gap: 2rem;
  align-items: center;

  @include responsive('mobile') {
    gap: 0.5rem;
  }
}

.footer__legal-link {
  @include link-base;

  &--button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: var(--footer-font);
  }
}

.footer__legal-divider {
  width: 0.25rem;
  height: 0.25rem;
  background-color: #4a4a4a;
  border-radius: 50%;

  @include responsive('mobile') {
    display: none;
  }
}

// ============================================
// Element: Credits
// ============================================
.footer__credits {
  color: var(--footer-text);
  font-family: var(--footer-font);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.3;

  @include responsive('mobile') {
    font-size: 0.75rem;
  }
}
</style>
