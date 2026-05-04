<template>
  <div class="lab-detail">
    <!-- Hero (same pattern as /lokacije/[slug]) -->
    <section class="lab-detail__hero" ref="heroRef">
      <div class="lab-detail__hero-image-wrapper" ref="imageWrapperRef">
        <picture v-if="displayImage" class="lab-detail__hero-picture">
          <source media="(min-width: 1024px)" :srcset="heroImageOriginal">
          <source media="(min-width: 768px)" :srcset="heroImageLarge">
          <img :src="heroImageMedium" :alt="displayTitle" class="lab-detail__hero-image">
        </picture>
      </div>

      <div class="lab-detail__hero-info" ref="heroInfoRef">
        <h1 :class="['lab-detail__title', typoClass('heroTitle')]" ref="titleRef">{{ displayTitle }}</h1>
        <div class="lab-detail__specs" ref="specsRef" v-if="subtitle">
          <div class="lab-detail__spec">
            <span :class="['lab-detail__spec-value', typoClass('specValue')]">{{ subtitle }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="lab-detail__actions" ref="actionsRef">
        <button :class="['lab-detail__action', typoClass('actionButton')]" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M3 8l4-4M3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('lab.viewAll') }}
        </button>
      </div>
    </section>

    <!-- Intro -->
    <section v-if="body" class="lab-detail__intro">
      <div :class="['lab-detail__intro-label', typoClass('introLabel')]">
        <span class="lab-detail__bullet" aria-hidden="true"></span>
        <span>{{ $t('lab.aboutProject') }}</span>
      </div>
      <div :class="['lab-detail__intro-body', typoClass('introBody')]" v-html="body"></div>
    </section>

    <!-- Sections -->
    <section v-if="sections.length > 0" class="lab-detail__sections">
      <div v-for="(section, i) in sections" :key="i" class="lab-detail__section">
        <div :class="['lab-detail__section-label', typoClass('sectionLabel')]">
          <span class="lab-detail__bullet" aria-hidden="true"></span>
          <span>{{ section.label }}</span>
        </div>
        <div class="lab-detail__section-body">
          <h2 v-if="section.title" :class="['lab-detail__section-title', typoClass('sectionTitle')]">{{ section.title }}</h2>
          <div :class="['lab-detail__section-content', typoClass('sectionContent')]" v-html="section.content"></div>
          <picture v-if="section.imagePath" class="lab-detail__section-picture">
            <source media="(min-width: 1024px)" :srcset="sectionImageUrl(section.imagePath)">
            <source media="(min-width: 768px)" :srcset="sectionImageUrl(section.imagePath, 'large')">
            <img
              :src="sectionImageUrl(section.imagePath, 'medium')"
              :alt="section.label"
              class="lab-detail__section-image"
              loading="lazy"
            >
          </picture>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCardTransitionData, goBackWithTransition } from '~/composables/useCardTransition'
import type { LabProject } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

// Fetch project from API by slug
const { data: projectsData } = await useApi<LabProject[]>('/api/lab_projects', {
  query: { slug, status: 'published' }
})

const project = computed(() => projectsData.value?.[0] ?? null)

// API-sourced values — responsive image URLs
const heroImageOriginal = computed(() =>
  resolveMediaUrl(project.value?.image) || '/images/placeholder-lab.svg'
)
const heroImageLarge = computed(() =>
  resolveMediaUrl(project.value?.image, 'large') || heroImageOriginal.value
)
const heroImageMedium = computed(() =>
  resolveMediaUrl(project.value?.image, 'medium') || heroImageOriginal.value
)
const heroImage = computed(() => heroImageOriginal.value)
const title = computed(() => project.value?.title ?? formattedSlug)
const meta = computed(() => {
  const cats = project.value?.categories
  if (Array.isArray(cats) && cats.length > 0) {
    return (cats[0] as any).name || cats[0].slug
  }
  return ''
})
const subtitle = computed(() => project.value?.subtitle ?? '')
const body = computed(() => project.value?.body ?? '')
const sections = computed(() => project.value?.sections ?? [])

function sectionImageUrl(path: string, size?: 'small' | 'medium' | 'large'): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const config = useRuntimeConfig()
  const base = `${config.public.apiBase}/storage/media`
  if (size) {
    const lastSlash = path.lastIndexOf('/')
    if (lastSlash >= 0) {
      return `${base}/${path.slice(0, lastSlash)}/thumbnails/${size}/${path.slice(lastSlash + 1)}`
    }
    return `${base}/thumbnails/${size}/${path}`
  }
  return `${base}/${path}`
}

