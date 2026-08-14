<template>
  <!-- ============================================================
    全站 Header
    功能：顯示祐強品牌、主要導覽、語言切換與行動版選單
    排版依照新版設計稿，但內容沿用舊 YochungMedical
  ============================================================ -->
  <header class="site-header" :class="languageLayoutClass">
    <div class="header-container">
      <!-- 品牌區：Logo + 中英文公司名稱 -->
      <NuxtLink to="/" class="brand" :aria-label="$ui('回到祐強醫療儀器首頁')" @click="closeMobileMenu">
        <img
          class="brand-logo"
          src="@/assets/image/logo.webp"
          :alt="$ui('祐強醫療儀器 Logo')"
        />

        <div class="brand-copy">
          <strong class="brand-name">
            <!-- 功能：桌機保留完整公司名稱；手機縮短英文品牌名稱，避免擠壓漢堡按鈕。 -->
            <span class="brand-name-desktop">
              {{ showLocalizedBrandName ? $ui('祐強醫療儀器有限公司') : 'YoChung Medical Instrument Co., Ltd.' }}
            </span>
            <span class="brand-name-mobile">
              {{ showLocalizedBrandName ? $ui('祐強醫療儀器有限公司') : 'YoChung Medical Instrument Co., Ltd.' }}
            </span>
          </strong>
          <span v-if="showLocalizedBrandName" class="brand-name-en notranslate">
            <span class="brand-name-desktop">YoChung Medical Instrument Co., Ltd.</span>
            <span class="brand-name-mobile">YoChung Medical Instrument Co., Ltd.</span>
          </span>
        </div>
      </NuxtLink>

      <!-- 桌面版主要導覽 -->
      <nav class="desktop-nav" :aria-label="$ui('主要導覽')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="nav-link"
          :class="{ active: isNavActive(item.to) }"
        >
          {{ $ui(item.label) }}
        </NuxtLink>

        <!-- 舊站原本就有的網站製作外部連結 -->
        <a
          class="nav-link"
          href="https://www.christylove.com.tw/"
          target="_blank"
          rel="noopener noreferrer"
        >{{ $ui('網頁製作') }}</a>

        <div v-if="authChecked && isLoggedIn" ref="accountMenuRef" class="account-menu">
          <button
            type="button"
            class="nav-link account-trigger"
            :class="{ active: route.path.startsWith(isAdmin ? '/admin' : '/member') }"
            @click="toggleAccountMenu"
          >
            {{ $ui(isAdmin ? '控制中心' : '會員中心') }}
          </button>
          <div v-if="accountMenuOpen" class="account-dropdown">
            <NuxtLink :to="isAdmin ? '/admin' : '/member'" @click="accountMenuOpen = false">{{ $ui('前往') }}</NuxtLink>
            <button type="button" @click="logout">{{ $ui('登出') }}</button>
          </div>
        </div>
        <NuxtLink
          v-else-if="authChecked"
          to="/login"
          class="nav-link"
          :class="{ active: route.path === '/login' }"
        >{{ $ui('註冊 / 登入') }}</NuxtLink>
        <span v-else class="account-placeholder" aria-hidden="true"></span>
      </nav>


      <!-- 桌面版幣值選擇器 -->
      <div ref="currencyMenuRef" class="currency-menu desktop-currency">
        <button class="currency-trigger" type="button" :aria-expanded="currencyMenuOpen" aria-haspopup="menu" @click="toggleCurrencyMenu">
          <span class="currency-symbol">{{ currentCurrency.symbol }}</span>
          <span>{{ currentCurrency.code }}</span>
          <svg class="chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
        </button>
        <div v-if="currencyMenuOpen" class="currency-dropdown" role="menu">
          <button v-for="currency in currencyOptions" :key="currency.code" type="button" role="menuitem" :class="{ selected: selectedCurrency === currency.code }" @click="changeCurrency(currency.code)">
            <span>{{ currency.symbol }}</span><strong>{{ currency.code }}</strong>
          </button>
        </div>
      </div>

      <!-- 桌面版語言選擇器 -->
      <div ref="languageMenuRef" class="language-menu desktop-language">
        <button
          class="language-trigger"
          type="button"
          :aria-expanded="languageMenuOpen"
          aria-haspopup="menu"
          @click="toggleLanguageMenu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21M12 3C9.8 5.4 8.6 8.4 8.6 12S9.8 18.6 12 21" />
          </svg>
          <span>{{ currentLanguageLabel }}</span>
          <svg class="chevron" viewBox="0 0 20 20" aria-hidden="true">
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>

        <div v-if="languageMenuOpen" class="language-dropdown" role="menu">
          <button
            v-for="language in languages"
            :key="language.code"
            type="button"
            role="menuitem"
            :class="{ selected: currentLanguage === language.code }"
            @click="changeLanguage(language.code)"
          >
            {{ language.label }}
          </button>
        </div>
      </div>

      <!-- 平板 / 手機版漢堡按鈕 -->
      <button
        class="mobile-toggle"
        type="button"
        :class="{ active: mobileMenuOpen }"
        :aria-expanded="mobileMenuOpen"
        aria-controls="mobile-navigation"
        :aria-label="$ui(mobileMenuOpen ? '關閉選單' : '開啟選單')"
        @click="toggleMobileMenu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- 行動版選單 -->
    <Transition name="mobile-nav">
      <div v-if="mobileMenuOpen" id="mobile-navigation" class="mobile-panel">
        <nav class="mobile-nav" :aria-label="$ui('行動版主要導覽')">
          <NuxtLink
            v-for="item in navItems"
            :key="`mobile-${item.label}`"
            :to="item.to"
            :class="{ active: isNavActive(item.to) }"
            @click="closeMobileMenu"
          >
            {{ $ui(item.label) }}
          </NuxtLink>

          <a
            href="https://www.christylove.com.tw/"
            target="_blank"
            rel="noopener noreferrer"
            @click="closeMobileMenu"
          >{{ $ui('網頁製作') }}</a>

          <template v-if="authChecked && isLoggedIn">
            <NuxtLink
              :to="isAdmin ? '/admin' : '/member'"
              :class="{ active: route.path.startsWith(isAdmin ? '/admin' : '/member') }"
              @click="closeMobileMenu"
            >
              {{ $ui(isAdmin ? '控制中心' : '會員中心') }}
            </NuxtLink>
            <button type="button" class="mobile-logout" @click="logout">{{ $ui('登出') }}</button>
          </template>
          <NuxtLink
            v-else-if="authChecked"
            to="/login"
            :class="{ active: route.path === '/login' }"
            @click="closeMobileMenu"
          >{{ $ui('註冊 / 登入') }}</NuxtLink>
        </nav>


        <!-- 行動版幣值選單 -->
        <div class="mobile-currency-section">
          <button type="button" class="mobile-currency-title mobile-collapse-title" :aria-expanded="mobileCurrencyOpen" @click="mobileCurrencyOpen = !mobileCurrencyOpen; if (mobileCurrencyOpen) mobileLanguageOpen = false">
            <span class="mobile-title-content"><span class="currency-symbol">{{ currentCurrency.symbol }}</span><span>{{ $ui('幣值 / Currency') }}</span></span>
            <svg class="mobile-collapse-chevron" :class="{ open: mobileCurrencyOpen }" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
          </button>
          <div v-show="mobileCurrencyOpen" class="mobile-currency-options mobile-collapse-content">
            <button v-for="currency in currencyOptions" :key="'mobile-currency-' + currency.code" type="button" :class="{ selected: selectedCurrency === currency.code }" @click="changeCurrency(currency.code)">
              <span>{{ currency.symbol }}</span><strong>{{ currency.code }}</strong>
            </button>
          </div>
        </div>

        <!-- 行動版語言選單：可收合 / 展開，操作方式與幣值區一致 -->
        <div class="mobile-language-section">
          <button
            type="button"
            class="mobile-language-title mobile-collapse-title"
            :aria-expanded="mobileLanguageOpen"
            @click="mobileLanguageOpen = !mobileLanguageOpen; if (mobileLanguageOpen) mobileCurrencyOpen = false"
          >
            <span class="mobile-title-content">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.2 2.4 3.4 5.4 3.4 9S14.2 18.6 12 21M12 3C9.8 5.4 8.6 8.4 8.6 12S9.8 18.6 12 21" />
              </svg>
              <span>{{ $ui('語言 / Language') }}</span>
            </span>
            <svg
              class="mobile-collapse-chevron"
              :class="{ open: mobileLanguageOpen }"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="m6 8 4 4 4-4" />
            </svg>
          </button>

          <div
            v-show="mobileLanguageOpen"
            class="mobile-language-options mobile-collapse-content"
          >
            <button
              v-for="language in languages"
              :key="`mobile-language-${language.code}`"
              type="button"
              :class="{ selected: currentLanguage === language.code }"
              @click="changeLanguage(language.code)"
            >
              {{ language.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 行動版選單背景遮罩 -->
    <Transition name="overlay">
      <button
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        type="button"
        :aria-label="$ui('關閉選單')"
        @click="closeMobileMenu"
      ></button>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'

// ==============================
// 導覽資料
// 說明：沿用舊站實際頁面，不使用設計稿中的範例選單文字。
// ==============================
const navItems = [
  { label: '首頁', to: '/' },
  { label: '關於祐強', to: '/about' },
  { label: '商品專區', to: '/products' },
  { label: '產品影片', to: '/video' },
  { label: '聯絡我們', to: '/contact' },
]

const languages = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'zh-CN', label: '简中' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'th', label: 'ภาษาไทย' },
]

