// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBase: 'https://phpstack-1595490-6341899.cloudwaysapps.com'
    }
  },
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
      meta: [
        // Stop iOS Safari from auto-linking phone numbers, dates, addresses, emails (which it then styles as blue links).
        { name: 'format-detection', content: 'telephone=no, date=no, address=no, email=no' }
      ],
      script: [
        {
          // Block rendering immediately — hide everything until loader mounts
          innerHTML: `document.documentElement.style.visibility='hidden';document.documentElement.style.background='#ffffff';`,
          tagPosition: 'head'
        }
      ],
      style: [
        {
          // Inline critical CSS: hide scrollbar + ensure white background
          innerHTML: `
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
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
