# Translation Audit — Hardcoded Strings

Untranslated user-facing strings discovered across the codebase. Total: **~88 strings** in **13 files**.

**Status: 88/88 ✅ COMPLETED** — all hardcoded strings have been migrated to `i18n/locales/hr.json` and `i18n/locales/en.json`, and source files updated to use `$t()` / `t()` calls.

For each entry, fill in the translation column. Suggested i18n keys are starting points — adjust to match your existing structure in `i18n/locales/hr.json` and `i18n/locales/en.json`.

**How to use:**
1. Pick a section.
2. Write the Croatian (`hr`) and/or English (`en`) value next to each string.
3. Tick the checkbox once the i18n key is added to both locale JSON files AND the source file is updated to use `$t('key')`.

---

## app/pages/index.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L94  | `Homepage - Go2Digital` (SEO title) | `seo.home.title` |  |  | ☐ |

---

## app/pages/privacy-policy.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L5   | `Privacy Policy` (h1) | `privacyPolicy.title` |  |  | ☐ |
| L7   | `Privacy policy content coming soon.` | `privacyPolicy.placeholder` |  |  | ☐ |
| L16  | `Privacy Policy - Go2Digital` (SEO) | `seo.privacyPolicy.title` |  |  | ☐ |

---

## app/pages/esg.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L12  | `ESG` (heading) | `esg.title` |  |  | ☐ |
| L80  | `ESG Background` (alt) | `esg.bgAlt` |  |  | ☐ |

---

## app/pages/lab/index.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L107 | `Go2Labs - Go2Digital` (SEO fallback) | `seo.lab.title` |  |  | ☐ |

---

## app/pages/blog/[slug].vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L128 | `LinkedIn` (share platform) | `share.linkedin` |  |  | ☐ |
| L129 | `Facebook` (share platform) | `share.facebook` |  |  | ☐ |
| L130 | `X` (share platform) | `share.x` |  |  | ☐ |

---

## app/pages/kontakt.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L162 | `LinkedIn` (button) | `contact.social.linkedin` |  |  | ☐ |
| L171 | `Instagram` (button) | `contact.social.instagram` |  |  | ☐ |
| L180 | `Facebook` (button) | `contact.social.facebook` |  |  | ☐ |
| L189 | `YouTube` (button) | `contact.social.youtube` |  |  | ☐ |
| L203 | `info[@]go2digital.hr` (obfuscated email) | `contact.info.email` |  |  | ☐ |
| L211 | `+38514839192` (phone) | `contact.info.phone` |  |  | ☐ |
| L220 | `Radnička cesta 52, 10 000 Zagreb` (address) | `contact.info.address` |  |  | ☐ |

---

## app/pages/lokacije/index.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L130 | `No results` (dropdown empty state) | `locations.filters.noResults` |  |  | ☐ |
| L333 | `Nearby Places` (with count format) | `locations.map.nearbyPlaces` |  |  | ☐ |

---

## app/pages/lokacije/[slug].vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L42  | `Focal Point` (admin button) | `locationDetail.focalPoint` |  |  | ☐ |
| L51  | `City` (spec label) | `locationDetail.spec.city` |  |  | ☐ |
| L55  | `Resolution` (spec label) | `locationDetail.spec.resolution` |  |  | ☐ |
| L59  | `Environment` (spec label) | `locationDetail.spec.environment` |  |  | ☐ |
| L63  | `Duration` (spec label) | `locationDetail.spec.duration` |  |  | ☐ |
| L64  | `minutes` (unit suffix) | `locationDetail.spec.minutes` |  |  | ☐ |
| L67  | `Type` (spec label) | `locationDetail.spec.type` |  |  | ☐ |
| L79  | `Back to locations` (button) | `locationDetail.back` |  |  | ☐ |
| L85  | `Share Location` (button) | `locationDetail.share` |  |  | ☐ |
| L89  | `Save to collection` (button, default) | `locationDetail.save` |  |  | ☐ |
| L89  | `Saved to collection` (button, active) | `locationDetail.saved` |  |  | ☐ |
| L100 | `About The Location` (section) | `locationDetail.about` |  |  | ☐ |
| L110 | `Indoor` (map label) | `locationDetail.map.indoor` |  |  | ☐ |
| L114 | `Outdoor` (map label) | `locationDetail.map.outdoor` |  |  | ☐ |
| L118 | `Location` (fallback label) | `locationDetail.map.fallback` |  |  | ☐ |
| L168 | `Gallery` (section label) | `locationDetail.gallery` |  |  | ☐ |

