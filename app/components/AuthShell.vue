<template>
  <section class="auth-shell" :class="{ 'is-mobile-scrollable': mobileScrollable }">
    <div class="auth-shell-card" :class="{ 'is-wide': wide, 'is-mobile-raised': mobileRaised }">
      <aside class="auth-brand-panel">
        <NuxtLink to="/" class="auth-brand-logo" :aria-label="$ui('回到首頁')">
          <img src="@/assets/image/logo.webp" :alt="$ui('祐強醫療儀器')" />
          <span>
            <strong>{{ $ui('祐強醫療儀器有限公司') }}</strong>
            <small class="notranslate"
              >YoChung Medical Instrument Co., Ltd.</small
            >
          </span>
        </NuxtLink>

        <div class="auth-brand-copy">
          <span class="auth-eyebrow">YOCHUNG MEDICAL</span>
          <h2>{{ $ui('專業醫療設備') }}<br />{{ $ui('值得信賴的服務夥伴') }}</h2>
          <p>{{ $ui('提供產品、設備應用與售後支援，讓每一次使用都更安心。') }}</p>
        </div>

        <div class="auth-brand-decoration" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      </aside>

      <div class="auth-form-panel">
        <div class="auth-form-inner">
          <div class="auth-heading">
            <h1>{{ title }}</h1>
            <p v-if="description">{{ description }}</p>
          </div>
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    wide?: boolean;
    mobileRaised?: boolean;
    mobileScrollable?: boolean;
  }>(),
  {
    description: "",
    wide: false,
    mobileRaised: false,
    mobileScrollable: false,
  },
);
</script>

