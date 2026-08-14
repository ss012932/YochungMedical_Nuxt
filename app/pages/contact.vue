<template>
  <div class="contact-page">
    <!-- 聯絡我們 Hero：沿用現有公司形象圖片，依設計稿做左文右圖＋柔和漸層。 -->
    <section class="contact-hero">
      <div class="contact-hero-media">
        <img src="@/assets/image/contact.webp" alt="祐強醫療儀器有限公司" />
      </div>
      <div class="contact-hero-overlay" aria-hidden="true"></div>
      <div class="contact-hero-copy">
        <h1>{{ $ui('聯絡我們') }}</h1>
        <h2>{{ $ui('我們隨時準備為您提供專業協助') }}</h2>
        <p class="hero-description">{{ $ui('無論是產品諮詢、設備應用或售後服務歡迎透過以下方式與我們聯繫，我們將盡快為您提供協助。') }}</p>
      </div>
    </section>

    <main class="contact-main">
      <!-- 上半部：聯絡資訊＋聯絡表單 -->
      <section class="contact-grid">
        <aside class="contact-info-panel">
          <div class="panel-heading">
            <h2>{{ $ui('聯絡資訊') }}</h2>
            <span></span>
          </div>

          <div class="contact-info-list">
            <a href="tel:+88633710988" class="contact-info-item">
              <span class="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M6.5 3.5 9 8l-2 2c1.6 3.2 3.8 5.4 7 7l2-2 4.5 2.5c.4.2.6.7.5 1.2-.4 1.7-1.9 2.8-3.7 2.8C9.2 21.5 2.5 14.8 2.5 6.7c0-1.8 1.1-3.3 2.8-3.7.5-.1 1 .1 1.2.5Z" /></svg>
              </span>
              <span>
                <strong>{{ $ui('電話') }}</strong>
                <b>(03) 371-0988</b>
                <small>{{ $ui('週一至週五 09:00 - 18:00') }}</small>
              </span>
            </a>

            <a href="mailto:yochung@rongchun.com.tw" class="contact-info-item">
              <span class="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6" /></svg>
              </span>
              <span>
                <strong>{{ $ui('電子郵件') }}</strong>
                <b>yochung@rongchun.com.tw</b>
                <small>{{ $ui('我們會儘快回覆您的來信') }}</small>
              </span>
            </a>

            <a href="https://maps.google.com/?q=桃園市八德區思源街188-1號" target="_blank" class="contact-info-item">
              <span class="info-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5" /></svg>
              </span>
              <span>
                <strong>{{ $ui('公司地址') }}</strong>
                <b>{{ $ui('桃園市八德區思源街188-1號') }}</b>
                <small>{{ $ui('點擊查看 Google 地圖') }}</small>
              </span>
            </a>

          
          </div>

          <div class="contact-socials" :aria-label="$ui('社群連結')">
            <a href="https://www.instagram.com/yochungmed/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="@/assets/image/instagram.webp" alt="Instagram" /></a>
            <a href="https://lin.ee/bN5528E" target="_blank" rel="noopener noreferrer" aria-label="LINE"><img src="@/assets/image/line.webp" alt="LINE" /></a>
            <a href="https://www.facebook.com/yochung.tw/?locale=zh_TW" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><img src="@/assets/image/Facebook.webp" alt="Facebook" /></a>
          </div>

          <!-- 服務特色：整合進聯絡資訊卡底部 -->
          <section class="service-strip">
        <article v-for="item in serviceItems" :key="item.title">
          <span class="service-icon" v-html="item.icon"></span>
          <div>
            <h3>{{ $ui(item.title) }}</h3>
          </div>
        </article>
      </section>


        </aside>

        <section class="contact-form-panel">
          <div class="panel-heading form-heading">
            <div>
              <h2>{{ $ui('聯絡表單') }}</h2>
              <span></span>
            </div>
            <p>{{ $ui('請填寫以下資料，我們將盡快與您聯繫。') }}</p>
          </div>

          <form class="contact-form" @submit.prevent="submitForm">
            <div class="form-row two-cols">
              <label>
                <span>{{ $ui('姓名') }}<em>*</em></span>
                <input v-model.trim="form.name" type="text" :placeholder="$ui('請輸入您的姓名')" />
              </label>
              <label>
                <span>{{ $ui('聯絡電話') }}<em>*</em></span>
                <input v-model.trim="form.phone" type="tel" :placeholder="$ui('請輸入聯絡電話')" />
              </label>
            </div>

            <label>
              <span>{{ $ui('電子郵件') }}</span>
              <input v-model.trim="form.email" type="email" :placeholder="$ui('請輸入電子郵件')" />
            </label>

            <label>
              <span>{{ $ui('主旨') }}<em>*</em></span>
              <select v-model="form.subject">
                <option value="" disabled>{{ $ui('請選擇聯絡主題') }}</option>
                <option>{{ $ui('產品諮詢') }}</option>
                <option>{{ $ui('設備應用') }}</option>
                <option>{{ $ui('售後服務') }}</option>
                <option>{{ $ui('合作洽詢') }}</option>
                <option>{{ $ui('其他') }}</option>
              </select>
            </label>

            <label>
              <span>{{ $ui('訊息內容') }}<em>*</em></span>
              <textarea v-model.trim="form.message" rows="6" :placeholder="$ui('請輸入您的需求，我們將盡快與您聯繫...')"></textarea>
            </label>

            <label class="consent-row">
              <input v-model="form.agree" type="checkbox" />
              <span>{{ $ui('我已閱讀並同意個人資料僅用於本次聯絡用途。') }}</span>
            </label>

            <button class="submit-button" type="submit">
              <span>{{ $ui('送出訊息') }}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 16-8-6 16-3-6-7-2Z"/><path d="m11 14 9-10" /></svg>
            </button>
          </form>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'

