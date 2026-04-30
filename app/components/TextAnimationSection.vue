<template>
  <section class="text-animation" ref="sectionRef">
    <div class="text-animation__container" ref="containerRef">
      <p :class="['text-animation__word', 'text-animation__word--primary', typoClass('word')]" ref="word1Ref" :aria-label="word1Text">
        <span v-for="(ch, i) in word1Chars" :key="`w1-${i}`" class="text-animation__letter-wrap" aria-hidden="true">
          <span class="text-animation__letter">{{ ch }}</span>
        </span>
      </p>
      <p :class="['text-animation__word', 'text-animation__word--secondary', typoClass('word')]" ref="word2Ref" :aria-label="word2Text">
        <span v-for="(ch, i) in word2Chars" :key="`w2-${i}`" class="text-animation__letter-wrap" aria-hidden="true">
          <span class="text-animation__letter">{{ ch }}</span>
        </span>
      </p>
      <p :class="['text-animation__word', 'text-animation__word--tertiary', typoClass('word')]" ref="word3Ref" :aria-label="word3Text">
        <span v-for="(ch, i) in word3Chars" :key="`w3-${i}`" class="text-animation__letter-wrap" aria-hidden="true">
          <span class="text-animation__letter">{{ ch }}</span>
        </span>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomepageTextAnimation } from '~/types/api'

const { t } = useI18n()
const { data: textAnim } = useApi<HomepageTextAnimation>('/api/singletons/homepage-text-animation', { lazy: true, server: false })

const DEFAULT_PRESETS = {
  word: 'display-huge',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = (textAnim.value as { typographyMap?: Record<string, string> } | null)?.typographyMap
  return `typo-${map?.[key] || DEFAULT_PRESETS[key]}`
}

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const word1Ref = ref<HTMLElement | null>(null)
const word2Ref = ref<HTMLElement | null>(null)
const word3Ref = ref<HTMLElement | null>(null)

const word1Text = computed(() => textAnim.value?.word1 ?? t('homepage.textAnimation.word1'))
const word2Text = computed(() => textAnim.value?.word2 ?? t('homepage.textAnimation.word2'))
const word3Text = computed(() => textAnim.value?.word3 ?? t('homepage.textAnimation.word3'))

// Split each word into characters; preserve spaces with non-breaking space
const splitChars = (s: string): string[] =>
  Array.from(s).map(c => (c === ' ' ? ' ' : c))

const word1Chars = computed(() => splitChars(word1Text.value))
const word2Chars = computed(() => splitChars(word2Text.value))
const word3Chars = computed(() => splitChars(word3Text.value))

let timeline: gsap.core.Timeline | null = null
const prefersReducedMotion = ref(false)

const mobileBreakpoint = 768
const isMobile = () => window.innerWidth < mobileBreakpoint

// #5: Debounced resize handler
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const handleResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh()
  }, 150)
}

const getLetters = (wordEl: HTMLElement | null): HTMLElement[] => {
  if (!wordEl) return []
  return Array.from(wordEl.querySelectorAll<HTMLElement>('.text-animation__letter'))
}

const buildTimeline = () => {
  if (timeline) {
    timeline.kill()
    timeline = null
  }
  if (!containerRef.value || !word1Ref.value || !word2Ref.value || !word3Ref.value) return

  const w1 = word1Ref.value
  const w2 = word2Ref.value
  const w3 = word3Ref.value
  const w1Letters = getLetters(w1)
  const w2Letters = getLetters(w2)
  const w3Letters = getLetters(w3)

  if (prefersReducedMotion.value) {
    gsap.set([w1, w2, w3], { opacity: 1 })
    gsap.set(w1Letters, { yPercent: 0, rotationX: 0 })
    gsap.set([...w2Letters, ...w3Letters], { yPercent: 110, rotationX: 90 })
    return
  }

  // All words share the same stacked position; visibility is driven by letter Y
  gsap.set([w1, w2, w3], { opacity: 1 })
  gsap.set(w1Letters, { yPercent: 0, rotationX: 0, transformOrigin: '50% 50%' })
  gsap.set(w2Letters, { yPercent: 110, rotationX: 90, transformOrigin: '50% 50%' })
  gsap.set(w3Letters, { yPercent: 110, rotationX: 90, transformOrigin: '50% 50%' })

  const mobile = isMobile()
  const letterStagger = mobile ? 0.025 : 0.04
  const letterDuration = mobile ? 0.4 : 0.55

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=300%',
      scrub: mobile ? 0.3 : 1,
      pin: containerRef.value,
      pinSpacing: false,
      invalidateOnRefresh: true,
    },
  })

  // Hold word 1 at the start of the pin
  timeline.to({}, { duration: 0.5 })

  // Word 1 → Word 2 (each letter rolls up out + fades, next letters roll up in)
  timeline
    .to(w1Letters, {
      yPercent: -110,
      rotationX: -90,
      opacity: 0,
      duration: letterDuration,
      ease: 'power3.in',
      stagger: { each: letterStagger, from: 'end' },
    })
    .to(
      w2Letters,
      {
        yPercent: 0,
        rotationX: 0,
        duration: letterDuration,
        ease: 'power3.out',
        stagger: { each: letterStagger, from: 'end' },
      },
      `-=${letterDuration * 0.6}`
    )
    .to({}, { duration: 0.3 })

  // Word 2 → Word 3
  timeline
    .to(w2Letters, {
      yPercent: -110,
      rotationX: -90,
      opacity: 0,
      duration: letterDuration,
      ease: 'power3.in',
      stagger: { each: letterStagger, from: 'end' },
    })
    .to(
      w3Letters,
      {
        yPercent: 0,
        rotationX: 0,
        duration: letterDuration,
        ease: 'power3.out',
        stagger: { each: letterStagger, from: 'end' },
      },
      `-=${letterDuration * 0.6}`
    )
    .to({}, { duration: 0.3 })

  // Word 3 exit (so the last word fades up instead of vanishing on unpin)
  timeline.to(w3Letters, {
    yPercent: -110,
    rotationX: -90,
    opacity: 0,
    duration: letterDuration,
    ease: 'power3.in',
    stagger: { each: letterStagger, from: 'end' },
  })

  requestAnimationFrame(() => ScrollTrigger.refresh(true))
}

onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  await nextTick()
  requestAnimationFrame(() => {
    buildTimeline()
    window.addEventListener('resize', handleResize, { passive: true })
  })
})

// Rebuild when CMS-provided text arrives (letter count changes)
watch([word1Text, word2Text, word3Text], async () => {
  await nextTick()
  requestAnimationFrame(() => buildTimeline())
})

onUnmounted(() => {
  // Clear pending timers
  if (resizeTimeout) clearTimeout(resizeTimeout)
  window.removeEventListener('resize', handleResize)

  if (timeline) {
    timeline.kill()
    timeline = null
  }

  // #6: Clear inline styles from GSAP
  for (const w of [word1Ref.value, word2Ref.value, word3Ref.value]) {
    if (!w) continue
    gsap.set(w, { clearProps: 'all' })
    gsap.set(w.querySelectorAll('.text-animation__letter'), { clearProps: 'all' })
  }
})
</script>

<style scoped lang="scss">
@mixin dot-pattern-bg {
  --d: 1px;
  background: #03120F radial-gradient(
    circle at var(--d) var(--d),
    rgba(250, 250, 250, 0.2) calc(var(--d) - 1px),
    #0000 var(--d)
  ) 0 0 / 10px 10px;
}

.text-animation {
  position: relative;
  width: 100%;
  height: 300vh;
  // #1: Removed overflow: hidden — it clips the ScrollTrigger pin-spacer
  z-index: 30;
  @include dot-pattern-bg;

  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100svh;
    width: 100%;
    padding: 2.5rem;
    @include dot-pattern-bg;
    @include tablet { padding: 1.5rem; }
  }

  &__word {
    color: #FAFAFA;
    text-align: center;
    white-space: nowrap;
    margin: 0;
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1.4; // gives diacritics (ž, š, č) and descenders room inside the letter mask
    perspective: 800px; // enables 3D rotation depth on letter rotateX

    &--primary { z-index: 3; }
    &--secondary { z-index: 2; }
    &--tertiary { z-index: 1; }

    @include tablet { letter-spacing: -0.04em; }
  }

  &__letter-wrap {
    display: inline-block;
    overflow: hidden;
    line-height: inherit;
    vertical-align: top;
    // Extend clip area on all sides so diacritics, descenders, and glyph
    // overhangs aren't cut. Negative margin cancels the layout impact so the
    // word's bounding box stays the same.
    padding: 0.3em 0.1em;
    margin: -0.3em -0.1em;
  }

  &__letter {
    display: inline-block;
    will-change: transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
}

// #4: Accessibility — reduced motion
@media (prefers-reduced-motion: reduce) {
  .text-animation__word {
    transition: none;
  }
}
</style>

<style>
/* #10: Pin spacer background for GSAP — scoped to this section via :has() */
.pin-spacer:has(.text-animation__container) {
  --d: 1px;
  background: #03120F radial-gradient(
    circle at var(--d) var(--d),
    rgba(250, 250, 250, 0.2) calc(var(--d) - 1px),
    #0000 var(--d)
  ) 0 0 / 10px 10px !important;
}
</style>