// Transition data for animation
const transitionImage = ref('')
const transitionTitle = ref('')
const transitionMeta = ref('')

const displayImage = computed(() => transitionImage.value || heroImage.value)
const displayTitle = computed(() => transitionTitle.value || title.value)
const displayMeta = computed(() => transitionMeta.value || meta.value)

// Hero refs for scroll animation
const heroRef = ref<HTMLElement | null>(null)
const imageWrapperRef = ref<HTMLElement | null>(null)
const heroInfoRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const specsRef = ref<HTMLElement | null>(null)
const actionsRef = ref<HTMLElement | null>(null)

let heroTimeline: gsap.core.Timeline | null = null

function setupScrollAnimation() {
  if (!heroRef.value || !imageWrapperRef.value) return

  const clipTargets = [titleRef.value, specsRef.value, actionsRef.value].filter(Boolean)
  gsap.set(clipTargets, { clipPath: 'inset(0 0 0 0)' })

  heroTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.value,
      start: 'top top',
      end: '+=100%',
      scrub: 1,
      pin: true,
      pinSpacing: true
    }
  })

  // Image expands to full viewport
  heroTimeline.to(imageWrapperRef.value, {
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
    marginLeft: 0,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)

  // Clip-path hide title
  if (titleRef.value) {
    heroTimeline.to(titleRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.05)
  }

  // Clip-path hide specs
  if (specsRef.value) {
    heroTimeline.to(specsRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.08)
  }

  // Clip-path hide actions
  if (actionsRef.value) {
    heroTimeline.to(actionsRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.11)
  }
}

function runEntranceAnimation() {
  const tl = gsap.timeline()

  if (titleRef.value) {
    gsap.set(titleRef.value, { opacity: 0, y: 20 })
    tl.to(titleRef.value, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0)
  }

  if (specsRef.value) {
    gsap.set(specsRef.value, { opacity: 0, y: 15 })
    tl.to(specsRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.1)
  }

  if (actionsRef.value) {
    gsap.set(actionsRef.value, { opacity: 0, y: 10 })
    tl.to(actionsRef.value, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.2)
  }
}

onMounted(async () => {
  const data = getCardTransitionData()
  if (data.image) transitionImage.value = data.image
  if (data.title) transitionTitle.value = data.title
  if (data.meta) transitionMeta.value = data.meta

  await nextTick()
  requestAnimationFrame(() => {
    runEntranceAnimation()
    setupScrollAnimation()
  })
})

onUnmounted(() => {
  if (heroTimeline) {
    heroTimeline.kill()
    heroTimeline = null
  }
  ScrollTrigger.getAll().forEach(st => {
    if (st.trigger === heroRef.value) st.kill()
  })
})

function goBack() {
  goBackWithTransition('/lab', slug, displayImage.value, imageWrapperRef.value)
}

useSeo('lab-projects', computed(() => project.value?.id), computed(() => `${title.value} - Go2Labs`))

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  heroTitle: 'hero-heading',
  specLabel: 'label-micro',
  specValue: 'body',
  actionButton: 'body-sm',
  introLabel: 'eyebrow',
  introBody: 'body-lg-static',
  sectionLabel: 'eyebrow',
  sectionTitle: 'section-title',
  sectionContent: 'body',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['lab-detail'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}
</script>

<style scoped lang="scss">
.lab-detail {
  min-height: 100dvh; // dvh accounts for mobile browser chrome (URL bar, toolbar)
  background-color: $color-background;
}

// ==========================================================================
// Hero — same pattern as /lokacije/[slug]
// ==========================================================================
.lab-detail__hero {
  height: 100dvh; // dvh so the actions row never slips under the mobile browser chrome
  display: flex;
  flex-direction: column;
  overflow: hidden; // clip info/actions when image expands past them
}

