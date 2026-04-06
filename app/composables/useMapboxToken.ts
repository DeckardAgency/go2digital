const FALLBACK_TOKEN = 'MAPBOX_TOKEN_REMOVED'

let cachedToken: string | null = null

export async function useMapboxToken(): Promise<string> {
  if (cachedToken) return cachedToken

  try {
    const config = useRuntimeConfig()
    const res = await $fetch<any>('/api/settings', {
      baseURL: config.public.apiBase as string,
      params: { key: 'integrations.mapboxAccessToken' },
      headers: { Accept: 'application/json' },
    })
    const settings = Array.isArray(res) ? res : res?.['hydra:member'] ?? []
    const s = settings.find((s: any) => s.key === 'integrations.mapboxAccessToken')
    const token = s?.value?.value
    if (token) {
      cachedToken = token
      return token
    }
  } catch {
    // fallback
  }

  cachedToken = FALLBACK_TOKEN
  return FALLBACK_TOKEN
}
