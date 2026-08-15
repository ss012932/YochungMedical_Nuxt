<template>
  <!-- ============================================================
    全站錯誤頁
    功能：Nuxt 找不到路由時顯示品牌化 404 頁面；其他錯誤則顯示通用錯誤訊息。
    說明：錯誤頁獨立顯示，不載入全站 Header / Footer。
  ============================================================ -->
  <section class="error-page" :class="{ 'is-not-found': isNotFound }">
    <!-- 功能：純 CSS 背景裝飾，不影響操作與無障礙閱讀。 -->
    <div
      class="error-decoration error-decoration-left"
      aria-hidden="true"
    ></div>
    <div
      class="error-decoration error-decoration-right"
      aria-hidden="true"
    ></div>

    <div class="error-container">
      <!-- ======================================================
          左側內容
          功能：顯示錯誤代碼、說明與主要導覽按鈕。
        ======================================================= -->
      <div class="error-copy">
        <!-- 404 專屬品牌數字：中間的 0 放入祐強 Logo。 -->
        <div
          v-if="isNotFound"
          class="error-code error-code-404"
          aria-label="404"
        >
          <span>4</span>
          <span class="error-zero" aria-hidden="true">
            <img src="@/assets/image/logo.webp" alt="" />
          </span>
          <span>4</span>
        </div>

        <!-- 非 404 錯誤：保留實際 HTTP 狀態碼，避免錯誤資訊被隱藏。 -->
        <div v-else class="error-code error-code-generic">
          {{ statusCode }}
        </div>

        <h1>
          {{
            $ui(isNotFound ? "這個頁面好像走失了" : "系統暫時無法處理這個請求")
          }}
        </h1>

        <p class="error-description">
          {{
            $ui(
              isNotFound
                ? "你前往的頁面可能已移動、網址輸入錯誤，或目前不存在。你可以返回首頁，或繼續瀏覽商品專區。"
                : "目前發生未預期的狀況，請稍後再試；若問題持續發生，歡迎透過聯絡我們告知祐強。",
            )
          }}
        </p>

        <!-- 功能：使用 clearError 離開 Nuxt error state，再重新導向正常頁面。 -->
        <div class="error-actions">
          <button
            type="button"
            class="error-button error-button-primary"
            @click="goTo('/')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 11 9-8 9 8" />
              <path d="M5.5 10.5V21h13V10.5M9.5 21v-6h5v6" />
            </svg>
            <span>{{ $ui("回到首頁") }}</span>
          </button>

          <button
            type="button"
            class="error-button error-button-secondary"
            @click="goTo('/products')"
          >
            <span>{{ $ui("前往商品專區") }}</span>
          </button>
        </div>

        <p class="error-help">
          {{ $ui("需要協助嗎？") }}
          <button type="button" @click="goTo('/contact')">
            {{ $ui("聯絡我們") }}
          </button>
        </p>
      </div>

      <!-- ======================================================
          右側醫療主視覺
          功能：以心電圖、醫療十字與品牌色建立 404 專屬視覺，不依賴額外圖片素材。
        ======================================================= -->
      <div class="error-visual" aria-hidden="true">
        <div class="visual-orbit visual-orbit-one"></div>
        <div class="visual-orbit visual-orbit-two"></div>

        <div class="medical-card">
          <div class="medical-card-header">
            <div class="medical-brand-mark">
              <span class="medical-cross"></span>
            </div>
            <div>
              <strong>YoChung Medical</strong>
              <span>{{
                isNotFound
                  ? `404 / ${$ui("PAGE NOT FOUND")}`
                  : `${$ui("ERROR")} / ${statusCode}`
              }}</span>
            </div>
          </div>

          <div class="monitor-screen">
            <div class="monitor-grid"></div>
            <svg
              class="heartbeat"
              viewBox="0 0 520 150"
              preserveAspectRatio="none"
            >
              <path
                class="heartbeat-shadow"
                d="M0 86 H95 L118 86 L136 72 L153 99 L171 37 L193 116 L213 86 H286 L307 86 L326 71 L342 98 L362 44 L382 110 L402 86 H520"
              />
              <path
                class="heartbeat-line"
                d="M0 86 H95 L118 86 L136 72 L153 99 L171 37 L193 116 L213 86 H286 L307 86 L326 71 L342 98 L362 44 L382 110 L402 86 H520"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

