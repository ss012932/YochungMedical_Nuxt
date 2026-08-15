<!-- ============================================================
  App 根元件
  功能：掛載 Nuxt Layout / Page，並設定全站基礎 SEO 與全域樣式
============================================================ -->
<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const site = useSiteConfig()

// 全站共用 SEO。各頁仍可用 useSeoMeta 覆蓋 title / description。
useHead(() => ({
  titleTemplate: (titleChunk) => {
    if (!titleChunk) return '祐強醫療儀器有限公司｜YoChung Medical Instrument Co., Ltd.'
    if (String(titleChunk).includes('祐強醫療')) return String(titleChunk)
    return `${titleChunk}｜祐強醫療儀器有限公司`
  },
  htmlAttrs: {
    lang: locale.value,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#8f3b86' },
    { charset: 'utf-8' },
  ],
}))

useSeoMeta({
  description: '祐強醫療儀器有限公司提供專業醫療器材、動物醫療設備、傷口照護產品與相關醫療解決方案。',
  ogSiteName: '祐強醫療儀器有限公司',
  ogType: 'website',
  ogImage: '/og-cover.webp',
  twitterCard: 'summary_large_image',
  twitterImage: '/og-cover.webp',
})

// 全站 Schema.org：建立公司與網站實體，供搜尋引擎辨識品牌。
useSchemaOrg([
  defineOrganization({
    name: '祐強醫療儀器有限公司',
    alternateName: 'YoChung Medical Instrument Co., Ltd.',
    url: site.url,
    logo: `${site.url}/logo.webp`,
  }),
  defineWebSite({
    name: '祐強醫療儀器有限公司',
    alternateName: 'YoChung Medical Instrument Co., Ltd.',
    url: site.url,
  }),
])
</script>

<style>
/* ============================================================
   全站基礎樣式
   說明：只放真正需要跨頁共用的 reset，不把頁面 CSS 集中在這裡。
============================================================ */
html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
  padding: 0;
}

html {
  overflow-x: clip;
  /* 功能：固定保留垂直捲軸空間，避免 SweetAlert2 鎖定頁面捲動時整頁左右位移。 */
  scrollbar-gutter: stable;
  background: #fff;
}

body {
  min-width: 320px;
  color: #14283b;
  font-family: 'Microsoft JhengHei', 'PingFang TC', 'Noto Sans TC', sans-serif;
  background: #fff;
}

/* ============================================================
   全站自製懸浮框遮罩：完整覆蓋 viewport
   功能：統一修正前台、會員與後台各種 Modal / Lightbox 的黑色遮罩。
   部分舊頁面使用 width: 100%，會被 html 的 scrollbar-gutter: stable 限制，
   造成畫面最右側留下白色直條；改用 100vw / 100dvh 直接覆蓋完整視窗。
============================================================ */
:where(
  .modal-overlay,
  .recommendation-modal,
  .product-modal-teleport-root .product-modal,
  .video-modal,
  .inquiry-modal,
  .lightbox
) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: auto !important;
  bottom: auto !important;
  width: 100vw !important;
  height: 100dvh !important;
  min-width: 100vw !important;
  min-height: 100dvh !important;
  max-width: none !important;
  margin: 0 !important;
}

/* ============================================================
   自製 Modal 開啟時取消 scrollbar gutter
   功能：html 平常使用 scrollbar-gutter: stable 預留捲軸空間；
   但任何自製懸浮框開啟時，預留區會變成右側白條。
   因此偵測 Modal 存在時暫時取消 gutter，並鎖住背景頁面捲動。
============================================================ */
html:has(.modal-overlay),
html:has(.recommendation-modal),
html:has(.product-modal-teleport-root .product-modal),
html:has(.video-modal),
html:has(.inquiry-modal),
html:has(.lightbox) {
  scrollbar-gutter: auto !important;
  overflow: hidden !important;
}

body:has(.modal-overlay),
body:has(.recommendation-modal),
body:has(.product-modal-teleport-root .product-modal),
body:has(.video-modal),
body:has(.inquiry-modal),
body:has(.lightbox) {
  overflow: hidden !important;
  padding-right: 0 !important;
}

/* ============================================================
   SweetAlert2 全域最上層 + 背景捲動鎖定
   功能：任何 Swal.fire()（包含 toast）顯示時，都蓋在全站所有 Modal / Header 之上，
   並鎖住 html/body 背景頁面，避免使用滑鼠滾輪或觸控手勢上下移動頁面。
============================================================ */
.swal2-container {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  max-width: none !important;
  z-index: 2147483000 !important;
}

html.swal2-global-open,
body.swal2-global-open,
body.swal2-shown,
body.swal2-toast-shown {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}

/* 功能：SW2 開啟時取消 html 原本保留的 scrollbar gutter，
   避免右側留下未被黑色遮罩覆蓋的白色直條。 */
html.swal2-global-open {
  scrollbar-gutter: auto !important;
}

/* 功能：scrollbar gutter 已由 html 預留，避免 SweetAlert2 再補 padding 造成第二次水平位移。 */
body.swal2-shown,
body.swal2-toast-shown,
body.swal2-global-open {
  padding-right: 0 !important;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

button,
input,
textarea,
select {
  font: inherit;
}

img {
  max-width: 100%;
}
</style>
