<template>
  <div class="blog-detail">
    <!-- Hero Image -->
    <div class="blog-detail__hero">
      <img v-if="heroImage" :src="heroImage" :alt="title" class="blog-detail__hero-image">
      <div class="blog-detail__hero-overlay">
        <div class="blog-detail__hero-content">
          <span v-if="meta" class="blog-detail__category">{{ meta }}</span>
          <h1 class="blog-detail__title">{{ title }}</h1>
        </div>
      </div>
      <button class="blog-detail__back" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Svi članci
      </button>
    </div>

    <!-- Content -->
    <article class="blog-detail__content">
      <div class="blog-detail__body">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <h2>Key Takeaways</h2>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { getCardTransitionData, goBackWithTransition } from '~/composables/useCardTransition'

const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

const heroImage = ref('')
const title = ref(formattedSlug)
const meta = ref('')

onMounted(() => {
  const data = getCardTransitionData()
  if (data.image) heroImage.value = data.image
  if (data.title) title.value = data.title
  if (data.meta) meta.value = data.meta
})

function goBack() {
  goBackWithTransition('/blog', slug, heroImage.value)
}

useHead({ title: `${formattedSlug} - Blog` })
definePageMeta({ showFooter: false })
</script>

<style scoped lang="scss">
.blog-detail {
  min-height: 100vh;
  background-color: $color-background;
}

.blog-detail__hero {
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 320px;
  overflow: hidden;
  margin: 0 $spacing-2xl;
  width: calc(100% - #{$spacing-2xl} * 2);
  border-radius: 0 0 $radius-lg $radius-lg;
  @include tablet { margin: 0 $spacing-lg; width: calc(100% - #{$spacing-lg} * 2); }
  @include mobile { margin: 0; width: 100%; border-radius: 0; }
}

.blog-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.blog-detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
}

.blog-detail__hero-content {
  padding: $spacing-xl $spacing-2xl;
  color: #ffffff;
  @include tablet { padding: $spacing-lg; }
}

.blog-detail__category {
  display: inline-block;
  font-size: $font-size-sm;
  opacity: 0.8;
  margin-bottom: $spacing-sm;
}

.blog-detail__title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.blog-detail__back {
  position: absolute;
  top: $spacing-lg;
  left: $spacing-lg;
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $color-primary;
  cursor: pointer;
  transition: background $transition-base;
  z-index: 1;
  &:hover { background: #ffffff; }
}

.blog-detail__content {
  max-width: 700px;
  margin: 0 auto;
  padding: $spacing-2xl;
  @include tablet { padding: $spacing-lg; }
}

.blog-detail__body {
  line-height: 1.9;
  p { margin-bottom: $spacing-lg; }
  h2 { margin: $spacing-2xl 0 $spacing-md; font-size: $font-size-xl; font-weight: 400; }
}
</style>