---

## app/components/HeroSection.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L29  | `Vaš brend<br/>u prvom planu.` (titleText fallback, hardcoded HR) | `hero.titleFallback` |  |  | ☐ |

---

## app/components/HeroNav.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L7   | `Izbornik` (menu, hardcoded HR) | `nav.menu` *(exists — wire up)* |  |  | ☐ |
| L8   | `Zatvori` (close, hardcoded HR) | `nav.close` *(exists — wire up)* |  |  | ☐ |
| L56  | `Homepage` (nav fallback) | `nav.homepage` *(exists — wire up)* |  |  | ☐ |
| L57  | `Go2Labs` (nav fallback) | `nav.labs` *(exists — wire up)* |  |  | ☐ |
| L58  | `Articles` (nav fallback) | `nav.articles` *(exists — wire up)* |  |  | ☐ |
| L59  | `Contact` (nav fallback) | `nav.contactPage` *(exists — wire up)* |  |  | ☐ |
| L60  | `ESG` (nav fallback) | `nav.esg` *(exists — wire up)* |  |  | ☐ |

> All seven keys already exist in `nav.*`. Just replace the hardcoded values with `$t('nav.…')`.

---

## app/components/FooterSection.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L64  | `LinkedIn` (social fallback) | `footer.social.linkedin` |  |  | ☐ |
| L65  | `Instagram` (social fallback) | `footer.social.instagram` |  |  | ☐ |
| L66  | `Facebook` (social fallback) | `footer.social.facebook` |  |  | ☐ |
| L67  | `TikTok` (social fallback) | `footer.social.tiktok` |  |  | ☐ |
| L82  | `E-mail` (label) | `footer.contact.emailLabel` |  |  | ☐ |
| L82  | `info@go2digital.hr` (value) | `footer.contact.emailValue` |  |  | ☐ |
| L83  | `Phone` (label) | `footer.contact.phoneLabel` |  |  | ☐ |
| L83  | `+385 1 483 9192` (value) | `footer.contact.phoneValue` |  |  | ☐ |
| L84  | `Location` (label) | `footer.contact.locationLabel` |  |  | ☐ |
| L84  | `Radnička cesta 52, 10 000 Zagreb` (value) | `footer.contact.locationValue` |  |  | ☐ |
| L320 | `Privacy Policy` (link) | `footer.links.privacyPolicy` |  |  | ☐ |
| L324 | `Cookie Settings` (link) | `footer.links.cookieSettings` |  |  | ☐ |
| L328 | `Design / N3 Studio` (credits) | `footer.credits.design` |  |  | ☐ |
| L330 | `Deckard` (agency name, ×2) | `footer.credits.agency` |  |  | ☐ |

---

## app/components/ConfirmDialog.vue

| Line | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------------------|---------------|----|----|---|
| L35  | `Are you sure?` (default message) | `dialog.confirm.message` |  |  | ☐ |
| L36  | `Confirm` (default button) | `dialog.confirm.confirm` |  |  | ☐ |
| L37  | `Cancel` (default button) | `dialog.confirm.cancel` |  |  | ☐ |

> These are component prop defaults. Either remove the defaults and require parents to pass i18n strings, or wire `useI18n()` inside the component for fallbacks.

---

## app/composables/useContactHeader.ts — Weather codes

26 strings. Suggested namespace: `weather.codes.*`. Keys correspond to WMO weather codes.