const route = useRoute()
const router = useRouter()
const api = useApi()
const { currencyOptions, selectedCurrency, currentCurrency, loadRates, setCurrency } = useCurrency()
// 登入顯示狀態使用 Nuxt useState 保存。
// 功能：跨 layout 切換時保留已確認狀態，避免回首頁時「會員中心」短暫消失。
const headerAuthUi = useCookie<{ loggedIn: boolean; isAdmin: boolean } | null>('yochung-header-auth-ui', {
  default: () => null,
  sameSite: 'lax'
})
const isLoggedIn = useState<boolean>('header-is-logged-in', () => headerAuthUi.value?.loggedIn ?? false)
const authChecked = useState<boolean>('header-auth-checked', () => headerAuthUi.value !== null)
const isAdmin = useState<boolean>('header-is-admin', () => headerAuthUi.value?.isAdmin ?? false)
const userName = useState<string>('header-user-name', () => '')
const accountMenuOpen = ref(false)
const isCheckingAuth = ref(false)
const mobileMenuOpen = ref(false)
const languageMenuOpen = ref(false)
const currencyMenuOpen = ref(false)
const mobileCurrencyOpen = ref(false)
const mobileLanguageOpen = ref(false)

// 功能：記住開啟手機選單前的頁面位置，關閉後回到原本位置。
let mobileMenuScrollY = 0
const { locale, setLocale } = useI18n()
const uiLocale = useState<string>('ui-locale', () => 'zh-TW')
const currentLanguage = computed(() => locale.value)
const showLocalizedBrandName = computed(() => ['zh-TW', 'zh-CN'].includes(currentLanguage.value))
const languageLayoutClass = computed(() => `lang-${currentLanguage.value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`)
const languageMenuRef = ref<HTMLElement | null>(null)
const currencyMenuRef = ref<HTMLElement | null>(null)
const accountMenuRef = ref<HTMLElement | null>(null)

