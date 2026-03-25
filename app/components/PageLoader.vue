<template>
  <div
    v-if="!hidden"
    class="page-loader"
    :class="{ 'page-loader--hidden': fading }"
    ref="loaderEl"
  >
    <div class="page-loader__counter">
      <div class="page-loader__counter-inner" ref="counterInnerEl">
        <div class="page-loader__percentage" ref="percentageEl">0%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const props = withDefaults(defineProps<{
  duration?: number
  ease?: string
  minLoadTime?: number
}>(), {
  duration: 2.5,
  ease: 'power2.out',
  minLoadTime: 1000
})

const emit = defineEmits<{
  complete: []
}>()

const loaderEl = ref<HTMLElement | null>(null)
const counterInnerEl = ref<HTMLElement | null>(null)
const percentageEl = ref<HTMLElement | null>(null)

const hidden = ref(false)
const fading = ref(false)

let currentProgress = 0
let assetsLoaded = false
let minimumTimeElapsed = false
let timeline: gsap.core.Timeline | null = null

onMounted(() => {
  // Reveal the page now that our loader is covering it
  document.documentElement.style.visibility = ''
  document.documentElement.style.background = ''
  document.body.classList.add('loading')

  // Minimum load time
  setTimeout(() => {
    minimumTimeElapsed = true
    checkComplete()
  }, props.minLoadTime)

  // Simulate progress
  timeline = gsap.timeline({
    onComplete: () => {
      assetsLoaded = true
      checkComplete()
    }
  })

  const proxy = { value: 0 }
  timeline.to(proxy, {
    value: 100,
    duration: props.duration,
    ease: props.ease,
    onUpdate: () => {
      currentProgress = proxy.value
      updateProgress()
    }
  })
})

function updateProgress() {
  const rounded = Math.round(currentProgress)

  if (percentageEl.value) {
    percentageEl.value.textContent = rounded + '%'
  }

  if (counterInnerEl.value) {
    const maxOffset = 200
    const offset = (rounded / 100) * maxOffset
    gsap.set(counterInnerEl.value, { y: -offset })
  }
}

function checkComplete() {
  if (assetsLoaded && minimumTimeElapsed) {
    hideLoader()
  }
}

function hideLoader() {
  // Ensure we hit 100%
  currentProgress = 100
  updateProgress()

  setTimeout(() => {
    if (!loaderEl.value) return

    gsap.to(loaderEl.value, {
      opacity: 0,
      duration: 0.5,
      ease: 'power4.inOut',
      onComplete: () => {
        fading.value = true
        document.body.classList.remove('loading')
        hidden.value = true
        emit('complete')
      }
    })
  }, 200)
}

onUnmounted(() => {
  if (timeline) {
    timeline.kill()
  }
  document.body.classList.remove('loading')
})
</script>

<style lang="scss">
.page-loader {
  @include fixed-fill;
  background: $color-background;
  z-index: $z-loader;
  pointer-events: all;
  overflow: hidden;

  &--hidden {
    pointer-events: none;
  }

  &__counter {
    position: absolute;
    left: $spacing-xl;
    bottom: $spacing-xl;

    @include tablet {
      left: $spacing-md;
      bottom: $spacing-lg;
    }
  }

  &__counter-inner {
    display: flex;
    flex-direction: column;
  }

  &__percentage {
    font-size: 5.375rem;
    font-weight: 400;
    font-family: $font-family;
    color: $color-primary;
    letter-spacing: -0.16rem;
    line-height: 1;
    user-select: none;
    white-space: nowrap;
    height: 5.375rem;
    display: flex;
    align-items: center;

    @include tablet {
      font-size: 3.5rem;
      height: 3.5rem;
      letter-spacing: -0.1rem;
    }
  }
}

body.loading {
  overflow: hidden;
}
</style>