<style scoped>
.auth-shell {
  --auth-ink: #173047;
  --auth-muted: #6c7c86;
  --auth-purple: #92348a;
  --auth-purple-dark: #7f2d77;
  --auth-line: #dde5e7;
  min-height: calc(100vh - 86px);
  padding: clamp(36px, 6vw, 84px) 24px;
  background:
    radial-gradient(
      circle at 12% 18%,
      rgba(159, 199, 130, 0.12) 0 130px,
      transparent 132px
    ),
    radial-gradient(
      circle at 88% 84%,
      rgba(145, 52, 137, 0.09) 0 160px,
      transparent 162px
    ),
    #f8faf9;
}
.auth-shell-card {
  display: grid;
  grid-template-columns: minmax(320px, 0.86fr) minmax(420px, 1.14fr);
  width: min(100%, 1060px);
  min-height: 610px;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e1e8e9;
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(31, 61, 72, 0.11);
}
.auth-shell-card.is-wide {
  width: min(100%, 1180px);
}
.auth-brand-panel {
  position: relative;
  display: flex;
  padding: 38px 34px;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: linear-gradient(155deg, #7d2b73 0%, #8f3b86 52%, #a45199 100%);
}
.auth-brand-logo {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  text-decoration: none;
}
.auth-brand-logo img {
  width: 56px;
  height: 56px;
  padding: 5px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 16px;
}
.auth-brand-logo span {
  display: grid;
  gap: 3px;
}
.auth-brand-logo strong {
  font-size: 15px;
  line-height: 1.35;
}
.auth-brand-logo small {
  font-size: 9.5px;
  opacity: 0.85;
}
.auth-brand-copy {
  position: relative;
  z-index: 2;
  max-width: 330px;
  margin: auto 0;
}
.auth-eyebrow {
  display: block;
  margin-bottom: 14px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  opacity: 0.78;
}
.auth-brand-copy h2 {
  margin: 0;
  font-size: clamp(28px, 2.6vw, 35px);
  line-height: 1.35;
  letter-spacing: 0.04em;
}
.auth-brand-copy p {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.85;

  white-space: nowrap;
}
.auth-brand-decoration span {
  position: absolute;
  display: block;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
}
.auth-brand-decoration span:nth-child(1) {
  width: 210px;
  height: 210px;
  right: -70px;
  top: 80px;
  background: rgba(255, 255, 255, 0.08);
}
.auth-brand-decoration span:nth-child(2) {
  width: 120px;
  height: 120px;
  left: -42px;
  bottom: 54px;
  background: rgba(255, 255, 255, 0.07);
}
.auth-brand-decoration span:nth-child(3) {
  width: 78px;
  height: 78px;
  right: 46px;
  bottom: 36px;
  background: rgba(255, 255, 255, 0.08);
}
.auth-form-panel {
  display: flex;
  min-width: 0;
  padding: clamp(34px, 4vw, 54px);
  align-items: center;
  background: #fff;
}
.auth-form-inner {
  width: min(100%, 560px);
  margin: 0 auto;
}
.is-wide .auth-form-inner {
  width: min(100%, 680px);
}
.auth-heading {
  margin-bottom: 28px;
}
.auth-heading-kicker {
  display: block;
  margin-bottom: 8px;
  color: #3c8f91;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.auth-heading h1 {
  margin: 0;
  color: var(--auth-ink);
  font-size: clamp(30px, 3vw, 40px);
  line-height: 1.2;
}
.auth-heading p {
  margin: 10px 0 0;
  color: var(--auth-muted);
  font-size: 13.5px;
  line-height: 1.75;
}
@media (max-width: 900px) {
  .auth-brand-copy p { white-space: normal; }
  .auth-shell {
    min-height: auto;
    padding: 32px 20px 46px;
  }
  .auth-shell-card,
  .auth-shell-card.is-wide {
    grid-template-columns: 1fr;
    width: min(100%, 700px);
    min-height: 0;
  }
  .auth-brand-panel {
    padding: 26px 28px;
  }
  .auth-brand-copy,
  .auth-brand-decoration {
    display: none;
  }
  .auth-form-panel {
    padding: 34px 30px 40px;
  }
}
@media (max-width: 560px) {
  .auth-shell {
    padding: 18px 12px 34px;
    background: #fff;
  }
  .auth-shell-card,
  .auth-shell-card.is-wide {
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .auth-brand-panel {
    padding: 18px 12px 8px;
    color: var(--auth-ink);
    background: #fff;
  }
  .auth-brand-logo {
    color: var(--auth-ink);
  }
  .auth-brand-logo img {
    width: 50px;
    height: 50px;
    padding: 0;
    background: transparent;
    border-radius: 0;
  }
  .auth-form-panel {
    padding: 22px 12px 30px;
  }
  .auth-heading {
    margin-bottom: 24px;
  }
  .auth-heading h1 {
    font-size: 30px;
  }
}

/* 中小尺寸 Auth：品牌側欄完全隱藏，表單直接置中顯示 */
@media (max-width: 900px) {
  .auth-brand-panel,
  .auth-brand-logo {
    display: none !important;
  }

  .auth-shell-card,
  .auth-shell-card.is-wide {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}


/* Auth 中小尺寸最終排版：表單置中、背景完整填滿 */
@media (max-width: 900px) {
  .auth-shell {
    display: grid;
    min-height: calc(100dvh - 72px);
    padding: 24px 18px;
    place-items: center;
    background: #fff;
  }

  .auth-shell-card,
  .auth-shell-card.is-wide {
    width: min(100%, 620px);
    min-height: 0;
    margin: 0 auto;
    background: #fff;
  }

  .auth-form-panel {
    width: 100%;
    padding: 32px 28px;
    align-items: center;
    background: #fff;
  }
}

@media (max-width: 560px) {
  .auth-shell {
    min-height: calc(100dvh - 64px);
    padding: 20px 16px;
    background: #fff;
  }

  .auth-shell-card,
  .auth-shell-card.is-wide {
    width: min(100%, 500px);
    background: #fff;
  }

  .auth-form-panel {
    padding: 24px 0;
    background: #fff;
  }
}


/* Login / Forgot Password：手機版整體稍微往上提 */
@media (max-width: 900px) {
  .auth-shell-card.is-mobile-raised {
    transform: translateY(-44px);
  }
}

@media (max-width: 560px) {
  .auth-shell-card.is-mobile-raised {
    transform: translateY(-54px);
  }
}

@media (max-height: 700px) and (max-width: 560px) {
  .auth-shell-card.is-mobile-raised {
    transform: translateY(-28px);
  }
}

/* 手機版 Auth：除註冊頁外固定在可視區域，不允許上下捲動 */
@media (max-width: 900px) {
  .auth-shell {
    width: 100%;
    height: 100%;
    min-height: 0 !important;
    overflow: hidden;
  }

  .auth-shell.is-mobile-scrollable {
    height: auto;
    min-height: 100% !important;
    overflow: visible;
  }
}


/* 桌機版 Auth：完整吃滿主內容可視區，不產生垂直捲軸或右側空白 */
@media (min-width: 901px) {
  .auth-shell {
    display: grid;
    width: 100%;
    height: 100%;
    min-height: 0 !important;
    box-sizing: border-box;
    overflow: hidden;
    padding: clamp(28px, 4vh, 52px) 24px;
    place-items: center;
  }

  .auth-shell-card,
  .auth-shell-card.is-wide {
    max-height: 100%;
    min-height: min(610px, 100%);
  }
}

</style>
