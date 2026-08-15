// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 功能：全站載入 Font Awesome Free，供既有 fas/fa-* 圖示使用。
  css: ['@fortawesome/fontawesome-free/css/all.min.css'],

  // SEO 正式網址：部署時請設定 NUXT_PUBLIC_SITE_URL，例如 https://www.example.com
  // 本機未設定時使用 localhost，方便驗證 sitemap / robots / canonical。
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL,
    env: process.env.NODE_ENV || 'development',
    name: '祐強醫療儀器有限公司',
    description: '祐強醫療儀器有限公司提供專業醫療器材、動物醫療設備、傷口照護產品與相關醫療解決方案。',
  },

  // 多語系 + 完整 Nuxt SEO 套件。
  modules: ['@nuxtjs/i18n', '@nuxtjs/seo'],

  // 多語系：保留既有 URL，不加入 /en、/ja 等前綴，避免影響既有 API / 金流 / reset 連結。
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'zh-TW',
    lazy: false,
    langDir: 'locales',
    locales: [
      { code: 'zh-TW', language: 'zh-TW', name: '繁中', file: 'zh-TW.json' },
      { code: 'zh-CN', language: 'zh-CN', name: '简中', file: 'zh-CN.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'ja', language: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', language: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'vi', language: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'th', language: 'th', name: 'ภาษาไทย', file: 'th.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'yochung_locale',
      fallbackLocale: 'zh-TW',
      redirectOn: 'root',
    },
  },

  // Sitemap：公開前台頁面由 Nuxt routes 自動產生；私有頁面用 routeRules 排除。
  sitemap: {
    urls: [
      { loc: '/', changefreq: 'weekly', priority: 1 },
      { loc: '/products', changefreq: 'daily', priority: 0.9 },
      { loc: '/about', changefreq: 'monthly', priority: 0.7 },
      { loc: '/video', changefreq: 'weekly', priority: 0.7 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.6 },
    ],
  },

  // Robots：管理、會員、認證、購物車不允許搜尋引擎爬取。
  robots: {
    groups: [
      {
        userAgent: ['*'],
        allow: ['/'],
        disallow: [
          '/admin',
          '/admin/**',
          '/member',
          '/member/**',
          '/login',
          '/register',
          '/forgot-password',
          '/reset',
          '/cart',
        ],
      },
    ],
  },

  // 私有與無搜尋價值頁面：同時排除 Sitemap 並輸出 noindex。
  routeRules: {
    '/admin': { robots: false, sitemap: false },
    '/admin/**': { robots: false, sitemap: false },
    '/member': { ssr: false, robots: false, sitemap: false },
    '/member/**': { ssr: false, robots: false, sitemap: false },
    '/login': { robots: false, sitemap: false },
    '/register': { robots: false, sitemap: false },
    '/forgot-password': { robots: false, sitemap: false },
    '/reset': { robots: false, sitemap: false },
    '/cart': { robots: false, sitemap: false },
    '/': { ssr: true, sitemap: { changefreq: 'weekly', priority: 1 } },
    '/products': { ssr: true, sitemap: { changefreq: 'daily', priority: 0.9 } },
    '/about': { ssr: true, sitemap: { changefreq: 'monthly', priority: 0.7 } },
    '/video': { ssr: true, sitemap: { changefreq: 'weekly', priority: 0.7 } },
    '/contact': { ssr: true, sitemap: { changefreq: 'monthly', priority: 0.6 } },
  },

  // OG Image：目前網站使用固定 /og-cover.webp，不需要動態產圖。
  // 關閉動態 renderer，避免 dev 啟動時詢問 satori / takumi / browser。
  ogImage: {
    enabled: false,
  },

  // 既有網站有 API / 動態連結，先不讓 link checker 在 build 阻擋部署。
  linkChecker: {
    runOnBuild: false,
    excludeLinks: ['/admin/**', '/member/**', '/api/**'],
  },
})
