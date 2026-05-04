/**
 * Load locale messages from the API at app startup so admins can edit
 * them via the CMS without redeploying. Falls back to whatever was
 * baked in by @nuxtjs/i18n if the API is unreachable.
 *
 * Runs on server (SSR populates messages) and client hydrates from the
 * Nuxt payload via useAsyncData — no double fetch.
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  const i18n = (nuxtApp as any).$i18n
  if (!i18n || typeof i18n.setLocaleMessage !== 'function') return

  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const localesRaw = unref(i18n.locales) as Array<string | { code: string }>
  const codes = localesRaw.map(l => typeof l === 'string' ? l : l.code).filter(Boolean)

  await Promise.all(codes.map(async (code) => {
    const { data, error } = await useAsyncData(
      `translations:${code}`,
      () => $fetch<Record<string, unknown>>(`/api/translations/messages/${code}`, { baseURL }),
      { default: () => null }
    )

    if (error.value) {
      console.warn(`[translations] ${code}: API fetch failed, using static fallback`, error.value)
      return
    }
    if (data.value && typeof data.value === 'object' && Object.keys(data.value).length > 0) {
      i18n.setLocaleMessage(code, data.value)
    }
  }))
})
