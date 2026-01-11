<template>
  <div class="esg-page">
    <!-- Hero Section -->
    <section class="esg-page__hero">
      <div class="esg-page__hero-title">
        <h1
          class="esg-page__display-title"
          data-split-text
          data-split-type="chars"
          data-split-duration="0.6"
          data-split-stagger="0.03"
        >ESG</h1>
      </div>
      <div class="esg-page__hero-label">
        <span class="esg-page__bullet"></span>
        <span
          class="esg-page__label-text"
          data-split-text
          data-split-type="lines"
          data-split-duration="0.4"
          data-split-delay="0.3"
          data-split-stagger="0.03"
        >{{ $t('esg.hero.label') }}</span>
      </div>
    </section>

    <!-- Intro Section -->
    <section class="esg-page__intro-section">
      <div class="esg-page__intro-grid">
        <div class="esg-page__intro-left">
          <p
            class="esg-page__intro-small"
            data-split-text
            data-split-type="lines"
            data-split-duration="0.5"
            data-split-stagger="0.08"
          >{{ $t('esg.intro.small') }}</p>
        </div>
        <div class="esg-page__intro-right">
          <p
            class="esg-page__intro-large"
            data-split-text
            data-split-type="lines"
            data-split-duration="0.6"
            data-split-stagger="0.1"
            data-split-indent="11.25rem"
          >{{ $t('esg.intro.large') }}</p>

          <div class="esg-page__download-btn">
            <a href="#" class="esg-page__action-link">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.83203 8.33334L9.9987 12.5L14.1654 8.33334" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 12.5V2.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('esg.intro.downloadReport') }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Pillars Section -->
    <section class="esg-page__pillars">
      <div class="esg-page__pillar">
        <div class="esg-page__pillar-number">01</div>
        <div class="esg-page__pillar-title">{{ $t('esg.pillars.pillar1.title') }}</div>
        <div class="esg-page__pillar-desc">{{ $t('esg.pillars.pillar1.description') }}</div>
      </div>

      <div class="esg-page__pillar">
        <div class="esg-page__pillar-number">02</div>
        <div class="esg-page__pillar-title">{{ $t('esg.pillars.pillar2.title') }}</div>
        <div class="esg-page__pillar-desc">{{ $t('esg.pillars.pillar2.description') }}</div>
      </div>

      <div class="esg-page__pillar">
        <div class="esg-page__pillar-number">03</div>
        <div class="esg-page__pillar-title">{{ $t('esg.pillars.pillar3.title') }}</div>
        <div class="esg-page__pillar-desc">{{ $t('esg.pillars.pillar3.description') }}</div>
      </div>
    </section>

    <!-- Video Section -->
    <section ref="videoSection" class="esg-page__video-section">
      <!-- Mobile background image -->
      <div class="esg-page__mobile-bg">
        <img :src="mobileBgUrl" alt="ESG Background">
      </div>

      <!-- Desktop video background -->
      <div ref="videoBg" class="esg-page__video-bg">
        <video class="esg-page__video" autoplay muted loop playsinline>
          <source :src="videoUrl" type="video/mp4">
        </video>
      </div>

      <!-- Video mask layer -->
      <div ref="videoMask" class="esg-page__video-mask">
        <video ref="videoElement" class="esg-page__video" autoplay muted loop playsinline>
          <source :src="videoUrl" type="video/mp4">
        </video>
      </div>

      <!-- Cards container -->
      <div class="esg-page__cards-container" data-esg-cards>
        <div ref="card1" class="esg-page__card">
          <div class="esg-page__card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12.5 16.5V22.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7.5 22.5H17.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12.5 3.5V16.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.57812 7.5H21.4073" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2.67578 11.5H22.3338" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22.9332 14.0503L20.8563 5.05028C20.6468 4.14282 19.8388 3.5 18.9075 3.5H6.0895C5.15819 3.5 4.35014 4.14282 4.14072 5.05028L2.0638 14.0503C1.77459 15.3035 2.72641 16.5 4.01258 16.5H20.9844C22.2706 16.5 23.2224 15.3035 22.9332 14.0503Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="esg-page__card-text">{{ $t('esg.cards.card1') }}</p>
        </div>

        <div ref="card2" class="esg-page__card">
          <div class="esg-page__card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 22.5C8.11305 22.5 5.82387 21.5518 4.13604 19.864C2.44821 18.1761 1.5 15.8869 1.5 13.5V9.5C2.6819 9.5 3.85222 9.73279 4.94415 10.1851C6.03608 10.6374 7.02823 11.3003 7.86396 12.136C8.69969 12.9718 9.36262 13.9639 9.81492 15.0558C10.2672 16.1478 10.5 17.3181 10.5 18.5V22.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10.5 22.5C12.2072 22.5 13.8977 22.1637 15.4749 21.5104C17.0521 20.8571 18.4852 19.8996 19.6924 18.6924C20.8996 17.4852 21.8571 16.0521 22.5104 14.4749C23.1637 12.8977 23.5 11.2072 23.5 9.5V2.5C20.0522 2.5 16.7456 3.86964 14.3076 6.30761C11.8696 8.74558 10.5 12.0522 10.5 15.5V22.5Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="esg-page__card-text">{{ $t('esg.cards.card2') }}</p>
        </div>

        <div ref="card3" class="esg-page__card">
          <div class="esg-page__card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 16L7.5 10.5L13.5 16.5L22.5 7.5L22.1312 7.86884" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15.5 7.5H22.5V14.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="esg-page__card-text">{{ $t('esg.cards.card3') }}</p>
        </div>
      </div>
    </section>

    <!-- Vision Section -->
    <section ref="visionSection" class="esg-page__vision">
      <div class="esg-page__vision-header">
        <h2 class="esg-page__vision-title">{{ $t('esg.vision.title') }}</h2>
        <div class="esg-page__vision-label">
          <span class="esg-page__bullet"></span>
          <span class="esg-page__label-text">{{ $t('esg.vision.label') }}</span>
        </div>
      </div>

      <div class="esg-page__vision-content">
        <div class="esg-page__vision-diagram">
          <div ref="diagramCircle" class="esg-page__diagram-circle">
            <div class="esg-page__diagram-marker esg-page__diagram-marker--1">
              <span ref="badge1" class="esg-page__diagram-badge">001</span>
            </div>
            <div class="esg-page__diagram-marker esg-page__diagram-marker--2">
              <span ref="badge2" class="esg-page__diagram-badge esg-page__diagram-badge--dim">002</span>
            </div>
            <div class="esg-page__diagram-marker esg-page__diagram-marker--3">
              <span ref="badge3" class="esg-page__diagram-badge esg-page__diagram-badge--dim">003</span>
            </div>

            <div class="esg-page__diagram-info">
              <h3 ref="diagramTitle" class="esg-page__diagram-title">{{ badgeContent[1].title }}</h3>
              <p ref="diagramDesc" class="esg-page__diagram-desc">{{ badgeContent[1].desc }}</p>
            </div>
          </div>
        </div>

        <p class="esg-page__scroll-hint">{{ $t('esg.vision.scrollHint') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

useHead({
  title: 'ESG - Go2Digital'
})

// Asset URLs (dynamic to avoid Vite static analysis)
const videoUrl = '/videos/esg-video-bg.mp4'
const mobileBgUrl = '/images/esg-bg.jpg'

// Template refs
const videoSection = ref<HTMLElement | null>(null)
const videoMask = ref<HTMLElement | null>(null)
const videoBg = ref<HTMLElement | null>(null)
const videoElement = ref<HTMLVideoElement | null>(null)
const card1 = ref<HTMLElement | null>(null)
const card2 = ref<HTMLElement | null>(null)
const card3 = ref<HTMLElement | null>(null)
const visionSection = ref<HTMLElement | null>(null)
const diagramCircle = ref<HTMLElement | null>(null)
const badge1 = ref<HTMLElement | null>(null)
const badge2 = ref<HTMLElement | null>(null)
const badge3 = ref<HTMLElement | null>(null)
const diagramTitle = ref<HTMLElement | null>(null)
const diagramDesc = ref<HTMLElement | null>(null)

// Animation references
let videoTimeline: gsap.core.Timeline | null = null
let videoScrollTrigger: ScrollTrigger | null = null
let visionTimeline: gsap.core.Timeline | null = null
let visionScrollTrigger: ScrollTrigger | null = null
let lastActiveBadge = 0

// Badge content for vision section
const badgeContent = {
  1: {
    title: 'Digitalni Ekrani',
    desc: 'Sama srž našeg poslovanja je digitalna i time smanjujemo utjecaj na okoliš i gradimo održiviju budućnost oglašavanja.'
  },
  2: {
    title: 'Zeleni Tornjevi',
    desc: 'Zeleni tornjevi su lokacije na kojima smo postavili košnice za pčele i autohtone hrvatske biljke čime doprinosimo održivosti okoliša u blizini naših ekrana.'
  },
  3: {
    title: 'Čišćenje Zraka',
    desc: 'Naši citylight ekrani imaju integrirane HEPA filtere koji uklanjaju sitne čestice prašine, peludi i zagađenja iz prometa te pomažu stvaranju zdravijeg i ugodnijeg urbanog okruženja.'
  }
}

/**
 * Initialize video section scroll animation with mask reveal
 */
function initVideoAnimation() {
  const isMobile = window.innerWidth <= 576

  // Skip animation on mobile
  if (isMobile) return

  const section = videoSection.value
  const mask = videoMask.value
  const bg = videoBg.value
  const video = videoElement.value
  const cards = [card1.value, card2.value, card3.value].filter(Boolean) as HTMLElement[]

  if (!section || !mask || cards.length === 0) return

  const numCards = cards.length
  const scrollMultiplier = 130 + numCards * 38

  videoTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: `+=${scrollMultiplier}%`,
      pin: true,
      scrub: 1,
      onLeave: () => {
        if (mask) {
          mask.style.clipPath = 'inset(0 0 0 0 round 0)'
        }
      },
      onUpdate: (self) => {
        const progress = self.progress

        // Phase 1: Mask reveal (0% - 25%)
        if (progress <= 0.25) {
          const maskProgress = progress / 0.25

          const topBottom = (1 - maskProgress) * 50 - (1 - maskProgress) * 10
          const leftRight = (1 - maskProgress) * 50 - (1 - maskProgress) * 14.5
          const borderRadius = (1 - maskProgress) * 2

          if (mask) {
            mask.style.clipPath = `inset(${topBottom}% ${leftRight}% ${topBottom}% ${leftRight}% round ${borderRadius}rem)`
          }

          // Keep cards below screen
          cards.forEach(card => {
            card.style.opacity = '1'
            card.style.transform = 'translateY(100vh)'
          })
        }

        // Phase 2: Cards animate up (25% - 100%)
        if (progress > 0.25) {
          if (mask) {
            mask.style.clipPath = 'inset(0 0 0 0 round 0)'
          }

          // Parallax effect on video
          const parallaxProgress = (progress - 0.25) / 0.75
          const parallaxAmount = -10

          if (video) {
            video.style.transform = `translate(-50%, -50%) scale(1.1) translateY(${parallaxProgress * parallaxAmount}%)`
          }

          // Card animations
          const cardPhaseStart = 0.25
          const cardPhaseDuration = 0.75 / cards.length
          const centeredYPosition = -25

          cards.forEach((card, index) => {
            const isLastCard = index === cards.length - 1
            const cardStart = cardPhaseStart + (index * cardPhaseDuration)
            const cardEnd = cardStart + cardPhaseDuration

            card.style.opacity = '1'

            if (progress < cardStart) {
              card.style.transform = 'translateY(100vh)'
            } else if (progress >= cardStart && progress < cardEnd) {
              const cardProgress = (progress - cardStart) / cardPhaseDuration
              const targetY = isLastCard ? centeredYPosition : 0
              const yPos = 100 - (cardProgress * (100 - targetY))
              card.style.transform = `translateY(${yPos}vh)`
            } else {
              if (isLastCard) {
                card.style.transform = `translateY(${centeredYPosition}vh)`
              } else {
                const exitDuration = cardPhaseDuration * 0.5
                const exitProgress = Math.min((progress - cardEnd) / exitDuration, 1)
                const yPos = -exitProgress * 100
                card.style.transform = `translateY(${yPos}vh)`
              }
            }
          })
        }
      }
    }
  })

  videoScrollTrigger = videoTimeline.scrollTrigger as ScrollTrigger
}