// ============================================================
// Nuxt 錯誤資訊
// 功能：error.vue 不是一般 route，而是 Nuxt 全站錯誤頁；由 Nuxt 傳入 error prop。
// ============================================================
const props = defineProps<{
  error: NuxtError;
}>();

const { $ui } = useNuxtApp();

const statusCode = computed(
  () => props.error?.status ?? props.error?.statusCode ?? 500,
);
const isNotFound = computed(() => statusCode.value === 404);

// ============================================================
// 錯誤頁 SEO
// 功能：404 / 系統錯誤頁不應被搜尋引擎收錄。
// ============================================================
useHead(() => ({
  title: isNotFound.value
    ? "找不到頁面｜祐強醫療儀器有限公司"
    : "系統錯誤｜祐強醫療儀器有限公司",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
}));

// ============================================================
// 離開錯誤頁
// 功能：先使用 clearError 清除 Nuxt 的 error state，再導向正常路由。
// ============================================================
async function goTo(path: string) {
  await clearError({ redirect: path });
}
</script>

<style scoped>
/* ============================================================
   404 頁面基礎色彩
   功能：沿用網站既有深藍、紫色、醫療青綠與淡綠品牌調性。
============================================================ */
.error-page {
  --error-ink: #173247;
  --error-muted: #687b86;
  --error-purple: #8f3b86;
  --error-purple-dark: #742d6d;
  --error-teal: #348f92;
  --error-teal-dark: #286f77;
  --error-green: #9fc77d;
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 12% 18%,
      rgba(159, 199, 125, 0.14) 0 90px,
      transparent 92px
    ),
    radial-gradient(
      circle at 93% 82%,
      rgba(143, 59, 134, 0.1) 0 150px,
      transparent 152px
    ),
    linear-gradient(135deg, #fbfdfc 0%, #f7faf9 52%, #fbf8fb 100%);
}

.error-decoration {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(1px);
}

.error-decoration-left {
  top: 18%;
  left: -90px;
  width: 220px;
  height: 220px;
  background: rgba(143, 59, 134, 0.055);
}

.error-decoration-right {
  right: -80px;
  bottom: 8%;
  width: 260px;
  height: 260px;
  background: rgba(90, 159, 148, 0.07);
}

.error-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(420px, 1.12fr);
  gap: clamp(48px, 7vw, 110px);
  width: min(calc(100% - 80px), 1380px);
  min-height: inherit;
  margin: 0 auto;
  padding: clamp(70px, 8vw, 112px) 0;
  align-items: center;
}

/* ============================================================
   左側文字區
============================================================ */
.error-copy {
  position: relative;
  max-width: 600px;
}

.error-eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 12px;
  color: var(--error-teal-dark);
  background: rgba(52, 143, 146, 0.08);
  border: 1px solid rgba(52, 143, 146, 0.13);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.16em;
}

.error-code {
  margin-top: 20px;
  color: var(--error-ink);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 900;
  line-height: 0.92;
  letter-spacing: -0.065em;
}

.error-code-404 {
  display: flex;
  align-items: center;
  gap: clamp(5px, 1vw, 12px);
  font-size: clamp(92px, 10vw, 150px);
}