useSeoMeta({
  title: '聯絡我們｜祐強醫療儀器有限公司',
  description: '聯絡祐強醫療儀器有限公司，取得產品諮詢、設備應用與售後服務協助。',
})

const form = reactive({
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: '',
  agree: false,
})

const serviceItems = [
  {
    title: '專業服務',
    description: '提供產品與設備應用諮詢',
    icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  },
  {
    title: '快速回覆',
    description: '工作時間內儘速回應需求',
    icon: '<svg viewBox="0 0 24 24"><path d="M13 2 5 13h6l-1 9 9-12h-6z"/></svg>',
  },
  {
    title: '完整支援',
    description: '設備、產品與售後服務協助',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"/><path d="m9 12 2 2 4-5"/></svg>',
  },
  {
    title: '客戶優先',
    description: '以實際需求提供合適建議',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.3-8.5-9C2.5 8.8 4.4 6 7.5 6c2 0 3.5 1.2 4.5 2.6C13 7.2 14.5 6 16.5 6c3.1 0 5 2.8 4 6-1.5 4.7-8.5 9-8.5 9Z"/></svg>',
  },
]

async function submitForm() {
  if (!form.name || !form.phone || !form.subject || !form.message) {
    await Swal.fire({
      icon: 'warning',
      title: '請完成必填欄位',
      text: '姓名、聯絡電話、主旨與訊息內容皆為必填。',
      confirmButtonColor: '#8c347f',
    })
    return
  }

  if (!form.agree) {
    await Swal.fire({
      icon: 'warning',
      title: '請確認個資使用說明',
      text: '勾選同意後才能送出聯絡資料。',
      confirmButtonColor: '#8c347f',
    })
    return
  }

  await Swal.fire({
    icon: 'info',
    title: '聯絡表單尚未串接送信服務',
    text: '目前頁面已完成表單介面與驗證；如需立即聯絡，請使用電話或電子郵件。',
    confirmButtonText: '知道了',
    confirmButtonColor: '#8c347f',
  })
}
</script>

