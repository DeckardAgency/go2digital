<template>
  <component :is="tag" :class="`typo-${preset}`">
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    preset: string
    tag?: string
  }>(),
  { tag: 'span' },
)

if (import.meta.dev) {
  const { presets, loaded } = useTypography()
  watchEffect(() => {
    if (loaded.value && !(props.preset in presets.value)) {
      console.warn(`[TypoText] unknown preset "${props.preset}"`)
    }
  })
}
</script>
