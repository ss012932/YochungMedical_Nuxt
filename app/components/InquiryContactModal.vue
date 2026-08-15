<template>
  <!-- 功能：共用洽詢客服懸浮框，可由首頁推薦商品與商品專區共同使用。 -->
  <Transition name="inquiry-fade">
    <div v-if="isVisible" class="inquiry-modal">
      <section
        class="inquiry-modal-panel"
        role="dialog"
        aria-modal="true"
        :aria-label="$ui('洽詢客服')"
      >
        <!-- 功能：關閉洽詢客服懸浮框。 -->
        <button
          type="button"
          class="inquiry-modal-close"
          :aria-label="$ui('關閉')"
          @click="emit('close')"
        >
          ×
        </button>

        <!-- 功能：顯示目前正在洽詢的商品名稱與說明。 -->
        <div class="inquiry-modal-heading">
          <h2>{{ $ui("洽詢客服") }}</h2>
          <p v-if="productName">
            {{ $ui("您正在洽詢") }}：<strong>{{ $ui(productName) }}</strong>
          </p>
          <small>
            {{
              $ui(
                "歡迎選擇以下方式聯絡我們，我們將盡快為您提供產品價格、規格與採購資訊。",
              )
            }}
          </small>
        </div>

        <!-- 功能：電話與電子郵件聯絡方式。 -->
        <div class="inquiry-contact-grid">
          <a class="inquiry-contact-card" href="tel:+88633710988">
            <span class="inquiry-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M6.5 3.5 9 8l-2 2c1.6 3.2 3.8 5.4 7 7l2-2 4.5 2.5c.4.2.6.7.5 1.2-.4 1.7-1.9 2.8-3.7 2.8C9.2 21.5 2.5 14.8 2.5 6.7c0-1.8 1.1-3.3 2.8-3.7.5-.1 1 .1 1.2.5Z"
                />
              </svg>
            </span>
            <span>
              <b>{{ $ui("電話") }}</b>
              <small>(03) 371-0988</small>
            </span>
          </a>

          <a class="inquiry-contact-card" href="mailto:yochung@rongchun.com.tw">
            <span class="inquiry-contact-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </span>
            <span>
              <b>{{ $ui("電子郵件") }}</b>
              <small>yochung@rongchun.com.tw</small>
            </span>
          </a>
        </div>

        <!-- 功能：LINE 快速洽詢入口。 -->
        <a
          class="inquiry-line-btn"
          href="https://lin.ee/bN5528E"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="@/assets/image/line.webp" alt="LINE" />
          <span>{{ $ui("使用 LINE 洽詢") }}</span>
        </a>

        <!-- 功能：社群平台快速連結。 -->
        <div class="inquiry-social-row">
          <span>{{ $ui("社群平台") }}</span>
          <div class="inquiry-social-links">
            <a
              href="https://www.instagram.com/yochungmed/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <img src="@/assets/image/instagram.webp" alt="Instagram" />
            </a>
            <a
              href="https://www.facebook.com/yochung.tw/?locale=zh_TW"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <img src="@/assets/image/Facebook.webp" alt="Facebook" />
            </a>
            <a
              href="https://lin.ee/bN5528E"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LINE"
            >
              <img src="@/assets/image/line.webp" alt="LINE" />
            </a>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
// 功能：接收是否顯示與目前洽詢商品名稱，讓不同頁面共用同一個客服框。
withDefaults(
  defineProps<{
    isVisible?: boolean;
    productName?: string;
  }>(),
  {
    isVisible: false,
    productName: "",
  },
);

// 功能：由父層決定關閉後要保留哪個商品懸浮框。
const emit = defineEmits<{
  close: [];
}>();
</script>

<style scoped>
/* ============================================================
   共用洽詢客服 Modal
   功能：覆蓋在商品或首頁推薦商品 Modal 上方。
============================================================ */
.inquiry-modal {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 13000;
  width: 100vw;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(20, 39, 48, 0.58);
  backdrop-filter: blur(8px);
}

.inquiry-modal-panel {
  position: relative;
  width: min(100%, 620px);
  padding: clamp(26px, 4vw, 42px);
  border: 1px solid #e1e8e9;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 28px 70px rgba(20, 40, 50, 0.24);
}

.inquiry-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  border: 1px solid #d9e2e4;
  border-radius: 50%;
  background: #fff;
  color: #46606d;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.inquiry-modal-heading {
  padding-right: 48px;
}

.inquiry-eyebrow {
  color: #30919a;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.14em;
}

.inquiry-modal-heading h2 {
  margin: 8px 0 12px;
  color: #173247;
  font-size: clamp(28px, 4vw, 38px);
}

.inquiry-modal-heading p {
  margin: 0;
  color: #405b68;
  font-size: 15px;
  line-height: 1.7;
}

.inquiry-modal-heading small {
  display: block;
  margin-top: 10px;
  color: #7c8e97;
  font-size: 13px;
  line-height: 1.7;
}

.inquiry-contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 26px;
}

.inquiry-contact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 16px;
  border: 1px solid #dfe7e8;
  border-radius: 14px;
  color: #24404f;
  text-decoration: none;
  background: #fbfcfc;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.inquiry-contact-card:hover {
  border-color: #c493bb;
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(82, 55, 78, 0.08);
}

.inquiry-contact-icon {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #943f86;
  background: #f7edf5;
}

.inquiry-contact-icon svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.inquiry-contact-card span:last-child {
  min-width: 0;
}

.inquiry-contact-card b {
  display: block;
  font-size: 13px;
}

.inquiry-contact-card small {
  display: block;
  margin-top: 4px;
  color: #6f818a;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.inquiry-line-btn {
  min-height: 48px;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  background: #06c755;
  color: #fff;
  text-decoration: none;
  font-weight: 850;
}

.inquiry-line-btn img {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

.inquiry-social-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #e7ecec;
  color: #70838d;
  font-size: 12px;
}

.inquiry-social-links {
  display: flex;
  gap: 10px;
}

.inquiry-social-links a {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid #e0e7e8;
  border-radius: 50%;
  background: #fff;
}

.inquiry-social-links img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.inquiry-fade-enter-active,
.inquiry-fade-leave-active {
  transition: opacity 0.2s ease;
}

.inquiry-fade-enter-from,
.inquiry-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .inquiry-modal {
    padding: 14px;
  }

  .inquiry-modal-panel {
    padding: 26px 18px 22px;
    border-radius: 18px;
  }

  .inquiry-modal-heading {
    padding-right: 44px;
  }

  .inquiry-contact-grid {
    grid-template-columns: 1fr;
  }

  .inquiry-social-row {
    align-items: flex-start;
  }
}
</style>
