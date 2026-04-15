<template>
  <div class="page page--home">
    <template v-if="orderLoaded">
      <component
        v-for="section in orderedSections"
        :key="section.id"
        :is="section.component"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { t } = useI18n()

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
  'possibilities': resolveComponent('PossibilitiesSection'),
}

const defaultOrder = [
  'hero', 'horizontal-scroll', 'why-section', 'custom-image',
  'custom-solution', 'featured-labs', 'human-focused', 'text-animation',
  'billboard', 'analytics', 'tracking', 'rentals-image', 'possibilities',
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

// Load section order on client only (API may not be reachable during SSR on Vercel)
onMounted(() => loadSectionOrder())

const orderedSections = computed(() =>
  sectionOrder.value
    .filter(id => sectionComponents[id])
    .map(id => ({ id, component: sectionComponents[id] }))
)


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
