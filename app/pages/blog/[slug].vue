<template>
  <div class="blog-detail">
    <!-- Hero (same pattern as /lokacije/[slug]) -->
    <section class="blog-detail__hero" ref="heroRef">
      <div class="blog-detail__hero-image-wrapper" ref="imageWrapperRef">
        <picture v-if="displayImage" class="blog-detail__hero-picture">
          <source media="(min-width: 1024px)" :srcset="heroImageOriginal">
          <source media="(min-width: 768px)" :srcset="heroImageLarge">
          <img :src="heroImageMedium" :alt="displayTitle" class="blog-detail__hero-image">
        </picture>
      </div>

      <div class="blog-detail__hero-info" ref="heroInfoRef">
        <h1 class="blog-detail__title" ref="titleRef">{{ displayTitle }}</h1>
        <div class="blog-detail__specs" ref="specsRef">
          <div class="blog-detail__spec" v-if="displayMeta">
            <span class="blog-detail__spec-label">Category</span>
            <span class="blog-detail__spec-value">{{ displayMeta }}</span>
          </div>
          <div class="blog-detail__spec" v-if="author">
            <span class="blog-detail__spec-label">Author</span>
            <span class="blog-detail__spec-value">{{ author }}</span>
          </div>
          <div class="blog-detail__spec" v-if="date">
            <span class="blog-detail__spec-label">Date</span>
            <span class="blog-detail__spec-value">{{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="blog-detail__actions" ref="actionsRef">
        <button class="blog-detail__action" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M3 8l4-4M3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('blog.viewAll') }}
        </button>
      </div>
    </section>

    <!-- Content -->
    <article v-if="body" class="blog-detail__content">
      <div class="blog-detail__body" v-html="body"></div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCardTransitionData, goBackWithTransition } from '~/composables/useCardTransition'
import type { BlogPost } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

// Fetch post from API by slug
const { data: postsData } = await useApi<BlogPost[]>('/api/blog_posts', {
  query: { slug, status: 'published' }
})

const post = computed(() => postsData.value?.[0] ?? null)

// Responsive image URLs
const heroImageOriginal = computed(() =>
  resolveMediaUrl(post.value?.image) || '/images/placeholder-lab.svg'
)
const heroImageLarge = computed(() =>
  resolveMediaUrl(post.value?.image, 'large') || heroImageOriginal.value
)
const heroImageMedium = computed(() =>
  resolveMediaUrl(post.value?.image, 'medium') || heroImageOriginal.value
)
const heroImage = computed(() => heroImageOriginal.value)
const title = computed(() => post.value?.title ?? formattedSlug)
const meta = computed(() => {
  const cat = post.value?.category
  if (cat && typeof cat === 'object') return cat.name || cat.slug
  return ''
})
const author = computed(() => post.value?.author ?? '')
const date = computed(() => post.value?.date ?? '')
const formattedDate = computed(() => {
  if (!date.value) return ''
  return new Date(date.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})
const body = computed(() => post.value?.body ?? '')

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

  if (titleRef.value) {
    heroTimeline.to(titleRef.value, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      ease: 'power2.in'
    }, 0.05)
  }

  if (specsRef.value) {
    const specs = specsRef.value.querySelectorAll('.blog-detail__spec')
    heroTimeline.to(specs, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 0.4,
      stagger: 0.02,
      ease: 'power2.in'
    }, 0.08)
  }

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
    const specs = specsRef.value.querySelectorAll('.blog-detail__spec')
    gsap.set(specs, { opacity: 0, y: 15 })
    tl.to(specs, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }, 0.1)
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
  goBackWithTransition('/blog', slug, displayImage.value, imageWrapperRef.value)
}

useSeo('blog-posts', computed(() => post.value?.id), computed(() => `${title.value} - Blog`))
definePageMeta({ showFooter: false })
</script>

<style scoped lang="scss">
.blog-detail {
  min-height: 100vh;
  background-color: $color-background;
}

// ==========================================================================
// Hero — same pattern as /lokacije/[slug]
// ==========================================================================
.blog-detail__hero {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; // clip info/actions when image expands past them
}

.blog-detail__hero-image-wrapper {
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

.blog-detail__hero-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.blog-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-detail__hero-info {
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

.blog-detail__title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0;
}

.blog-detail__specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-lg $spacing-xl;
  align-content: start;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.blog-detail__spec-label {
  display: block;
  font-size: $font-size-sm;
  color: $color-muted;
  margin-bottom: $spacing-xs;
}

.blog-detail__spec-value {
  display: block;
  font-size: $font-size-base;
  font-weight: 500;
}

// Actions
.blog-detail__actions {
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
    padding: $spacing-md;
  }
}

.blog-detail__action {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: none;
  border: 1px solid $color-border;
  border-radius: $radius-full;
  font-size: $font-size-sm;
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
// Content
// ==========================================================================
.blog-detail__content {
  max-width: 700px;
  margin: 0 auto;
  padding: $spacing-2xl;

  @include tablet {
    padding: $spacing-lg;
  }
}

.blog-detail__body {
  line-height: 1.9;

  :deep(p) { margin-bottom: $spacing-lg; }
  :deep(h2) { margin: $spacing-2xl 0 $spacing-md; font-size: $font-size-xl; font-weight: 400; }
  :deep(img) { width: 100%; border-radius: $radius-lg; margin: $spacing-lg 0; }
}
</style>
