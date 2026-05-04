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
        <h1 :class="['blog-detail__title', typoClass('heroTitle')]" ref="titleRef">{{ displayTitle }}</h1>
        <div class="blog-detail__specs" ref="specsRef">
          <div class="blog-detail__spec" v-if="displayMeta">
            <span :class="['blog-detail__spec-label', typoClass('specLabel')]">{{ $t('blog.category') }}</span>
            <span :class="['blog-detail__spec-value', typoClass('specValue')]">{{ displayMeta }}</span>
          </div>
          <div class="blog-detail__spec" v-if="author">
            <span :class="['blog-detail__spec-label', typoClass('specLabel')]">{{ $t('blog.author') }}</span>
            <span :class="['blog-detail__spec-value', typoClass('specValue')]">{{ author }}</span>
          </div>
          <div class="blog-detail__spec" v-if="date">
            <span :class="['blog-detail__spec-label', typoClass('specLabel')]">{{ $t('blog.date') }}</span>
            <span :class="['blog-detail__spec-value', typoClass('specValue')]">{{ formattedDate }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="blog-detail__actions" ref="actionsRef">
        <button :class="['blog-detail__action', typoClass('actionButton')]" @click="goBack">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M3 8l4-4M3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('blog.viewAll') }}
        </button>
      </div>
    </section>

    <!-- Content -->
    <article v-if="body" class="blog-detail__content">
      <div class="blog-detail__row">
        <div class="blog-detail__body" v-html="body"></div>
      </div>

      <div class="blog-detail__row">
        <div :class="['blog-detail__share-label', typoClass('shareLabel')]">
          <span class="blog-detail__bullet" aria-hidden="true"></span>
          <span>{{ $t('blog.share') }}</span>
        </div>
        <div :class="['blog-detail__share-links', typoClass('shareLink')]">
          <a
            v-for="link in shareLinks"
            :key="link.label"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="blog-detail__share-link"
          >{{ link.label }}</a>
          <button type="button" class="blog-detail__share-link" @click="copyShareLink">
            {{ linkJustCopied ? $t('blog.linkCopied') : $t('blog.copyLink') }}
          </button>
        </div>
      </div>
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
const { locale, t } = useI18n()
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
  const localeTag = locale.value === 'hr' ? 'hr-HR' : 'en-GB'
  return new Date(date.value).toLocaleDateString(localeTag, { day: 'numeric', month: 'long', year: 'numeric' })
})
const body = computed(() => post.value?.body ?? '')

// Share
const linkJustCopied = ref(false)
const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return window.location.href
})
const shareLinks = computed(() => {
  const url = encodeURIComponent(shareUrl.value)
  const text = encodeURIComponent(title.value)
  return [
    { label: t('share.linkedin'), href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: t('share.facebook'), href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: t('share.x'), href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
  ]
})

async function copyShareLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    linkJustCopied.value = true
    setTimeout(() => { linkJustCopied.value = false }, 2000)
  } catch {
    /* ignore */
  }
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

const { blockMaps } = useTypography()

const DEFAULT_PRESETS = {
  heroTitle: 'hero-heading',
  specLabel: 'label-micro',
  specValue: 'body',
  actionButton: 'body-sm',
  shareLabel: 'eyebrow',
  shareLink: 'body-sm',
} as const

function typoClass(key: keyof typeof DEFAULT_PRESETS): string {
  const map = blockMaps.value['blog-detail'] || {}
  return `typo-${map[key] || DEFAULT_PRESETS[key]}`
}
</script>

<style scoped lang="scss">
.blog-detail {
  min-height: 100dvh; // dvh accounts for mobile browser chrome (URL bar, toolbar)
  background-color: $color-background;
}

// ==========================================================================
// Hero — same pattern as /lokacije/[slug]
// ==========================================================================
.blog-detail__hero {
  height: 100dvh; // dvh so the actions row never slips under the mobile browser chrome
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
  color: $color-muted;
  margin-bottom: $spacing-xs;
}

.blog-detail__spec-value {
  display: block;
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
    // Add the iOS home-indicator inset to the bottom padding so the row sits
    // above the safe area on devices that report it.
    padding: $spacing-md $spacing-md calc(#{$spacing-md} + env(safe-area-inset-bottom)) $spacing-md;
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
// Content — same layout as .lab-detail__sections / .lab-detail__section
// ==========================================================================
.blog-detail__content {
  padding: 0 $spacing-2xl 6rem;
  @include desktop { padding: 0 $spacing-lg 4rem; }
  @include tablet { padding: 0 $spacing-lg 3rem; }
  @include mobile { padding: 0 $spacing-md $spacing-2xl; }
}

.blog-detail__row {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: $spacing-2xl;
  padding: 4rem 0;

  @include tablet { gap: $spacing-lg; padding: 3rem 0; }
  @include mobile { grid-template-columns: 1fr; gap: $spacing-md; padding: $spacing-xl 0; }
}

.blog-detail__bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-primary;
  flex-shrink: 0;
  margin-top: 6px;
}

.blog-detail__body {
  grid-column: 6 / 11;
  color: $color-muted;
  min-width: 0;
  overflow-wrap: break-word;

  @include tablet { grid-column: 5 / 13; }
  @include mobile { grid-column: 1; }

  :deep(p) {
    margin: 0 0 $spacing-md;
    &:last-child { margin-bottom: 0; }
  }
  :deep(h2) {
    color: $color-primary;
    margin: $spacing-2xl 0 $spacing-md;
    font-size: $font-size-xl;
    font-weight: 400;
  }
  :deep(strong) { color: $color-primary; font-weight: 600; }
  :deep(img) { width: 100%; border-radius: $radius-lg; margin: $spacing-lg 0; }

  :deep(ul), :deep(ol) {
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
}

// Share row
.blog-detail__share-label {
  grid-column: 3 / 5;
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  color: $color-primary;
  padding-top: 2px;

  @include tablet { grid-column: 1 / 5; }
  @include mobile { grid-column: 1; }
}

.blog-detail__share-links {
  grid-column: 6 / 11;
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-lg;

  @include tablet { grid-column: 5 / 13; }
  @include mobile { grid-column: 1; gap: $spacing-md; }
}

.blog-detail__share-link {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  color: $color-primary;
  text-decoration: none;
  cursor: pointer;
  transition: opacity $transition-base;

  &:hover { opacity: 0.6; }
}
</style>