.error-zero {
  display: grid;
  width: 0.73em;
  height: 0.73em;
  flex: 0 0 auto;
  overflow: hidden;
  background: #fff;
  border: 5px solid rgba(143, 59, 134, 0.16);
  border-radius: 50%;
  box-shadow:
    0 16px 40px rgba(38, 70, 78, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  place-items: center;
}

.error-zero img {
  width: 72%;
  height: 72%;
  object-fit: contain;
}

.error-code-generic {
  font-size: clamp(88px, 9vw, 138px);
}

.error-copy h1 {
  margin: 26px 0 0;
  color: var(--error-ink);
  font-size: clamp(30px, 3vw, 44px);
  font-weight: 850;
  line-height: 1.25;
  letter-spacing: 0.035em;
}

.error-description {
  max-width: 560px;
  margin: 18px 0 0;
  color: var(--error-muted);
  font-size: 14px;
  line-height: 1.9;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.error-button {
  display: inline-flex;
  min-height: 48px;
  padding: 0 20px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.error-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.error-button-primary {
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--error-teal),
    var(--error-teal-dark)
  );
  border: 1px solid transparent;
  box-shadow: 0 10px 24px rgba(47, 132, 137, 0.18);
}

.error-button-secondary {
  color: var(--error-purple-dark);
  background: #fff;
  border: 1px solid rgba(143, 59, 134, 0.22);
}

.error-button:hover {
  transform: translateY(-2px);
}

.error-button-primary:hover {
  box-shadow: 0 14px 30px rgba(47, 132, 137, 0.24);
}

.error-button-secondary:hover {
  background: #fbf6fa;
  border-color: rgba(143, 59, 134, 0.36);
}

.error-button:focus-visible,
.error-help button:focus-visible {
  outline: 3px solid rgba(52, 143, 146, 0.24);
  outline-offset: 3px;
}

.error-help {
  margin: 18px 0 0;
  color: #89969d;
  font-size: 12px;
}

.error-help button {
  padding: 0;
  margin-left: 4px;
  color: var(--error-purple);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.error-help button:hover {
  text-decoration: underline;
}

/* ============================================================
   右側醫療視覺
============================================================ */
.error-visual {
  position: relative;
  display: grid;
  min-height: 470px;
  place-items: center;
}

.visual-orbit {
  position: absolute;
  border: 1px solid rgba(52, 143, 146, 0.12);
  border-radius: 50%;
}

.visual-orbit-one {
  width: min(38vw, 500px);
  height: min(38vw, 500px);
}

.visual-orbit-two {
  width: min(31vw, 400px);
  height: min(31vw, 400px);
  border-color: rgba(143, 59, 134, 0.09);
}

.medical-card {
  position: relative;
  z-index: 3;
  width: min(100%, 570px);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.93);
  border: 1px solid rgba(222, 231, 231, 0.95);
  border-radius: 28px;
  box-shadow: 0 30px 70px rgba(24, 60, 72, 0.12);
  backdrop-filter: blur(12px);
  transform: rotate(1.5deg);
}

.medical-card-header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #edf1f1;
}

.medical-brand-mark {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  background: linear-gradient(135deg, var(--error-teal), #53a4a0);
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(52, 143, 146, 0.2);
  place-items: center;
}

.medical-cross {
  position: relative;
  width: 23px;
  height: 23px;
}

.medical-cross::before,
.medical-cross::after {
  position: absolute;
  top: 50%;
  left: 50%;
  content: "";
  background: #fff;
  border-radius: 2px;
  transform: translate(-50%, -50%);
}

.medical-cross::before {
  width: 23px;
  height: 6px;
}

.medical-cross::after {
  width: 6px;
  height: 23px;
}

.medical-card-header div:last-child {
  display: grid;
  gap: 3px;
}

.medical-card-header strong {
  color: var(--error-ink);
  font-size: 14px;
  letter-spacing: 0.02em;
}

.medical-card-header span {
  color: #94a1a7;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.monitor-screen {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(242, 250, 248, 0.96),
    rgba(247, 251, 250, 0.96)
  );
}

.monitor-grid {
  position: absolute;
  inset: 0;
  opacity: 0.48;
  background-image:
    linear-gradient(rgba(52, 143, 146, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(52, 143, 146, 0.08) 1px, transparent 1px);
  background-size: 26px 26px;
}

.heartbeat {
  position: absolute;
  top: 34px;
  left: 0;
  width: 100%;
  height: 150px;
  overflow: visible;
}

.heartbeat-shadow,
.heartbeat-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.heartbeat-shadow {
  stroke: rgba(52, 143, 146, 0.1);
  stroke-width: 9;
}

.heartbeat-line {
  stroke: var(--error-teal);
  stroke-width: 3.2;
  stroke-dasharray: 760;
  stroke-dashoffset: 760;
  animation: heartbeat-draw 2.4s cubic-bezier(0.45, 0, 0.25, 1) infinite;
}

.monitor-status {
  position: absolute;
  right: 18px;
  bottom: 16px;
  display: inline-flex;
  min-height: 28px;
  padding: 0 10px;
  align-items: center;
  gap: 7px;
  color: #547178;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(214, 226, 224, 0.92);
  border-radius: 999px;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.11em;
}

.monitor-dot {
  width: 7px;
  height: 7px;
  background: var(--error-teal);
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(52, 143, 146, 0.1);
}

.medical-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 19px 24px 22px;
}