const currentLanguageLabel = computed(() => {
  return languages.find((item) => item.code === currentLanguage.value)?.label ?? '繁中'
})

// ==============================
// 判斷目前導覽項目
// 說明：首頁只在 / 時亮起，其餘頁面也包含子路由。
// ==============================
function isNavActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function checkAuth() {
  if (isCheckingAuth.value) return
  isCheckingAuth.value = true
  try {
    const res:any = await api.get('/auth/me')
    if (res.data.authenticated) {
      isLoggedIn.value = true
      isAdmin.value = !!res.data.isAdmin
      headerAuthUi.value = { loggedIn: true, isAdmin: isAdmin.value }
      userName.value = res.data.name || ''
    } else {
      isLoggedIn.value = false
      isAdmin.value = false
      headerAuthUi.value = { loggedIn: false, isAdmin: false }
      userName.value = ''
    }
  } catch {
    isLoggedIn.value = false
      isAdmin.value = false
      headerAuthUi.value = { loggedIn: false, isAdmin: false }
      userName.value = ''
  } finally {
    authChecked.value = true
    isCheckingAuth.value = false
  }
}

async function logout() {
  try {
    await api.post('/logout')
    // 登出 API 成功後立即同步共用狀態，不進入「尚未確認」空白狀態。
    isLoggedIn.value = false
    authChecked.value = true
    isAdmin.value = false
    headerAuthUi.value = { loggedIn: false, isAdmin: false }
    userName.value = ''
    accountMenuOpen.value = false
    mobileMenuOpen.value = false
    await router.push('/login')
  } catch {
    await Swal.fire({ icon: 'error', title: '登出失敗', text: '請稍後再試', confirmButtonText: '確定' })
  }
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  mobileCurrencyOpen.value = false
  mobileLanguageOpen.value = false
}

