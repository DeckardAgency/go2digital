<template>
  <div class="blog">
    <!-- Header Section -->
    <header class="blog__header">
      <div class="blog__title-wrap">
        <h1
          class="blog__title"
          data-split-text
          data-split-type="chars"
          data-split-duration="0.6"
          data-split-stagger="0.03"
          data-split-delay="0.3"
        >{{ $t('blog.title') }}</h1>
        <span class="blog__count">({{ filteredArticles.length }})</span>
      </div>

      <!-- Category Filters -->
      <nav class="blog__filters" aria-label="Category filters">
        <button
          v-for="category in categories"
          :key="category.slug"
          class="blog__filter"
          :class="{ 'blog__filter--active': selectedCategory === category.slug }"
          @click="filterByCategory(category.slug)"
        >
          <span v-if="selectedCategory === category.slug" class="blog__filter-dot"></span>
          <span class="blog__filter-text">{{ category.title }}</span>
        </button>
      </nav>
    </header>

    <!-- Articles Grid -->
    <div class="blog__content">
      <!-- Row patterns based on original design -->
      <template v-for="(row, rowIndex) in layoutRows" :key="rowIndex">
        <!-- Split row: small + large -->
        <div v-if="row.type === 'split'" class="blog__row blog__row--split">
          <article
            v-for="article in row.small"
            :key="article.id"
            class="article-card article-card--small"
            @mouseenter="onCardHover"
            @mouseleave="onCardLeave"
          >
            <NuxtLink :to="`/blog/${article.slug}`" class="article-card__link">
              <div class="article-card__image-wrap">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="article-card__image"
                  loading="lazy"
                >
              </div>
              <div class="article-card__content">
                <div class="article-card__info">
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <div class="article-card__meta">
                    <time class="article-card__date" :datetime="article.date">{{ formatDate(article.date) }}</time>
                    <span class="article-card__divider"></span>
                    <span class="article-card__author">{{ article.author }}</span>
                  </div>
                </div>
                <div v-if="article.category" class="article-card__category">
                  <span class="article-card__category-text">{{ article.category }}</span>
                </div>
              </div>
            </NuxtLink>
          </article>
          <article
            v-for="article in row.large"
            :key="article.id"
            class="article-card article-card--large"
            @mouseenter="onCardHover"
            @mouseleave="onCardLeave"
          >
            <NuxtLink :to="`/blog/${article.slug}`" class="article-card__link">
              <div class="article-card__image-wrap">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="article-card__image"
                  loading="lazy"
                >
              </div>
              <div class="article-card__content">
                <div class="article-card__info">
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <div class="article-card__meta">
                    <time class="article-card__date" :datetime="article.date">{{ formatDate(article.date) }}</time>
                    <span class="article-card__divider"></span>
                    <span class="article-card__author">{{ article.author }}</span>
                  </div>
                </div>
                <div v-if="article.category" class="article-card__category">
                  <span class="article-card__category-text">{{ article.category }}</span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Three columns row -->
        <div v-else-if="row.type === 'three-columns'" class="blog__row blog__row--three-columns">
          <article
            v-for="article in row.posts"
            :key="article.id"
            class="article-card article-card--small"
            @mouseenter="onCardHover"
            @mouseleave="onCardLeave"
          >
            <NuxtLink :to="`/blog/${article.slug}`" class="article-card__link">
              <div class="article-card__image-wrap">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="article-card__image"
                  loading="lazy"
                >
              </div>
              <div class="article-card__content">
                <div class="article-card__info">
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <div class="article-card__meta">
                    <time class="article-card__date" :datetime="article.date">{{ formatDate(article.date) }}</time>
                    <span class="article-card__divider"></span>
                    <span class="article-card__author">{{ article.author }}</span>
                  </div>
                </div>
                <div v-if="article.category" class="article-card__category">
                  <span class="article-card__category-text">{{ article.category }}</span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Full width row -->
        <div v-else-if="row.type === 'full'" class="blog__row blog__row--full">
          <article
            v-for="article in row.posts"
            :key="article.id"
            class="article-card article-card--full"
            @mouseenter="onCardHover"
            @mouseleave="onCardLeave"
          >
            <NuxtLink :to="`/blog/${article.slug}`" class="article-card__link">
              <div class="article-card__image-wrap">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="article-card__image"
                  loading="lazy"
                >
              </div>
              <div class="article-card__content">
                <div class="article-card__info">
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <div class="article-card__meta">
                    <time class="article-card__date" :datetime="article.date">{{ formatDate(article.date) }}</time>
                    <span class="article-card__divider"></span>
                    <span class="article-card__author">{{ article.author }}</span>
                  </div>
                </div>
                <div v-if="article.category" class="article-card__category">
                  <span class="article-card__category-text">{{ article.category }}</span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Two columns row -->
        <div v-else-if="row.type === 'two-columns'" class="blog__row blog__row--two-columns">
          <article
            v-for="article in row.posts"
            :key="article.id"
            class="article-card article-card--medium"
            @mouseenter="onCardHover"
            @mouseleave="onCardLeave"
          >
            <NuxtLink :to="`/blog/${article.slug}`" class="article-card__link">
              <div class="article-card__image-wrap">
                <img
                  :src="article.image"
                  :alt="article.title"
                  class="article-card__image"
                  loading="lazy"
                >
              </div>
              <div class="article-card__content">
                <div class="article-card__info">
                  <h3 class="article-card__title">{{ article.title }}</h3>
                  <div class="article-card__meta">
                    <time class="article-card__date" :datetime="article.date">{{ formatDate(article.date) }}</time>
                    <span class="article-card__divider"></span>
                    <span class="article-card__author">{{ article.author }}</span>
                  </div>
                </div>
                <div v-if="article.category" class="article-card__category">
                  <span class="article-card__category-text">{{ article.category }}</span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
      </template>

      <!-- Empty State -->
      <div v-if="filteredArticles.length === 0" class="blog__empty">
        <h2 class="blog__empty-title">{{ $t('blog.noResultsTitle') }}</h2>
        <p class="blog__empty-text">{{ $t('blog.noResultsText') }}</p>
        <button class="blog__empty-link" @click="filterByCategory('')">
          {{ $t('blog.viewAll') }}
        </button>
      </div>
    </div>

    <!-- Custom Cursor (teleported to body) -->
    <Teleport to="body">
      <div ref="blogCursor" class="blog-cursor">
        <span class="blog-cursor__text">{{ $t('blog.readMore') }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { gsap } from 'gsap'

useHead({
  title: 'Blog - Go2Digital'
})

// Custom cursor ref
const blogCursor = ref<HTMLElement | null>(null)

// Categories
const categories = [
  { slug: '', title: 'Sve' },
  { slug: 'marketing', title: 'Marketing' },
  { slug: 'design', title: 'Design' },
  { slug: 'technology', title: 'Technology' },
  { slug: 'news', title: 'News' }
]

// Selected category
const selectedCategory = ref('')

// Mockup articles data
const articles = ref([
  {
    id: 1,
    title: 'The Future of Digital Marketing in 2025',
    slug: 'future-digital-marketing-2025',
    image: 'https://picsum.photos/seed/blog1/800/700',
    date: '2025-01-10',
    author: 'Go2Digital',
    category: 'Marketing'
  },
  {
    id: 2,
    title: 'How AI is Transforming Creative Design',
    slug: 'ai-transforming-creative-design',
    image: 'https://picsum.photos/seed/blog2/800/700',
    date: '2025-01-08',
    author: 'Go2Digital',
    category: 'Design'
  },
  {
    id: 3,
    title: 'Building Sustainable Digital Campaigns',
    slug: 'sustainable-digital-campaigns',
    image: 'https://picsum.photos/seed/blog3/800/700',
    date: '2025-01-05',
    author: 'Go2Digital',
    category: 'Marketing'
  },
  {
    id: 4,
    title: 'The Rise of Interactive DOOH Advertising',
    slug: 'interactive-dooh-advertising',
    image: 'https://picsum.photos/seed/blog4/1400/700',
    date: '2025-01-03',
    author: 'Go2Digital',
    category: 'Technology'
  },
  {
    id: 5,
    title: 'Brand Identity Trends for the New Year',
    slug: 'brand-identity-trends',
    image: 'https://picsum.photos/seed/blog5/800/700',
    date: '2024-12-28',
    author: 'Go2Digital',
    category: 'Design'
  },
  {
    id: 6,
    title: 'Maximizing ROI with Programmatic Advertising',
    slug: 'maximizing-roi-programmatic',
    image: 'https://picsum.photos/seed/blog6/800/700',
    date: '2024-12-25',
    author: 'Go2Digital',
    category: 'Marketing'
  },
  {
    id: 7,
    title: 'Go2Digital Wins Excellence Award',
    slug: 'go2digital-excellence-award',
    image: 'https://picsum.photos/seed/blog7/800/700',
    date: '2024-12-20',
    author: 'Go2Digital',
    category: 'News'
  },
  {
    id: 8,
    title: 'UX Design Best Practices for 2025',
    slug: 'ux-design-best-practices',
    image: 'https://picsum.photos/seed/blog8/800/700',
    date: '2024-12-18',
    author: 'Go2Digital',
    category: 'Design'
  },
  {
    id: 9,
    title: 'The Power of Data-Driven Creativity',
    slug: 'data-driven-creativity',
    image: 'https://picsum.photos/seed/blog9/800/700',
    date: '2024-12-15',
    author: 'Go2Digital',
    category: 'Technology'
  },
  {
    id: 10,
    title: 'New Partnership Announcement',
    slug: 'new-partnership-announcement',
    image: 'https://picsum.photos/seed/blog10/800/700',
    date: '2024-12-12',
    author: 'Go2Digital',
    category: 'News'
  },
  {
    id: 11,
    title: 'Creating Memorable Brand Experiences',
    slug: 'memorable-brand-experiences',
    image: 'https://picsum.photos/seed/blog11/800/700',
    date: '2024-12-10',
    author: 'Go2Digital',
    category: 'Marketing'
  },
  {
    id: 12,
    title: 'Motion Design in Digital Advertising',
    slug: 'motion-design-advertising',
    image: 'https://picsum.photos/seed/blog12/800/700',
    date: '2024-12-08',
    author: 'Go2Digital',
    category: 'Design'
  },
  {
    id: 13,
    title: 'Smart City Integration for OOH Media',
    slug: 'smart-city-ooh-integration',
    image: 'https://picsum.photos/seed/blog13/800/700',
    date: '2024-12-05',
    author: 'Go2Digital',
    category: 'Technology'
  }
])

// Filtered articles based on selected category
const filteredArticles = computed(() => {
  if (!selectedCategory.value) {
    return articles.value
  }
  return articles.value.filter(article =>
    article.category.toLowerCase() === selectedCategory.value.toLowerCase()
  )
})

// Generate layout rows from filtered articles
const layoutRows = computed(() => {
  const rows: Array<{ type: string; small?: any[]; large?: any[]; posts?: any[] }> = []
  const items = [...filteredArticles.value]
  let index = 0

  // Pattern: split, three-columns, full, two-columns, repeat
  const patterns = ['split', 'three-columns', 'full', 'two-columns']
  let patternIndex = 0

  while (index < items.length) {
    const pattern = patterns[patternIndex % patterns.length]

    if (pattern === 'split' && index + 2 <= items.length) {
      rows.push({
        type: 'split',
        small: [items[index]],
        large: [items[index + 1]]
      })
      index += 2
    } else if (pattern === 'three-columns' && index + 3 <= items.length) {
      rows.push({
        type: 'three-columns',
        posts: items.slice(index, index + 3)
      })
      index += 3
    } else if (pattern === 'full' && index + 1 <= items.length) {
      rows.push({
        type: 'full',
        posts: [items[index]]
      })
      index += 1
    } else if (pattern === 'two-columns' && index + 2 <= items.length) {
      rows.push({
        type: 'two-columns',
        posts: items.slice(index, index + 2)
      })
      index += 2
    } else {
      // Not enough items for this pattern, use remaining as small cards
      rows.push({
        type: 'three-columns',
        posts: items.slice(index)
      })
      break
    }

    patternIndex++
  }

  return rows
})

// Filter by category
function filterByCategory(slug: string) {
  selectedCategory.value = slug
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

// Custom cursor state
const isCursorVisible = ref(false)

// Initialize cursor position tracking
onMounted(() => {
  nextTick(() => {
    const cursor = blogCursor.value
    if (cursor) {
      gsap.set(cursor, {
        opacity: 0,
        scale: 0.5,
        xPercent: -50,
        yPercent: -50
      })
    }
    document.addEventListener('mousemove', moveCursor)
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', moveCursor)
  isCursorVisible.value = false
  const cursor = blogCursor.value
  if (cursor) {
    gsap.killTweensOf(cursor)
  }
})

// Custom cursor handlers
function onCardHover(e: MouseEvent) {
  isCursorVisible.value = true
  const cursor = blogCursor.value
  if (!cursor) return

  gsap.set(cursor, {
    x: e.clientX,
    y: e.clientY,
    xPercent: -50,
    yPercent: -50
  })

  gsap.to(cursor, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: 'power2.out'
  })
}

function onCardLeave() {
  isCursorVisible.value = false
  const cursor = blogCursor.value
  if (!cursor) return

  gsap.to(cursor, {
    opacity: 0,
    scale: 0.5,
    duration: 0.3,
    ease: 'power2.out'
  })
}

function moveCursor(e: MouseEvent) {
  const cursor = blogCursor.value
  if (!cursor || !isCursorVisible.value) return

  gsap.to(cursor, {
    x: e.clientX,
    y: e.clientY,
    xPercent: -50,
    yPercent: -50,
    duration: 0.15,
    ease: 'power2.out'
  })
}
</script>

<style lang="scss" scoped>
// Variables and mixins are now globally available via nuxt.config.ts
// Page-specific spacing
$spacing-page: 2.5rem;
$spacing-page-mobile: 1rem;

// ==========================================================================
// Block: Blog
// ==========================================================================
.blog {
  background-color: $color-background;
  min-height: 100dvh;
  padding-bottom: 6rem;
  contain: layout style;

  @include mobile {
    margin-top: 6rem;
  }

  // ==========================================================================
  // Element: Header
  // ==========================================================================
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: $spacing-page;

    @include mobile {
      padding: 2rem $spacing-page-mobile;
    }
  }

  // ==========================================================================
  // Element: Title Wrap
  // ==========================================================================
  &__title-wrap {
    display: flex;
    align-items: baseline;
    gap: 0.625rem;
  }

  // ==========================================================================
  // Element: Title
  // ==========================================================================
  &__title {
    font-size: 5.375rem;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.03em;
    color: $color-primary;
    margin: 0;

    @include tablet {
      font-size: 3.5rem;
    }
  }

  // ==========================================================================
  // Element: Count
  // ==========================================================================
  &__count {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    margin-top: 0.5rem;
  }

  // ==========================================================================
  // Element: Filters
  // ==========================================================================
  &__filters {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  // ==========================================================================
  // Element: Filter Button
  // ==========================================================================
  &__filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border: 1px solid $color-border;
    border-radius: 999px;
    background: transparent;
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
    transition: border-color 0.3s ease;

    &:hover:not(.blog__filter--active) {
      border-color: $color-primary;
    }

    &--active .blog__filter-text {
      opacity: 1;
    }
  }

  &__filter-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: $color-accent;
  }

  &__filter-text {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    opacity: 0.4;
    text-transform: capitalize;
  }

  // ==========================================================================
  // Element: Content
  // ==========================================================================
  &__content {
    padding: 6.25rem $spacing-page;
    display: flex;
    flex-direction: column;
    row-gap: 7.5rem;

    @include mobile {
      padding: 2rem $spacing-page-mobile;
      row-gap: 2.5rem;
    }
  }

  // ==========================================================================
  // Element: Row
  // ==========================================================================
  &__row {
    display: grid;
    gap: 1.5rem;

    @include mobile {
      gap: 2.5rem;
    }

    &--split {
      grid-template-columns: 1fr;

      @media (min-width: $breakpoint-desktop) {
        grid-template-columns: 585fr 827fr;
      }
    }

    &--full {
      grid-template-columns: 1fr;
    }

    &--two-columns {
      grid-template-columns: 1fr;

      @media (min-width: $breakpoint-tablet) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    &--three-columns {
      grid-template-columns: 1fr;

      @media (min-width: $breakpoint-tablet) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: $breakpoint-desktop) {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }

  // ==========================================================================
  // Element: Empty State
  // ==========================================================================
  &__empty {
    text-align: center;
    padding: 4rem 1.5rem;
  }

  &__empty-title {
    font-size: 1.5rem;
    font-weight: 400;
    color: $color-primary;
    margin: 0 0 1rem;
  }

  &__empty-text {
    font-size: 1rem;
    color: $color-primary;
    opacity: 0.6;
    margin: 0 0 1.5rem;
  }

  &__empty-link {
    font-family: inherit;
    font-size: 1rem;
    color: $color-accent;
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: none;
    }
  }
}

// ==========================================================================
// Block: Article Card
// ==========================================================================
.article-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  // ==========================================================================
  // Modifiers: Size variants (aspect ratios)
  // ==========================================================================
  &--small .article-card__image-wrap {
    aspect-ratio: 585 / 560;
  }

  &--medium .article-card__image-wrap {
    aspect-ratio: 706 / 700;
  }

  &--large .article-card__image-wrap {
    aspect-ratio: 827 / 700;
  }

  &--full .article-card__image-wrap {
    aspect-ratio: 1432 / 700;
  }

  // ==========================================================================
  // Element: Link
  // ==========================================================================
  &__link {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    text-decoration: none;
    color: inherit;
    cursor: none;

    @include mobile {
      cursor: pointer;
    }

    &:hover .article-card__image {
      transform: scale(1.05);
    }
  }

  // ==========================================================================
  // Element: Image Wrap
  // ==========================================================================
  &__image-wrap {
    position: relative;
    border-radius: 1.5rem;
    overflow: hidden;
    background-color: darken($color-background, 5%);
  }

  // ==========================================================================
  // Element: Image
  // ==========================================================================
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  // ==========================================================================
  // Element: Content
  // ==========================================================================
  &__content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0 0.5rem;

    @include mobile {
      flex-direction: column;
      gap: 1rem;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 2.125rem;
    font-weight: 400;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: $color-primary;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @include tablet {
      font-size: 1.5rem;
    }
  }

  // ==========================================================================
  // Element: Meta
  // ==========================================================================
  &__meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__date,
  &__author {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    opacity: 0.4;
    text-transform: capitalize;
  }

  &__divider {
    width: 1px;
    height: 0.5625rem;
    background-color: $color-primary;
    opacity: 0.4;
  }

  // ==========================================================================
  // Element: Category
  // ==========================================================================
  &__category {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    border: 1px solid $color-border;
    border-radius: 999px;
  }

  &__category-text {
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.3;
    color: $color-primary;
    opacity: 0.4;
    text-transform: capitalize;
  }
}
</style>

<!-- Global styles for teleported cursor -->
<style lang="scss">
.blog-cursor {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  will-change: transform, opacity;

  @media (max-width: 576px) {
    display: none;
  }

  &__text {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    background-color: #FAFAFA;
    color: #03120F;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 999px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