.medical-card-footer > div:first-child {
  display: grid;
  gap: 4px;
}

.medical-card-footer span {
  color: #96a2a8;
  font-size: 10px;
  font-weight: 700;
}

.medical-card-footer strong {
  color: var(--error-ink);
  font-size: 13px;
}

.medical-card-icon {
  display: grid;
  width: 40px;
  height: 40px;
  color: var(--error-purple);
  background: rgba(143, 59, 134, 0.08);
  border-radius: 12px;
  place-items: center;
}

.medical-card-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 2;
}

.floating-badge {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  min-height: 42px;
  padding: 0 14px;
  align-items: center;
  gap: 9px;
  color: var(--error-ink);
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(224, 231, 231, 0.95);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(27, 58, 69, 0.1);
  font-size: 11px;
  font-weight: 850;
  backdrop-filter: blur(10px);
}

.floating-badge-top {
  top: 40px;
  right: -18px;
  transform: rotate(-5deg);
}

.floating-badge-bottom {
  bottom: 35px;
  left: -20px;
  transform: rotate(4deg);
}

.badge-icon {
  display: grid;
  width: 22px;
  height: 22px;
  color: #fff;
  background: var(--error-purple);
  border-radius: 7px;
  place-items: center;
  font-size: 16px;
  line-height: 1;
}

.badge-pulse {
  width: 9px;
  height: 9px;
  background: var(--error-green);
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(159, 199, 125, 0.16);
}

@keyframes heartbeat-draw {
  0% {
    stroke-dashoffset: 760;
  }
  48%,
  72% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -760;
  }
}

/* ============================================================
   平板版
============================================================ */
@media (max-width: 1080px) {
  .error-container {
    grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
    gap: 48px;
    width: min(calc(100% - 48px), 980px);
  }

  .error-code-404 {
    font-size: clamp(84px, 11vw, 118px);
  }

  .error-copy h1 {
    font-size: clamp(28px, 3.6vw, 38px);
  }

  .error-visual {
    min-height: 410px;
  }

  .floating-badge-top {
    right: 0;
  }

  .floating-badge-bottom {
    left: 0;
  }
}

/* ============================================================
   手機 / 小平板版
============================================================ */
@media (max-width: 820px) {
  .error-page {
    min-height: 100dvh;
  }

  .error-container {
    grid-template-columns: 1fr;
    gap: 46px;
    width: min(calc(100% - 36px), 680px);
    padding: 58px 0 68px;
  }

  .error-copy {
    max-width: 620px;
    text-align: center;
    margin: 0 auto;
  }

  .error-code-404 {
    justify-content: center;
  }

  .error-description {
    margin-right: auto;
    margin-left: auto;
  }

  .error-actions {
    justify-content: center;
  }

  .error-visual {
    width: min(100%, 600px);
    min-height: 390px;
    margin: 0 auto;
  }

  .visual-orbit-one {
    width: 440px;
    height: 440px;
  }

  .visual-orbit-two {
    width: 350px;
    height: 350px;
  }
}

