<template>
  <!-- ============================================================
    全站 Footer
    功能：品牌資訊、快速連結、聯絡資料與版權資訊
    外觀依照新版設計稿，內容沿用舊 YochungMedical
  ============================================================ -->
  <footer class="site-footer">
    <!-- Footer 主內容 -->
    <div class="footer-main">
      <!-- 左右裝飾圓形：純 CSS 製作，不使用設計稿內的範例圖片 -->
      <div class="decoration decoration-left" aria-hidden="true">
        <span class="circle circle-green"></span>
        <span class="circle circle-purple"></span>
      </div>

      <div class="decoration decoration-right" aria-hidden="true">
        <span class="circle circle-green"></span>
        <span class="circle circle-purple"></span>
      </div>

      <div class="footer-container">
        <!-- 品牌資訊 -->
        <section class="footer-brand" :aria-label="$ui('祐強醫療儀器公司資訊')">
          <NuxtLink to="/" class="footer-logo-link" :aria-label="$ui('回到祐強醫療儀器首頁')">
            <img
              class="footer-logo"
              src="@/assets/image/logo.webp"
              :alt="$ui('祐強醫療儀器 Logo')"
            />

            <div class="footer-brand-copy">
              <strong>{{ $ui('祐強醫療儀器有限公司') }}</strong>
              <span class="notranslate">YoChung Medical Instrument Co., Ltd.</span>
            </div>
          </NuxtLink>

          <!-- 使用舊站既有 SEO 描述，不採用設計稿範例文案 -->
          <p class="footer-description">{{ $ui('祐強醫療儀器，提供高品質醫療設備與技術支援，服務全台醫療院所。') }}</p>
        </section>

        <!-- 快速連結 -->
        <section class="footer-links" aria-labelledby="footer-links-title">
          <h2 id="footer-links-title">{{ $ui('快速連結') }}</h2>

          <nav :aria-label="$ui('Footer 快速連結')">
            <NuxtLink to="/">{{ $ui('首頁') }}</NuxtLink>
            <NuxtLink to="/about">{{ $ui('關於祐強') }}</NuxtLink>
            <NuxtLink to="/products">{{ $ui('商品專區') }}</NuxtLink>
            <NuxtLink to="/video">{{ $ui('產品影片') }}</NuxtLink>
            <NuxtLink to="/contact">{{ $ui('聯絡我們') }}</NuxtLink>
          </nav>
        </section>

        <!-- 聯絡資訊 -->
        <section class="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">{{ $ui('聯絡我們') }}</h2>

          <address>
            <a href="tel:+88633710988" class="contact-row">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7.6 3.8 5.3 5.1c-.7.4-1 1.2-.8 2 1.3 5.5 5.9 10.1 11.4 11.4.8.2 1.6-.1 2-.8l1.3-2.3c.4-.7.2-1.6-.5-2l-2.8-1.6c-.6-.3-1.3-.2-1.7.3l-1.2 1.4a13 13 0 0 1-2.5-2.1 13 13 0 0 1-2.1-2.5l1.4-1.2c.5-.4.6-1.1.3-1.7L9.6 4.3c-.4-.7-1.3-.9-2-.5Z" />
              </svg>
              <span>(03) 371-0988</span>
            </a>

            <a href="mailto:yochung@rongchun.com.tw" class="contact-row">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
                <path d="m4.5 7 7.5 6 7.5-6" />
              </svg>
              <span>yochung@rongchun.com.tw</span>
            </a>

            <a
              class="contact-row"
              href="https://maps.google.com/?q=桃園市八德區思源街188-1號"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
                <circle cx="12" cy="10" r="2" />
              </svg>
              <span>{{ $ui('桃園市八德區思源街188-1號') }}</span>
            </a>
          </address>

          <div class="footer-socials" :aria-label="$ui('祐強社群連結')">
            <a href="https://www.instagram.com/yochungmed/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><img src="@/assets/image/instagram.webp" alt="Instagram" /></a>
            <a href="https://lin.ee/bN5528E" target="_blank" rel="noopener noreferrer" aria-label="LINE"><img src="@/assets/image/line.webp" alt="LINE" /></a>
            <a href="https://www.facebook.com/yochung.tw/?locale=zh_TW" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><img src="@/assets/image/Facebook.webp" alt="Facebook" /></a>
          </div>
        </section>
      </div>
    </div>

    <!-- Footer 底部紫色版權列 -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <span>© {{ currentYear }} {{ $ui('祐強醫療儀器有限公司 版權所有') }}</span>
        <span class="footer-divider" aria-hidden="true">|</span>
        <span>{{ $ui('Design by 彩虹小馬工作室') }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 版權年份自動使用目前年份，避免每年手動修改。
const currentYear = new Date().getFullYear()
</script>

<style scoped>
/* ============================================================
   Footer 主內容
   說明：以白色大區塊 + 左右半透明圓形裝飾，對應設計稿視覺。
============================================================ */
.site-footer {
  width: 100%;
  color: #263444;
  background: #fff;
}

.footer-main {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  background: #fff;
  border-top: 1px solid #ececef;
}

.footer-container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(320px, 1.45fr) minmax(160px, 0.65fr) minmax(300px, 1fr);
  gap: clamp(44px, 6vw, 110px);
  width: min(100% - 64px, 1680px);
  padding: 48px 0 42px;
  margin: 0 auto;
}

/* 左側品牌區 */
.footer-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  color: #253343;
  text-decoration: none;
}

