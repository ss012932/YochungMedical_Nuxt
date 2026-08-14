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

/* 功能：scrollbar gutter 已由 html 預留，避免 SweetAlert2 再補 padding 造成第二次水平位移。 */
body.swal2-shown {
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
