<template>
  <div class="auth-layout" :class="{ 'is-register-page': isRegisterPage }">
    <AppHeader />

    <!--
      Auth 主要內容
      功能：只有登入頁 /login 套用輕微淡入動畫。
      /register 與 /forgot-password 共用 auth layout，但不會被一起套用。
    -->
    <main
      :key="route.path"
      class="auth-layout-main"
      :class="{ 'login-page-fade': isLoginPage }"
    >
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isRegisterPage = computed(() => route.path === '/register')
const isLoginPage = computed(() => route.path === '/login')

// Auth 頁本身不需要預留 scrollbar gutter，避免桌機右側出現空白。
useHead({
  htmlAttrs: { class: 'auth-page-root' },
})
</script>

<style scoped>
.auth-layout {
  display: flex;
  width: 100vw;
  max-width: none;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  flex-direction: column;
  background: #f8faf9;
}

.auth-layout-main {
  width: 100vw;
  max-width: none;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  flex: 1 1 auto;
  background: #f8faf9;
}

/* ============================================================
   登入頁淡入動畫
   功能：只在 /login 進入時，以輕微透明 + 位移方式淡入。
============================================================ */
.login-page-fade {
  animation: login-page-fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes login-page-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .auth-layout,
  .auth-layout-main {
    background: #fff;
  }

  /* 註冊頁只有在中小尺寸保留垂直捲動 */
  .auth-layout.is-register-page {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }

  .auth-layout.is-register-page .auth-layout-main {
    overflow: visible;
  }
}

/* 無障礙：使用者偏好減少動畫時，自動停用登入頁淡入。 */
@media (prefers-reduced-motion: reduce) {
  .login-page-fade {
    animation: none;
  }
}

/* Auth 頁停用全站預留的 scrollbar gutter，讓背景真正填滿右側。 */
:global(html.auth-page-root) {
  scrollbar-gutter: auto !important;
  overflow-x: hidden;
}

:global(html.auth-page-root body),
:global(html.auth-page-root #__nuxt),
:global(html.auth-page-root #__nuxt > div) {
  width: 100%;
  max-width: none;
}
</style>
