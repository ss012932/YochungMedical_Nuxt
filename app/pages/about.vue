<template>
  <div class="about-page">
    <!-- ========================================================
      關於祐強 Hero
      功能：使用舊站公司介紹內容與既有圖片，套用新版設計稿的左文右圖視覺。
    ========================================================= -->
    <section class="about-hero">
      <div class="about-hero-media">
        <img src="@/assets/image/about.webp" alt="祐強醫療儀器公司介紹" />
      </div>
      <div class="about-hero-overlay" aria-hidden="true"></div>
      <div class="about-hero-copy">
        <span class="about-kicker">{{ $ui('關於祐強') }}</span>
        <h1>{{ $ui('專業醫療設備') }}<br />{{ $ui('與寵物照護的可靠夥伴') }}</h1>
        <p>{{ $ui('祐強醫療儀器有限公司致力於寵物醫院、醫療設備推廣應用，寵物傷口照護及寵物天然保健食品') }}<br />{{ $ui('平台上已經累積與獸醫師在臨床使用上有非常顯著的效果與經驗。') }}</p>
      </div>
    </section>

    <!-- ========================================================
      企業理念
      功能：沿用舊 AboutPage 四項企業理念，改成新版設計稿的四欄資訊區。
    ========================================================= -->
    <section class="mission-section">
      <div class="mission-container">
        <div class="mission-heading">
          <h2>{{ $ui('我們的理念') }}</h2>
          <span aria-hidden="true"></span>
        </div>

        <div class="mission-grid">
          <article
            v-for="(item, index) in missionItems"
            :key="item.title"
            class="mission-item"
          >
            <div
              class="mission-icon"
              :class="`mission-icon-${index + 1}`"
              aria-hidden="true"
            >
              <svg v-if="index === 0" viewBox="0 0 24 24">
                <path
                  d="M12 21s-6.8-3.8-8.4-8.3C2.5 9.7 4.3 7 7.2 7c1.9 0 3.2 1 4.1 2.2C12.2 8 13.5 7 15.4 7c2.9 0 4.7 2.7 3.6 5.7C17.4 17.2 12 21 12 21Z"
                />
                <path d="M6.2 18.7 4 16.5a2 2 0 0 0-2.8 2.8L5 23" />
                <path d="m17.8 18.7 2.2-2.2a2 2 0 0 1 2.8 2.8L19 23" />
              </svg>

              <svg v-else-if="index === 1" viewBox="0 0 24 24">
                <path
                  d="M12 3 19 6v5c0 4.7-2.8 8.1-7 10-4.2-1.9-7-5.3-7-10V6l7-3Z"
                />
                <path d="m9 12 2 2 4-5" />
              </svg>

              <svg v-else-if="index === 2" viewBox="0 0 24 24">
                <path d="M4 20V11M10 20V7M16 20V13M22 20V4" />
                <path d="m4 9 6-4 6 3 6-6" />
              </svg>

              <svg v-else viewBox="0 0 24 24">
                <path d="m9.5 13.5 3 3 7-7" />
                <path
                  d="M8.5 11.5 6 9a3 3 0 0 0-4.2 4.2l4.8 4.8a3 3 0 0 0 4.2 0l1.7-1.7"
                />
                <path
                  d="m15.5 11.5 2.5-2.5a3 3 0 0 1 4.2 4.2L17.4 18a3 3 0 0 1-4.2 0l-1.7-1.7"
                />
              </svg>
            </div>

            <h3>{{ $ui(item.title) }}</h3>
            <p>{{ $ui(item.description) }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ========================================================
      關於祐強醫療
      功能：依設計稿在理念下方加入品牌介紹，圖片使用既有 logo.webp。
    ========================================================= -->
    <section class="company-profile-section">
      <div class="company-profile-container">
        <div class="company-profile-visual">
          <img
            class="company-profile-image"
            src="@/assets/image/about-company.webp"
            :alt="$ui('祐強醫療儀器有限公司')"
          />
        </div>

        <div class="company-profile-copy">
          <div class="company-profile-heading">
            <h2>{{ $ui('關於祐強醫療') }}</h2>
            <span aria-hidden="true"></span>
          </div>
          <p>{{ $ui('祐強醫療儀器有限公司致力於寵物醫院、醫療設備推廣應用，並提供寵物傷口照護及寵物天然保健食品等專業產品與服務。') }}</p>
          <p>{{ $ui('我們長期累積與獸醫師臨床合作的實際經驗，重視產品品質、專業應用與完善服務，協助醫療單位找到合適的解決方案。') }}</p>
          <p>{{ $ui('秉持「竭盡所能、盡心服務」的理念，祐強持續以專業、可靠的服務，與醫師及醫療機構共同提升照護品質。') }}</p>
        </div>
      </div>
    </section>

    <!-- 醫師使用器材推薦：沿用舊站真實資料與原本查看更多功能 -->
    <section class="recommendation-section">
      <div class="about-content-container">
        <div class="section-title-row">
          <h2>{{ $ui('醫師使用器材推薦') }}</h2>
          <span class="section-title-line" aria-hidden="true"></span>
        </div>

        <div class="recommendation-grid">
          <article
            v-for="(item, index) in featuredRecommendations"
            :key="item.id"
            class="recommendation-card"
          >
            <div
              class="recommendation-visual"
              :class="'recommendation-visual-' + (index + 1)"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24">
                <path
                  v-if="index === 0"
                  d="M7 3h10v4H7zM6 7h12v13H6zM9 11h6M9 15h6"
                />
                <path
                  v-else
                  d="M8 3h8v5l3 6a4 4 0 0 1-3.6 6H8.6A4 4 0 0 1 5 14l3-6V3ZM8 13h8"
                />
              </svg>
            </div>

            <div class="recommendation-copy">
              <div class="recommendation-head">
                <div>
                  <span class="recommendation-label">{{ $ui(item.isMock ? '示意資料' : '推薦器材') }}</span>
                  <h3>{{ $ui(item.product) }}</h3>
                </div>
                <span class="recommendation-quote" aria-hidden="true">“</span>
              </div>

              <p class="recommendation-description">{{ $ui(item.description) }}</p>

              <div class="recommendation-hospitals">
                <span class="hospital-label">{{ $ui('使用醫院') }}</span>
                <div class="hospital-tags">
                  <span
                    v-for="hospital in item.hospitals.slice(0, 2)"
                    :key="hospital"
                    class="hospital-tag"
                  >
                    {{ $ui(hospital) }}
                  </span>
                  <span
                    v-if="item.hospitals.length > 2"
                    class="hospital-more-badge"
                  >
                    {{ $ui('+{count} 家醫院').replace('{count}', String(item.hospitals.length - 2)) }}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="recommendation-more">
          <button
            type="button"
            class="btn-view-more"
            @click="showAllRecommendations"
          >
            <span>{{ $ui('查看更多醫院使用器材') }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        v-if="modalVisible"
        class="recommendation-modal"
      >
        <div
          class="recommendation-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recommendation-modal-title"
        >
          <header class="recommendation-modal-header">
            <div class="modal-title-block">
              <span class="modal-eyebrow">{{ $ui('醫療單位使用資訊') }}</span>
              <h2 id="recommendation-modal-title">{{ $ui('醫師使用器材推薦') }}</h2>
              <p>{{ $ui('依地區查看器材與合作使用單位') }}</p>
            </div>
            <button
              type="button"
              class="modal-close"
              :aria-label="$ui('關閉')"
              @click="closeRecommendationModal"
            >
              ×
            </button>
          </header>

          <div class="region-tabs" role="tablist" :aria-label="$ui('地區切換')">
            <button
              v-for="region in recommendationRegions"
              :key="region.key"
              type="button"
              class="region-tab"
              :class="{ active: activeRecommendationRegion === region.key }"
              @click="activeRecommendationRegion = region.key"
            >
              <span>{{ $ui(region.label) }}</span>
              <strong>{{ region.count }}</strong>
            </button>
          </div>

          <main class="recommendation-modal-content">
            <div class="region-overview">
              <div>
                <h3>{{ $ui(currentRecommendationRegion.title) }}</h3>
              </div>
            </div>

            <div class="region-product-list">
              <article
                v-for="(
                  group, groupIndex
                ) in currentRecommendationRegion.groups"
                :key="group.product"
                class="modal-product-row"
              >
                <div class="product-summary">
                  <div
                    class="product-summary-icon"
                    :class="'product-summary-icon-' + (groupIndex + 1)"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M8 3h8v5l3 6a4 4 0 0 1-3.6 6H8.6A4 4 0 0 1 5 14l3-6V3ZM8 13h8"
                      />
                    </svg>
                  </div>
                  <div class="product-summary-copy">
                    <h4>{{ $ui(group.product) }}</h4>
                    <p>{{ $ui(group.description) }}</p>
                  </div>
                </div>

                <div class="product-hospitals">
                  <div class="product-hospitals-heading">
                    <span>{{ $ui('使用單位') }}</span>
                  </div>
                  <div class="hospital-chip-list">
                    <span
                      v-for="hospital in group.hospitals"
                      :key="group.product + '-' + hospital"
                      class="hospital-chip"
                    >
                      <span class="hospital-dot" aria-hidden="true"></span>
                      {{ $ui(hospital) }}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- 專業合作品牌：沿用舊站品牌 Logo -->
    <section class="partners-section">
      <div class="about-content-container">
        <div class="section-title-row">
          <h2>{{ $ui('專業合作品牌') }}</h2>
          <span class="section-title-line" aria-hidden="true"></span>
        </div>
        <div class="partners-grid">
          <div v-for="brand in brands" :key="brand.id" class="partner-item">
            <img :src="brand.logo" :alt="brand.name" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import bowaLogo from "@/assets/image/BOWA.webp";
import blueLogo from "@/assets/image/blue.webp";
import pettrustLogo from "@/assets/image/PETTRUST.webp";
import wolfLogo from "@/assets/image/Wolf.webp";
import mtsLogo from "@/assets/image/MTS.webp";
import pedgraceLogo from "@/assets/image/Pedgrace.webp";
// ============================================================
// SEO
// 功能：使用祐強實際品牌內容，不採用設計稿範例公司資訊。
// ============================================================
useSeoMeta({
  title: "關於祐強｜祐強醫療儀器有限公司",
  description:
    "了解祐強醫療儀器有限公司的公司理念、寵物醫療設備、傷口照護與專業服務方向。",
});

// ============================================================
// 企業理念資料
// 功能：沿用舊 AboutPage 的四項內容，不使用設計稿範例文案。
// ============================================================
const missionItems = [
  {
    title: "專業與實證導向",
    description:
      "致力於與獸醫臨床合作，累積使用經驗與療效，提供實證基礎的醫療產品與設備。",
  },
  {
    title: "以客為本的服務精神",
    description:
      "秉持「竭盡所能、盡心服務」的理念，為專業醫師與臨床需求提供對應服務。",
  },
  {
    title: "品質與創新並重",
    description: "提供高品質的醫療器材，推動醫療技術與設備應用的創新與整合。",
  },
  {
    title: "共同創造照與善的目標",
    description: "與醫師、醫療機構共創「照護」與「完善」的醫療服務願景。",
  },
];

const featuredRecommendations = [
  {
    id: 1,
    product: "舒派特系列",
    description: "專業傷口護理系列產品，適用於各種動物傷口處理。",
    hospitals: [
      "小王子動物醫院",
      "布達羊急診動物醫院",
      "展望動物醫院",
      "大福小幸動物醫院",
      "康乃爾動物醫院",
      "和平動物醫院",
      "台北市動保處",
      "九九峰",
    ],
    isMock: false,
  },
  {
    id: 2,
    product: "舒派特凝膠",
    description: "專業醫療級凝膠，廣受寵物醫院信賴。",
    hospitals: [
      "國立台灣大學附設動物醫院",
      "小王子動物醫院",
      "布達羊急診動物醫院",
      "康乃爾動物醫院",
      "和平動物醫院",
      "台北市立動物園",
    ],
    isMock: false,
  },
  {
    id: 3,
    product: "舒派特敷料",
    description: "示意資料：適用於術後照護與一般傷口覆蓋，方便臨床搭配使用。",
    hospitals: [
      "台中示意動物醫院",
      "高雄示意動物醫院",
      "新竹示意動物醫院",
      "台南示意動物醫院",
    ],
    isMock: true,
  },
];

const regionalRecommendationData = [
  {
    key: "north" as const,
    label: "北部",
    title: "北部使用單位",
    groups: [
      {
        product: "舒派特系列",
        description: "專業傷口護理系列產品，適用於各種動物傷口處理。",
        hospitals: [
          "小王子動物醫院",
          "布達羊急診動物醫院",
          "展望動物醫院",
          "康乃爾動物醫院",
          "台北市動保處",
        ],
      },
      {
        product: "舒派特凝膠",
        description: "專業醫療級凝膠，廣受寵物醫院信賴。",
        hospitals: [
          "國立台灣大學附設動物醫院",
          "和平動物醫院",
          "台北市立動物園",
        ],
      },
    ],
  },
  {
    key: "central" as const,
    label: "中部",
    title: "中部使用單位",
    groups: [
      {
        product: "舒派特系列",
        description: "示意區域資料，待正式 hospitalData 後替換。",
        hospitals: ["九九峰", "台中示意動物醫院"],
      },
      {
        product: "舒派特敷料",
        description: "示意資料：適用於術後照護與一般傷口覆蓋。",
        hospitals: ["彰化示意動物醫院", "苗栗示意動物醫院"],
      },
    ],
  },
  {
    key: "south" as const,
    label: "南部",
    title: "南部使用單位",
    groups: [
      {
        product: "舒派特凝膠",
        description: "示意區域資料，待正式 hospitalData 後替換。",
        hospitals: ["高雄示意動物醫院", "台南示意動物醫院"],
      },
      {
        product: "舒派特敷料",
        description: "示意資料：適用於術後照護與一般傷口覆蓋。",
        hospitals: ["屏東示意動物醫院"],
      },
    ],
  },
] as const;

const brands = [
  { id: 1, name: "BOWA", logo: bowaLogo },
  { id: 2, name: "blue", logo: blueLogo },
  { id: 3, name: "PETTRUST", logo: pettrustLogo },
  { id: 4, name: "Wolf", logo: wolfLogo },
  { id: 5, name: "MTS", logo: mtsLogo },
  { id: 6, name: "Pedgrace", logo: pedgraceLogo },
];

const activeRecommendationRegion = ref<"all" | "north" | "central" | "south">(
  "all",
);

const recommendationRegions = computed(() => {
  const regionalItems = regionalRecommendationData.map((region) => ({
    key: region.key,
    label: region.label,
    count: region.groups.reduce(
      (total, group) => total + group.hospitals.length,
      0,
    ),
  }));

  return [
    {
      key: "all" as const,
      label: "全部",
      count: regionalItems.reduce((total, region) => total + region.count, 0),
    },
    ...regionalItems,
  ];
});

const currentRecommendationRegion = computed(() => {
  if (activeRecommendationRegion.value === "all") {
    const mergedGroups = featuredRecommendations
      .map((item) => ({
        product: item.product,
        description: item.description,
        hospitals: Array.from(
          new Set(
            regionalRecommendationData.flatMap((region) =>
              region.groups
                .filter((group) => group.product === item.product)
                .flatMap((group) => group.hospitals),
            ),
          ),
        ),
      }))
      .filter((group) => group.hospitals.length > 0);

    return {
      key: "all" as const,
      label: "全部",
      title: "全部使用單位",
      count: mergedGroups.reduce(
        (total, group) => total + group.hospitals.length,
        0,
      ),
      groups: mergedGroups,
    };
  }

  const region =
    regionalRecommendationData.find(
      (item) => item.key === activeRecommendationRegion.value,
    ) ?? regionalRecommendationData[0];

  return {
    ...region,
    count: region.groups.reduce(
      (total, group) => total + group.hospitals.length,
      0,
    ),
  };
});

const modalVisible = ref(false);
const modalScrollY = ref(0);

function lockPageScroll() {
  if (!import.meta.client) return;

  modalScrollY.value = window.scrollY;

  // 功能：Modal 開啟後移除全站 scrollbar-gutter 預留空間，
  // 讓黑色遮罩可以完整貼齊瀏覽器最右側，不留下白色直條。
  document.documentElement.style.scrollbarGutter = "auto";
  document.documentElement.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = "-" + modalScrollY.value + "px";
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
  if (!import.meta.client) return;

  // 功能：關閉 Modal 後恢復 app.vue 的 scrollbar-gutter: stable。
  document.documentElement.style.scrollbarGutter = "";
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  window.scrollTo(0, modalScrollY.value);
}

function closeRecommendationModal() {
  modalVisible.value = false;
  unlockPageScroll();
}

function showAllRecommendations() {
  if (!import.meta.client) return;

  modalVisible.value = true;
  lockPageScroll();
}

onBeforeUnmount(() => {
  unlockPageScroll();
});
</script>

<style scoped>
/* ============================================================
   About 頁面共同設定
============================================================ */
.about-page {
  --about-ink: #162b3c;
  --about-muted: #5f6f7a;
  --about-purple: #8c347f;
  --about-green: #86b967;
  --about-line: #e4e9e8;
  width: 100%;
  overflow: hidden;
  color: var(--about-ink);
  background: #fff;
}

.about-page *,
.about-page *::before,
.about-page *::after {
  box-sizing: border-box;
}

/* ============================================================
   第一塊：About Hero
   說明：依設計稿改為整張橫幅圖片，左側使用白色漸層疊字。
============================================================ */
.about-hero {
  position: relative;
  width: 100%;
  height: clamp(420px, 33vw, 520px);
  min-height: 420px;
  overflow: hidden;
  background: #eef2ef;
}
.about-hero-media {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.about-hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.about-hero-overlay {
  position: absolute;
  z-index: 2;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 0 0,
      rgba(149, 188, 121, 0.11) 0 92px,
      transparent 94px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.99) 0%,
      rgba(255, 255, 255, 0.97) 24%,
      rgba(255, 255, 255, 0.92) 36%,
      rgba(255, 255, 255, 0.72) 48%,
      rgba(255, 255, 255, 0.26) 62%,
      rgba(255, 255, 255, 0.04) 76%,
      transparent 100%
    );
}
.about-hero-copy {
  position: relative;
  z-index: 3;
  display: flex;
  width: min(58vw, 900px);
  height: 100%;
  padding: clamp(54px, 5.2vw, 78px) 24px clamp(48px, 4.5vw, 68px)
    max(72px, calc((100vw - 1500px) / 2));
  flex-direction: column;
  justify-content: flex-start;
}
.about-kicker {
  display: block;
  margin-bottom: 16px;
  color: var(--about-purple);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.about-hero h1 {
  max-width: 12em;
  margin: 0 0 20px;
  color: var(--about-ink);
  font-size: clamp(40px, 3.5vw, 56px);
  font-weight: 800;
  line-height: 1.22;
  letter-spacing: 0.035em;
}
.about-hero-copy p {
  max-width: 760px;
  margin: 0;
  color: #4f606d;
  font-size: 13px;
  line-height: 1.9;
}
.about-hero-copy p + p {
  margin-top: 4px;
}
@media (max-width: 1100px) {
  .about-hero {
    height: 460px;
    min-height: 460px;
  }
  .about-hero-copy {
    width: 64vw;
    padding: 54px 28px 50px 48px;
  }
  .about-hero h1 {
    font-size: clamp(34px, 4.4vw, 44px);
  }
}
@media (max-width: 760px) {
  .about-hero {
    display: flex;
    height: auto;
    min-height: 0;
    flex-direction: column;
  }
  .about-hero-media {
    position: relative;
    order: 1;
    height: clamp(240px, 62vw, 330px);
  }
  .about-hero-overlay {
    display: none;
  }
  .about-hero-copy {
    order: 2;
    width: 100%;
    height: auto;
    padding: 34px 24px 40px;
    background: #fff;
  }
  .about-kicker {
    margin-bottom: 12px;
    font-size: 12px;
  }
  .about-hero h1 {
    max-width: none;
    margin-bottom: 16px;
    font-size: clamp(30px, 8vw, 38px);
  }
  .about-hero-copy p {
    font-size: 13px;
    line-height: 1.8;
  }
}

/* ============================================================
   第二塊：企業理念
   說明：依設計稿採用置中標題 + 四欄資訊，不做傳統卡片盒。
============================================================ */
.mission-section {
  padding: 56px 32px 64px;
  background: #fff;
}

.mission-container {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.mission-heading {
  text-align: center;
}

.mission-heading h2 {
  margin: 0;
  color: var(--about-ink);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.mission-heading span {
  display: block;
  width: 44px;
  height: 3px;
  margin: 12px auto 26px;
  background: var(--about-purple);
  border-radius: 999px;
}

.mission-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 0;
}

.mission-item {
  position: relative;
  min-width: 0;
  padding: 18px clamp(24px, 3vw, 48px) 6px;
  text-align: center;
}

.mission-item:not(:last-child)::after {
  position: absolute;
  top: 10px;
  right: 0;
  width: 1px;
  height: calc(100% - 12px);
  content: "";
  background: var(--about-line);
}

.mission-icon {
  display: grid;
  width: 76px;
  height: 76px;
  margin: 0 auto 20px;
  color: var(--about-purple);
  background: rgba(140, 52, 127, 0.09);
  border-radius: 50%;
  place-items: center;
}

.mission-icon-2,
.mission-icon-4 {
  color: #679b47;
  background: rgba(134, 185, 103, 0.12);
}

.mission-icon svg {
  width: 38px;
  height: 38px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.mission-item h3 {
  margin: 0;
  color: var(--about-ink);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
}

.mission-item p {
  max-width: 280px;
  margin: 14px auto 0;
  color: var(--about-muted);
  font-size: 13px;
  line-height: 1.85;
}

/* ============================================================
   RWD
   說明：桌機設計保持四欄；平板以下依空間轉為雙欄與單欄。
============================================================ */
@media (max-width: 1100px) {
  .about-hero {
    grid-template-columns: 1fr 1fr;
    min-height: 470px;
  }

  .about-hero-copy {
    padding: 58px 38px 56px 48px;
  }

  .about-hero h1 {
    font-size: clamp(34px, 4.3vw, 44px);
  }

  .mission-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mission-item {
    padding: 24px 34px 30px;
  }

  .mission-item:nth-child(2)::after {
    display: none;
  }

  .mission-item:nth-child(-n + 2) {
    border-bottom: 1px solid var(--about-line);
  }
}

@media (max-width: 760px) {
  .about-hero {
    display: flex;
    min-height: 0;
    flex-direction: column;
  }

  .about-hero::before {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 45%),
      radial-gradient(
        circle at 0 0,
        rgba(145, 189, 112, 0.12) 0 72px,
        transparent 74px
      );
  }

  .about-hero-media {
    order: 1;
    height: clamp(240px, 64vw, 340px);
    min-height: 0;
  }

  .about-hero-media img {
    height: 100%;
    min-height: 0;
  }

  .about-hero-copy {
    order: 2;
    max-width: none;
    padding: 38px 24px 42px;
    background: #fff;
  }

  .about-kicker {
    margin-bottom: 12px;
    font-size: 12px;
  }

  .about-hero h1 {
    max-width: none;
    margin-bottom: 16px;
    font-size: clamp(30px, 8vw, 38px);
  }

  .about-hero-copy p {
    font-size: 13px;
    line-height: 1.8;
  }

  .mission-section {
    padding: 44px 18px 50px;
  }

  .mission-heading h2 {
    font-size: 25px;
  }

  .mission-grid {
    grid-template-columns: 1fr;
  }

  .mission-item,
  .mission-item:nth-child(-n + 2) {
    padding: 28px 20px;
    border-bottom: 1px solid var(--about-line);
  }

  .mission-item:last-child {
    border-bottom: 0;
  }

  .mission-item::after {
    display: none !important;
  }

  .mission-icon {
    width: 68px;
    height: 68px;
    margin-bottom: 16px;
  }

  .mission-icon svg {
    width: 34px;
    height: 34px;
  }
}

/* 醫師使用器材推薦 + 專業合作品牌 */
.about-content-container {
  width: min(calc(100% - 112px), 1600px);
  margin: 0 auto;
  margin-top: 2rem;
}
.recommendation-section {
  padding: 58px 0 30px;
  background: #fbfcfc;
  border-top: 1px solid #edf0f1;
}
.section-title-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
}
.section-title-row h2 {
  margin: 0;
  color: #2e7e80;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.section-title-line {
  width: 56px;
  height: 2px;
  background: rgba(46, 126, 128, 0.35);
}
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}
.recommendation-card {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  min-height: 238px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e9ea;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(31, 61, 72, 0.055);
}
.recommendation-visual {
  display: grid;
  min-height: 100%;
  color: #fff;
  background:
    radial-gradient(
      circle at 28% 20%,
      rgba(255, 255, 255, 0.18) 0 46px,
      transparent 48px
    ),
    linear-gradient(145deg, #3e999b, #2f7d83);
  place-items: center;
}
.recommendation-visual-2 {
  background:
    radial-gradient(
      circle at 30% 18%,
      rgba(255, 255, 255, 0.18) 0 46px,
      transparent 48px
    ),
    linear-gradient(145deg, #8d3b81, #71306c);
}
.recommendation-visual-3 {
  background:
    radial-gradient(
      circle at 30% 18%,
      rgba(255, 255, 255, 0.18) 0 46px,
      transparent 48px
    ),
    linear-gradient(145deg, #6b8f5a, #4e7652);
}
.recommendation-visual svg {
  width: 74px;
  height: 74px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}
.recommendation-copy {
  padding: 26px 28px 24px;
}
.recommendation-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}
.recommendation-label,
.hospital-label {
  display: block;
  color: #418f91;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.recommendation-head h3 {
  margin: 5px 0 0;
  color: #183245;
  font-size: 20px;
  font-weight: 800;
}
.recommendation-quote {
  margin-top: -8px;
  color: #3c8f91;
  font-family: Georgia, serif;
  font-size: 48px;
  line-height: 1;
}
.recommendation-description {
  margin: 18px 0 0;
  color: #61717c;
  font-size: 13px;
  line-height: 1.8;
}
.recommendation-hospitals {
  padding-top: 16px;
  margin-top: 18px;
  border-top: 1px solid #edf0f1;
}
.recommendation-hospitals p {
  margin: 6px 0 0;
  color: #27465a;
  font-size: 12px;
  line-height: 1.7;
}
.hospital-more {
  display: inline-block;
  margin-top: 5px;
  color: #8a3a80;
  font-size: 11px;
  font-weight: 700;
}
.partners-section {
  padding: 28px 0 72px;
  background: #fbfcfc;
}
.partners-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.partner-item {
  display: grid;
  min-height: 108px;
  padding: 18px 26px;
  background: #fff;
  border: 1px solid #e2e7e9;
  border-radius: 12px;
  place-items: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.partner-item:hover {
  box-shadow: 0 10px 26px rgba(31, 61, 72, 0.08);
  transform: translateY(-2px);
}
.partner-item img {
  width: auto;
  height: auto;
  max-width: 78%;
  max-height: 58px;
  object-fit: contain;
}
@media (max-width: 1000px) {
  .about-content-container {
    width: calc(100% - 48px);
  }
  .recommendation-card {
    grid-template-columns: 140px minmax(0, 1fr);
  }
  .recommendation-visual svg {
    width: 60px;
    height: 60px;
  }
}
@media (max-width: 760px) {
  .about-content-container {
    width: calc(100% - 28px);
  }
  .recommendation-section {
    padding-top: 44px;
  }
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
  .recommendation-card {
    grid-template-columns: 108px minmax(0, 1fr);
    min-height: 0;
  }
  .recommendation-copy {
    padding: 20px 18px;
  }
  .recommendation-head h3 {
    font-size: 17px;
  }
  .recommendation-quote {
    font-size: 38px;
  }
  .partners-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .partner-item {
    min-height: 92px;
    padding: 14px 16px;
  }
  .partner-item img {
    max-width: 86%;
    max-height: 48px;
  }
}
@media (max-width: 480px) {
  .section-title-row h2 {
    font-size: 19px;
  }
  .recommendation-card {
    grid-template-columns: 88px minmax(0, 1fr);
  }
  .recommendation-visual svg {
    width: 44px;
    height: 44px;
  }
  .recommendation-copy {
    padding: 17px 14px;
  }
  .recommendation-description {
    margin-top: 12px;
    font-size: 12px;
  }
  .recommendation-hospitals {
    padding-top: 12px;
    margin-top: 13px;
  }
}

/* ============================================================
   醫師使用器材推薦 — 原始資料整合版
============================================================ */
.hospital-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 9px;
}

.hospital-tag,
.hospital-more-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  font-size: 11px;
  line-height: 1.4;
  border-radius: 999px;
}

.hospital-tag {
  color: #31566a;
  background: #f3f7f7;
  border: 1px solid #dfe8e8;
}

.hospital-more-badge {
  color: #8a347f;
  font-weight: 800;
  background: rgba(140, 52, 127, 0.08);
  border: 1px solid rgba(140, 52, 127, 0.14);
}

.recommendation-more {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.btn-view-more {
  display: inline-flex;
  min-height: 46px;
  padding: 0 22px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  color: #fff;
  background: #348d90;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.btn-view-more:hover {
  box-shadow: 0 10px 22px rgba(52, 141, 144, 0.2);
  transform: translateY(-2px);
}

.recommendation-modal {
  position: fixed;
  z-index: 2000;
  inset: 0;
  display: grid;
  padding: 28px;
  overflow-y: auto;
  background: rgba(13, 28, 38, 0.56);
  place-items: center;
  backdrop-filter: blur(4px);
}

.recommendation-modal-panel {
  width: min(100%, 900px);
  max-height: min(82vh, 760px);
  overflow: hidden;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 28px 70px rgba(12, 28, 38, 0.24);
}

.recommendation-modal-header,
.recommendation-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 26px;
}

.recommendation-modal-header {
  border-bottom: 1px solid #e7ecee;
}

.recommendation-modal-header h2 {
  margin: 5px 0 0;
  color: #183245;
  font-size: 22px;
}

.modal-close {
  display: grid;
  width: 40px;
  height: 40px;
  padding: 0;
  flex: 0 0 auto;
  cursor: pointer;
  color: #516570;
  background: #f5f7f7;
  border: 0;
  border-radius: 50%;
  font-size: 25px;
  line-height: 1;
  place-items: center;
}

.recommendation-modal-body {
  display: grid;
  gap: 18px;
  max-height: calc(min(82vh, 760px) - 160px);
  padding: 24px 26px;
  overflow-y: auto;
}

.modal-product-group {
  padding: 20px;
  background: #f8faf9;
  border: 1px solid #e3e9e9;
  border-radius: 16px;
}

.modal-product-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.modal-product-heading h3 {
  margin: 0;
  color: #173245;
  font-size: 18px;
}

.modal-product-heading span {
  color: #3e8e91;
  font-size: 12px;
  font-weight: 800;
}

.modal-product-group > p {
  margin: 9px 0 16px;
  color: #677984;
  font-size: 13px;
  line-height: 1.7;
}

.modal-hospital-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.modal-hospital-item {
  padding: 10px 12px;
  color: #294a5d;
  background: #fff;
  border: 1px solid #dfe7e8;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.45;
}

.recommendation-modal-footer {
  justify-content: flex-end;
  border-top: 1px solid #e7ecee;
}

.btn-modal-close {
  min-width: 92px;
  min-height: 40px;
  cursor: pointer;
  color: #fff;
  background: #355f70;
  border: 0;
  border-radius: 999px;
  font-weight: 800;
}

@media (max-width: 640px) {
  .recommendation-modal {
    padding: 14px;
  }

  .recommendation-modal-panel {
    max-height: 88vh;
    border-radius: 18px;
  }

  .recommendation-modal-header,
  .recommendation-modal-footer {
    padding: 18px;
  }

  .recommendation-modal-body {
    max-height: calc(88vh - 148px);
    padding: 18px;
  }

  .modal-hospital-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   推薦區與品牌牆版型調整
   功能：依新版設計稿改成置中標題、推薦卡集中排列；品牌移除卡片外框。
============================================================ */
.recommendation-section {
  padding: 54px 0 36px;
  background: #fff;
}

.recommendation-section .about-content-container,
.partners-section .about-content-container {
  width: min(calc(100% - 72px), 1320px);
}

.recommendation-section .section-title-row,
.partners-section .section-title-row {
  display: flex;
  margin-bottom: 30px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.recommendation-section .section-title-row h2,
.partners-section .section-title-row h2 {
  color: var(--about-ink);
  font-size: 24px;
  letter-spacing: 0.1em;
}

.recommendation-section .section-title-line,
.partners-section .section-title-line {
  width: 38px;
  height: 3px;
  background: var(--about-purple);
  border-radius: 999px;
}

.recommendation-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  width: min(100%, 1320px);
  margin: 0 auto;
}

.recommendation-card {
  grid-template-columns: 128px minmax(0, 1fr);
  min-height: 216px;
  border-radius: 14px;
  box-shadow: 0 8px 22px rgba(31, 61, 72, 0.07);
}

.recommendation-visual {
  min-height: 216px;
}

.recommendation-copy {
  padding: 22px 22px 20px;
}

.recommendation-description {
  margin-top: 12px;
}

.recommendation-hospitals {
  padding-top: 14px;
  margin-top: 14px;
}

.recommendation-more {
  margin-top: 24px;
}

.partners-section {
  padding: 26px 0 64px;
  background: #fff;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(22px, 3vw, 44px);
  align-items: center;
}

.partner-item {
  display: grid;
  min-height: 72px;
  padding: 8px 4px;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  place-items: center;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.partner-item:hover {
  box-shadow: none;
  opacity: 0.82;
  transform: translateY(-2px);
}

.partner-item img {
  max-width: 100%;
  max-height: 52px;
}

@media (max-width: 1180px) {
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1000px) {
  .recommendation-section .about-content-container,
  .partners-section .about-content-container {
    width: calc(100% - 40px);
  }

  .recommendation-card {
    grid-template-columns: 130px minmax(0, 1fr);
  }

  .partners-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 26px;
  }
}

@media (max-width: 760px) {
  .recommendation-section .section-title-row h2,
  .partners-section .section-title-row h2 {
    font-size: 21px;
  }

  .recommendation-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .recommendation-card {
    grid-template-columns: 108px minmax(0, 1fr);
  }

  .partners-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 28px;
  }

  .partner-item {
    min-height: 64px;
  }

  .partner-item img {
    max-height: 44px;
  }
}

/* ============================================================
   推薦詳情 Modal 重新設計
============================================================ */
.recommendation-modal {
  padding: 24px;
  background: rgba(18, 33, 43, 0.58);
  backdrop-filter: blur(8px);
}
.recommendation-modal-panel {
  width: min(100%, 980px);
  max-height: min(88vh, 840px);
  border-radius: 26px;
  box-shadow: 0 34px 90px rgba(10, 25, 35, 0.28);
  background: #fff;
  overflow: hidden;
}
.recommendation-modal-header {
  padding: 26px 30px 22px;
  background: linear-gradient(135deg, #fbfdfd 0%, #f5f9f8 100%);
  border-bottom: 1px solid #e8eeef;
}
.modal-title-block h2 {
  margin: 6px 0 4px;
  font-size: 26px;
  color: #173247;
}
.modal-title-block p {
  margin: 0;
  color: #71818a;
  font-size: 13px;
}
.modal-close {
  width: 42px;
  height: 42px;
  background: #fff;
  border: 1px solid #e1e8e9;
  box-shadow: 0 4px 12px rgba(31, 61, 72, 0.06);
}
.region-switcher {
  display: flex;
  gap: 10px;
  padding: 18px 30px 0;
  background: #fff;
  overflow-x: auto;
}
.region-switch-button {
  display: inline-flex;
  min-width: 112px;
  height: 44px;
  padding: 0 14px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  color: #526672;
  background: #f4f7f7;
  border: 1px solid #e1e8e9;
  border-radius: 999px;
  font-weight: 800;
  transition: 0.18s ease;
}
.region-switch-button strong {
  display: grid;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  place-items: center;
  background: #fff;
  border-radius: 999px;
  font-size: 11px;
}
.region-switch-button.active {
  color: #fff;
  background: linear-gradient(135deg, #2f8c90, #357b82);
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(47, 140, 144, 0.2);
}
.region-switch-button.active strong {
  color: #2f8084;
}
.recommendation-modal-body {
  display: block;
  max-height: calc(min(88vh, 840px) - 210px);
  padding: 22px 30px 28px;
  background: #fff;
}
.region-summary {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}
.region-summary-kicker {
  color: #8b3a80;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}
.region-summary h3 {
  margin: 4px 0 0;
  color: #173247;
  font-size: 20px;
}
.region-summary-count {
  color: #3a8588;
  font-size: 12px;
  font-weight: 800;
}
.region-product-list {
  display: grid;
  gap: 16px;
}
.modal-product-card {
  position: relative;
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  overflow: hidden;
  background: #f8faf9;
  border: 1px solid #e1e8e9;
  border-radius: 18px;
}
.modal-product-accent {
  background: linear-gradient(180deg, #3a9798, #8c3a80);
}
.modal-product-content {
  padding: 20px 22px 22px;
}
.modal-product-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.modal-product-heading h3 {
  margin: 5px 0 0;
  font-size: 18px;
}
.modal-product-heading > span {
  display: inline-flex;
  min-width: 48px;
  height: 30px;
  padding: 0 10px;
  align-items: center;
  justify-content: center;
  color: #2d7f83;
  background: #eaf5f4;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}
.modal-product-content > p {
  margin: 10px 0 16px;
  color: #6b7c86;
  font-size: 12.5px;
  line-height: 1.7;
}
.modal-hospital-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.modal-hospital-item {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 44px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e0e7e8;
  border-radius: 12px;
  color: #294b5c;
}
.hospital-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  background: #3a9396;
  border-radius: 50%;
}
.recommendation-modal-footer {
  padding: 16px 30px 20px;
  background: #fbfcfc;
  border-top: 1px solid #e8eeef;
}
.modal-data-note {
  max-width: 70%;
  color: #88979f;
  font-size: 11px;
  line-height: 1.5;
}
.btn-modal-close {
  min-width: 96px;
  min-height: 42px;
  background: #285f6d;
}
@media (max-width: 760px) {
  .recommendation-modal {
    padding: 10px;
  }
  .recommendation-modal-panel {
    max-height: 92vh;
    border-radius: 20px;
  }
  .recommendation-modal-header {
    padding: 20px;
  }
  .region-switcher {
    padding: 14px 20px 0;
  }
  .recommendation-modal-body {
    max-height: calc(92vh - 210px);
    padding: 18px 20px 22px;
  }
  .region-summary {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
  .modal-hospital-grid {
    grid-template-columns: 1fr;
  }
  .recommendation-modal-footer {
    padding: 14px 20px 18px;
    align-items: flex-start;
    flex-direction: column;
  }
  .modal-data-note {
    max-width: none;
  }
  .btn-modal-close {
    width: 100%;
  }
}

/* ===== About modal redesign v2 ===== */
.company-profile-section {
  padding: 62px 32px 68px;
  background: #fbfcfb;
  border-top: 1px solid #eef1f0;
}

.company-profile-container {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1.08fr);
  gap: clamp(54px, 7vw, 104px);
  width: min(100%, 1320px);
  margin: 0 auto;
  align-items: center;
}

.company-profile-visual {
  display: grid;
  min-height: 300px;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 20% 18%,
      rgba(255, 255, 255, 0.85) 0 62px,
      transparent 64px
    ),
    linear-gradient(145deg, #f3f7f4 0%, #e9f1ea 52%, #f7f3f7 100%);
  border-radius: 24px;
  place-items: center;
  box-shadow: 0 18px 42px rgba(31, 61, 72, 0.07);
}

.company-profile-logo-wrap {
  display: grid;
  width: min(72%, 350px);
  aspect-ratio: 1.9 / 1;
  padding: 28px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  place-items: center;
  box-shadow: 0 14px 34px rgba(44, 77, 86, 0.08);
}

.company-profile-logo-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.company-profile-heading h2 {
  margin: 0;
  color: var(--about-ink);
  font-size: clamp(26px, 2.3vw, 34px);
  font-weight: 800;
  letter-spacing: 0.08em;
}

.company-profile-heading span {
  display: block;
  width: 42px;
  height: 3px;
  margin: 13px 0 22px;
  background: var(--about-purple);
  border-radius: 999px;
}

.company-profile-copy p {
  max-width: 700px;
  margin: 0;
  color: #536670;
  font-size: 14px;
  line-height: 1.95;
}

.company-profile-copy p + p {
  margin-top: 10px;
}

.recommendation-modal {
  position: fixed;
  z-index: 3000;
  inset: 0;
  display: grid;
  padding: clamp(16px, 3vw, 34px);
  overflow: hidden;
  background: rgba(17, 31, 40, 0.62);
  place-items: center;
  backdrop-filter: blur(10px);
}

.recommendation-modal-panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(100%, 1060px);
  height: min(88vh, 790px);
  max-height: none;
  overflow: hidden;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 28px;
  box-shadow: 0 34px 100px rgba(8, 24, 34, 0.3);
}

.recommendation-modal-header {
  display: flex;
  padding: 26px 30px 22px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  background: #fff;
  border-bottom: 1px solid #e9eeee;
}

.modal-eyebrow {
  color: #37898c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.modal-title-block h2 {
  margin: 6px 0 4px;
  color: #173247;
  font-size: 26px;
  line-height: 1.25;
}

.modal-title-block p {
  margin: 0;
  color: #7a8991;
  font-size: 13px;
}

.modal-close {
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  flex: 0 0 auto;
  cursor: pointer;
  color: #526672;
  background: #f5f8f8;
  border: 1px solid #e5ebec;
  border-radius: 50%;
  font-size: 25px;
  line-height: 1;
  place-items: center;
}

.recommendation-modal-layout {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.region-sidebar {
  display: flex;
  min-height: 0;
  padding: 24px 16px;
  flex-direction: column;
  gap: 9px;
  background: #f7f9f9;
  border-right: 1px solid #e7eded;
}

.region-sidebar-title {
  margin: 0 10px 7px;
  color: #92a0a6;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.region-nav-item {
  display: flex;
  min-height: 64px;
  padding: 11px 12px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  color: #526772;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
}

.region-nav-item:hover {
  background: #fff;
  border-color: #e1e9e9;
}

.region-nav-item.active {
  color: #fff;
  background: linear-gradient(135deg, #348f92 0%, #28767e 100%);
  box-shadow: 0 10px 22px rgba(48, 134, 138, 0.2);
}

.region-nav-text {
  display: grid;
  gap: 3px;
}

.region-nav-text strong {
  font-size: 14px;
}

.region-nav-text small {
  color: #87969d;
  font-size: 10px;
}

.region-nav-item.active small {
  color: rgba(255, 255, 255, 0.72);
}

.region-nav-count {
  display: grid;
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  color: #347f83;
  background: #fff;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  place-items: center;
}

.recommendation-modal-content {
  min-width: 0;
  min-height: 0;
  padding: 26px 30px 30px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #fff;
}

.region-content-heading {
  display: flex;
  margin-bottom: 22px;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.region-content-eyebrow {
  color: #8d3a80;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.region-content-heading h3 {
  margin: 5px 0 4px;
  color: #173247;
  font-size: 22px;
}

.region-content-heading p {
  margin: 0;
  color: #84929a;
  font-size: 12px;
}

.region-total {
  display: grid;
  min-width: 92px;
  padding: 10px 14px;
  text-align: center;
  background: #eef7f6;
  border-radius: 14px;
}

.region-total strong {
  color: #287f83;
  font-size: 22px;
  line-height: 1;
}

.region-total span {
  margin-top: 4px;
  color: #668087;
  font-size: 10px;
}

.region-product-list {
  display: grid;
  gap: 16px;
}

.modal-product-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e2e9e9;
  border-radius: 18px;
  box-shadow: 0 7px 18px rgba(31, 61, 72, 0.045);
}

.modal-product-header {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 13px;
  align-items: center;
}

.modal-product-icon {
  display: grid;
  width: 48px;
  height: 48px;
  color: #fff;
  background: #3b9698;
  border-radius: 14px;
  place-items: center;
}

.modal-product-icon-2 {
  background: #8d3b81;
}

.modal-product-icon svg {
  width: 25px;
  height: 25px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.modal-product-title span {
  color: #3c8b8e;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.modal-product-title h4 {
  margin: 3px 0 0;
  color: #173247;
  font-size: 17px;
}

.modal-product-count {
  display: inline-flex;
  min-height: 30px;
  padding: 0 11px;
  align-items: center;
  color: #287e82;
  background: #eef7f6;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.modal-product-description {
  margin: 14px 0;
  color: #718189;
  font-size: 12.5px;
  line-height: 1.7;
}

.modal-hospital-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.modal-hospital-item {
  display: flex;
  min-height: 42px;
  padding: 9px 11px;
  align-items: center;
  gap: 9px;
  color: #315466;
  background: #f8faf9;
  border: 1px solid #e4eaea;
  border-radius: 11px;
  font-size: 12px;
}

.hospital-dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  background: #3b9295;
  border-radius: 50%;
}

.recommendation-modal-footer {
  display: flex;
  min-height: 70px;
  padding: 14px 30px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #fbfcfc;
  border-top: 1px solid #e7eded;
}

.modal-data-note {
  color: #89979e;
  font-size: 10.5px;
  line-height: 1.5;
}

.btn-modal-close {
  min-width: 96px;
  min-height: 42px;
  cursor: pointer;
  color: #fff;
  background: #296574;
  border: 0;
  border-radius: 999px;
  font-weight: 800;
}

@media (max-width: 900px) {
  .company-profile-container {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .company-profile-visual {
    min-height: 250px;
  }

  .recommendation-modal-layout {
    grid-template-columns: 150px minmax(0, 1fr);
  }
}

@media (max-width: 680px) {
  .company-profile-section {
    padding: 44px 18px 48px;
  }

  .company-profile-visual {
    min-height: 210px;
    border-radius: 18px;
  }

  .company-profile-logo-wrap {
    width: min(78%, 300px);
    padding: 22px;
  }

  .recommendation-modal {
    padding: 8px;
  }

  .recommendation-modal-panel {
    width: 100%;
    height: 94vh;
    border-radius: 20px;
  }

  .recommendation-modal-header {
    padding: 20px 18px 16px;
  }

  .modal-title-block h2 {
    font-size: 21px;
  }

  .recommendation-modal-layout {
    display: flex;
    flex-direction: column;
  }

  .region-sidebar {
    display: flex;
    padding: 12px 16px;
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid #e7eded;
  }

  .region-sidebar-title {
    display: none;
  }

  .region-nav-item {
    min-width: 116px;
    min-height: 48px;
    padding: 8px 10px;
  }

  .region-nav-text small {
    display: none;
  }

  .recommendation-modal-content {
    padding: 18px 16px 22px;
  }

  .region-content-heading {
    align-items: flex-start;
  }

  .region-content-heading p {
    display: none;
  }

  .modal-hospital-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-modal-footer {
    padding: 12px 16px;
  }

  .modal-data-note {
    display: none;
  }
}

/* ============================================================
   推薦詳情 Modal v3：品牌官網型資訊版
============================================================ */
.recommendation-modal {
  position: fixed;
  /* 功能：高於全站 Header（z-index: 5000），讓遮罩連最上方導覽列一起覆蓋。 */
  z-index: 12000;
  inset: 0 auto 0 0;
  /* 功能：完整覆蓋 viewport，包含原本 scrollbar 所在區域。 */
  width: 100vw;
  min-height: 100dvh;
  display: grid;
  padding: clamp(14px, 2.4vw, 30px);
  overflow: hidden;
  background: rgba(18, 31, 40, 0.58);
  place-items: center;
  backdrop-filter: blur(10px);
}

.recommendation-modal-panel {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  width: min(100%, 1040px);
  height: min(86vh, 760px);
  max-height: none;
  overflow: hidden;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 34px 100px rgba(8, 24, 34, 0.28);
}

.recommendation-modal-header {
  display: flex;
  padding: 24px 30px 18px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  background: #fff;
  border-bottom: 0;
}

.modal-eyebrow {
  color: #3b8f91;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.modal-title-block h2 {
  margin: 6px 0 4px;
  color: #173247;
  font-size: 25px;
}

.modal-title-block p {
  margin: 0;
  color: #819096;
  font-size: 12.5px;
}

.region-tabs {
  display: flex;
  width: fit-content;
  margin: 0 auto 4px;
  padding: 5px;
  gap: 4px;
  background: #f2f6f5;
  border: 1px solid #e4ebea;
  border-radius: 999px;
}

.region-tab {
  display: inline-flex;
  min-width: 112px;
  height: 42px;
  padding: 0 16px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  color: #5b6c75;
  background: transparent;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  transition: 0.18s ease;
}

.region-tab strong {
  display: grid;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  color: #587078;
  background: #fff;
  border-radius: 999px;
  font-size: 10px;
  place-items: center;
}

.region-tab.active {
  color: #fff;
  background: linear-gradient(135deg, #378f92, #2b7880);
  box-shadow: 0 8px 18px rgba(47, 137, 141, 0.18);
}

.region-tab.active strong {
  color: #2e8185;
}

.recommendation-modal-content {
  min-height: 0;
  padding: 22px 30px 26px;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #fff;
}

.region-overview {
  display: flex;
  margin-bottom: 18px;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
}

.region-overview h3 {
  margin: 4px 0 0;
  color: #173247;
  font-size: 20px;
}

.region-overview > p {
  margin: 0;
  color: #3c8588;
  font-size: 11px;
  font-weight: 800;
}

.region-product-list {
  display: grid;
  gap: 0;
  border-top: 1px solid #e8eeee;
}

.modal-product-row {
  display: grid;
  grid-template-columns: minmax(220px, 0.82fr) minmax(0, 1.18fr);
  gap: 26px;
  padding: 24px 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #e8eeee;
  border-radius: 0;
  box-shadow: none;
}

.product-summary {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

.product-summary-icon {
  display: grid;
  width: 54px;
  height: 54px;
  color: #fff;
  background: #3d9698;
  border-radius: 16px;
  place-items: center;
}

.product-summary-icon-2 {
  background: #8c3a80;
}

.product-summary-icon svg {
  width: 27px;
  height: 27px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.product-summary-copy > span,
.product-hospitals-heading > span {
  color: #438b8e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.product-summary-copy h4 {
  margin: 4px 0 7px;
  color: #173247;
  font-size: 17px;
}

.product-summary-copy p {
  margin: 0;
  color: #7a8990;
  font-size: 12px;
  line-height: 1.7;
}

.product-hospitals {
  min-width: 0;
}

.product-hospitals-heading {
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.product-hospitals-heading strong {
  color: #7a8990;
  font-size: 10px;
}

.hospital-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hospital-chip {
  display: inline-flex;
  min-height: 34px;
  padding: 7px 11px;
  align-items: center;
  gap: 7px;
  color: #355665;
  background: #f7f9f9;
  border: 1px solid #e4eaea;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1.3;
}

.hospital-dot {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  background: #3b9295;
  border-radius: 50%;
}

.recommendation-modal-footer {
  display: flex;
  min-height: 66px;
  padding: 12px 30px 16px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #fff;
  border-top: 1px solid #e8eeee;
}

.btn-modal-close {
  min-width: 94px;
  min-height: 40px;
  cursor: pointer;
  color: #fff;
  background: #2d6a77;
  border: 0;
  border-radius: 999px;
  font-weight: 800;
}

@media (max-width: 760px) {
  .recommendation-modal {
    padding: 8px;
  }
  .recommendation-modal-panel {
    height: 94vh;
    border-radius: 20px;
  }
  .recommendation-modal-header {
    padding: 20px 18px 14px;
  }
  .modal-title-block h2 {
    font-size: 21px;
  }
  .region-tabs {
    width: calc(100% - 28px);
    overflow-x: auto;
    justify-content: flex-start;
  }
  .region-tab {
    min-width: 100px;
    flex: 0 0 auto;
  }
  .recommendation-modal-content {
    padding: 18px 16px 22px;
  }
  .modal-product-row {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px 0;
  }
  .region-overview {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
  .recommendation-modal-footer {
    padding: 12px 16px 14px;
  }
  .modal-data-note {
    display: none;
  }
  .btn-modal-close {
    width: 100%;
  }
}

/* 關於祐強醫療 Logo 改為圓形呈現 */
.company-profile-logo-wrap {
  width: clamp(210px, 24vw, 300px);
  aspect-ratio: 1 / 1;
  padding: 26px;
  border-radius: 50%;
  overflow: hidden;
}
.company-profile-logo-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}
@media (max-width: 680px) {
  .company-profile-logo-wrap {
    width: clamp(190px, 58vw, 250px);
    padding: 22px;
  }
}

/* 關於祐強醫療：改用 about-company.webp，移除裝飾背景 */
.company-profile-visual {
  display: block;
  min-height: 0;
  overflow: visible;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}
.company-profile-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 0;
}
.company-profile-logo-wrap {
  display: none;
}


/* ===== About Fluid RWD Final Override ===== */
/* 功能：僅調整 1179px 以下，1180px 以上維持目前桌機版。 */
@media (max-width: 1179px) {
  .about-page { overflow-x: hidden; }

  .about-hero {
    height: clamp(420px, 46vw, 500px);
    min-height: 420px;
  }

  .about-hero-copy {
    width: min(62vw, 760px);
    padding:
      clamp(46px, 5vw, 64px)
      clamp(24px, 3vw, 36px)
      clamp(42px, 4vw, 56px)
      clamp(42px, 6vw, 72px);
  }

  .about-hero h1 {
    font-size: clamp(34px, 4vw, 46px);
    line-height: 1.2;
  }

  .about-hero-copy p {
    max-width: min(68vw, 680px);
    font-size: clamp(12.5px, 1.15vw, 13.5px);
  }

  .mission-section {
    padding: clamp(46px, 5vw, 58px) clamp(24px, 4vw, 40px) clamp(52px, 5vw, 64px);
  }

  .mission-item {
    padding-inline: clamp(20px, 2.8vw, 34px);
  }

  .company-profile-section {
    padding: clamp(48px, 5vw, 62px) clamp(24px, 4vw, 40px) clamp(54px, 5vw, 68px);
  }

  .company-profile-container {
    grid-template-columns: minmax(300px, .95fr) minmax(0, 1.05fr);
    gap: clamp(36px, 5vw, 62px);
  }

  .company-profile-copy p {
    font-size: clamp(13px, 1.15vw, 14px);
  }

  .recommendation-section .about-content-container,
  .partners-section .about-content-container {
    width: min(calc(100% - clamp(32px, 5vw, 56px)), 1180px);
  }

  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(16px, 2vw, 22px);
  }

  .recommendation-card {
    grid-template-columns: clamp(110px, 14vw, 136px) minmax(0, 1fr);
    min-height: 202px;
  }

  .recommendation-visual { min-height: 202px; }
  .recommendation-copy { padding: clamp(18px, 2vw, 22px); }

  .partners-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(20px, 3vw, 34px);
  }
}

@media (max-width: 900px) {
  .about-hero {
    display: grid;
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
    background: #fff;
  }

  .about-hero-media {
    position: relative;
    inset: auto;
    height: clamp(280px, 48vw, 380px);
  }

  .about-hero-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .about-hero-overlay { display: none; }

  .about-hero-copy {
    width: 100%;
    height: auto;
    padding: clamp(34px, 5vw, 46px) clamp(24px, 5vw, 40px) clamp(40px, 6vw, 52px);
    background: #fff;
  }

  .about-hero h1 {
    max-width: 14em;
    font-size: clamp(32px, 6vw, 42px);
  }

  .about-hero-copy p {
    max-width: 100%;
    font-size: 13px;
  }

  .about-hero-copy p br { display: none; }

  .mission-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mission-item {
    padding: clamp(24px, 4vw, 32px) clamp(20px, 4vw, 28px);
  }

  .mission-item:nth-child(2)::after { display: none; }
  .mission-item:nth-child(-n + 2) { border-bottom: 1px solid var(--about-line); }

  .company-profile-container {
    grid-template-columns: 1fr;
    gap: clamp(28px, 5vw, 40px);
  }

  .company-profile-visual {
    width: min(100%, 680px);
    margin: 0 auto;
  }

  .company-profile-image { width: 100%; height: auto; }

  .company-profile-copy {
    width: min(100%, 760px);
    margin: 0 auto;
  }

  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .recommendation-card {
    grid-template-columns: 112px minmax(0, 1fr);
    min-height: 190px;
  }

  .recommendation-visual { min-height: 190px; }

  .partners-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .recommendation-modal-panel {
    width: min(96vw, 920px);
    height: min(90vh, 760px);
  }

  .region-tabs {
    max-width: calc(100% - 32px);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .region-tabs::-webkit-scrollbar { display: none; }
}

@media (max-width: 640px) {
  .about-hero-media {
    height: clamp(230px, 62vw, 310px);
  }

  .about-hero-copy {
    padding: clamp(28px, 7vw, 36px) clamp(18px, 5vw, 24px) clamp(34px, 8vw, 44px);
  }

  .about-kicker {
    margin-bottom: 10px;
    font-size: 12px;
  }

  .about-hero h1 {
    max-width: none;
    margin-bottom: 14px;
    font-size: clamp(28px, 8.5vw, 36px);
    line-height: 1.22;
  }

  .mission-section {
    padding: 38px 16px 44px;
  }

  .mission-heading h2 { font-size: clamp(23px, 6.5vw, 27px); }

  .mission-grid { grid-template-columns: 1fr; }

  .mission-item,
  .mission-item:nth-child(-n + 2) {
    padding: 24px 16px;
    border-bottom: 1px solid var(--about-line);
  }

  .mission-item:last-child { border-bottom: 0; }
  .mission-item::after { display: none !important; }

  .mission-icon {
    width: clamp(62px, 18vw, 70px);
    height: clamp(62px, 18vw, 70px);
    margin-bottom: 14px;
  }

  .mission-item p {
    max-width: 320px;
    margin-top: 10px;
    font-size: 12.5px;
    line-height: 1.75;
  }

  .company-profile-section {
    padding: 38px 16px 44px;
  }

  .company-profile-container { gap: 24px; }

  .company-profile-heading h2 {
    font-size: clamp(24px, 7vw, 30px);
  }

  .company-profile-heading span { margin-bottom: 18px; }

  .company-profile-copy p {
    font-size: 13px;
    line-height: 1.82;
  }

  .recommendation-section {
    padding: 42px 0 30px;
  }

  .recommendation-section .about-content-container,
  .partners-section .about-content-container {
    width: calc(100% - 28px);
  }

  .recommendation-section .section-title-row,
  .partners-section .section-title-row {
    margin-bottom: 24px;
  }

  .recommendation-section .section-title-row h2,
  .partners-section .section-title-row h2 {
    font-size: clamp(20px, 6vw, 23px);
  }

  .recommendation-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .recommendation-card {
    grid-template-columns: clamp(84px, 25vw, 104px) minmax(0, 1fr);
    min-height: 0;
  }

  .recommendation-visual { min-height: 168px; }
  .recommendation-visual svg { width: 46px; height: 46px; }

  .recommendation-copy { padding: 16px 14px; }
  .recommendation-head h3 { font-size: 17px; }
  .recommendation-description { margin-top: 10px; font-size: 12px; line-height: 1.65; }
  .recommendation-hospitals { margin-top: 12px; padding-top: 12px; }
  .hospital-tags { gap: 6px; }
  .hospital-tag, .hospital-more-badge { font-size: 10px; }

  .partners-section { padding: 20px 0 48px; }
  .partners-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 22px;
  }

  .partner-item { min-height: 58px; padding: 6px 2px; }
  .partner-item img { max-height: 42px; }

  .recommendation-modal { padding: 6px; }

  .recommendation-modal-panel {
    width: 100%;
    height: 94dvh;
    border-radius: 18px;
  }

  .recommendation-modal-header {
    padding: 18px 16px 12px;
  }

  .modal-title-block h2 { font-size: 20px; }
  .modal-title-block p { font-size: 11.5px; }

  .region-tabs {
    width: calc(100% - 20px);
    max-width: none;
    margin-inline: auto;
    padding: 4px;
    justify-content: flex-start;
    overflow-x: auto;
  }

  .region-tab {
    min-width: 92px;
    height: 40px;
    padding-inline: 12px;
    flex: 0 0 auto;
  }

  .recommendation-modal-content {
    padding: 16px 14px 18px;
  }

  .region-overview { margin-bottom: 12px; }
  .region-overview h3 { font-size: 18px; }

  .modal-product-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 18px 0;
  }

  .product-summary {
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 12px;
  }

  .product-summary-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }

  .product-summary-copy h4 { font-size: 16px; }
  .product-summary-copy p { font-size: 11.5px; }

  .hospital-chip-list { gap: 6px; }
  .hospital-chip {
    min-height: 32px;
    padding: 6px 9px;
    font-size: 11px;
  }

  .recommendation-modal-footer {
    padding: 10px 14px 12px;
  }

  .btn-modal-close {
    width: 100%;
    min-height: 40px;
  }
}



/* ===== Mobile About Hero Overlay Redesign ===== */
/* 功能：手機版 Hero 改為單一完整主視覺，圖片與文字不再上下切開。 */
@media (max-width: 640px) {
  .about-hero {
    position: relative;
    display: block;
    height: clamp(500px, 132vw, 610px);
    min-height: 500px;
    overflow: hidden;
    background: #fff;
  }

  .about-hero-media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .about-hero-media img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 58% center;
  }

  .about-hero-overlay {
    position: absolute;
    z-index: 2;
    inset: 0;
    display: block;
    background:
      linear-gradient(180deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,.04) 32%,
        rgba(255,255,255,.72) 58%,
        rgba(255,255,255,.96) 72%,
        #fff 100%
      );
  }

  .about-hero-copy {
    position: absolute;
    z-index: 3;
    right: 0;
    bottom: 0;
    left: 0;
    display: block;
    width: 100%;
    height: auto;
    padding: 0 20px 28px;
    background: transparent;
  }

  .about-kicker {
    display: inline-block;
    margin: 0 0 10px;
    color: var(--about-purple);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .1em;
  }

  .about-hero h1 {
    max-width: 10.8em;
    margin: 0 0 14px;
    color: var(--about-ink);
    font-size: clamp(29px, 8vw, 36px);
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: .025em;
  }

  .about-hero-copy p {
    max-width: 100%;
    margin: 0;
    color: #4f606d;
    font-size: 12.5px;
    line-height: 1.75;
  }

  .about-hero-copy p br {
    display: none;
  }
}



/* ===== Hide About Hero Image Below 1180px ===== */
@media (max-width: 1179px) {
  .about-hero {
    display: block;
    height: auto;
    min-height: 0;
    background: #fff;
  }

  .about-hero-media,
  .about-hero-overlay {
    display: none !important;
  }

  .about-hero-copy {
    position: relative;
    inset: auto;
    display: block;
    width: min(100%, 900px);
    height: auto;
    margin: 0 auto;
    padding: clamp(44px, 6vw, 68px) clamp(24px, 6vw, 56px) clamp(46px, 6vw, 64px);
    background: #fff;
  }

  .about-hero h1 {
    max-width: 12em;
  }

  .about-hero-copy p {
    max-width: 760px;
  }
}

@media (max-width: 640px) {
  .about-hero {
    height: auto;
    min-height: 0;
  }

  .about-hero-copy {
    position: relative;
    right: auto;
    bottom: auto;
    left: auto;
    padding: 34px 20px 40px;
  }
}


/* ============================================================
   About 內容物淡入
   功能：背景與 section 直接顯示，只讓文字、圖片、icon、卡片與品牌 Logo 淡入。
============================================================ */
.about-hero-copy > *,
.about-hero-media img,
.mission-heading,
.mission-item,
.company-profile-visual,
.company-profile-copy > *,
.section-title-row,
.recommendation-card,
.recommendation-more,
.partner-item { animation: about-content-fade-in .68s cubic-bezier(.22,1,.36,1) backwards; }
.about-hero-media img, .company-profile-visual { animation-name: about-media-fade-in; animation-duration: .8s; }
.mission-item:nth-child(2), .recommendation-card:nth-child(2), .partner-item:nth-child(2) { animation-delay: .06s; }
.mission-item:nth-child(3), .recommendation-card:nth-child(3), .partner-item:nth-child(3) { animation-delay: .12s; }
.mission-item:nth-child(4), .partner-item:nth-child(4) { animation-delay: .18s; }
.partner-item:nth-child(5) { animation-delay: .24s; }
.partner-item:nth-child(6) { animation-delay: .30s; }
@keyframes about-content-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes about-media-fade-in { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .about-hero-copy > *, .about-hero-media img, .mission-heading, .mission-item, .company-profile-visual, .company-profile-copy > *, .section-title-row, .recommendation-card, .recommendation-more, .partner-item { animation: none !important; }
}

</style>