// ==============================
// 語言切換
// 說明：改用 Nuxt i18n 原生 setLocale，不再使用 Google Translate Cookie / reload。
// ==============================
async function changeLanguage(languageCode: string) {
  languageMenuOpen.value = false
  mobileMenuOpen.value = false

  const previousUiLocale = uiLocale.value
  uiLocale.value = languageCode

  try {
    await setLocale(languageCode)
  } catch (error) {
    // i18n 切換失敗時回復原本 UI 語言，避免顯示狀態不一致。
    uiLocale.value = previousUiLocale
    throw error
  }
}

// ==============================
// 點擊外部關閉語言選單
// ==============================
function toggleAccountMenu() {
  accountMenuOpen.value = !accountMenuOpen.value
  if (accountMenuOpen.value) { languageMenuOpen.value = false; currencyMenuOpen.value = false }
}

function toggleLanguageMenu() {
  languageMenuOpen.value = !languageMenuOpen.value
  if (languageMenuOpen.value) { accountMenuOpen.value = false; currencyMenuOpen.value = false }
}

function toggleCurrencyMenu() {
  currencyMenuOpen.value = !currencyMenuOpen.value
  if (currencyMenuOpen.value) { accountMenuOpen.value = false; languageMenuOpen.value = false }
}

async function changeCurrency(code: any) {
  currencyMenuOpen.value = false
  const changed = await setCurrency(code)
  if (!changed) {
    await Swal.fire({ icon: 'error', title: '幣值切換失敗', text: '目前無法取得匯率，請稍後再試。', confirmButtonText: '確定' })
  }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node

  if (!languageMenuRef.value?.contains(target)) {
    languageMenuOpen.value = false
  }

  if (!accountMenuRef.value?.contains(target)) {
    accountMenuOpen.value = false
  }
}

function handleResize() {
  if (window.innerWidth >= 1180) {
    mobileMenuOpen.value = false
  }
}



onMounted(() => {
  checkAuth()
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', handleResize)

  // 功能：離開頁面時保證解除手機選單的背景鎖定。
  if (import.meta.client) {
    document.documentElement.style.scrollbarGutter = ''
    document.documentElement.style.overflow = ''
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
  }
})

