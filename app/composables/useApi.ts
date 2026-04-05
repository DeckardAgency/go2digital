/**
 * Composable for fetching data from the Go2Digital API.
 * Automatically sends Accept-Language header based on current i18n locale.
 * Re-fetches when locale changes.
 */
export function useApi<T>(
  endpoint: string | Ref<string> | (() => string),
  options: Record<string, any> = {}
) {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  const { watch: extraWatch, headers: extraHeaders, query: queryOption, lazy: lazyOption, server: serverOption, ...restOptions } = options

  // Build a unique key from the endpoint
  const key = computed(() => {
    const ep = typeof endpoint === 'function' ? endpoint() : unref(endpoint)
    const q = unref(queryOption)
    return `api:${ep}:${locale.value}:${q ? JSON.stringify(q) : ''}`
  })

  return useAsyncData<T>(
    key.value,
    () => $fetch<T>(typeof endpoint === 'function' ? endpoint() : unref(endpoint), {
      baseURL: config.public.apiBase as string,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': locale.value,
        ...(extraHeaders as Record<string, string> || {})
      },
      query: unref(queryOption),
      ...restOptions,
    }),
    {
      lazy: lazyOption ?? false,
      server: serverOption ?? true,
      watch: [locale, ...(Array.isArray(extraWatch) ? extraWatch : extraWatch ? [extraWatch] : []),
        ...(queryOption ? [isRef(queryOption) ? queryOption : ref(queryOption)] : [])],
    }
  )
}

/**
 * Imperative fetch for event handlers and non-SSR contexts.
 */
export function $api<T = any>(
  endpoint: string,
  options: Record<string, any> = {}
) {
  const config = useRuntimeConfig()
  const { locale } = useI18n()

  return $fetch<T>(endpoint, {
    baseURL: config.public.apiBase as string,
    headers: {
      'Accept': 'application/json',
      'Accept-Language': locale.value,
      ...(options.headers as Record<string, string> || {})
    },
    ...options
  })
}