.lab-detail__hero-image-wrapper {
  width: calc(100vw - #{$spacing-2xl} * 2);
  margin-left: $spacing-2xl;
  height: 50vh;
  min-height: 280px;
  overflow: hidden;
  border-radius: 0 0 $radius-lg $radius-lg;
  will-change: width, height, border-radius;
  flex-shrink: 0; // prevent flex from compressing when GSAP animates to 100vh

  @include tablet {
    width: calc(100vw - #{$spacing-lg} * 2);
    margin-left: $spacing-lg;
  }

  @include mobile {
    width: 100vw;
    margin-left: 0;
    border-radius: 0;
  }
}

.lab-detail__hero-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.lab-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lab-detail__hero-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-2xl;
  padding: $spacing-2xl $spacing-2xl 0;
  flex: 1;
  align-content: start;

  @include tablet {
    grid-template-columns: 1fr;
    gap: $spacing-lg;
    padding: $spacing-lg $spacing-lg 0;
  }

  @include mobile {
    padding: $spacing-md $spacing-md 0;
  }
}

.lab-detail__title {
  margin: 0;
}

.lab-detail__specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-lg $spacing-xl;
  align-content: start;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.lab-detail__spec-label {
  display: block;
  color: $color-muted;
  margin-bottom: $spacing-xs;
}

.lab-detail__spec-value {
  display: block;
}

// Actions
.lab-detail__actions {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-lg $spacing-2xl;
  margin-top: auto;

  @include tablet {
    padding: $spacing-lg;
    flex-wrap: wrap;
  }

  @include mobile {
    // Add the iOS home-indicator inset to the bottom padding so the row sits
    // above the safe area on devices that report it.
    padding: $spacing-md $spacing-md calc(#{$spacing-md} + env(safe-area-inset-bottom)) $spacing-md;
  }
}

.lab-detail__action {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: none;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  font-family: inherit;
  color: $color-primary;
  cursor: pointer;
  transition: background $transition-base, border-color $transition-base;

  &:hover {
    background: $color-surface;
    border-color: $color-primary;
  }
}

// ==========================================================================
// Shared bullet
// ==========================================================================
.lab-detail__bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-primary;
  flex-shrink: 0;
  margin-top: 2px;
}

// ==========================================================================
// Intro
// ==========================================================================
.lab-detail__intro {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-2xl;
  padding: 8rem $spacing-2xl 6rem;

  @include desktop {
    padding: 6rem $spacing-lg 4rem;
  }

  @include tablet {
    padding: 4rem $spacing-lg 3rem;
    gap: $spacing-lg;
  }

  @include mobile {
    grid-template-columns: 1fr;
    padding: $spacing-2xl $spacing-md;
    gap: $spacing-md;
  }
}

.lab-detail__intro-label {
  grid-column: 1 / 4;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  color: $color-primary;
  padding-top: 0.5rem;

  @include tablet { grid-column: 1 / 5; }
  @include mobile { grid-column: 1; padding-top: 0; }
}

.lab-detail__intro-body {
  grid-column: 6 / 13;
  color: $color-primary;

  @include tablet { grid-column: 5 / 13; }
  @include mobile { grid-column: 1; }

  :deep(p) {
    margin: 0 0 $spacing-lg;
    &:last-child { margin-bottom: 0; }
  }
}

// ==========================================================================
// Sections
// ==========================================================================
.lab-detail__sections {
  padding: 0 $spacing-2xl 6rem;
  @include desktop { padding: 0 $spacing-lg 4rem; }
  @include tablet { padding: 0 $spacing-lg 3rem; }
  @include mobile { padding: 0 $spacing-md $spacing-2xl; }
}

.lab-detail__section {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: $spacing-2xl;
  padding: 4rem 0;

  @include tablet { gap: $spacing-lg; padding: 3rem 0; }
  @include mobile { grid-template-columns: 1fr; gap: $spacing-md; padding: $spacing-xl 0; }
}

.lab-detail__section-label {
  grid-column: 3 / 5;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  color: $color-primary;
  padding-top: 2px;

  @include tablet { grid-column: 1 / 5; }
  @include mobile { grid-column: 1; }
}

.lab-detail__section-body {
  grid-column: 6 / 11;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  min-width: 0;
  overflow-wrap: break-word;

  @include tablet { grid-column: 5 / 13; }
  @include mobile { grid-column: 1; }
}

.lab-detail__section-title {
  color: $color-primary;
  margin: 0;
}

.lab-detail__section-content {
  color: $color-muted;

  :deep(p) {
    margin: 0 0 $spacing-md;
    &:last-child { margin-bottom: 0; }
  }

  :deep(strong) {
    color: $color-primary;
    font-weight: 600;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 $spacing-md;
    padding-left: 1.5rem;
    &:last-child { margin-bottom: 0; }
  }

  :deep(ul) { list-style: disc; }
  :deep(ol) { list-style: decimal; }

  :deep(li) {
    margin-bottom: $spacing-xs;
    padding-left: 0.25rem;
    &::marker { color: $color-primary; }
    &:last-child { margin-bottom: 0; }
  }

  :deep(li > ul),
  :deep(li > ol) {
    margin-top: $spacing-xs;
    margin-bottom: 0;
  }
}

.lab-detail__section-picture {
  display: block;
  margin-top: $spacing-md;
}

.lab-detail__section-image {
  width: 100%;
  border-radius: $radius-lg;
  object-fit: cover;
}
</style>
