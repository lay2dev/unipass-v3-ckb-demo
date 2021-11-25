// import fs from 'fs'
// import path from 'path'
export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'UniPass L3 Demo',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no',
      },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: '//at.alicdn.com/t/font_2883496_azmp1437rp.css',
      },
    ],
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js',
      },
      {
        src: 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.6.6/dist/esm/index.min.js',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@assets/css/main.scss'],

  // Global loading https://www.nuxtjs.cn/api/configuration-loading
  loading: {
    color: '#3179ff',
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/axios', '~/plugins/element-ui', '~/plugins/main'],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://color-mode.nuxtjs.org
    '@nuxtjs/color-mode',
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/dotenv',
    'nuxt-compress',
  ],
  'google-gtag': {
    id: process.env.UNIPASS_GA,
  },
  'nuxt-compress': {
    gzip: {
      threshold: 8192,
    },
    brotli: {
      threshold: 8192,
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    // '@nuxtjs/onesignal',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // baseURL: process.env.UNIPASS_URL,
  },

  router: {
    base: '/',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // analyze: process.env.NODE_ENV === 'production',
    transpile: [/^element-ui/, 'up-ckb', '@lay2/pw-core'],
    publicPath: '',
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      },
    },
  },
  env: {
    environment: process.env.NODE_ENV,
  },

  // eslint
  eslint: {
    fix: true,
  },

  // server
  server: {
    // host: '0.0.0.0',
    port: 3100,
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'bin/cert.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'bin/cert.crt')),
    // },
  },
}