<style scoped>
.contact-page {
  --ink: #173047;
  --muted: #60727d;
  --purple: #8c347f;
  --purple-soft: #f7eff6;
  --line: #e3e9ea;
  --teal: #3d9295;
  width: 100%;
  overflow: hidden;
  color: var(--ink);
  background: #fff;
}

.contact-page *,
.contact-page *::before,
.contact-page *::after { box-sizing: border-box; }

.contact-hero {
  position: relative;
  height: 360px;
  overflow: hidden;
  background: #f8faf9;
}

.contact-hero-media { position: absolute; inset: 0; }
.contact-hero-media img { width: 100%; height: 100%; object-fit: cover; object-position: center 48%; }

.contact-hero-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0 8%, rgba(137, 187, 108, .13) 0 90px, transparent 92px),
    linear-gradient(90deg, rgba(255,255,255,.99) 0%, rgba(255,255,255,.97) 24%, rgba(255,255,255,.90) 39%, rgba(255,255,255,.58) 53%, rgba(255,255,255,.12) 70%, transparent 84%);
}

.contact-hero-copy {
  position: relative;
  z-index: 2;
  display: flex;
  width: min(47%, 760px);
  height: 100%;
  padding: 52px 24px 46px max(80px, calc((100vw - 1450px) / 2));
  flex-direction: column;
  justify-content: center;
}

