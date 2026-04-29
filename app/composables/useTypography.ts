import { readonly } from 'vue'

export interface TypographyFontWeight {
  weight: number
  src: string
  format: string
}

export interface TypographyFont {
  slug: string
  name: string
  stack: string
  weights: TypographyFontWeight[]
}

export interface TypographyPreset {
  slug: string
  label: string
  fontSlug: string
  weight: number
  lineHeight: number | string
  letterSpacing: string | null
  sizes: {
    mobile: string
    tablet: string
    desktop: string
  }
}

export function useTypography() {
  const config = useRuntimeConfig()
  const nuxtApp = useNuxtApp()

  const fonts = useState<TypographyFont[]>('typography:fonts', () => [])
  const presets = useState<Record<string, TypographyPreset>>('typography:presets', () => ({}))
  const blockMaps = useState<Record<string, Record<string, string>>>('typography:blockMaps', () => ({}))
  const loaded = useState<boolean>('typography:loaded', () => false)

  function load(): Promise<void> {
    if (loaded.value) return Promise.resolve()
    const inFlight = (nuxtApp as Record<string, unknown>).__typographyLoadPromise as Promise<void> | undefined
    if (inFlight) return inFlight

    const promise = (async () => {
      try {
        const res = await $fetch<unknown>('/api/settings', {
          baseURL: config.public.apiBase as string,
          params: { group: 'typography' },
          headers: { Accept: 'application/json' },
        })

        const settings = Array.isArray(res)
          ? res
          : ((res as { 'hydra:member'?: unknown[] })?.['hydra:member'] ?? [])

        const nextFonts: TypographyFont[] = []
        const nextPresets: Record<string, TypographyPreset> = {}
        const nextBlockMaps: Record<string, Record<string, string>> = {}

        for (const s of settings as Array<{ key?: string; value?: unknown }>) {
          if (s.key === 'typography.fonts' && Array.isArray(s.value)) {
            nextFonts.push(...(s.value as TypographyFont[]))
            continue
          }
          if (typeof s.key === 'string' && s.key.startsWith('typography.presets.')) {
            const preset = s.value as TypographyPreset | undefined
            if (preset?.slug) nextPresets[preset.slug] = preset
            continue
          }
          if (typeof s.key === 'string' && s.key.startsWith('typography.blockMaps.')) {
            const blockId = s.key.slice('typography.blockMaps.'.length)
            if (s.value && typeof s.value === 'object') {
              nextBlockMaps[blockId] = s.value as Record<string, string>
            }
          }
        }

        fonts.value = nextFonts
        presets.value = nextPresets
        blockMaps.value = nextBlockMaps
      } catch (err) {
        if (import.meta.dev) console.warn('[typography] failed to load presets', err)
      } finally {
        loaded.value = true
      }
    })()

    ;(nuxtApp as Record<string, unknown>).__typographyLoadPromise = promise
    return promise
  }

  function buildCss(): string {
    const parts: string[] = []
    const fontBySlug = new Map(fonts.value.map(f => [f.slug, f]))

    for (const font of fonts.value) {
      for (const w of font.weights ?? []) {
        parts.push(
          `@font-face{font-family:'${font.name}';src:url('${w.src}') format('${w.format}');font-weight:${w.weight};font-display:swap}`,
        )
      }
    }

    const root: string[] = []
    const tablet: string[] = []
    const mobile: string[] = []

    for (const p of Object.values(presets.value)) {
      const stack = fontBySlug.get(p.fontSlug)?.stack ?? 'inherit'
      root.push(`--typo-${p.slug}-family:${stack}`)
      root.push(`--typo-${p.slug}-weight:${p.weight}`)
      root.push(`--typo-${p.slug}-line:${p.lineHeight}`)
      if (p.letterSpacing) root.push(`--typo-${p.slug}-spacing:${p.letterSpacing}`)
      root.push(`--typo-${p.slug}-size:${p.sizes.desktop}`)

      if (p.sizes.tablet !== p.sizes.desktop) {
        tablet.push(`--typo-${p.slug}-size:${p.sizes.tablet}`)
      }
      if (p.sizes.mobile !== p.sizes.tablet) {
        mobile.push(`--typo-${p.slug}-size:${p.sizes.mobile}`)
      }
    }

    if (root.length) parts.push(`:root{${root.join(';')}}`)
    if (tablet.length) parts.push(`@media(max-width:1023px){:root{${tablet.join(';')}}}`)
    if (mobile.length) parts.push(`@media(max-width:767px){:root{${mobile.join(';')}}}`)

    for (const p of Object.values(presets.value)) {
      const rules = [
        `font-family:var(--typo-${p.slug}-family)`,
        `font-weight:var(--typo-${p.slug}-weight)`,
        `font-size:var(--typo-${p.slug}-size)`,
        `line-height:var(--typo-${p.slug}-line)`,
      ]
      if (p.letterSpacing) rules.push(`letter-spacing:var(--typo-${p.slug}-spacing)`)
      parts.push(`.typo-${p.slug}{${rules.join(';')}}`)
    }

    return parts.join('\n')
  }

  function injectCss(): void {
    if (typeof document === 'undefined') return

    let el = document.getElementById('typo-vars') as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = 'typo-vars'
      document.head.appendChild(el)
    }
    el.textContent = buildCss()
  }

  return {
    fonts: readonly(fonts),
    presets: readonly(presets),
    blockMaps: readonly(blockMaps),
    loaded: readonly(loaded),
    load,
    buildCss,
    injectCss,
  }
}
