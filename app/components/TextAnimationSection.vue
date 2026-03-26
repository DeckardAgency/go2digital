<template>
  <section class="text-animation" ref="sectionRef">
    <div class="text-animation__container" ref="containerRef">
      <p class="text-animation__word text-animation__word--primary" ref="word1Ref">{{ $t('homepage.textAnimation.word1') }}</p>
      <p class="text-animation__word text-animation__word--secondary" ref="word2Ref">{{ $t('homepage.textAnimation.word2') }}</p>
      <p class="text-animation__word text-animation__word--tertiary" ref="word3Ref">{{ $t('homepage.textAnimation.word3') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const word1Ref = ref<HTMLElement | null>(null)
const word2Ref = ref<HTMLElement | null>(null)
const word3Ref = ref<HTMLElement | null>(null)

let timeline: gsap.core.Timeline | null = null

onMounted(() => {
  if (!containerRef.value || !word1Ref.value || !word2Ref.value || !word3Ref.value) return

  const words = [word1Ref.value, word2Ref.value, word3Ref.value]

  // Initial state: only first word visible
  gsap.set(words[0], { opacity: 1, y: 0 })
  gsap.set(words[1], { opacity: 0, y: '5vh' })
  gsap.set(words[2], { opacity: 0, y: '5vh' })

  timeline = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top top',
      end: '+=300%',
      scrub: 1,
      pin: containerRef.value,
      pinSpacing: false
    }
  })

  // Word 1 → Word 2
  timeline
    .to(words[0], { opacity: 0, y: '-5vh', duration: 0.3, ease: 'power2.in' })
    .fromTo(words[1], { opacity: 0, y: '5vh' }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    .to({}, { duration: 0.2 }) // hold

  // Word 2 → Word 3
  timeline
    .to(words[1], { opacity: 0, y: '-5vh', duration: 0.3, ease: 'power2.in' })
    .fromTo(words[2], { opacity: 0, y: '5vh' }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
    .to({}, { duration: 0.2 }) // hold
})

onUnmounted(() => {
  if (timeline) {
    timeline.kill()
    timeline = null
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
  overflow: hidden;
  z-index: 30;
  @include dot-pattern-bg;

  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    width: 100%;
    padding: 2.5rem;
    @include dot-pattern-bg;
    @include tablet { padding: 1.5rem; }
  }

  &__word {
    font-family: $font-family;
    font-size: clamp(4.5rem, 17.5vw, 17.5rem);
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.06em;
    color: #FAFAFA;
    text-align: center;
    white-space: nowrap;
    margin: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    will-change: opacity, transform;

    &--primary { z-index: 3; }
    &--secondary { z-index: 2; }
    &--tertiary { z-index: 1; }

    @include desktop { font-size: clamp(4rem, 14vw, 12rem); }
    @include tablet { font-size: clamp(3.5rem, 12vw, 10rem); }
    @include mobile { font-size: clamp(3rem, 10vw, 7rem); letter-spacing: -0.04em; }
  }
}
</style>

<style>
/* Pin spacer background for GSAP */
.pin-spacer:has(.text-animation__container) {
  --d: 1px;
  background: #03120F radial-gradient(
    circle at var(--d) var(--d),
    rgba(250, 250, 250, 0.2) calc(var(--d) - 1px),
    #0000 var(--d)
  ) 0 0 / 10px 10px !important;
}
</style>