// ==============================
// 行動版選單開啟時鎖住背景捲動
// 說明：不能只設定 overflow:hidden，部分手機瀏覽器仍可能拖動背景。
// 這裡固定 body 並記住 scrollY，關閉後再回復原本位置。
// ==============================
function lockMobileMenuPageScroll() {
  if (!import.meta.client) return

  mobileMenuScrollY = window.scrollY

  // 功能：取消 scrollbar 預留空間，避免右側留下白邊。
  document.documentElement.style.scrollbarGutter = 'auto'
  document.documentElement.style.overflow = 'hidden'

  // 功能：固定背景頁面，漢堡選單開啟期間禁止頁面上下滑動。
  document.body.style.position = 'fixed'
  document.body.style.top = `-${mobileMenuScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

function unlockMobileMenuPageScroll() {
  if (!import.meta.client) return

  // 功能：恢復全站原本捲動設定與頁面位置。
  document.documentElement.style.scrollbarGutter = ''
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  document.body.style.overflow = ''
  window.scrollTo(0, mobileMenuScrollY)
}

watch(mobileMenuOpen, (isOpen) => {
  if (isOpen) {
    lockMobileMenuPageScroll()
    return
  }

  unlockMobileMenuPageScroll()
})

// 切換路由時自動收起選單
watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false
  mobileCurrencyOpen.value = false
  mobileLanguageOpen.value = false
  languageMenuOpen.value = false
  accountMenuOpen.value = false
  checkAuth()
})
</script>

<style scoped>
/* ============================================================
   Header 基礎版型
   說明：白底、細底線、大留白，對應設計稿的乾淨醫療品牌風格。
============================================================ */
.site-header {
  position: relative;
  z-index: 5000;
  width: 100%;
  background: rgba(255, 255, 255, 0.98);
  border-bottom: 1px solid #e9e9ec;
}

.header-container {
  display: flex;
  align-items: center;
  gap: clamp(18px, 2vw, 36px);
  width: min(100% - 48px, 1440px);
  min-height: 88px;
  margin: 0 auto;
}

/* 品牌區 */
.brand {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: #102335;
  text-decoration: none;
}

.brand-logo {
  display: block;
  width: 58px;
  height: 58px;
  object-fit: contain;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.brand-name {
  font-size: clamp(17px, 1.05vw, 22px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.brand-name-en {
  font-size: clamp(11px, 0.72vw, 14px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.015em;
  white-space: nowrap;
}

/* 功能：預設顯示完整品牌名稱；手機版才切換為短版英文名稱。 */
.brand-name-mobile {
  display: none;
}

/* 桌面導覽 */
.desktop-nav {
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: flex-end;
  gap: clamp(16px, 2.1vw, 40px);
  align-self: stretch;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 0 2px;
  color: #102335;
  font-size: clamp(14px, 0.86vw, 17px);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.nav-link::after {
  position: absolute;
  right: 0;
  bottom: 26px;
  left: 0;
  height: 2px;
  content: '';
  background: #8f3b86;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #762f71;
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

/* 會員選單 */
.account-placeholder { display:block; min-width:88px; }
.account-placeholder{display:block;min-width:88px;}
.account-menu { position: relative; display:flex; align-items:stretch; }
.account-trigger { border:0; background:transparent; cursor:pointer; font-family:inherit; }
.account-dropdown { position:absolute; top:calc(100% - 18px); right:0; z-index:5200; min-width:130px; padding:8px; background:#fff; border:1px solid #e3e4e7; border-radius:8px; box-shadow:0 14px 36px rgba(26,34,43,.14); }
.account-dropdown a, .account-dropdown button { display:block; width:100%; padding:10px 12px; color:#263849; font:inherit; font-size:14px; text-align:left; text-decoration:none; cursor:pointer; background:transparent; border:0; border-radius:7px; }
.account-dropdown a:hover, .account-dropdown button:hover { color:#762f71; background:#f7eff6; }

/* 語言選擇器 */
.language-menu {
  position: relative;
  flex: 0 0 auto;
}

.language-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 116px;
  min-height: 46px;
  padding: 0 14px;
  color: #14283b;
  font: inherit;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  background: #fff;
  border: 1px solid #cfd2d6;
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.language-trigger:hover,
.language-trigger:focus-visible {
  border-color: #8f3b86;
  box-shadow: 0 0 0 3px rgba(143, 59, 134, 0.09);
  outline: none;
}

.language-trigger svg,
.mobile-language-title svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.language-trigger .chevron {
  width: 15px;
  height: 15px;
  margin-left: auto;
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 180px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e3e4e7;
  border-radius: 8px;
  box-shadow: 0 14px 36px rgba(26, 34, 43, 0.14);
}

.language-dropdown button {
  width: 100%;
  padding: 10px 12px;
  color: #263849;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 7px;
}

.language-dropdown button:hover,
.language-dropdown button.selected {
  color: #762f71;
  background: #f7eff6;
}

/* 行動版按鈕 */
.mobile-toggle {
  display: none;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  padding: 9px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d8dade;
  border-radius: 8px;
}

.mobile-toggle span {
  display: block;
  width: 100%;
  height: 2px;
  margin: 5px 0;
  background: #14283b;
  border-radius: 999px;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.mobile-toggle.active span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-toggle.active span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.mobile-panel,
.mobile-overlay {
  display: none;
}

/* ============================================================
   1180px 以下切換成行動版導覽
============================================================ */
@media (max-width: 1179px) {
  .header-container {
    width: min(100% - 36px, 1100px);
    min-height: 82px;
  }

  .brand-logo {
    width: 52px;
    height: 52px;
  }

  .brand-name {
    font-size: clamp(16px, 2.1vw, 21px);
  }

  .brand-name-en {
    font-size: clamp(10px, 1.3vw, 13px);
  }

  .desktop-nav,
  .desktop-language {
    display: none;
  }

  .mobile-toggle {
    display: block;
    margin-left: auto;
  }

  .mobile-panel {
    position: fixed;
    z-index: 5100;
    top: 82px;
    right: 0;
    display: block;
    width: min(88vw, 390px);
    height: calc(100dvh - 82px);
    padding: 22px 24px 36px;
    overflow-y: auto;
    background: #fff;
    box-shadow: -12px 20px 40px rgba(25, 35, 45, 0.16);
  }

  .mobile-overlay {
    position: fixed;
    z-index: 5050;
    inset: 82px 0 0;
    display: block;
    width: 100%;
    padding: 0;
    cursor: default;
    background: rgba(16, 35, 53, 0.32);
    border: 0;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
  }

  .mobile-nav a,
  .mobile-nav .mobile-logout {
    padding: 15px 4px;
    color: #14283b;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px solid #ececef;
  }

  .mobile-nav a.active {
    color: #8f3b86;
  }

  /* 行動版登出：移除瀏覽器原生 button 外觀，維持側滑導覽一致性 */
  .mobile-nav .mobile-logout {
    width: 100%;
    margin: 0;
    padding: 15px 4px;
    text-align: left;
    color: #a14555;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-bottom: 1px solid #ececef;
    border-radius: 0;
    appearance: none;
    transition: color .2s ease, background-color .2s ease, padding-left .2s ease;
  }

  .mobile-nav .mobile-logout:hover,
  .mobile-nav .mobile-logout:focus-visible {
    padding-left: 10px;
    color: #8f3347;
    background: #fff7f8;
    outline: none;
  }

  .mobile-language-section {
    padding-top: 24px;
  }

  .mobile-language-title {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 13px;
    color: #14283b;
    font-size: 14px;
    font-weight: 800;
  }

  .mobile-language-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .mobile-language-options button {
    padding: 10px 8px;
    color: #35485b;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    background: #f7f7f8;
    border: 1px solid transparent;
    border-radius: 7px;
  }

  .mobile-language-options button.selected {
    color: #762f71;
    background: #f8f0f7;
    border-color: rgba(143, 59, 134, 0.22);
  }
}

@media (max-width: 640px) {
  .header-container {
    width: min(100% - 24px, 600px);
    min-height: 72px;
    gap: 8px;
  }

  .brand {
    gap: 8px;
  }

  .brand-logo {
    width: 44px;
    height: 44px;
  }

  .brand-name {
    max-width: calc(100vw - 128px);
    overflow: visible;
    font-size: 12.5px;
    line-height: 1.18;
    text-overflow: clip;
    white-space: normal;
  }

  /* 功能：手機版仍顯示完整公司名稱，允許自然換行避免被漢堡按鈕擠壓。 */
  .brand-name-desktop {
    display: none;
  }

  .brand-name-mobile {
    display: inline;
    white-space: normal;
  }

  .brand-name-en {
    max-width: calc(100vw - 128px);
    overflow: visible;
    font-size: 8.5px;
    line-height: 1.18;
    text-overflow: clip;
    white-space: normal;
  }

  .mobile-panel {
    top: 72px;
    height: calc(100dvh - 72px);
  }

  .mobile-overlay {
    inset: 72px 0 0;
  }
}

/* 動畫 */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after,
  .mobile-nav-enter-active,
  .mobile-nav-leave-active,
  .overlay-enter-active,
  .overlay-leave-active,
  .mobile-toggle span {
    transition-duration: 0.01ms !important;
  }
}


/* ============================================================
   FINAL OVERRIDE：所有語言共用同一套桌機 Header
   功能：繁中、簡中、英、日、韓、越、泰全部使用相同的
   品牌區 / 導覽列 / 幣值 / 語言水平排列，不再依語言改版型。
============================================================ */
@media (min-width: 1180px) {
  .site-header .header-container {
    display: grid !important;
    grid-template-columns: minmax(360px, 430px) minmax(0, 1fr) auto auto !important;
    align-items: center !important;
    width: min(calc(100% - 32px), 1680px) !important;
    max-width: 1680px !important;
    min-height: 88px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    column-gap: clamp(14px, 1.3vw, 26px) !important;
  }

  .site-header .brand {
    display: flex !important;
    min-width: 0 !important;
    max-width: 430px !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 10px !important;
    margin: 0 !important;
  }

  .site-header .brand-logo {
    width: 52px !important;
    height: 52px !important;
    flex: 0 0 52px !important;
  }

  .site-header .brand-copy {
    display: flex !important;
    min-width: 0 !important;
    align-items: flex-start !important;
    justify-content: center !important;
    text-align: left !important;
  }

  .site-header .brand-name {
    max-width: none !important;
    overflow: visible !important;
    font-size: clamp(16px, 1vw, 20px) !important;
    line-height: 1.2 !important;
    letter-spacing: 0 !important;
    text-overflow: clip !important;
    white-space: nowrap !important;
  }

  .site-header .brand-name-en {
    max-width: 100% !important;
    overflow: hidden !important;
    font-size: clamp(10px, 0.68vw, 13px) !important;
    line-height: 1.2 !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  .site-header .desktop-nav {
    display: flex !important;
    min-width: 0 !important;
    height: 88px !important;
    align-self: stretch !important;
    align-items: stretch !important;
    justify-content: flex-end !important;
    gap: clamp(10px, 1.1vw, 24px) !important;
  }

  .site-header .nav-link {
    display: flex !important;
    min-width: 0 !important;
    min-height: 88px !important;
    align-items: center !important;
    padding: 0 0 2px !important;
    font-size: clamp(13px, 0.8vw, 16px) !important;
    line-height: 1.35 !important;
    white-space: nowrap !important;
  }

  .site-header .nav-link::after {
    bottom: 24px !important;
  }

  .site-header .desktop-currency,
  .site-header .desktop-language {
    flex: 0 0 auto !important;
    align-self: center !important;
    margin: 0 !important;
  }

  .site-header .currency-trigger,
  .site-header .language-trigger {
    min-height: 44px !important;
    padding-right: 12px !important;
    padding-left: 12px !important;
    font-size: 13px !important;
    line-height: 1.35 !important;
  }

  .site-header .currency-trigger {
    min-width: 112px !important;
  }

  .site-header .language-trigger {
    min-width: 116px !important;
  }

  /* 功能：繁體中文、簡體中文的導覽文字較短，可使用較大的字級與間距提升閱讀性。 */
  :is(.site-header.lang-zh-tw, .site-header.lang-zh-cn) .desktop-nav {
    gap: clamp(18px, 1.55vw, 30px) !important;
  }

  :is(.site-header.lang-zh-tw, .site-header.lang-zh-cn) .nav-link {
    font-size: clamp(15px, 0.92vw, 17px) !important;
    font-weight: 700 !important;
  }
}

/* ===== Header 下拉選單文字置中 ===== */
.account-dropdown > a,
.account-dropdown > button,
.language-dropdown > button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  text-align: center !important;
}

.language-dropdown > button.selected {
  justify-content: center !important;
  text-align: center !important;
}


/* ===== Header Dropdown：與觸發按鈕等寬並左緣對齊 ===== */
.account-menu,
.language-menu {
  position: relative !important;
}

.account-dropdown,
.language-dropdown {
  top: calc(100% + 10px) !important;
  left: 0 !important;
  right: auto !important;
  width: 100% !important;
  min-width: 100% !important;
  box-sizing: border-box !important;
}

.account-dropdown > a,
.account-dropdown > button,
.language-dropdown > button {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  min-height: 40px;
  padding-left: 8px !important;
  padding-right: 8px !important;
  text-align: center !important;
  white-space: nowrap;
}


/* 會員中心下拉選單：往上靠近觸發按鈕 */
.account-dropdown {
  top: calc(100% + 4px) !important;
}


/* 會員中心下拉選單：幾乎貼齊觸發按鈕 */
.account-dropdown {
  top: calc(100% + 1px) !important;
}


/* 會員中心下拉：貼近會員中心底線 */
.account-dropdown {
  top: calc(100% - 18px) !important;
}


/* ===== 全站幣值選擇器 ===== */
.currency-menu{position:relative;flex:0 0 auto}.currency-trigger{display:flex;align-items:center;gap:7px;min-width:112px;min-height:46px;padding:0 12px;color:#14283b;font:inherit;font-size:13px;font-weight:750;cursor:pointer;background:#fff;border:1px solid #cfd2d6;border-radius:8px}.currency-trigger:hover,.currency-trigger:focus-visible{border-color:#8f3b86;box-shadow:0 0 0 3px rgba(143,59,134,.09);outline:none}.currency-trigger .currency-symbol{color:#8f3b86;font-weight:850}.currency-trigger .chevron{width:15px;height:15px;margin-left:auto;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.8}.currency-dropdown{position:absolute;z-index:5200;top:calc(100% + 10px);left:0;width:100%;min-width:112px;padding:8px;background:#fff;border:1px solid #e3e4e7;border-radius:8px;box-shadow:0 14px 36px rgba(26,34,43,.14);box-sizing:border-box}.currency-dropdown button{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:40px;padding:8px;color:#263849;font:inherit;font-size:13px;cursor:pointer;background:transparent;border:0;border-radius:7px}.currency-dropdown button:hover,.currency-dropdown button.selected{color:#762f71;background:#f7eff6}.currency-dropdown button span{min-width:25px;text-align:right;font-weight:800}.currency-dropdown button strong{min-width:34px;text-align:left;font-weight:750}.mobile-currency-section{margin-top:20px;padding-top:20px;border-top:1px solid #e8ecee}.mobile-currency-title{display:flex;align-items:center;gap:9px;margin-bottom:12px;color:#14283b;font-size:13px;font-weight:800}.mobile-currency-title .currency-symbol{color:#8f3b86;font-size:15px}.mobile-currency-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.mobile-currency-options button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:8px;border:1px solid #e2e7e9;border-radius:8px;background:#fff;color:#263849;font:inherit;font-size:13px;cursor:pointer}.mobile-currency-options button.selected{color:#762f71;border-color:#e3cfe0;background:#f7eff6}@media(max-width:1179px){.desktop-currency{display:none}}

/* 行動版幣值 / 語言折疊區 */
@media (max-width: 1179px) {
  .mobile-collapse-title {
    width: 100%;
    padding: 0;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .mobile-currency-title.mobile-collapse-title,
  .mobile-language-title.mobile-collapse-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
    padding: 4px 0 12px;
    text-align: left;
  }

  .mobile-title-content {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .mobile-collapse-chevron {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    fill: none;
    stroke: #657586;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
    transition: transform .2s ease;
  }

  .mobile-collapse-chevron.open {
    transform: rotate(180deg);
  }

  .mobile-collapse-content {
    margin-top: 4px;
    margin-bottom: 8px;
  }

  .mobile-language-section {
    padding-top: 14px;
  }
}
</style>
