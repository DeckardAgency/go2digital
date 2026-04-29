export default defineNuxtPlugin(async () => {
  const typography = useTypography()
  await typography.load()
  typography.injectCss()
})
