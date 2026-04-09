// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  ssr: false,
  nitro: { preset: 'static' },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxtjs/color-mode', 'nuxt-charts', '@vite-pwa/nuxt'],
  colorMode: { preference: 'system', classSuffix: '' },
  runtimeConfig: {
    public: {
      SECRET_KEY: 'THESALUS943875PL',
      // api: 'https://api.ctsantaisabel.com',
      api: 'http://127.0.0.1:8000',
      login: 'api/login',
      categoria: 'api/categorias',
      productos: 'api/productos',
      cliente: 'api/cliente',
      equipo: 'api/equipo',
      tecnico: 'api/tecnico',
      tipo_equipo: 'api/tipo_equipo',
      sistema: 'api/sistema',
      componente: 'api/componente',
      cita: 'api/cita',
      reporte: 'api/reporte',
      rol: 'api/rol',
      secciones: 'api/secciones',
      recibido_firma: 'api/recibido_firma',

      cambiarContraseña: 'api/cambiarContraseña',
      cambiarContraseñaPrimerVez: 'api/cambiarContraseñaPrimerVez',
      recuperarContraseña: 'api/recuperarContraseña',
      primerIngreso: 'api/primerIngreso',
    }
  },
  app: {
    head: {
      link: [ 
          { rel: 'icon', type: 'image/x-icon', href: '/cruz.png' },
       ]
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ANANKE APP',
      short_name: 'ANANKE',
      theme_color: '#2262a3',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: '/logo.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/cruz.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
     navigateFallback: '/index.html',
    navigateFallbackAllowlist: [/^\/$/,/^\/.+/],

    },
    devOptions: {
      enabled: true
    }
  }
});