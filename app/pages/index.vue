<template>
  <div class="page page--home">
    <template v-if="orderLoaded">
      <component
        v-for="section in orderedSections"
        :key="section.id"
        :is="section.component"
      />
    </template>
    <FeatureSection
      v-for="(feature, i) in features"
      :key="'feature-' + i"
      :icon="feature.icon"
      :title="feature.title"
      :description="feature.description"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { t, tm, rt } = useI18n()

// Section component map
const sectionComponents: Record<string, any> = {
  'hero': resolveComponent('HeroSection'),
  'horizontal-scroll': resolveComponent('HorizontalScrollSection'),
  'why-section': resolveComponent('WhySection'),
  'custom-image': resolveComponent('CustomImageSection'),
  'custom-solution': resolveComponent('CustomSolutionsSection'),
  'featured-labs': resolveComponent('FeaturedLabsSection'),
  'human-focused': resolveComponent('HumanFocusedSection'),
  'text-animation': resolveComponent('TextAnimationSection'),
  'billboard': resolveComponent('BillboardSection'),
  'analytics': resolveComponent('AnalyticsSection'),
  'tracking': resolveComponent('TrackingSection'),
  'rentals-image': resolveComponent('RentalsImageSection'),
  'products': resolveComponent('CubeSection'),
  'interactive-display': resolveComponent('InteractiveDisplaySection'),
  'interactive-description': resolveComponent('InteractiveDescriptionSection'),
}

const defaultOrder = [
  'hero', 'horizontal-scroll', 'why-section', 'custom-image',
  'custom-solution', 'featured-labs', 'human-focused', 'text-animation',
  'billboard', 'analytics', 'tracking', 'rentals-image',
  'products', 'interactive-display', 'interactive-description',
]

// Fetch section order from settings
const config = useRuntimeConfig()
const sectionOrder = ref<string[]>([])
const orderLoaded = ref(false)

async function loadSectionOrder() {
  try {
    const res = await $fetch<any>('/api/settings', {
      baseURL: config.public.apiBase as string,
      params: { key: 'homepage.sectionOrder' },
      headers: { Accept: 'application/json' },
    })
    const settings = Array.isArray(res) ? res : res?.['hydra:member'] ?? []
    const s = settings.find((s: any) => s.key === 'homepage.sectionOrder')
    const order = s?.value?.value
    if (Array.isArray(order) && order.length > 0) {
      const missing = defaultOrder.filter(id => !order.includes(id))
      sectionOrder.value = [...order, ...missing]
    } else {
      sectionOrder.value = [...defaultOrder]
    }
  } catch {
    sectionOrder.value = [...defaultOrder]
  }
  orderLoaded.value = true
}

// Load on client
onMounted(() => loadSectionOrder())
// Also try SSR
loadSectionOrder()

const orderedSections = computed(() =>
  sectionOrder.value
    .filter(id => sectionComponents[id])
    .map(id => ({ id, component: sectionComponents[id] }))
)

const featureIcons = ['Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ']

const features = computed(() => {
  const raw = (tm as any)('homepage.interactiveDisplay.features')
  if (Array.isArray(raw)) {
    return raw.map((f: any, i: number) => ({
      icon: featureIcons[i] || `${i + 1}`,
      title: rt(f.title),
      description: rt(f.description)
    }))
  }
  return []
})

useHead({
  title: 'Homepage - Go2Digital'
})
</script>

<style scoped lang="scss">
// NOTE: Do NOT use `contain: layout` here - it breaks ScrollTrigger pinning in HeroSection
.page--home {
  min-height: 100vh;
}
</style>
