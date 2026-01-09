// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'hr', language: 'hr-HR', file: 'hr.json', name: 'Hrvatski' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'hr',
    lazy: true,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
