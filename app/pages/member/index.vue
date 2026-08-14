<template>
  <div class="member-page">
    <!-- 會員中心頁首：主標與頁內導覽整合成一個前台式區塊 -->
    <section class="member-hero">
      <div class="member-container member-hero-inner">
        <div class="member-hero-copy">
          <span class="member-kicker">MEMBER SERVICE</span>
          <h1>{{ $ui('會員中心') }}</h1>
          <p>{{ $ui('登入後即可使用購物車與會員相關服務。') }}</p>
        </div>

        <nav class="member-section-nav" :aria-label="$ui('會員中心')">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="member-section-link"
            :class="{ active: activeTab === tab.key }"
            @click="changeTab(tab.key)"
          >
            <i :class="tab.icon" aria-hidden="true"></i>
            <span>{{ $ui(tab.label) }}</span>
          </button>
        </nav>
      </div>
    </section>

    <!-- 會員功能內容：維持單一 /member 頁面 -->
    <section class="member-workspace">
      <div class="member-container">
        <div class="member-section-content">
          <KeepAlive>
            <component :is="activeComponent" />
          </KeepAlive>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MemberOverview from '~/components/member/MemberOverview.vue'
import MemberOrders from '~/components/member/MemberOrders.vue'
import MemberProfile from '~/components/member/MemberProfile.vue'

definePageMeta({
  layout: 'default',
  middleware: 'member-auth'
})

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'overview', label: '商品推薦', icon: 'fas fa-house' },
  { key: 'orders', label: '我的訂單', icon: 'fas fa-shopping-bag' },
  { key: 'profile', label: '個人資料', icon: 'fas fa-user' }
] as const

type MemberTab = typeof tabs[number]['key']

const activeTab = computed<MemberTab>(() => {
  const tab = String(route.query.tab || 'overview')
  return tabs.some((item) => item.key === tab) ? (tab as MemberTab) : 'overview'
})

const activeComponent = computed(() => {
  if (activeTab.value === 'orders') return MemberOrders
  if (activeTab.value === 'profile') return MemberProfile
  return MemberOverview
})

// 區域：只控制會員中心頁內切換，不碰各功能原本 API / methods。
function changeTab(tab: MemberTab) {
  const nextQuery = { ...route.query }

  if (tab === 'overview') delete nextQuery.tab
  else nextQuery.tab = tab

  // 離開訂單頁籤時移除訂單詳情定位參數，避免再次進入時自動開啟舊訂單。
  if (tab !== 'orders') delete nextQuery.selected

  router.replace({ path: '/member', query: nextQuery })
}
</script>

<style scoped>
.member-page {
  min-height: 70vh;
  background: #f7f9f9;
  color: #173149;
}

.member-container {
  width: min(1440px, calc(100% - 64px));
  margin: 0 auto;
}

/* 區域：會員中心頁首，延續前台頁面的簡潔留白與品牌色。 */
.member-hero {
  position: relative;
  overflow: hidden;
  background: #fff;
  border-bottom: 1px solid #e5ebec;
}

.member-hero::before {
  content: '';
  position: absolute;
  width: 220px;
  height: 220px;
  right: 7%;
  top: -150px;
  border-radius: 50%;
  background: #f0f6ed;
  opacity: .8;
  pointer-events: none;
}

.member-hero::after {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  left: -95px;
  bottom: -105px;
  border-radius: 50%;
  background: #f6edf4;
  pointer-events: none;
}

.member-hero-inner {
  min-height: 180px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 48px;
  padding: 42px 0 30px;
}

.member-hero-copy {
  min-width: 0;
  max-width: 620px;
}

.member-kicker {
  display: block;
  margin-bottom: 7px;
  color: #278690;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: .16em;
}

.member-hero h1 {
  margin: 0 0 8px;
  color: #173149;
  font-size: clamp(34px, 3.2vw, 46px);
  font-weight: 850;
  line-height: 1.15;
  letter-spacing: -.02em;
}

.member-hero p {
  margin: 0;
  color: #70828c;
  font-size: 13px;
  line-height: 1.7;
}

/* 區域：會員功能頁內導覽，做成前台 section navigation，不使用後台 tab 卡片感。 */
.member-section-nav {
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 28px;
  overflow-x: auto;
  scrollbar-width: none;
}
.member-section-nav::-webkit-scrollbar { display: none; }

.member-section-link {
  position: relative;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 0 0 auto;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: #647781;
  cursor: pointer;
  font-size: 13px;
  font-weight: 760;
  transition: color .2s ease;
}
.member-section-link i {
  color: #93a1a8;
  font-size: 11px;
  transition: color .2s ease;
}
.member-section-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: #963b8a;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .2s ease;
}
.member-section-link:hover,
.member-section-link.active { color: #8f3b86; }
.member-section-link:hover i,
.member-section-link.active i { color: #8f3b86; }
.member-section-link.active::after { transform: scaleX(1); }

.member-workspace {
  padding: 26px 0 58px;
}

.member-section-content {
  min-width: 0;
}

/* 區域：移除舊後台外框限制，讓三個會員功能使用同一個前台內容寬度。 */
.member-section-content :deep(.member-dashboard),
.member-section-content :deep(.orders-page),
.member-section-content :deep(.profile-page) {
  width: 100%;
  max-width: none;
  margin: 0;
}

.member-section-content :deep(.orders-page) {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

@media (max-width: 900px) {
  .member-container { width: calc(100% - 32px); }
  .member-hero-inner {
    min-height: 0;
    align-items: flex-start;
    flex-direction: column;
    gap: 22px;
    padding: 32px 0 0;
  }
  .member-section-nav {
    width: 100%;
    justify-content: flex-start;
    gap: 26px;
  }
  .member-workspace { padding: 22px 0 46px; }
}

@media (max-width: 560px) {
  .member-container { width: calc(100% - 24px); }
  .member-hero-inner { padding-top: 26px; gap: 18px; }
  .member-hero h1 { font-size: 31px; }
  .member-hero p { font-size: 12px; }
  .member-section-nav { gap: 22px; }
  .member-section-link {
    min-height: 44px;
    font-size: 12px;
  }
  .member-workspace { padding-top: 16px; }
}


/* ===== 會員中心頁內導覽：桌機版字體加大 ===== */
@media (min-width: 901px) {
  .member-section-link {
    font-size: 16px;
    min-height: 50px;
  }
  .member-section-link i {
    font-size: 13px;
  }
}
</style>
