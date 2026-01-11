// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/scss/_variables" as *;
            @use "~/assets/scss/_mixins" as *;
          `
        }
      }
    }
  },

  app: {
    head: {
      style: [
        {
          // Inline critical CSS to hide scrollbar immediately
          children: `
            html, body { scrollbar-width: none !important; -ms-overflow-style: none !important; }
            html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
          `
        }
      ]
    }
  },

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