@media (max-width: 520px) {
  .error-container {
    width: min(calc(100% - 28px), 480px);
    padding: 44px 0 54px;
  }

  .error-eyebrow {
    font-size: 9px;
  }

  .error-code-404 {
    margin-top: 18px;
    font-size: clamp(78px, 25vw, 104px);
  }

  .error-zero {
    border-width: 4px;
  }

  .error-copy h1 {
    margin-top: 20px;
    font-size: clamp(26px, 8vw, 32px);
  }

  .error-description {
    margin-top: 14px;
    font-size: 13px;
    line-height: 1.8;
  }

  .error-actions {
    display: grid;
    grid-template-columns: 1fr;
    width: min(100%, 330px);
    margin: 26px auto 0;
  }

  .error-button {
    width: 100%;
  }

  .error-visual {
    min-height: 310px;
  }

  .medical-card {
    border-radius: 22px;
    transform: none;
  }

  .medical-card-header {
    padding: 17px 18px 14px;
  }

  .medical-brand-mark {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .medical-cross {
    transform: scale(0.84);
  }

  .monitor-screen {
    height: 175px;
  }

  .heartbeat {
    top: 20px;
    height: 132px;
  }

  .medical-card-footer {
    padding: 16px 18px 18px;
  }

  .floating-badge {
    display: none;
  }

  .visual-orbit-one {
    width: 330px;
    height: 330px;
  }

  .visual-orbit-two {
    width: 260px;
    height: 260px;
  }
}

/* ============================================================
   無障礙：使用者偏好減少動態效果時停用動畫與 hover 位移。
============================================================ */
@media (prefers-reduced-motion: reduce) {
  .heartbeat-line {
    animation: none;
    stroke-dashoffset: 0;
  }

  .error-button {
    transition: none;
  }

  .error-button:hover {
    transform: none;
  }
}

/* ============================================================
   404 桌機滿版最終調整
   功能：讓 404 內容真正吃滿整個 viewport，避免上下與左右出現大面積空白。
============================================================ */
@media (min-width: 821px) {
  .error-page {
    width: 100vw;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
  }

  .error-container {
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
    gap: clamp(48px, 5vw, 96px);
    width: 100%;
    max-width: none;
    height: 100dvh;
    min-height: 100dvh;
    padding: clamp(34px, 5vh, 58px) clamp(54px, 7vw, 138px);
    align-items: stretch;
  }

  .error-copy {
    display: flex;
    max-width: none;
    min-width: 0;
    flex-direction: column;
    justify-content: center;
  }

  .error-code-404 {
    margin-top: clamp(18px, 2.2vh, 28px);
    font-size: clamp(118px, 9.4vw, 176px);
  }

  .error-copy h1 {
    margin-top: clamp(20px, 2.5vh, 30px);
    font-size: clamp(36px, 2.7vw, 50px);
  }

  .error-description {
    max-width: 650px;
    font-size: clamp(14px, 0.9vw, 16px);
  }

  .error-actions {
    margin-top: clamp(26px, 3vh, 36px);
  }

  .error-button {
    min-height: 52px;
    padding-inline: 24px;
    font-size: 14px;
  }

  .error-visual {
    min-width: 0;
    min-height: 0;
    height: 100%;
  }

  .medical-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(100%, 720px);
    min-height: clamp(440px, 58vh, 610px);
  }

  .monitor-screen {
    height: auto;
    min-height: clamp(290px, 38vh, 410px);
  }

  .heartbeat {
    top: 50%;
    height: 46%;
    transform: translateY(-50%);
  }

  .visual-orbit-one {
    width: min(54vw, 690px);
    height: min(54vw, 690px);
  }

  .visual-orbit-two {
    width: min(44vw, 560px);
    height: min(44vw, 560px);
  }

  .floating-badge-top {
    top: 10%;
    right: 1%;
  }

  .floating-badge-bottom {
    bottom: 12%;
    left: 1%;
  }
}

/* 功能：中小螢幕仍保持滿版背景，但允許內容自然往下延伸，避免被裁切。 */
@media (max-width: 820px) {
  .error-page {
    width: 100%;
    min-height: 100dvh;
  }
}

/* ============================================================
   404 右側白條修正
   功能：全站 app.vue 的 html 預設使用 scrollbar-gutter: stable，
   錯誤頁沒有 Header / Footer 且本身已滿版，因此這裡取消預留捲軸空間，
   避免 viewport 最右側出現一條白色空隙。
============================================================ */
:global(html),
:global(body),
:global(#__nuxt) {
  width: 100%;
  min-width: 100%;
  margin: 0;
  padding: 0;
}

:global(html) {
  scrollbar-gutter: auto !important;
  overflow-x: hidden;
  background: #fbfdfc;
}

:global(body),
:global(#__nuxt) {
  overflow-x: hidden;
  background: #fbfdfc;
}

.error-page {
  width: 100%;
  max-width: none;
}
</style>