.hero-breadcrumb { margin: 0 0 18px; color: #765273; font-size: 12px; font-weight: 800; }
.contact-hero h1 { margin: 0; font-size: clamp(40px, 3.3vw, 54px); line-height: 1.12; letter-spacing: .05em; }
.contact-hero h2 { margin: 18px 0 12px; color: var(--purple); font-size: 20px; line-height: 1.45; }
.hero-description { max-width: 540px; margin: 0; color: #596b76; font-size: 13px; line-height: 1.85; }

.contact-main { width: min(calc(100% - 72px), 1380px); margin: 0 auto; padding: 44px 0 72px; }
.contact-grid { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 28px; align-items: stretch; }
.contact-info-panel,
.contact-form-panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 8px 24px rgba(31,61,72,.045); }
.contact-info-panel { padding: 28px 24px; }
.contact-form-panel { padding: 28px 30px 30px; }

.panel-heading h2 { margin: 0; font-size: 20px; }
.panel-heading > span,
.form-heading > div > span { display: block; width: 36px; height: 3px; margin-top: 10px; background: var(--purple); border-radius: 999px; }
.form-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.form-heading p { margin: 4px 0 0; color: #7a8991; font-size: 12px; }

.contact-info-list { display: grid; gap: 8px; margin-top: 20px; }
.contact-info-item { display: grid; grid-template-columns: 46px minmax(0,1fr); gap: 13px; padding: 12px 8px; align-items: center; color: inherit; text-decoration: none; border-radius: 12px; transition: background .18s ease; }
.contact-info-item:hover { background: #faf7fa; }
.contact-info-item.static:hover { background: transparent; }
.info-icon { display: grid; width: 44px; height: 44px; place-items: center; color: var(--purple); background: #faf5f9; border-radius: 50%; }
.info-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.contact-info-item strong { display: block; color: #526773; font-size: 10px; font-weight: 800; letter-spacing: .08em; }
.contact-info-item b { display: block; margin-top: 3px; color: var(--ink); font-size: 13px; line-height: 1.45; }
.contact-info-item small { display: block; margin-top: 3px; color: #88969d; font-size: 10.5px; line-height: 1.45; }

.support-card { display: grid; grid-template-columns: 48px minmax(0,1fr); gap: 12px 14px; margin-top: 20px; padding: 18px; color: #fff; background: linear-gradient(135deg, #7e2d75 0%, #a34391 100%); border-radius: 14px; }
.support-icon { display: grid; width: 46px; height: 46px; place-items: center; background: rgba(255,255,255,.14); border-radius: 50%; }
.support-icon svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }
.support-card strong { font-size: 13px; }
.support-card p { margin: 4px 0 0; color: rgba(255,255,255,.78); font-size: 10.5px; line-height: 1.55; }
.support-card a { grid-column: 2; width: fit-content; padding: 7px 12px; color: #7d2e74; background: #fff; border-radius: 999px; font-size: 11px; font-weight: 800; text-decoration: none; }

.contact-form { display: grid; gap: 16px; }
.form-row.two-cols { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 14px; }
.contact-form label > span { display: block; margin-bottom: 7px; color: #415965; font-size: 11px; font-weight: 800; }
.contact-form em { color: var(--purple); font-style: normal; }
.contact-form input,
.contact-form select,
.contact-form textarea { width: 100%; color: #344f5d; background: #fff; border: 1px solid #dfe6e8; border-radius: 8px; outline: none; transition: border-color .18s ease, box-shadow .18s ease; }
.contact-form input,
.contact-form select { height: 44px; padding: 0 13px; }
.contact-form textarea { padding: 12px 13px; resize: vertical; min-height: 120px; line-height: 1.65; }
.contact-form input:focus,
.contact-form select:focus,
.contact-form textarea:focus { border-color: rgba(140,52,127,.55); box-shadow: 0 0 0 3px rgba(140,52,127,.08); }
.contact-form input::placeholder,
.contact-form textarea::placeholder { color: #a1acb1; }
.consent-row { display: flex !important; align-items: center; gap: 8px; cursor: pointer; }
.consent-row input { width: 15px; height: 15px; margin: 0; accent-color: var(--purple); }
.consent-row span { margin: 0 !important; color: #6e7f87 !important; font-size: 10.5px !important; font-weight: 500 !important; }
.submit-button { display: inline-flex; min-height: 46px; align-items: center; justify-content: center; gap: 9px; cursor: pointer; color: #fff; background: linear-gradient(90deg, #7c2d74, #a44191); border: 0; border-radius: 9px; font-size: 12px; font-weight: 800; }
.submit-button svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }

.service-strip { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); margin-top: 24px; padding: 20px 22px; background: #fbfcfc; border: 1px solid #edf1f1; border-radius: 14px; }
.service-strip article { display: grid; grid-template-columns: 42px minmax(0,1fr); gap: 12px; padding: 0 22px; align-items: center; }
.service-strip article:not(:last-child) { border-right: 1px solid #e6ecec; }
.service-icon { display: grid; width: 42px; height: 42px; place-items: center; color: var(--purple); background: #faf5f9; border-radius: 50%; }
.service-icon :deep(svg) { width: 21px; height: 21px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.service-strip h3 { margin: 0; font-size: 12px; }
.service-strip p { margin: 4px 0 0; color: #7b8a91; font-size: 10px; line-height: 1.45; }

.map-section { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(280px,.65fr); margin-top: 26px; overflow: hidden; border: 1px solid var(--line); border-radius: 16px; }
.map-frame { min-height: 330px; background: #eef2f2; }
.map-frame iframe { width: 100%; height: 100%; min-height: 330px; border: 0; display: block; }
.directions-panel { padding: 28px 26px; background: #fff; }
.direction-list { display: grid; gap: 18px; margin-top: 22px; }
.direction-list strong { font-size: 12px; }
.direction-list p { margin: 4px 0 0; color: #70818a; font-size: 11px; line-height: 1.65; }
.map-link { display: inline-block; margin-top: 22px; color: var(--purple); font-size: 11px; font-weight: 800; text-decoration: none; }

@media (max-width: 1100px) {
  .contact-hero { height: 320px; }
  .contact-hero-copy { width: 54%; padding-left: 56px; }
  .contact-main { width: calc(100% - 40px); }
  .contact-grid { grid-template-columns: 320px minmax(0,1fr); gap: 20px; }
  .service-strip { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px 0; }
  .service-strip article:nth-child(2) { border-right: 0; }
}

@media (max-width: 820px) {
  .contact-hero { height: auto; background: #fff; }
  .contact-hero-media,
  .contact-hero-overlay { display: none; }
  .contact-hero-copy { width: min(100%, 760px); height: auto; margin: 0 auto; padding: 42px 28px 28px; }
  .contact-hero h1 { font-size: clamp(36px, 7vw, 46px); }
  .contact-main { width: calc(100% - 28px); padding-top: 18px; }
  .contact-grid { grid-template-columns: 1fr; }
  .contact-info-panel,
  .contact-form-panel { border-radius: 14px; }
  .contact-info-list { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .support-card { grid-column: 1 / -1; }
  .map-section { grid-template-columns: 1fr; }
  .map-frame,
  .map-frame iframe { min-height: 300px; }
}

@media (max-width: 560px) {
  .contact-hero-copy { padding: 30px 18px 20px; }
  .hero-breadcrumb { margin-bottom: 12px; font-size: 11px; }
  .contact-hero h1 { font-size: 34px; }
  .contact-hero h2 { margin-top: 13px; font-size: 18px; }
  .hero-description { font-size: 12.5px; }
  .contact-main { width: calc(100% - 20px); padding-top: 12px; }
  .contact-info-panel,
  .contact-form-panel { padding: 22px 18px; }
  .contact-info-list { grid-template-columns: 1fr; }
  .form-heading { flex-direction: column; gap: 8px; }
  .form-row.two-cols { grid-template-columns: 1fr; }
  .service-strip { grid-template-columns: 1fr; padding: 18px; }
  .service-strip article { padding: 12px 4px; border-right: 0 !important; border-bottom: 1px solid #e7ecec; }
  .service-strip article:last-child { border-bottom: 0; }
  .map-frame,
  .map-frame iframe { min-height: 260px; }
}


/* ===== Contact Info Services + Font Scale ===== */
/* 功能：將服務特色整合至聯絡資訊卡，並放大聯絡頁主要字級。 */
.panel-heading h2 { font-size: 24px !important; }
.form-heading p { font-size: 14px !important; line-height: 1.6 !important; }
.contact-info-item strong { font-size: 12px !important; }
.contact-info-item b { font-size: 15px !important; }
.contact-info-item small { font-size: 12px !important; }
.contact-form label > span { font-size: 13px !important; }
.contact-form input,
.contact-form select,
.contact-form textarea { font-size: 15px !important; }
.contact-form input::placeholder,
.contact-form textarea::placeholder { font-size: 15px !important; }
.consent-row span { font-size: 12px !important; }
.submit-button { font-size: 14px !important; }

.contact-info-panel .service-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
  padding: 18px 0 0;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--line);
  border-radius: 0;
}
.contact-info-panel .service-strip article {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 10px;
  padding: 10px 8px;
  align-items: center;
  border: 0 !important;
}
.contact-info-panel .service-icon { width: 38px; height: 38px; }
.contact-info-panel .service-icon :deep(svg) { width: 20px; height: 20px; }
.contact-info-panel .service-strip h3 { margin: 0; color: var(--ink); font-size: 13px; }
.contact-info-panel .service-strip p { margin: 3px 0 0; color: #74858d; font-size: 11.5px; line-height: 1.45; }

@media (max-width: 820px) {
  .contact-info-panel .service-strip { grid-column: 1 / -1; grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media (max-width: 560px) {
  .panel-heading h2 { font-size: 22px !important; }
  .contact-info-panel .service-strip { grid-template-columns: 1fr; }
  .contact-info-panel .service-strip article { padding: 10px 4px; }
  .contact-info-item b { font-size: 14px !important; }
  .contact-form input,
  .contact-form select,
  .contact-form textarea,
  .contact-form input::placeholder,
  .contact-form textarea::placeholder { font-size: 14px !important; }
}


/* ===== Contact Social Links + Simple Service Strip ===== */
.contact-info-panel .service-strip {
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 14px;
}
.contact-info-panel .service-strip article {
  grid-template-columns: 44px minmax(0,1fr);
  min-height: 64px;
  padding: 10px 6px;
}
.contact-info-panel .service-icon { width: 44px; height: 44px; }
.contact-info-panel .service-icon :deep(svg) { width: 23px; height: 23px; }
.contact-info-panel .service-strip h3 {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.25;
}
.contact-info-panel .service-strip p { display: none !important; }
.contact-socials {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 10px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.contact-socials a {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--purple);
  background: #faf5f9;
  border: 1px solid #f0e2ee;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  transition: .18s ease;
}
.contact-socials a:hover {
  background: #f6eaf4;
  transform: translateY(-1px);
}
.contact-socials svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}
.contact-socials a:last-child svg { fill: currentColor; stroke: none; }
@media (max-width:560px){
  .contact-info-panel .service-strip { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .contact-socials { grid-template-columns: 1fr; }
}


/* ===== Contact Social Icon Images ===== */
.contact-socials { display:flex; grid-template-columns:none; gap:12px; margin-top:18px; padding-top:18px; align-items:center; border-top:1px solid var(--line); }
.contact-socials a { display:grid; width:42px; min-height:42px; height:42px; padding:0; place-items:center; background:transparent; border:0; border-radius:50%; transition:transform .18s ease, opacity .18s ease; }
.contact-socials a:hover { background:transparent; transform:translateY(-2px); opacity:.82; }
.contact-socials img { display:block; width:32px; height:32px; object-fit:contain; }
@media (max-width:560px){ .contact-socials { display:flex; grid-template-columns:none; } }


/* ===== Contact Social Icons Centered ===== */
/* 功能：社群 icon 置中、放大，並移除社群區塊上邊線。 */
.contact-socials {
  justify-content: center !important;
  gap: 18px !important;
  margin-top: 20px !important;
  padding-top: 0 !important;
  border-top: 0 !important;
}
.contact-socials a {
  width: 48px !important;
  height: 48px !important;
  min-height: 48px !important;
}
.contact-socials img {
  width: 36px !important;
  height: 36px !important;
}

/* ============================================================
   Contact 內容物淡入
   功能：頁面背景直接顯示，只讓 Hero 文字/圖片、聯絡資訊與表單物件進場。
============================================================ */
.contact-hero-copy > *,
.contact-hero-media img,
.panel-heading,
.contact-info-item,
.contact-socials,
.contact-info-panel .service-strip article,
.form-heading,
.contact-form > * { animation: contact-content-fade-in .68s cubic-bezier(.22,1,.36,1) backwards; }
.contact-hero-media img { animation-name: contact-media-fade-in; animation-duration: .8s; }
.contact-info-item:nth-child(2), .contact-form > *:nth-child(2) { animation-delay: .06s; }
.contact-info-item:nth-child(3), .contact-form > *:nth-child(3) { animation-delay: .12s; }
.contact-info-panel .service-strip article:nth-child(2), .contact-form > *:nth-child(4) { animation-delay: .18s; }
.contact-info-panel .service-strip article:nth-child(3), .contact-form > *:nth-child(5) { animation-delay: .24s; }
.contact-info-panel .service-strip article:nth-child(4), .contact-form > *:nth-child(6) { animation-delay: .30s; }
@keyframes contact-content-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes contact-media-fade-in { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .contact-hero-copy > *, .contact-hero-media img, .panel-heading, .contact-info-item, .contact-socials, .contact-info-panel .service-strip article, .form-heading, .contact-form > * { animation: none !important; }
}

</style>