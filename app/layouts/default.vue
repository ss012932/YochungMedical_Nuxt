<!-- ============================================================
  Default Layout
  功能：統一放置全站 Header、頁面內容與 Footer
============================================================ -->
<template>
  <div class="app-wrapper">
    <!-- 全站共用 Header -->
    <AppHeader />

    <!--
      客戶前台主要內容
      功能：只有商品頁保留整頁淡入；首頁、關於、影片、聯絡改由各頁只控制文字與物件動畫。
      /cart、/member/* 與其他使用 default layout 的頁面都不會套用動畫。
      使用 route.path 當 key，切換到另一個前台頁面時會重新播放一次淡入效果。
    -->
    <main
      :key="route.path"
      class="main-content"
      :class="{ 'customer-page-fade': shouldUseCustomerFade }"
    >
      <slot />
    </main>

    <!-- 全站共用 Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// ==============================
// 客戶前台淡入動畫路由白名單
// 功能：共用 Layout 只保留商品頁整頁淡入，其餘公開頁面不再對整個 main 套 transform。
// ==============================
const route = useRoute()

const customerFrontPaths = new Set([
  '/products',
])

// 功能：首頁、關於、影片、聯絡由各頁控制內容動畫；購物車、會員中心與其他頁面也不套用整頁淡入。
const shouldUseCustomerFade = computed(() => customerFrontPaths.has(route.path))
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  min-width: 0;
}

/* ============================================================
   客戶前台頁面淡入動畫
   功能：商品頁進入時只做透明度淡入。
   注意：這裡不能使用 transform，否則 main-content 會形成 fixed 定位的 containing block，
   導致 products.vue 的 floating-cart-btn 無法真正固定在瀏覽器 viewport。
============================================================ */
.customer-page-fade {
  animation: customer-page-fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes customer-page-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/*
  無障礙支援：
  若使用者在作業系統設定「減少動態效果」，直接取消淡入動畫。
*/
@media (prefers-reduced-motion: reduce) {
  .customer-page-fade {
    animation: none;
  }
}
</style>