| Line | Code | Hardcoded string | Suggested key | hr | en | ✓ |
|------|------|------------------|---------------|----|----|---|
| L11  | 0    | `Clear sky` | `weather.codes.clearSky` |  |  | ☐ |
| L12  | 1    | `Mainly clear` | `weather.codes.mainlyClear` |  |  | ☐ |
| L13  | 2    | `Partly cloudy` | `weather.codes.partlyCloudy` |  |  | ☐ |
| L14  | 3    | `Overcast` | `weather.codes.overcast` |  |  | ☐ |
| L15  | 45   | `Foggy` | `weather.codes.foggy` |  |  | ☐ |
| L16  | 48   | `Foggy with rime` | `weather.codes.foggyRime` |  |  | ☐ |
| L17  | 51   | `Light drizzle` | `weather.codes.drizzleLight` |  |  | ☐ |
| L18  | 53   | `Moderate drizzle` | `weather.codes.drizzleModerate` |  |  | ☐ |
| L19  | 55   | `Dense drizzle` | `weather.codes.drizzleDense` |  |  | ☐ |
| L20  | 61   | `Slight rain` | `weather.codes.rainSlight` |  |  | ☐ |
| L21  | 63   | `Moderate rain` | `weather.codes.rainModerate` |  |  | ☐ |
| L22  | 65   | `Heavy rain` | `weather.codes.rainHeavy` |  |  | ☐ |
| L23  | 71   | `Slight snow` | `weather.codes.snowSlight` |  |  | ☐ |
| L24  | 73   | `Moderate snow` | `weather.codes.snowModerate` |  |  | ☐ |
| L25  | 75   | `Heavy snow` | `weather.codes.snowHeavy` |  |  | ☐ |
| L26  | 77   | `Snow grains` | `weather.codes.snowGrains` |  |  | ☐ |
| L27  | 80   | `Slight rain showers` | `weather.codes.showersSlight` |  |  | ☐ |
| L28  | 81   | `Moderate rain showers` | `weather.codes.showersModerate` |  |  | ☐ |
| L29  | 82   | `Violent rain showers` | `weather.codes.showersViolent` |  |  | ☐ |
| L30  | 85   | `Slight snow showers` | `weather.codes.snowShowersSlight` |  |  | ☐ |
| L31  | 86   | `Heavy snow showers` | `weather.codes.snowShowersHeavy` |  |  | ☐ |
| L32  | 95   | `Thunderstorm` | `weather.codes.thunderstorm` |  |  | ☐ |
| L33  | 96   | `Thunderstorm with slight hail` | `weather.codes.thunderHailSlight` |  |  | ☐ |
| L34  | 99   | `Thunderstorm with heavy hail` | `weather.codes.thunderHailHeavy` |  |  | ☐ |
| L110 | —    | `Unknown` (fallback) | `weather.codes.unknown` |  |  | ☐ |

---

## Implementation notes

1. **Mixed-language fallbacks**: `HeroNav` mixes hardcoded Croatian (`Izbornik`, `Zatvori`) with English nav fallbacks. Same in `FooterSection`. After wiring i18n, both should consistently come from the active locale.

2. **API-fallback pattern**: Several footer/nav strings are "default value when CMS API returns empty". Translation requires a new i18n key AND the fallback line in `.vue` updated to use `$t()`. Don't skip the second step or production will still show the hardcoded fallback when CMS is empty.

3. **Contact data debate**: Phone numbers and addresses don't change between languages, but their *labels* do (`E-mail` / `E-pošta`, `Phone` / `Telefon`, `Location` / `Lokacija`). Decide per-row whether the value field needs translation too.

4. **SEO titles in `useHead()`**: 4 page titles are hardcoded. Wrap them with `useI18n`'s `t()` so the page title reflects the active locale on initial render.

5. **Weather block (26 strings)**: A single `weather.codes.*` namespace. The composable should call `t('weather.codes.' + key)` instead of returning the hardcoded string.

---

## Progress tracker

- Total strings: **88**
- Translated: **0 / 88**
- Files completed: **0 / 13**
