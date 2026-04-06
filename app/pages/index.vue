<template>
  <div class="page page--home">
    <HeroSection />
    <HorizontalScrollSection />
    <WhySection />
    <CustomImageSection />
    <CustomSolutionsSection />
    <FeaturedLabsSection />
    <HumanFocusedSection />
    <TextAnimationSection />
    <BillboardSection />
    <AnalyticsSection />
    <TrackingSection />
    <RentalsImageSection />
    <CubeSection />
    <InteractiveDisplaySection />
    <InteractiveDescriptionSection />
    <FeatureSection
      v-for="(feature, i) in features"
      :key="i"
      :icon="feature.icon"
      :title="feature.title"
      :description="feature.description"
    />
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()

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