/**
 * Set active badge and update content
 */
function setActiveBadge(badgeNum: number) {
  if (lastActiveBadge === badgeNum) return

  const badges = [badge1.value, badge2.value, badge3.value]
  const titleEl = diagramTitle.value
  const descEl = diagramDesc.value

  badges.forEach((badge, index) => {
    if (!badge) return
    const badgeIndex = index + 1

    if (badgeIndex <= badgeNum) {
      badge.classList.add('esg-page__diagram-badge--active')
      badge.classList.remove('esg-page__diagram-badge--dim')
    } else {
      badge.classList.remove('esg-page__diagram-badge--active')
      badge.classList.add('esg-page__diagram-badge--dim')
    }
  })

  // Update content with animation
  const content = badgeContent[badgeNum as keyof typeof badgeContent]
  if (content && titleEl && descEl) {
    gsap.to([titleEl, descEl], {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        titleEl.textContent = content.title
        descEl.textContent = content.desc
        gsap.to([titleEl, descEl], {
          opacity: 1,
          duration: 0.2
        })
      }
    })
  }

  lastActiveBadge = badgeNum
}

/**
 * Initialize vision section scroll animation
 */
function initVisionAnimation() {
  const section = visionSection.value
  const circle = diagramCircle.value

  if (!section || !circle) return

  const circleWidth = circle.offsetWidth
  const circleHeight = circle.offsetHeight
  const radius = Math.min(circleWidth, circleHeight) / 2 - 1
  const circumference = 2 * Math.PI * radius

  // Create SVG progress circle
  const svgNS = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('class', 'esg-page__progress-svg')
  svg.setAttribute('viewBox', `0 0 ${circleWidth} ${circleHeight}`)
  svg.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    pointer-events: none;
    overflow: visible;
  `

  // Background circle (dotted)
  const bgCircle = document.createElementNS(svgNS, 'circle')
  bgCircle.setAttribute('cx', String(circleWidth / 2))
  bgCircle.setAttribute('cy', String(circleHeight / 2))
  bgCircle.setAttribute('r', String(radius))
  bgCircle.setAttribute('fill', 'none')
  bgCircle.setAttribute('stroke', 'rgba(12, 212, 89, 0.3)')
  bgCircle.setAttribute('stroke-width', '1')
  bgCircle.setAttribute('stroke-dasharray', '8 12')

  // Progress circle (solid, animated)
  const progressCircle = document.createElementNS(svgNS, 'circle')
  progressCircle.setAttribute('cx', String(circleWidth / 2))
  progressCircle.setAttribute('cy', String(circleHeight / 2))
  progressCircle.setAttribute('r', String(radius))
  progressCircle.setAttribute('fill', 'none')
  progressCircle.setAttribute('stroke', '#0CD459')
  progressCircle.setAttribute('stroke-width', '1')
  progressCircle.setAttribute('stroke-dasharray', String(circumference))
  progressCircle.setAttribute('stroke-dashoffset', String(circumference))
  progressCircle.setAttribute('class', 'esg-page__progress-circle')

  svg.appendChild(bgCircle)
  svg.appendChild(progressCircle)

  // Create intermediate dots
  const dotPositions = [
    { angle: 60, progressThreshold: 0.165 },
    { angle: 180, progressThreshold: 0.5 },
    { angle: 300, progressThreshold: 0.835 }
  ]

  const intermediateDots: SVGCircleElement[] = []
  const dotRadius = 8
  const cx = circleWidth / 2
  const cy = circleHeight / 2

  dotPositions.forEach((dot) => {
    const angleRad = dot.angle * (Math.PI / 180)
    const dotX = cx + radius * Math.cos(angleRad)
    const dotY = cy + radius * Math.sin(angleRad)

    const dotCircle = document.createElementNS(svgNS, 'circle')
    dotCircle.setAttribute('cx', String(dotX))
    dotCircle.setAttribute('cy', String(dotY))
    dotCircle.setAttribute('r', String(dotRadius))
    dotCircle.setAttribute('fill', 'none')
    dotCircle.setAttribute('stroke', 'rgba(12, 212, 89, 0.5)')
    dotCircle.setAttribute('stroke-width', '1')
    dotCircle.setAttribute('class', 'esg-page__progress-dot')
    dotCircle.dataset.threshold = String(dot.progressThreshold)

    svg.appendChild(dotCircle)
    intermediateDots.push(dotCircle)
  })

  // Remove existing border and add SVG
  circle.style.border = 'none'
  circle.style.position = 'relative'
  circle.insertBefore(svg, circle.firstChild)

  // Set initial state
  setActiveBadge(1)

  // Create scroll-triggered animation
  visionTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress

        // Update circle progress
        const offset = circumference - (progress * circumference)
        progressCircle.setAttribute('stroke-dashoffset', String(offset))

        // Update intermediate dots
        intermediateDots.forEach(dot => {
          const threshold = parseFloat(dot.dataset.threshold || '0')
          if (progress >= threshold) {
            dot.setAttribute('fill', '#0CD459')
            dot.setAttribute('stroke', '#0CD459')
          } else {
            dot.setAttribute('fill', 'none')
            dot.setAttribute('stroke', 'rgba(12, 212, 89, 0.5)')
          }
        })

        // Determine active badge
        let activeBadge = 1
        if (progress > 0.66) {
          activeBadge = 3
        } else if (progress > 0.33) {
          activeBadge = 2
        }

        setActiveBadge(activeBadge)
      }
    }
  })

  visionScrollTrigger = visionTimeline.scrollTrigger as ScrollTrigger
}

onMounted(() => {
  // Wait for DOM to be ready
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initVideoAnimation()
      initVisionAnimation()
    })
  })
})

onUnmounted(() => {
  if (videoScrollTrigger) {
    videoScrollTrigger.kill()
  }
  if (videoTimeline) {
    videoTimeline.kill()
  }
  if (visionScrollTrigger) {
    visionScrollTrigger.kill()
  }
  if (visionTimeline) {
    visionTimeline.kill()
  }
})
</script>

<style lang="scss" scoped>
// Design tokens
$esg-color-background: #063D32;
$esg-color-accent: #0CD459;
$esg-color-border: #1B594C;
$esg-color-border-faint: rgba(#0CD459, 0.2);

$esg-mobile-breakpoint: 576px;

@mixin esg-mobile {
  @media (max-width: $esg-mobile-breakpoint) {
    @content;
  }
}

@mixin esg-tablet {
  @media (max-width: 1024px) {
    @content;
  }
}

@mixin esg-desktop-lg {
  @media (min-width: 1200px) {
    @content;
  }
}

// ESG Page Styles
.esg-page {
  background-color: $esg-color-background;
  min-height: 100dvh;
  color: $esg-color-accent;

  @include esg-mobile {
    padding-top: 6.0625rem;
  }

  // Bullet element
  &__bullet {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background-color: $esg-color-accent;
    flex-shrink: 0;
  }

  &__label-text {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 0.9;
    color: $esg-color-accent;
  }

  // Hero Section
  &__hero {
    padding: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    @include esg-mobile {
      padding: 1.25rem 1rem;
      border-top: 0.0625rem solid #395E57;
      flex-direction: column;
      gap: 1rem;
    }
  }

  &__hero-title {
    flex: 1;
  }

  &__display-title {
    font-size: 8.75rem;
    font-weight: 400;
    line-height: 0.8;
    letter-spacing: -0.06em;
    color: $esg-color-accent;
    margin: 0;

    @include esg-desktop-lg {
      font-size: 17.5rem;
    }

    @include esg-mobile {
      font-size: 5.375rem;
      line-height: 0.85;
      letter-spacing: -0.03em;
    }
  }

  &__hero-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    @include esg-mobile {
      align-self: flex-start;
    }
  }

  // Intro Section
  &__intro-section {
    padding: 8rem 2.5rem 12.5rem 2.5rem;

    @include esg-mobile {
      padding: 2.5rem 1rem 3.75rem 1rem;
    }
  }

  &__intro-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2.5rem;
    margin-bottom: 0;

    @include esg-mobile {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  }

  &__intro-left {
    grid-column: 1 / 4;
  }

  &__intro-right {
    grid-column: 6 / 13;
  }

  &__intro-small {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    margin: 0;

    @include esg-mobile {
      font-size: 0.875rem;
      opacity: 0.6;
    }
  }

  &__intro-large {
    font-size: 1.75rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    color: $esg-color-accent;
    margin: 0;

    @include esg-desktop-lg {
      font-size: 3.125rem;
    }

    @include esg-mobile {
      font-size: 1.375rem;
      line-height: 1.1;
    }
  }

  &__download-btn {
    margin-top: 7.625rem;

    @include esg-mobile {
      margin-top: 2rem;
    }
  }

  &__action-link {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    text-decoration: none;
    padding-bottom: 0.25rem;
    border-bottom: 0.0625rem solid $esg-color-accent;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.7;
    }

    svg {
      flex-shrink: 0;
    }

    @include esg-mobile {
      font-size: 0.875rem;
    }
  }

  // Pillars Section
  &__pillars {
    padding: 0;
    border-top: 0.0625rem solid $esg-color-border-faint;
  }

  &__pillar {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1.25rem;
    padding: 1.25rem 2.5rem 18.75rem 2.5rem;
    border-bottom: 0.0625rem solid $esg-color-border-faint;

    @include esg-mobile {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 1.25rem 1rem 2.5rem 1rem;
    }
  }

  &__pillar-number {
    grid-column: 1 / 2;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: $esg-color-accent;

    @include esg-desktop-lg {
      font-size: 2rem;
    }

    @include esg-mobile {
      font-size: 1.125rem;
    }
  }

  &__pillar-title {
    grid-column: 3 / 6;
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: $esg-color-accent;

    @include esg-desktop-lg {
      font-size: 2rem;
    }

    @include esg-mobile {
      font-size: 1.25rem;
    }
  }

  &__pillar-desc {
    grid-column: 8 / 12;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    opacity: 0.4;

    @include esg-desktop-lg {
      max-width: 29rem;
      margin-left: auto;
    }

    @include esg-mobile {
      font-size: 0.875rem;
    }
  }

  // Video Section
  &__video-section {
    position: relative;
    height: 100dvh;
    overflow: hidden;
    background-color: $esg-color-background;

    @include esg-mobile {
      height: auto;
      min-height: unset;
    }
  }

  &__mobile-bg {
    display: none;

    @include esg-mobile {
      display: block;
      position: absolute;
      inset: 0;
      z-index: 1;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  &__video-bg {
    position: absolute;
    inset: 0;
    opacity: 0;
    will-change: transform;

    @include esg-mobile {
      display: none;
    }
  }

  &__video-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: inset(calc(50% - 10rem) calc(50% - 14.5rem) calc(50% - 10rem) calc(50% - 14.5rem) round 2rem);
    will-change: clip-path;

    @include esg-mobile {
      display: none;
    }
  }

  &__video {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
    will-change: transform;

    @include esg-mobile {
      display: none;
    }
  }

  &__cards-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 2.5rem;
    pointer-events: none;
    z-index: 10;

    > * {
      pointer-events: auto;
    }

    @include esg-mobile {
      position: relative;
      height: auto;
      padding: 1rem;
      gap: 0.75rem;
    }
  }

  &__card {
    width: 100%;
    max-width: 25rem;
    height: auto;
    min-height: 14.25rem;
    padding: 1.25rem;
    background: rgba(250, 250, 250, 0.01);
    backdrop-filter: blur(1.875rem);
    border-radius: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
    opacity: 0;
    transform: translateY(100vh);
    will-change: transform, opacity;

    @include esg-mobile {
      max-width: 100%;
      min-height: 10rem;
      padding: 1rem;
      border-radius: 20px;
      background: rgba($esg-color-accent, 0.05);
      border: 0.0625rem solid $esg-color-border-faint;
      opacity: 1;
      transform: none;
      will-change: auto;
    }
  }

  &__card-icon {
    width: 5rem;
    height: 5rem;
    border: 0.0625rem solid rgba(250, 250, 250, 0.2);
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FAFAFA;
    flex-shrink: 0;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    @include esg-mobile {
      width: 3.5rem;
      height: 3.5rem;
      border-color: $esg-color-border-faint;
      color: $esg-color-accent;
    }
  }

  &__card-text {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: #FAFAFA;
    margin: 0;

    @include esg-mobile {
      font-size: 0.875rem;
      color: $esg-color-accent;
    }
  }

  // Vision Section
  &__vision {
    position: relative;
    height: 100dvh;
    padding: 5rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    @include esg-mobile {
      padding: 2.5rem 1rem;
    }
  }

  &__vision-header {
    position: absolute;
    top: 5rem;
    left: 2.5rem;
    right: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    @include esg-mobile {
      position: relative;
      top: 0;
      left: 0;
      right: 0;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
  }

  &__vision-title {
    font-size: 2rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.02em;
    color: $esg-color-accent;
    margin: 0;
    max-width: 28.5rem;

    @include esg-desktop-lg {
      font-size: 3.125rem;
    }

    @include esg-mobile {
      font-size: 1.5rem;
      max-width: 100%;
    }
  }

  &__vision-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__vision-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  &__vision-diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;

    @include esg-mobile {
      width: 100%;
    }
  }

  &__diagram-circle {
    width: 32.25rem;
    height: 32.875rem;
    position: relative;
    border: 0.0625rem solid rgba($esg-color-accent, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    @include esg-mobile {
      width: 17.5rem;
      height: 17.5rem;
    }
  }

  &__progress-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    pointer-events: none;
  }

  &__progress-circle {
    transition: stroke-dashoffset 0.1s ease-out;
  }

  &__progress-dot {
    transition: fill 0.3s ease, stroke 0.3s ease;
  }

  &__diagram-marker {
    position: absolute;

    &--1 {
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &--2 {
      bottom: 20%;
      right: 5%;
    }

    &--3 {
      bottom: 20%;
      left: 5%;
    }
  }

  &__diagram-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    background-color: $esg-color-accent;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-background;
    transition: opacity 0.3s ease, transform 0.3s ease;

    &--dim {
      opacity: 0.4;
    }

    &--active {
      opacity: 1;
      transform: scale(1.1);
    }

    @include esg-mobile {
      font-size: 0.625rem;
      padding: 0.1875rem 0.375rem;
    }
  }

  &__diagram-info {
    text-align: center;
    max-width: 17.875rem;
    min-height: 5rem;

    @include esg-mobile {
      max-width: 11.25rem;
    }
  }

  &__diagram-title {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    margin: 0 0 1.25rem 0;
    transition: opacity 0.2s ease;

    @include esg-mobile {
      font-size: 0.875rem;
      margin: 0 0 0.75rem 0;
    }
  }

  &__diagram-desc {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    opacity: 0.4;
    margin: 0;
    transition: opacity 0.2s ease;

    @include esg-mobile {
      font-size: 0.75rem;
    }
  }

  &__scroll-hint {
    position: absolute;
    left: 0;
    top: 50%;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.3;
    color: $esg-color-accent;
    text-transform: capitalize;

    @include esg-mobile {
      display: none;
    }
  }
}
</style>
