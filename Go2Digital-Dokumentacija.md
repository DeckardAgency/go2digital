# go2digital — Tehnička dokumentacija

Javni web Go2Digital v3 (DOOH / digital billboard). Nuxt 4 / Vue 3. Sav sadržaj dohvaća s API-ja (`go2digital-api`); nema vlastite baze.

Pregled cijelog sustava i veze između aplikacija: [`../DOKUMENTACIJA.md`](../DOKUMENTACIJA.md).

## Sadržaj
- [Brzi pregled](#brzi-pregled)
- [Arhitektura](#arhitektura)
- [Postavljanje](#postavljanje)
- [Integracija s API-jem](#integracija-s-api-jem)
- [i18n](#i18n)
- [Postojeći vodiči](#postojeći-vodiči)

## Brzi pregled

| | |
|---|---|
| Framework | Nuxt 4.2, Vue 3.5 |
| Routing | file-based (`app/pages/`) |
| State | Nuxt `useState` (bez Pinia/Vuex) |
| Animacije | GSAP 3 (+ ScrollTrigger), Lenis (smooth scroll), SplitText |
| Karte | Mapbox GL 3 (stranica lokacija) |
| WebGL | OGL (hover/distorzija efekti) |
| Stilovi | SCSS (sass-embedded) |
| i18n | `@nuxtjs/i18n` 10 (HR default, EN) |
| Package manager | Yarn |

Dev server: `http://localhost:3000`.

---

# Arhitektura

## Pregled

Nuxt 4 aplikacija s file-based routingom. Sadržaj je vođen API-jem: homepage sekcije, blog, lab, lokacije, navigacija, tipografija i prijevodi dohvaćaju se s `go2digital-api`. Bez vlastite baze i bez state managementa — globalno stanje drži se kroz Nuxt `useState`.

## Struktura `app/`

```
app/
├── app.vue              # root: page transitions, loader, navigacija
├── assets/scss/         # _variables, _mixins, main.scss (auto-injektani u sve SCSS)
├── components/          # Vue SFC komponente (hero, sekcije, navigacija, dialozi…)
├── composables/         # reusable logika (vidi tablicu)
├── pages/               # file-based rute
├── plugins/             # client/init pluginovi (GSAP, Lenis, SplitText, prijevodi…)
├── types/               # TS tipovi (api.ts — odgovori API-ja)
└── utils/               # helperi (media.ts — razrješavanje URL-ova medija)
```

Nema `server/`, `middleware/` ni `layouts/` — root `app.vue` orkestrira loader, navigaciju i tranzicije.

## Rute (`app/pages/`)

| Ruta | Datoteka |
|---|---|
| `/` | `index.vue` (homepage, sekcije po redoslijedu iz API settings) |
| `/esg` | `esg.vue` |
| `/kontakt` | `kontakt.vue` (kontakt + live vrijeme/vremenska prognoza) |
| `/tim` | `tim.vue` |
| `/privacy-policy` | `privacy-policy.vue` |
| `/blog`, `/blog/:slug` | `blog/index.vue`, `blog/[slug].vue` |
| `/lab`, `/lab/:slug` | `lab/index.vue`, `lab/[slug].vue` |
| `/lokacije`, `/lokacije/:slug` | `lokacije/index.vue`, `lokacije/[slug].vue` (Mapbox) |

Engleske varijante dobivaju prefiks `/en` (strategija `prefix_except_default`).

## Composables (`app/composables/`)

| Composable | Uloga |
|---|---|
| `useApi` / `$api` | dohvat s API-ja (Accept-Language, re-fetch po jeziku) — vidi [Integracija s API-jem](#integracija-s-api-jem) |
| `useSeo` | dohvat i primjena SEO metapodataka |
| `useNavigation` | stanje menija (`isMenuOpen`, toggle) |
| `useAdminAuth` | provjera `g2d_token` cookieja i admin role |
| `useTypography` | učitavanje fontova i preseta s API-ja |
| `useSplitText` | text-split animacija (vidi [Postojeći vodiči](#postojeći-vodiči)) |
| `useContactHeader` | vrijeme, sat, datum, baterija |
| `useLenis` | smooth scroll wrapper |
| `useMapboxToken` | inicijalizacija Mapboxa |
| `useWebGLHover` | WebGL hover efekti (OGL) |
| `useCardTransition` / `useDistortionTransition` | tranzicije kartica / distorzija |

## Pluginovi (`app/plugins/`)

| Plugin | Uloga |
|---|---|
| `gsap.client.ts` | globalna registracija GSAP-a + ScrollTrigger |
| `lenis.client.ts` | inicijalizacija Lenis smooth scrolla (desktop) |
| `splitText.client.ts` | auto-init text-split animacija pri učitavanju |
| `typography.ts` | dohvat i injektiranje dinamičkog tipografskog CSS-a |
| `translations.ts` | dohvat poruka prijevoda pri startu (vidi [i18n](#i18n)) |

## Animacijski sustav

- **Page transitions** (`app.vue`): GSAP timeline — odlazna stranica se smanjuje/blurra i overlay klizi gore; dolazna se otkriva. Na mobilnom se blur izostavlja (iOS WebKit zaključava scroll).
- **Smooth scroll** (`lenis.client.ts`): samo desktop (mobilni koristi native momentum); sinkroniziran s GSAP tickerom; resetira ScrollTrigger pri navigaciji.
- **Split text** (`useSplitText.ts`): dijeljenje na linije/riječi/znakove preko data atributa; čuva originalni tekst u `aria-label` radi pristupačnosti. Detalji: [docs/split-text.md](./docs/split-text.md).

## Rendering i konfiguracija

- SSR uključen; `useApi` koristi `useAsyncData` (server-side + hidracija na klijentu).
- Kritični inline `<script>`/`<style>` u `nuxt.config.ts` sakrivaju sadržaj dok se loader ne montira i skrivaju scrollbar.
- SCSS `_variables` i `_mixins` automatski se injektiraju u sve SCSS datoteke (`vite.css.preprocessorOptions`).

---

# Postavljanje

## Preduvjeti

- Node.js (verzija kompatibilna s Nuxt 4)
- Yarn
- Pristup `go2digital-api` instanci (lokalno ili Cloudways)

## Instalacija

```bash
yarn install        # postinstall automatski pokreće `nuxt prepare`
```

## Konfiguracija okruženja

Runtime config je u `nuxt.config.ts` (`runtimeConfig.public.apiBase`), s defaultom na Cloudways API. Override preko `.env`:

```bash
# .env
NUXT_PUBLIC_API_BASE=https://127.0.0.1:8001   # lokalni API
# prod: https://api.go2digital.hr ili Cloudways URL
```

| Varijabla | Opis |
|---|---|
| `NUXT_PUBLIC_API_BASE` | bazni URL API-ja **bez** `/api` sufiksa (endpointi ga sadrže, npr. `/api/blog-posts`) |

> Mapbox token: inicijalizira se kroz `useMapboxToken` (provjeri composable za izvor tokena — env ili API).

## Skripte (`package.json`)

```bash
yarn dev         # razvojni server na http://localhost:3000
yarn build       # produkcijski build (Nitro SSR → .output/)
yarn generate    # statički pre-render (SSG)
yarn preview     # lokalni pregled builda
```

## Napomene

- Default `apiBase` u `nuxt.config.ts` je hardkodiran na Cloudways; za lokalni rad postavi `NUXT_PUBLIC_API_BASE`.
- Frontend čita objavljeni sadržaj javno (bez tokena); admin značajke ovise o `g2d_token` cookieju koji postavlja CMS na dijeljenoj domeni.

---

# Integracija s API-jem

Frontend dohvaća sav sadržaj s `go2digital-api`. Bazni URL: `runtimeConfig.public.apiBase` (`nuxt.config.ts`) — **bez** `/api` sufiksa; endpointi ga uključuju.

## `useApi` (`app/composables/useApi.ts`)

Glavni composable za dohvat, omota `useAsyncData` + `$fetch`:

- automatski šalje `Accept: application/json` i `Accept-Language: <locale>`;
- **re-fetcha pri promjeni jezika** (`watch: [locale]`);
- gradi jedinstveni cache key iz endpointa + locale + querya;
- SSR-friendly (`server: true` default), uz opcionalni `lazy`.

```ts
const { data, pending, error } = useApi<BlogPost[]>('/api/blog-posts')
```

### `$api` — imperativni dohvat

Za event handlere i ne-SSR kontekste (`$fetch` wrapper s istim headerima):

```ts
const result = await $api<ContactResponse>('/api/contact', { method: 'POST', body })
```

## Tipovi odgovora

Definirani u `app/types/api.ts`. Prevodivi entiteti vraćaju sravnjena prevedena polja + `locale`. Reference na medije sadrže `path`, `thumbnails` (small/medium/large), `alt`, `title`.

## Korišteni endpointi (sažeto)

| Endpoint | Svrha |
|---|---|
| `/api/singletons/homepage-*` | homepage sekcije (hero, billboard, …) |
| `/api/settings` | dinamičke postavke (redoslijed sekcija, tipografija, footer) |
| `/api/blog-posts`, `/api/blog-categories` | blog |
| `/api/lab-projects`, `/api/lab-categories` | lab projekti |
| `/api/locations` | lokacije (stranica `/lokacije`) |
| `/api/navigation` | stavke navigacije |
| `/api/contact-info`, `/api/social-links` | footer/kontakt |
| `/api/seo-public/...` | SEO metapodaci (vidi `useSeo`) |
| `/api/translations/messages/{locale}` | poruke prijevoda (vidi [i18n](#i18n)) |
| `/api/auth/me` | provjera admin role (vidi dolje) |

> Točni nazivi resursa potvrđuju se u `GET /api/docs` na API-ju.

## SEO (`useSeo`)

Dohvaća metapodatke po entitetu ili singleton stranici i primjenjuje title, description, keywords, robots, OG/Twitter tagove i canonical. Jezično svjesno.

## Sadržaj vođen postavkama

Redoslijed homepage sekcija, tipografija (fontovi + preseti) i poruke prijevoda dohvaćaju se s API-ja pri montiranju/startu. Ako API nije dostupan, koriste se statički fallbackovi.

## Admin autentikacija (`useAdminAuth`)

Frontend ne radi login — koristi **`g2d_token` cookie** koji postavlja CMS na dijeljenoj domeni (`.go2digital.hr`).

1. `checkAdmin()` se izvršava samo na klijentu (`import.meta.server` guard).
2. Čita `g2d_token` cookie (`useCookie`).
3. Poziva `GET /api/auth/me` s `Authorization: Bearer <token>`.
4. Ako korisnik ima `ROLE_SUPER_ADMIN` / `ROLE_ADMIN` / `ROLE_EDITOR`, otključava in-page admin alate (npr. uređivanje focal pointa na lokacijama).

Cijeli tok autentikacije sustava: [`../DOKUMENTACIJA.md`](../DOKUMENTACIJA.md#tok-autentikacije).

---

# i18n

Višejezičnost preko `@nuxtjs/i18n` (v10). Konfiguracija u `nuxt.config.ts`.

## Jezici i strategija

| Locale | Jezik | Datoteka | URL |
|---|---|---|---|
| `hr` | Hrvatski (default) | `i18n/locales/hr.json` | `/` (bez prefiksa) |
| `en` | English | `i18n/locales/en.json` | `/en` |

- **Strategija:** `prefix_except_default` — hrvatski je kanonski na `/`, engleski na `/en`.
- **`detectBrowserLanguage: false`** — bez automatskog preusmjeravanja; korisnik ručno mijenja jezik. Dizajn tretira hrvatski kao kanonski ulaz.

## Statički prijevodi

Bazni prijevodi su u `i18n/locales/{hr,en}.json`. Komponente koriste `$t('kljuc')` / `useI18n().t('kljuc')`.

## Dinamički prijevodi (`app/plugins/translations.ts`)

Pri startu aplikacije dohvaćaju se poruke s API-ja (`GET /api/translations/messages/{locale}`) i spajaju preko statičkih JSON-ova. Ovo omogućuje uređivanje UI tekstova iz CMS-a bez deploya. Ako API nije dostupan → fallback na statičke datoteke.

## Sadržajni prijevodi

Sadržaj entiteta (blog, lab, lokacije, sekcije…) prevodi API: frontend šalje `Accept-Language: <locale>` i dobiva sravnjena prevedena polja za traženi jezik. `useApi` re-fetcha pri promjeni jezika.

## Audit hardkodiranih stringova

Popis stringova koje treba migrirati u i18n ključeve vodi se u [`TRANSLATIONS.md`](./TRANSLATIONS.md) (npr. SEO naslovi, labeli na kontakt stranici, specifikacije lokacija, WMO weather kodovi).

---

# Postojeći vodiči

- [docs/split-text.md](./docs/split-text.md) — text-split animacijski efekt.
- [TRANSLATIONS.md](./TRANSLATIONS.md) — audit hardkodiranih stringova.