.footer-logo {
  display: block;
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.footer-brand-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-brand-copy strong {
  font-size: clamp(16px, 0.95vw, 19px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.03em;
}

.footer-brand-copy span {
  font-size: clamp(10px, 0.66vw, 13px);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.footer-description {
  max-width: 420px;
  margin: 20px 0 0;
  color: #526170;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.75;
  letter-spacing: 0.03em;
}

/* 標題 */
.footer-links h2,
.footer-contact h2 {
  margin: 0 0 16px;
  color: #263444;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

/* 快速連結 */
.footer-links {
  position: relative;
  padding-right: 44px;
}

.footer-links::after {
  position: absolute;
  top: 12px;
  right: 0;
  width: 1px;
  height: 175px;
  content: '';
  background: #e2e3e6;
}

.footer-links nav {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.footer-links a {
  position: relative;
  color: #445363;
  font-size: 11.5px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.18s ease, transform 0.18s ease;
}

.footer-links a:hover,
.footer-links a.router-link-active {
  color: #8f3b86;
  transform: translateX(3px);
}

/* 聯絡資訊 */
.footer-contact address {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-style: normal;
}

.contact-row {
  display: grid;
  grid-template-columns: 21px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  color: #445363;
  font-size: 11.5px;
  line-height: 1.55;
  text-decoration: none;
  transition: color 0.18s ease;
}

.contact-row:hover {
  color: #8f3b86;
}

.contact-row svg {
  width: 17px;
  height: 17px;
  margin-top: 2px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

/* ============================================================
   左右裝飾圓形
   說明：只使用 CSS 建立淡綠、淡紫裝飾，避免額外圖片資產。
============================================================ */
.decoration {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.decoration .circle {
  position: absolute;
  display: block;
  border-radius: 50%;
}

.decoration-left {
  bottom: -86px;
  left: -78px;
  width: 260px;
  height: 260px;
}

.decoration-left .circle-green {
  right: 0;
  bottom: 0;
  width: 210px;
  height: 210px;
  background: rgba(166, 197, 133, 0.42);
}

.decoration-left .circle-purple {
  top: -62px;
  left: -34px;
  width: 150px;
  height: 150px;
  background: rgba(171, 109, 160, 0.14);
}

.decoration-right {
  right: -92px;
  bottom: -54px;
  width: 300px;
  height: 240px;
}

.decoration-right .circle-green {
  top: 0;
  left: 0;
  width: 176px;
  height: 176px;
  background: rgba(166, 197, 133, 0.3);
}

.decoration-right .circle-purple {
  right: 0;
  bottom: 0;
  width: 220px;
  height: 220px;
  background: rgba(143, 59, 134, 0.33);
}

/* ============================================================
   底部版權列
============================================================ */
.footer-bottom {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  min-height: 52px;
  color: #fff;
  background: linear-gradient(90deg, #7b246f 0%, #913a85 48%, #772268 100%);
}

.footer-bottom-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: min(100% - 32px, 1500px);
  margin: 0 auto;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-align: center;
}

.footer-divider {
  opacity: 0.68;
}

/* ============================================================
   平板響應式
============================================================ */
@media (max-width: 1000px) {
  .footer-container {
    grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
    gap: 42px 70px;
    width: min(100% - 48px, 900px);
    padding: 44px 0 40px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-description {
    max-width: 620px;
  }

  .footer-links::after {
    height: 155px;
  }
}

/* ============================================================
   手機響應式
============================================================ */
@media (max-width: 640px) {
  .footer-main {
    min-height: auto;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 38px;
    width: min(100% - 40px, 560px);
    padding: 48px 0 44px;
  }

  .footer-brand {
    grid-column: auto;
  }

  .footer-logo-link {
    gap: 11px;
  }

  .footer-logo {
    width: 48px;
    height: 48px;
  }

  .footer-brand-copy strong {
    font-size: 15px;
  }

  .footer-brand-copy span {
    font-size: 9px;
  }

  .footer-description {
    margin-top: 20px;
    font-size: 13px;
    line-height: 1.75;
  }

  .footer-links {
    padding-right: 0;
  }

  .footer-links::after {
    display: none;
  }

  .footer-links nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 13px 20px;
  }

  .footer-links a:hover,
  .footer-links a.router-link-active {
    transform: none;
  }

  .decoration-left {
    bottom: -90px;
    left: -110px;
    transform: scale(0.72);
  }

  .decoration-right {
    right: -135px;
    bottom: -70px;
    transform: scale(0.68);
  }

  .footer-bottom {
    min-height: 66px;
    padding: 12px 0;
  }

  .footer-bottom-content {
    flex-direction: column;
    gap: 4px;
    font-size: 11px;
  }

  .footer-divider {
    display: none;
  }
}


/* ===== Footer Social Links ===== */
.footer-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}
.footer-socials a {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #445363;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: none;
  transition: color .18s ease, transform .18s ease;
}
.footer-socials a:hover {
  color: #8f3b86;
  transform: translateY(-1px);
}
.footer-socials svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}
.footer-socials a:last-child svg { fill: currentColor; stroke: none; }
@media (max-width:640px){
  .footer-socials { gap: 14px 18px; }
  .footer-socials a { font-size: 12px; }
}


/* ===== Footer Social Icon Images ===== */
.footer-socials { display:flex; gap:12px; margin-top:18px; align-items:center; }
.footer-socials a { display:grid; width:36px; height:36px; padding:0; place-items:center; color:inherit; background:transparent; border:0; border-radius:50%; text-decoration:none; transition:transform .18s ease, opacity .18s ease; }
.footer-socials a:hover { transform:translateY(-2px); opacity:.82; }
.footer-socials img { display:block; width:28px; height:28px; object-fit:contain; }

.rates-credit{color:inherit;text-decoration:none;opacity:.82}.rates-credit:hover{text-decoration:underline;opacity:1}
</style>
