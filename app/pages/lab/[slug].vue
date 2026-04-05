<template>
  <div class="lab-detail">
    <!-- Hero Image -->
    <div class="lab-detail__hero">
      <img v-if="displayImage" :src="displayImage" :alt="displayTitle" class="lab-detail__hero-image">
      <div class="lab-detail__hero-overlay">
        <div class="lab-detail__hero-content">
          <span v-if="displayMeta" class="lab-detail__category">{{ displayMeta }}</span>
          <h1 class="lab-detail__title">{{ displayTitle }}</h1>
        </div>
      </div>
      <button class="lab-detail__back" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ $t('lab.viewAll') }}
      </button>
    </div>

    <!-- Content -->
    <section v-if="body" class="lab-detail__content">
      <div class="lab-detail__body" v-html="body"></div>
    </section>

    <!-- Sections -->
    <section v-if="sections.length > 0" class="lab-detail__sections">
      <div v-for="(section, i) in sections" :key="i" class="lab-detail__section">
        <div class="lab-detail__section-label">
          <span class="lab-detail__section-bullet"></span>
          {{ section.label }}
        </div>
        <div class="lab-detail__section-body">
          <div class="lab-detail__section-content" v-html="section.content"></div>
          <img v-if="section.imagePath" :src="resolveMediaUrl({ path: section.imagePath } as any)" :alt="section.label" class="lab-detail__section-image" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { getCardTransitionData, goBackWithTransition } from '~/composables/useCardTransition'
import type { LabProject } from '~/types/api'
import { resolveMediaUrl } from '~/utils/media'

const route = useRoute()
const slug = route.params.slug as string
const formattedSlug = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

// Fetch project from API by slug
const { data: projectsData } = await useApi<LabProject[]>('/api/lab_projects', {
  query: { slug, status: 'published' }
})

const project = computed(() => projectsData.value?.[0] ?? null)

// API-sourced values
const heroImage = computed(() =>
  resolveMediaUrl(project.value?.image, 'large') || `https://picsum.photos/seed/${slug}/800/600`
)
const title = computed(() => project.value?.title ?? formattedSlug)
const meta = computed(() => {
  const cats = project.value?.categories
  if (Array.isArray(cats) && cats.length > 0) {
    return (cats[0] as any).name || cats[0].slug
  }
  return ''
})
const body = computed(() => project.value?.body ?? '')
const sections = computed(() => (project.value as any)?.sections ?? [])

// Transition data for animation
const transitionImage = ref('')
const transitionTitle = ref('')
const transitionMeta = ref('')

onMounted(() => {
  const data = getCardTransitionData()
  if (data.image) transitionImage.value = data.image
  if (data.title) transitionTitle.value = data.title
  if (data.meta) transitionMeta.value = data.meta
})

const displayImage = computed(() => transitionImage.value || heroImage.value)
const displayTitle = computed(() => transitionTitle.value || title.value)
const displayMeta = computed(() => transitionMeta.value || meta.value)

function goBack() {
  goBackWithTransition('/lab', slug, displayImage.value)
}

useHead({ title: computed(() => `${title.value} - Go2Labs`) })
definePageMeta({ showFooter: false })
</script>

<style scoped lang="scss">
.lab-detail {
  min-height: 100vh;
  background-color: $color-background;
}

.lab-detail__hero {
  position: relative;
  height: 50vh;
  min-height: 320px;
  overflow: hidden;
  margin: 0 $spacing-2xl;
  border-radius: 0 0 $radius-lg $radius-lg;
  @include tablet { margin: 0 $spacing-lg; }
  @include mobile { margin: 0; border-radius: 0; }
}

.lab-detail__hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lab-detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  display: flex;
  align-items: flex-end;
}

.lab-detail__hero-content {
  padding: $spacing-xl $spacing-2xl;
  color: #ffffff;
  @include tablet { padding: $spacing-lg; }
}

.lab-detail__category {
  display: inline-block;
  font-size: $font-size-sm;
  opacity: 0.8;
  margin-bottom: $spacing-sm;
}

.lab-detail__title {
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 400;
  line-height: 1.1;
  margin: 0;
}

.lab-detail__back {
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

.lab-detail__content {
  max-width: 700px;
  margin: 0 auto;
  padding: $spacing-2xl;
  @include tablet { padding: $spacing-lg; }
}

.lab-detail__body {
  line-height: 1.9;
  p { margin-bottom: $spacing-lg; }
}

.lab-detail__sections {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 $spacing-2xl $spacing-2xl;
  @include tablet { padding: 0 $spacing-lg $spacing-lg; }
}

.lab-detail__section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: $spacing-2xl;
  padding: $spacing-2xl 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);

  @include tablet {
    grid-template-columns: 1fr;
    gap: $spacing-md;
  }
}

.lab-detail__section-label {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  font-size: $font-size-base;
  color: $color-muted;
  font-weight: 400;
  padding-top: 2px;
}

.lab-detail__section-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $color-muted;
  flex-shrink: 0;
  margin-top: 8px;
}

.lab-detail__section-body {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.lab-detail__section-content {
  font-size: $font-size-base;
  line-height: 1.8;
  color: $color-muted;

  :deep(p) {
    margin-bottom: $spacing-md;
    &:last-child { margin-bottom: 0; }
  }
}

.lab-detail__section-image {
  width: 100%;
  border-radius: $radius-md;
  object-fit: cover;
}
</style>
