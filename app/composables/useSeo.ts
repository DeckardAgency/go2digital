/**
 * Fetch and apply SEO metadata from the API.
 *
 * Usage for entities (blog posts, lab projects, totems):
 *   useSeo('blog-posts', postId, fallbackTitle)
 *
 * Usage for singleton pages (blog list, lab list, esg, kontakt, tim):
 *   useSeo('singleton/blog-page', null, fallbackTitle)
 */
export function useSeo(
  entityType: string,
  entityId: Ref<string | null | undefined> | string | null,
  fallbackTitle: Ref<string> | string
) {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  const idValue = computed(() =>
    typeof entityId === 'string' ? entityId : entityId?.value ?? null
  )
  const titleValue = computed(() =>
    typeof fallbackTitle === 'string' ? fallbackTitle : fallbackTitle.value
  )

  const endpoint = computed(() => {
    if (entityType.startsWith('singleton/')) {
      return `/api/seo-public/${entityType}`
    }
    if (!idValue.value) return null
    return `/api/seo-public/${entityType}/${idValue.value}`
  })

  const { data: seoData } = useAsyncData(
    `seo-${entityType}-${idValue.value || 'page'}`,
    () => {
      if (!endpoint.value) return Promise.resolve(null)
      return $fetch<any>(endpoint.value, {
        baseURL: config.public.apiBase as string,
      }).catch(() => null)
    },
    { lazy: true, server: false, watch: [endpoint] }
  )

  const seo = computed(() => {
    const s = seoData.value
    if (!s?.translations) return null
    const t = s.translations[locale.value] || s.translations.hr || null
    return t ? { ...s, ...t } : s
  })

  useHead({
    title: () => seo.value?.title || titleValue.value,
    meta: () => {
      const s = seo.value
      const meta: any[] = []

      if (s?.description) meta.push({ name: 'description', content: s.description })
      if (s?.keywords) meta.push({ name: 'keywords', content: s.keywords })
      if (s?.robots) meta.push({ name: 'robots', content: s.robots })

      // Open Graph
      meta.push({ property: 'og:title', content: s?.ogTitle || s?.title || titleValue.value })
      if (s?.ogDescription) meta.push({ property: 'og:description', content: s.ogDescription })
      if (s?.ogType) meta.push({ property: 'og:type', content: s.ogType })
      if (s?.ogImageUrl) meta.push({ property: 'og:image', content: s.ogImageUrl })

      // Twitter
      if (s?.twitterCard) meta.push({ name: 'twitter:card', content: s.twitterCard })
      if (s?.twitterTitle) meta.push({ name: 'twitter:title', content: s.twitterTitle })
      if (s?.twitterDescription) meta.push({ name: 'twitter:description', content: s.twitterDescription })

      return meta
    },
    link: () => {
      if (seo.value?.canonicalUrl) {
        return [{ rel: 'canonical', href: seo.value.canonicalUrl }]
      }
      return []
    },
  })
}
