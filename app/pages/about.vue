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
        <span class="about-kicker">{{ $ui("關於祐強") }}</span>
        <h1>
          {{ $ui("專業醫療設備") }}<br />{{ $ui("與寵物照護的可靠夥伴") }}
        </h1>
        <p>
          {{
            $ui(
              "祐強醫療儀器有限公司致力於寵物醫院、醫療設備推廣應用，寵物傷口照護及寵物天然保健食品",
            )
          }}<br />{{
            $ui("平台上已經累積與獸醫師在臨床使用上有非常顯著的效果與經驗。")
          }}
        </p>
      </div>
    </section>

    <!-- ========================================================
      企業理念
      功能：沿用舊 AboutPage 四項企業理念，改成新版設計稿的四欄資訊區。
    ========================================================= -->
    <section class="mission-section">
      <div class="mission-container">
        <div class="mission-heading">
          <h2>{{ $ui("我們的理念") }}</h2>
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

        <!-- ====================================================
          手機商品圖片全螢幕檢視器
          功能：支援雙指縮放、單指拖曳、縮放按鈕與重設。
        ===================================================== -->
        <div
          v-if="mobilePreviewProduct"
          class="mobile-image-viewer"
          @click.self="closeMobileProductPreview"
        >
          <div class="mobile-image-viewer-header">
            <!-- 功能：頂部只保留關閉按鈕，讓商品名稱與圖片視覺上更靠近。 -->
            <button
              type="button"
              class="mobile-image-viewer-close"
              :aria-label="$ui('關閉圖片')"
              @click="closeMobileProductPreview"
            >
              ×
            </button>
          </div>

          <div
            class="mobile-image-viewer-stage"
            @touchstart="onPreviewTouchStart"
            @touchmove.prevent="onPreviewTouchMove"
            @touchend="onPreviewTouchEnd"
            @touchcancel="onPreviewTouchEnd"
          >
            <img
              v-if="mobilePreviewImage"
              :src="mobilePreviewImage"
              :alt="$ui(mobilePreviewCurrentName)"
              class="mobile-image-viewer-image"
              :style="mobilePreviewImageStyle"
              draggable="false"
            />

            <!-- 功能：多張圖片才顯示左右翻頁按鈕。 -->
            <button
              v-if="mobilePreviewImages.length > 1"
              type="button"
              class="mobile-image-viewer-nav mobile-image-viewer-nav-prev"
              :aria-label="$ui('上一張圖片')"
              @click.stop="showPreviousMobilePreviewImage"
            >
              <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
            </button>
            <button
              v-if="mobilePreviewImages.length > 1"
              type="button"
              class="mobile-image-viewer-nav mobile-image-viewer-nav-next"
              :aria-label="$ui('下一張圖片')"
              @click.stop="showNextMobilePreviewImage"
            >
              <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
            </button>

            <div v-if="!mobilePreviewImage" class="mobile-image-viewer-empty">
              <i class="fa-regular fa-image" aria-hidden="true"></i>
              <span>{{ $ui('商品圖片待補') }}</span>
            </div>
          </div>

          <!-- ==================================================
            商品圖片名稱
            功能：名稱固定顯示在目前圖片正下方，多張圖片切換時同步更新。
          =================================================== -->
          <div class="mobile-image-viewer-caption">
            <strong>{{ $ui(mobilePreviewCurrentName) }}</strong>
            <span v-if="mobilePreviewImage">
              {{
                mobilePreviewImages.length > 1
                  ? $ui('左右切換圖片・可放大查看商品細節')
                  : $ui('可放大查看商品細節')
              }}
            </span>
          </div>

          <div class="mobile-image-viewer-controls">
            <span
              v-if="mobilePreviewImages.length > 1"
              class="mobile-image-viewer-page"
            >
              {{ mobilePreviewIndex + 1 }} / {{ mobilePreviewImages.length }}
            </span>
            <button
              type="button"
              :aria-label="$ui('縮小')"
              :disabled="mobilePreviewScale <= 1"
              @click="changeMobilePreviewScale(-0.5)"
            >
              −
            </button>
            <span>{{ Math.round(mobilePreviewScale * 100) }}%</span>
            <button
              type="button"
              :aria-label="$ui('放大')"
              :disabled="mobilePreviewScale >= 4"
              @click="changeMobilePreviewScale(0.5)"
            >
              +
            </button>
            <button
              type="button"
              class="mobile-image-viewer-reset"
              @click="resetMobileProductPreview"
            >
              {{ $ui('重設') }}
            </button>
          </div>
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
            <h2>{{ $ui("關於祐強醫療") }}</h2>
            <span aria-hidden="true"></span>
          </div>
          <p>
            {{
              $ui(
                "祐強醫療儀器有限公司致力於寵物醫院、醫療設備推廣應用，並提供寵物傷口照護及寵物天然保健食品等專業產品與服務。",
              )
            }}
          </p>
          <p>
            {{
              $ui(
                "我們長期累積與獸醫師臨床合作的實際經驗，重視產品品質、專業應用與完善服務，協助醫療單位找到合適的解決方案。",
              )
            }}
          </p>
          <p>
            {{
              $ui(
                "秉持「竭盡所能、盡心服務」的理念，祐強持續以專業、可靠的服務，與醫師及醫療機構共同提升照護品質。",
              )
            }}
          </p>
        </div>
      </div>
    </section>

    <!-- 醫師使用器材推薦：沿用舊站真實資料與原本查看更多功能 -->
    <section class="recommendation-section">
      <div class="about-content-container">
        <div class="section-title-row">
          <h2>{{ $ui("醫師使用器材推薦") }}</h2>
          <span class="section-title-line" aria-hidden="true"></span>
        </div>

        <div class="recommendation-grid">
          <article
            v-for="item in featuredRecommendations"
            :key="item.id"
            class="recommendation-card"
          >
            <div class="recommendation-copy">
              <div class="recommendation-head">
                <div>
                  <span class="recommendation-label">{{ $ui("推薦器材") }}</span>
                  <h3>{{ $ui(item.product) }}</h3>
                </div>
                <span class="recommendation-quote" aria-hidden="true">“</span>
              </div>

              <p class="recommendation-description">
                {{ $ui(item.description) }}
              </p>

              <div class="recommendation-hospitals">
                <span class="hospital-label">{{ $ui("使用醫院") }}</span>
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
                    {{
                      $ui("+{count} 個單位").replace(
                        "{count}",
                        String(item.hospitals.length - 2),
                      )
                    }}
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
            <span>{{ $ui("查看更多醫院使用器材") }}</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div v-if="modalVisible" class="recommendation-modal">
        <div
          class="recommendation-modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recommendation-modal-title"
        >
          <header class="recommendation-modal-header">
            <div class="modal-title-block">
              <h2 id="recommendation-modal-title">
                {{ $ui("醫師使用器材推薦") }}
              </h2>
              <p>{{ $ui("依地區查看器材與合作使用單位") }}</p>
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

          <main class="recommendation-modal-content recommendation-browser-content">
            <!-- ==================================================
              區域資訊與地區篩選
              功能：將地區切換整合到內容標題列，避免獨立膠囊元件顯得突兀。
            =================================================== -->
            <div class="region-toolbar">

              <!-- 功能：手機版預設收起地區選單，只顯示目前地區摘要。 -->
              <button
                type="button"
                class="mobile-region-filter-toggle"
                :aria-expanded="mobileRegionFilterExpanded"
                @click="mobileRegionFilterExpanded = !mobileRegionFilterExpanded"
              >
                <span class="mobile-region-filter-label">{{ $ui('篩選地區') }}</span>
                <span class="mobile-region-filter-current">
                  {{ $ui(recommendationRegionLabels[activeRecommendationRegion]) }}
                  <strong>{{ currentRecommendationRegion.hospitalCount }}</strong>
                </span>
                <i
                  class="fa-solid fa-chevron-down"
                  :class="{ open: mobileRegionFilterExpanded }"
                  aria-hidden="true"
                ></i>
              </button>

              <div
                class="region-tabs region-tabs-inline"
                :class="{ 'mobile-expanded': mobileRegionFilterExpanded }"
                role="tablist"
                :aria-label="$ui('地區切換')"
              >
                <button
                  v-for="region in recommendationRegions"
                  :key="region.key"
                  type="button"
                  class="region-tab"
                  :class="{ active: activeRecommendationRegion === region.key }"
                  @click="selectRecommendationRegion(region.key)"
                >
                  <span>{{ $ui(region.label) }}</span>
                  <strong>{{ region.count }}</strong>
                </button>
              </div>
            </div>

            <!-- ==================================================
              桌機商品瀏覽器
              功能：左側固定商品目錄，右側只顯示目前選中的商品，
              避免商品數量增加後整個 Modal 變成超長頁面。
            =================================================== -->
            <div class="desktop-recommendation-browser">
              <aside class="product-index-pane">
                <label class="recommendation-search product-index-search">
                  <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input
                    v-model.trim="recommendationSearchKeyword"
                    type="search"
                    :placeholder="$ui('搜尋商品或使用單位')"
                    :aria-label="$ui('搜尋商品或使用單位')"
                  />
                  <button
                    v-if="recommendationSearchKeyword"
                    type="button"
                    :aria-label="$ui('清除搜尋')"
                    @click="recommendationSearchKeyword = ''"
                  >
                    ×
                  </button>
                </label>

                <div class="product-index-meta">
                  <strong>{{ $ui('器材列表') }}</strong>
                  <span>{{ filteredRecommendationGroups.length }} {{ $ui('項') }}</span>
                </div>

                <div class="product-index-list">
                  <button
                    v-for="group in paginatedDesktopRecommendationGroups"
                    :key="'desktop-index-' + group.id"
                    type="button"
                    class="product-index-item"
                    :class="{
                      active: selectedDesktopRecommendationGroup?.id === group.id,
                    }"
                    @click="selectDesktopProduct(group.id)"
                  >
                    <span class="product-index-item-copy">
                      <strong>{{ $ui(group.product) }}</strong>
                      <small>{{ group.hospitals.length }} {{ $ui('個使用單位') }}</small>
                    </span>
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                  </button>

                  <div
                    v-if="filteredRecommendationGroups.length === 0"
                    class="recommendation-empty-state product-index-empty"
                  >
                    <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                    <strong>{{ $ui('找不到符合條件的器材') }}</strong>
                    <span>{{ $ui('請切換地區或清除搜尋條件。') }}</span>
                  </div>
                </div>

                <!-- ==================================================
                  桌機器材分頁
                  功能：每頁 3 欄 × 6 列，共 18 項器材，避免長距離捲動。
                =================================================== -->
                <nav
                  v-if="desktopProductTotalPages > 1"
                  class="product-index-pagination"
                  :aria-label="$ui('器材列表分頁')"
                >
                  <button
                    type="button"
                    class="pagination-arrow"
                    :disabled="desktopProductPage === 1"
                    :aria-label="$ui('上一頁')"
                    @click="goToDesktopProductPage(desktopProductPage - 1)"
                  >
                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                  </button>

                  <button
                    v-for="page in desktopProductPageNumbers"
                    :key="'product-page-' + page"
                    type="button"
                    class="pagination-page"
                    :class="{ active: desktopProductPage === page }"
                    :aria-current="desktopProductPage === page ? 'page' : undefined"
                    @click="goToDesktopProductPage(page)"
                  >
                    {{ page }}
                  </button>

                  <button
                    type="button"
                    class="pagination-arrow"
                    :disabled="desktopProductPage === desktopProductTotalPages"
                    :aria-label="$ui('下一頁')"
                    @click="goToDesktopProductPage(desktopProductPage + 1)"
                  >
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                  </button>

                  <span class="pagination-summary">
                    {{ desktopProductPage }} / {{ desktopProductTotalPages }}
                  </span>
                </nav>
              </aside>

              <section
                v-if="selectedDesktopRecommendationGroup"
                class="product-detail-pane"
              >
                <header class="product-detail-header">
                  <div class="product-detail-copy">
                    <div class="product-detail-title-row">
                      <h4>{{ $ui(selectedDesktopRecommendationGroup.product) }}</h4>
                    </div>
                    <p>{{ $ui(selectedDesktopRecommendationGroup.description) }}</p>
                  </div>

                  <!-- 功能：桌機版以明確文字按鈕呈現商品圖片入口，固定在 Header 最右側。 -->
                  <button
                    type="button"
                    class="desktop-product-image-button"
                    :aria-label="$ui(selectedDesktopRecommendationGroup.product + ' 查看圖片')"
                    @click.stop="openMobileProductPreview(selectedDesktopRecommendationGroup.product)"
                  >
                    {{ $ui('查看圖片') }}
                  </button>
                </header>

                <div class="product-detail-usage-heading">
                  <div>
                    <strong>{{ $ui('使用單位') }}</strong>
                  </div>
                </div>

                <div class="product-detail-hospital-directory">
                  <div
                    v-for="hospital in selectedDesktopRecommendationGroup.hospitals"
                    :key="selectedDesktopRecommendationGroup.product + '-detail-' + hospital"
                    class="hospital-directory-item"
                  >
                    <span class="hospital-dot" aria-hidden="true"></span>
                    <span>{{ $ui(hospital) }}</span>
                  </div>
                </div>
              </section>

              <section v-else class="product-detail-pane product-detail-empty">
                <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                <strong>{{ $ui('目前沒有符合條件的器材') }}</strong>
                <span>{{ $ui('請切換地區或清除搜尋條件。') }}</span>
              </section>
            </div>

            <!-- ==================================================
              手機商品瀏覽器
              功能：第一層只列商品；點入後才顯示單一商品詳細內容，
              避免所有商品與使用單位同時堆在一個長頁面。
            =================================================== -->
            <div class="mobile-recommendation-browser">
              <template v-if="!selectedMobileRecommendationGroup">
                <label class="recommendation-search mobile-browser-search">
                  <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                  <input
                    v-model.trim="recommendationSearchKeyword"
                    type="search"
                    :placeholder="$ui('搜尋商品或使用單位')"
                    :aria-label="$ui('搜尋商品或使用單位')"
                  />
                  <button
                    v-if="recommendationSearchKeyword"
                    type="button"
                    :aria-label="$ui('清除搜尋')"
                    @click="recommendationSearchKeyword = ''"
                  >
                    ×
                  </button>
                </label>

                <div class="mobile-product-index">
                  <button
                    v-for="group in filteredRecommendationGroups"
                    :key="'mobile-index-' + group.id"
                    type="button"
                    class="mobile-product-index-item"
                    @click="selectMobileProduct(group.id)"
                  >
                    <span>
                      <strong>{{ $ui(group.product) }}</strong>
                      <small>{{ group.hospitals.length }} {{ $ui('個使用單位') }}</small>
                    </span>
                    <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
                  </button>

                  <div
                    v-if="filteredRecommendationGroups.length === 0"
                    class="recommendation-empty-state"
                  >
                    <i class="fa-regular fa-folder-open" aria-hidden="true"></i>
                    <strong>{{ $ui('找不到符合條件的器材') }}</strong>
                    <span>{{ $ui('請切換地區或清除搜尋條件。') }}</span>
                  </div>
                </div>
              </template>

              <section v-else class="mobile-product-detail">
                <button
                  type="button"
                  class="mobile-product-back"
                  @click="backToMobileProductList"
                >
                  <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                  <span>{{ $ui('返回器材列表') }}</span>
                </button>

                <div class="mobile-product-detail-heading">
                  <div class="mobile-product-detail-copy">
                    <h4>{{ $ui(selectedMobileRecommendationGroup.product) }}</h4>
                    <p>{{ $ui(selectedMobileRecommendationGroup.description) }}</p>
                  </div>

                  <button
                    type="button"
                    class="mobile-product-image-button"
                    :aria-label="$ui(selectedMobileRecommendationGroup.product + ' 查看圖片')"
                    @click.stop="openMobileProductPreview(selectedMobileRecommendationGroup.product)"
                  >
                    {{ $ui('查看圖片') }}
                  </button>

                  <strong class="mobile-product-usage-count">
                    {{ selectedMobileRecommendationGroup.hospitals.length }} {{ $ui('個使用單位') }}
                  </strong>
                </div>

                <div class="mobile-product-hospital-list">
                  <span
                    v-for="hospital in getVisibleMobileHospitals(selectedMobileRecommendationGroup)"
                    :key="selectedMobileRecommendationGroup.product + '-mobile-detail-' + hospital"
                    class="hospital-chip"
                  >
                    <span class="hospital-dot" aria-hidden="true"></span>
                    {{ $ui(hospital) }}
                  </span>
                </div>

                <button
                  v-if="selectedMobileRecommendationGroup.hospitals.length > mobileHospitalPreviewCount"
                  type="button"
                  class="mobile-hospital-more"
                  @click="toggleMobileHospitals(selectedMobileRecommendationGroup.id)"
                >
                  <span v-if="expandedHospitalProductId === selectedMobileRecommendationGroup.id">
                    {{ $ui('收合單位') }}
                  </span>
                  <span v-else>
                    {{
                      $ui('顯示其餘 {count} 個').replace(
                        '{count}',
                        String(selectedMobileRecommendationGroup.hospitals.length - mobileHospitalPreviewCount),
                      )
                    }}
                  </span>
                  <i
                    class="fa-solid fa-chevron-down"
                    :class="{ active: expandedHospitalProductId === selectedMobileRecommendationGroup.id }"
                    aria-hidden="true"
                  ></i>
                </button>
              </section>
            </div>
          </main>
        </div>
      </div>
    </section>

    <!-- 專業合作品牌：沿用舊站品牌 Logo -->
    <section class="partners-section">
      <div class="about-content-container">
        <div class="section-title-row">
          <h2>{{ $ui("專業合作品牌") }}</h2>
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
import savpet1 from "@/assets/image/savpet-1.webp";
import savpet2 from "@/assets/image/savpet-2.webp";
import savpet3 from "@/assets/image/savpet-3.webp";
import savpet4 from "@/assets/image/savpet-4.webp";
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

// ============================================================
// 醫師使用器材推薦資料
// 功能：依商品整理實際購買／使用醫院，Modal 顯示完整清單。
// ============================================================
const northRecommendationProducts = [
  {
    "id": 1,
    "product": "舒派特凝膠",
    "description": "傷口照護凝膠，依提供的實際採購／使用資料整理。",
    "hospitals": [
      "國立台灣大學附設動物醫院",
      "布達羊急診動物醫院",
      "華中動物醫院",
      "佳恩動物醫院",
      "寵樂動物醫院",
      "小王子動物醫院",
      "沐樂動物醫院",
      "毛派樂動物醫院",
      "角落動物醫院",
      "中研動物醫院",
      "亞各特殊寵物醫院",
      "人人動物醫院-大園分院",
      "人人-埔心動物醫院",
      "阿牛動物醫院",
      "欣欣動物醫院",
      "頂點動物醫院",
      "胖皮動物醫院",
      "三重濛濛加動物醫院",
      "維康動物醫院(內湖)",
      "台安動物醫院",
      "廣慈動物醫院",
      "祐康動物醫院",
      "祐熙動物醫院",
      "汪喵聯萌動物醫院",
      "長生動物醫院",
      "綠光動物醫院",
      "中壢太樸動物醫院",
      "元氣動物醫院",
      "台大稚沅動物醫院(基隆)",
      "大福小幸動物醫院",
      "元沅動物醫院",
      "耀眼動物醫院",
      "安定動物醫院",
      "中華蘆竹動物醫院",
      "守足動物醫院",
      "度度鳥特殊寵物專科醫院",
      "康乃爾動物醫院",
      "新竹築心動物醫院",
      "佳恩動物醫院(竹北)",
      "後龍動物醫院",
      "瑞芳愛馨動物醫院"
    ]
  },
  {
    "id": 2,
    "product": "舒派特敷料系列",
    "description": "傷口照護敷料系列；「敷料系列」與「舒派特凝膠敷料系列」依原資料脈絡合併整理。",
    "hospitals": [
      "布達羊急診動物醫院",
      "華中動物醫院",
      "佳恩動物醫院",
      "寵樂動物醫院",
      "展望動物醫院",
      "小王子動物醫院",
      "沐樂動物醫院",
      "中研動物醫院",
      "亞各特殊寵物醫院",
      "人人動物醫院-大園分院",
      "人人-埔心動物醫院",
      "阿牛動物醫院",
      "心恩動物醫院",
      "台安動物醫院",
      "廣慈動物醫院",
      "祐康動物醫院",
      "祐熙動物醫院",
      "汪喵聯萌動物醫院",
      "長生動物醫院",
      "綠光動物醫院",
      "青谷動物醫院",
      "中壢太樸動物醫院",
      "元氣動物醫院",
      "台大稚沅動物醫院(基隆)",
      "大福小幸動物醫院",
      "元沅動物醫院",
      "超群動物醫院",
      "安定動物醫院",
      "中華蘆竹動物醫院",
      "守足動物醫院",
      "度度鳥特殊寵物專科醫院",
      "康乃爾動物醫院",
      "新竹築心動物醫院",
      "佳恩動物醫院(竹北)",
      "後龍動物醫院",
      "瑞芳愛馨動物醫院"
    ]
  },
  {
    "id": 3,
    "product": "PETTRUST 血壓計",
    "description": "動物血壓監測設備。",
    "hospitals": [
      "紀劃動物醫院",
      "寵樂動物醫院",
      "展望動物醫院",
      "小王子動物醫院",
      "人人-埔心動物醫院",
      "阿牛動物醫院",
      "銀晨動物醫院",
      "心恩動物醫院",
      "大福小幸動物醫院",
      "築心動物醫院",
      "新竹築心動物醫院"
    ]
  },
  {
    "id": 4,
    "product": "溫風毯機",
    "description": "術中與照護使用的保溫設備。",
    "hospitals": [
      "布達羊急診動物醫院",
      "卡夫卡動物醫院",
      "人人-埔心動物醫院",
      "阿牛動物醫院",
      "銀晨動物醫院",
      "核心動物醫院",
      "好好動物醫院",
      "青谷動物醫院",
      "中壢太樸動物醫院",
      "築心動物醫院",
      "新竹築心動物醫院"
    ]
  },
  {
    "id": 5,
    "product": "BOWA ARC350 電刀",
    "description": "BOWA ARC350 電外科設備；原資料中的 BOW ARC350、ARC350 合併整理。",
    "hospitals": [
      "康寧動物醫院",
      "紀劃動物醫院",
      "松山動物醫院",
      "寵樂動物醫院",
      "展望動物醫院",
      "人人動物醫院-大園分院",
      "青谷動物醫院",
      "耀眼動物醫院",
      "信安動物醫院(新竹)",
      "後龍動物醫院"
    ]
  },
  {
    "id": 6,
    "product": "球型活性碳",
    "description": "依原始採購／使用資料整理的球型活性碳品項。",
    "hospitals": [
      "康寧動物醫院",
      "寵樂動物醫院",
      "廣慈動物醫院",
      "台大稚沅動物醫院(基隆)",
      "元沅動物醫院",
      "超群動物醫院"
    ]
  },
  {
    "id": 7,
    "product": "疝氣腹膜網",
    "description": "疝氣／腹壁修補相關網材；原資料「疝氣腹膜」併入此項。",
    "hospitals": [
      "華中動物醫院",
      "中壢太樸動物醫院",
      "耀眼動物醫院",
      "中華蘆竹動物醫院"
    ]
  },
  {
    "id": 8,
    "product": "A.R.C. FOX810 雷射主機",
    "description": "A.R.C. FOX810 雷射設備；原資料 ARCFOX810 併入此項。",
    "hospitals": [
      "松山動物醫院",
      "佳恩動物醫院",
      "安達動物醫院"
    ]
  },
  {
    "id": 9,
    "product": "CASP 電漿滅菌／消毒鍋",
    "description": "CASP 電漿滅菌與消毒設備。",
    "hospitals": [
      "松山動物醫院",
      "沐樂動物醫院"
    ]
  },
  {
    "id": 10,
    "product": "DRF40 X光機",
    "description": "DRF40 X 光影像設備。",
    "hospitals": [
      "人人-埔心動物醫院",
      "大直動物醫院"
    ]
  },
  {
    "id": 11,
    "product": "IMEC8 生理監視器",
    "description": "IMEC8 生理監視設備。",
    "hospitals": [
      "寵樂動物醫院",
      "心恩動物醫院"
    ]
  },
  {
    "id": 12,
    "product": "LOTUS 超音波刀",
    "description": "LOTUS 超音波手術設備。",
    "hospitals": [
      "沐樂動物醫院",
      "安達動物醫院"
    ]
  },
  {
    "id": 13,
    "product": "LOTUS 超音波機",
    "description": "LOTUS 超音波設備。",
    "hospitals": [
      "紀劃動物醫院",
      "大福小幸動物醫院"
    ]
  },
  {
    "id": 14,
    "product": "MTS 體外震波治療儀",
    "description": "MTS 體外震波治療設備。",
    "hospitals": [
      "紀劃動物醫院",
      "信安動物醫院(新竹)"
    ]
  },
  {
    "id": 15,
    "product": "PGS 電刀",
    "description": "PGS 電外科設備。",
    "hospitals": [
      "卡夫卡動物醫院",
      "安達動物醫院"
    ]
  },
  {
    "id": 16,
    "product": "PHILIPS CM100 生理監視器",
    "description": "PHILIPS CM100 生理監視設備。",
    "hospitals": [
      "左岸動物醫院",
      "伊甸園動物醫院"
    ]
  },
  {
    "id": 17,
    "product": "超音波機（未標品牌／型號）",
    "description": "原資料僅記載「超音波機」，未標示品牌與型號。",
    "hospitals": [
      "安達動物醫院",
      "信安動物醫院(新竹)"
    ]
  },
  {
    "id": 18,
    "product": "輕氧艙",
    "description": "輕氧艙設備。",
    "hospitals": [
      "佳恩動物醫院",
      "人人動物醫院-大園分院"
    ]
  },
  {
    "id": 19,
    "product": "動物專用異物鉗 AK47",
    "description": "動物專用異物鉗 AK47。",
    "hospitals": [
      "布達羊急診動物醫院"
    ]
  },
  {
    "id": 20,
    "product": "喉頭鏡",
    "description": "喉頭檢查相關器材。",
    "hospitals": [
      "布達羊急診動物醫院"
    ]
  },
  {
    "id": 21,
    "product": "WOLF（原資料僅記品牌）",
    "description": "原資料僅記載 WOLF，未標示實際設備型號。",
    "hospitals": [
      "康寧動物醫院"
    ]
  },
  {
    "id": 22,
    "product": "沈大腹腔鏡",
    "description": "腹腔鏡設備。",
    "hospitals": [
      "康寧動物醫院"
    ]
  },
  {
    "id": 23,
    "product": "生理監視器（未標型號）",
    "description": "原資料僅記載生理監視器，未標示品牌與型號。",
    "hospitals": [
      "康寧動物醫院"
    ]
  },
  {
    "id": 24,
    "product": "電動升降診療台",
    "description": "電動升降診療台。",
    "hospitals": [
      "康寧動物醫院"
    ]
  },
  {
    "id": 25,
    "product": "PGS 氬氣刀",
    "description": "PGS 氬氣刀設備。",
    "hospitals": [
      "康寧動物醫院"
    ]
  },
  {
    "id": 26,
    "product": "食道內視鏡 AK47",
    "description": "食道內視鏡 AK47。",
    "hospitals": [
      "松山動物醫院"
    ]
  },
  {
    "id": 27,
    "product": "BOWA 氬氣刀",
    "description": "原資料記載為 BOWA ARC350 電刀及氬氣刀。",
    "hospitals": [
      "松山動物醫院"
    ]
  },
  {
    "id": 28,
    "product": "HD 高清五官鏡",
    "description": "HD 高清五官鏡。",
    "hospitals": [
      "佳恩動物醫院"
    ]
  },
  {
    "id": 29,
    "product": "移動式 X光機",
    "description": "移動式 X 光影像設備。",
    "hospitals": [
      "伊甸園動物醫院"
    ]
  },
  {
    "id": 30,
    "product": "動物麻醉機 ETCO2",
    "description": "動物麻醉相關設備，原資料標示 ETCO2。",
    "hospitals": [
      "伊甸園動物醫院"
    ]
  },
  {
    "id": 31,
    "product": "壁掛式手術燈",
    "description": "壁掛式手術照明設備。",
    "hospitals": [
      "伊甸園動物醫院"
    ]
  },
  {
    "id": 32,
    "product": "異物鉗（未標型號）",
    "description": "原資料僅記載異物鉗，未標示型號。",
    "hospitals": [
      "伊甸園動物醫院"
    ]
  },
  {
    "id": 33,
    "product": "華佗20 麻醉機",
    "description": "華佗20 麻醉設備。",
    "hospitals": [
      "寵樂動物醫院"
    ]
  },
  {
    "id": 34,
    "product": "造影劑",
    "description": "影像檢查使用的造影劑品項。",
    "hospitals": [
      "王樣動物醫院"
    ]
  },
  {
    "id": 35,
    "product": "沈大軟式內視鏡",
    "description": "軟式內視鏡設備。",
    "hospitals": [
      "興泰動物醫院"
    ]
  },
  {
    "id": 36,
    "product": "ICU",
    "description": "動物重症照護 ICU 設備。",
    "hospitals": [
      "人人-埔心動物醫院"
    ]
  },
  {
    "id": 37,
    "product": "HY300 滅菌鍋",
    "description": "HY300 滅菌設備。",
    "hospitals": [
      "青谷動物醫院"
    ]
  },
  {
    "id": 38,
    "product": "輸液幫浦",
    "description": "輸液幫浦設備。",
    "hospitals": [
      "青谷動物醫院"
    ]
  },
  {
    "id": 39,
    "product": "CNS 麻醉機呼吸器",
    "description": "CNS 麻醉機與呼吸器設備。",
    "hospitals": [
      "青谷動物醫院"
    ]
  },
  {
    "id": 40,
    "product": "凝膠（原資料未標品牌）",
    "description": "青谷動物醫院原資料僅記載「凝膠」，未直接標示為舒派特凝膠。",
    "hospitals": [
      "青谷動物醫院"
    ]
  },
  {
    "id": 41,
    "product": "五官鏡（未標型號）",
    "description": "原資料僅記載五官鏡，未標示品牌與型號。",
    "hospitals": [
      "大福小幸動物醫院"
    ]
  },
  {
    "id": 42,
    "product": "製氧機",
    "description": "製氧設備。",
    "hospitals": [
      "大福小幸動物醫院"
    ]
  },
  {
    "id": 43,
    "product": "腸滲淨",
    "description": "依原始採購／使用資料保留品名。",
    "hospitals": [
      "中華蘆竹動物醫院"
    ]
  },
  {
    "id": 44,
    "product": "鋇脫普粉",
    "description": "依原始採購／使用資料保留品名。",
    "hospitals": [
      "中華蘆竹動物醫院"
    ]
  }
];

// ============================================================
// 中部、南部、宜花東使用資料
// 功能：以「地區 + 醫院 + 商品」記錄，避免同名醫院跨區時被錯誤歸類。
// ============================================================
type HospitalRegionKey = "north" | "central" | "south" | "east";

const additionalRecommendationUsageData: Array<{
  region: HospitalRegionKey;
  hospital: string;
  products: string[];
}> = [
  {
    "region": "central",
    "hospital": "國立中興大學獸醫教學醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "康乃爾動物醫院",
    "products": [
      "PETTRUST 血壓計",
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "吉米哈利動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "毛克利動物醫院",
    "products": [
      "輕氧艙",
      "溫風毯機",
      "舒派特凝膠",
      "舒派特敷料系列",
      "喉頭鏡"
    ]
  },
  {
    "region": "central",
    "hospital": "夏洛克動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "心美動物醫院",
    "products": [
      "DRF40 X光機"
    ]
  },
  {
    "region": "central",
    "hospital": "登群動物醫院",
    "products": [
      "超音波機（未標品牌／型號）"
    ]
  },
  {
    "region": "central",
    "hospital": "福爾摩沙動物醫院",
    "products": [
      "超音波機（未標品牌／型號）"
    ]
  },
  {
    "region": "central",
    "hospital": "國際犬貓動物醫院",
    "products": [
      "BOWA ARC350 電刀",
      "超音波機（未標品牌／型號）"
    ]
  },
  {
    "region": "central",
    "hospital": "恩怡動物醫院",
    "products": [
      "超音波機（未標品牌／型號）"
    ]
  },
  {
    "region": "central",
    "hospital": "龜毛動物醫院",
    "products": [
      "BOWA ARC350 電刀"
    ]
  },
  {
    "region": "central",
    "hospital": "康澄診所",
    "products": [
      "BOWA ARC400 電刀",
      "BOWA 氬氣刀"
    ]
  },
  {
    "region": "central",
    "hospital": "森洧動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "羅大宇動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "透視動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "毛暖動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "九九峰動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "凱特森貓動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "central",
    "hospital": "蓋荳動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "鈞懋動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "信安動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "喬丹動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "大甲聖愛動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "大甲建安動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "凡賽爾賽鴿動物醫院",
    "products": [
      "舒派特凝膠"
    ]
  },
  {
    "region": "south",
    "hospital": "快樂動物醫院",
    "products": [
      "BOWA ARC350 電刀",
      "輕氧艙",
      "V型電動升降手術台",
      "吸引器"
    ]
  },
  {
    "region": "south",
    "hospital": "高醫動物醫院",
    "products": [
      "LOTUS 超音波刀",
      "高速電動鑽具",
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "國際犬貓動物醫院",
    "products": [
      "LOTUS 超音波刀",
      "喉頭鏡"
    ]
  },
  {
    "region": "south",
    "hospital": "萌星人動物醫院",
    "products": [
      "BOWA ARC400 電刀",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "慈愛動物醫院（台南總院）",
    "products": [
      "吻合器",
      "疝氣腹膜網"
    ]
  },
  {
    "region": "south",
    "hospital": "梅西動物醫療中心",
    "products": [
      "舒派特凝膠"
    ]
  },
  {
    "region": "south",
    "hospital": "宏力動物醫院",
    "products": [
      "BOWA ARC400 電刀",
      "PETTRUST 血壓計",
      "沈大軟式內視鏡",
      "動物專用異物鉗 AK47",
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "德民動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "永安動物醫院",
    "products": [
      "PETTRUST 血壓計",
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "樂樂動物醫院",
    "products": [
      "沈大軟式內視鏡",
      "油壓手術台",
      "血管夾",
      "異物鉗（未標型號）",
      "ICU"
    ]
  },
  {
    "region": "south",
    "hospital": "聯盟動物醫院",
    "products": [
      "溫風毯機",
      "舒派特凝膠",
      "疝氣腹膜網"
    ]
  },
  {
    "region": "south",
    "hospital": "順心動物醫院",
    "products": [
      "BOWA ARC350 電刀"
    ]
  },
  {
    "region": "south",
    "hospital": "忠愛動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "south",
    "hospital": "大豐獸醫院-路竹分院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "雨聲動物醫院",
    "products": [
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "國立屏東科技大學",
    "products": [
      "BOWA ARC350 電刀",
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "博聯動物醫院",
    "products": [
      "A.R.C. FOX810 雷射主機",
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "south",
    "hospital": "河堤中興動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "吉貝爾動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "佳里動物醫院",
    "products": [
      "PETTRUST 血壓計"
    ]
  },
  {
    "region": "south",
    "hospital": "河童動物醫院",
    "products": [
      "舒派特凝膠"
    ]
  },
  {
    "region": "south",
    "hospital": "酷比動物醫院",
    "products": [
      "舒派特敷料系列"
    ]
  },
  {
    "region": "east",
    "hospital": "維倫斯動物醫院",
    "products": [
      "TOP 輸液幫浦",
      "磅秤",
      "顯微鏡",
      "手術台",
      "喉頭鏡"
    ]
  },
  {
    "region": "east",
    "hospital": "新和動物醫院",
    "products": [
      "舒派特凝膠"
    ]
  },
  {
    "region": "east",
    "hospital": "友博動物醫院",
    "products": [
      "BOWA ARC350 電刀"
    ]
  },
  {
    "region": "east",
    "hospital": "和平動物醫院",
    "products": [
      "滅菌鍋（未標型號）",
      "洗牙機",
      "磅秤",
      "舒派特凝膠",
      "鋇粉",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "east",
    "hospital": "中華動物醫院",
    "products": [
      "BOWA ARC350 電刀",
      "輕氧艙",
      "HY230S 滅菌鍋"
    ]
  },
  {
    "region": "east",
    "hospital": "永安動物醫院",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "north",
    "hospital": "嘉仕美整形外科診所",
    "products": [
      "直立式蒸汽滅菌鍋",
      "手術燈（未標型號）",
      "手術台",
      "生理監視器（未標型號）"
    ]
  },
  {
    "region": "north",
    "hospital": "綺色佳醫美診所",
    "products": [
      "200型電刀",
      "生理監視器（未標型號）"
    ]
  },
  {
    "region": "north",
    "hospital": "儷人整形外科診所",
    "products": [
      "德國 WOLF 鏡頭"
    ]
  },
  {
    "region": "north",
    "hospital": "木生婦幼診所",
    "products": [
      "CASP 電漿滅菌／消毒鍋",
      "數位封口機"
    ]
  },
  {
    "region": "north",
    "hospital": "樹林仁愛醫院",
    "products": [
      "CASP 電漿滅菌／消毒鍋"
    ]
  },
  {
    "region": "south",
    "hospital": "天富教育培訓中心",
    "products": [
      "直線吻合器"
    ]
  },
  {
    "region": "north",
    "hospital": "台北市動保處",
    "products": [
      "舒派特敷料系列"
    ]
  },
  {
    "region": "north",
    "hospital": "台北市立動物園",
    "products": [
      "造影劑",
      "X光底片",
      "鋇粉",
      "舒派特凝膠"
    ]
  },
  {
    "region": "north",
    "hospital": "綠世界生態農場",
    "products": [
      "舒派特凝膠",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "central",
    "hospital": "九九峰動物樂園",
    "products": [
      "PETTRUST 血壓計",
      "電動交叉磅秤手術台",
      "舒派特敷料系列"
    ]
  },
  {
    "region": "south",
    "hospital": "頑皮世界野生動物園",
    "products": [
      "PEDGRACE 傷口呼呼貼",
      "舒派特敷料系列"
    ]
  }
];

const additionalProductDescriptions: Record<string, string> = {
  "BOWA ARC400 電刀": "BOWA ARC400 高頻電外科設備，依提供的實際採購／使用資料整理。",
  "V型電動升降手術台": "動物手術用電動升降手術台，依提供的實際採購／使用資料整理。",
  "吸引器": "醫療吸引設備，依提供的實際採購／使用資料整理。",
  "高速電動鑽具": "手術用高速電動鑽具，依提供的實際採購／使用資料整理。",
  "吻合器": "手術吻合器，依提供的實際採購／使用資料整理。",
  "油壓手術台": "動物手術用油壓手術台，依提供的實際採購／使用資料整理。",
  "血管夾": "手術用血管夾，依提供的實際採購／使用資料整理。",
  "TOP 輸液幫浦": "TOP 輸液幫浦，依提供的實際採購／使用資料整理。",
  "磅秤": "動物醫療用磅秤，依提供的實際採購／使用資料整理。",
  "顯微鏡": "臨床檢驗用顯微鏡，依提供的實際採購／使用資料整理。",
  "手術台": "動物手術台，依提供的實際採購／使用資料整理。",
  "滅菌鍋（未標型號）": "滅菌設備，原始資料未標示品牌／型號。",
  "洗牙機": "動物牙科洗牙設備，依提供的實際採購／使用資料整理。",
  "鋇粉": "造影用鋇粉，依提供的實際採購／使用資料整理。",
  "HY230S 滅菌鍋": "HY230S 滅菌設備，依提供的實際採購／使用資料整理。",
  "直立式蒸汽滅菌鍋": "直立式蒸汽滅菌設備，依提供的實際採購／使用資料整理。",
  "手術燈（未標型號）": "手術照明設備，原始資料未標示品牌／型號。",
  "200型電刀": "原始資料記載為 200 型電刀，依提供的實際採購／使用資料整理。",
  "德國 WOLF 鏡頭": "德國 WOLF 內視鏡相關鏡頭，依提供的實際採購／使用資料整理。",
  "數位封口機": "醫療包裝用數位封口設備，依提供的實際採購／使用資料整理。",
  "直線吻合器": "手術用直線吻合器，依提供的實際採購／使用資料整理。",
  "X光底片": "X 光影像底片，依提供的實際採購／使用資料整理。",
  "電動交叉磅秤手術台": "原始資料記載為電動交叉磅秤手術台，依提供的實際採購／使用資料整理。",
  "PEDGRACE 傷口呼呼貼": "PEDGRACE 傷口照護產品，依提供的實際採購／使用資料整理。"
};

// 功能：將新增區域資料合併到既有北部商品清單，同商品／同醫院自動去重。
const recommendationProducts = (() => {
  const products = northRecommendationProducts.map((group) => ({
    ...group,
    hospitals: [...group.hospitals],
  }));
  let nextId = Math.max(...products.map((group) => group.id)) + 1;

  for (const usage of additionalRecommendationUsageData) {
    for (const productName of usage.products) {
      let group = products.find((item) => item.product === productName);

      if (!group) {
        group = {
          id: nextId++,
          product: productName,
          description:
            additionalProductDescriptions[productName] ??
            "依提供的實際採購／使用資料整理。",
          hospitals: [],
        };
        products.push(group);
      }

      if (!group.hospitals.includes(usage.hospital)) {
        group.hospitals.push(usage.hospital);
      }
    }
  }

  return products;
})();

// 功能：取得「特定商品在特定醫院」所屬地區；同一名稱可同時存在不同區域。
function getProductHospitalRegions(
  productName: string,
  hospitalName: string,
): HospitalRegionKey[] {
  const regions = new Set<HospitalRegionKey>();

  const northGroup = northRecommendationProducts.find(
    (group) => group.product === productName,
  );
  if (northGroup?.hospitals.includes(hospitalName)) {
    regions.add("north");
  }

  for (const usage of additionalRecommendationUsageData) {
    if (
      usage.hospital === hospitalName &&
      usage.products.includes(productName)
    ) {
      regions.add(usage.region);
    }
  }

  return Array.from(regions);
}

// 功能：首頁只顯示三個代表性商品。
const featuredProductNames = [
  "舒派特凝膠",
  "舒派特敷料系列",
  "PETTRUST 血壓計",
];

const featuredRecommendations = recommendationProducts.filter((item) =>
  featuredProductNames.includes(item.product),
);

// ============================================================
// 推薦器材地區分類
// 功能：以商品 + 醫院關係判斷地區，可正確處理同名醫院跨區資料。
// ============================================================
type RecommendationRegionKey = "all" | HospitalRegionKey;

const activeRecommendationRegion = ref<RecommendationRegionKey>("all");
// 功能：手機版地區篩選預設收起，避免上方佔用過多空間。
const mobileRegionFilterExpanded = ref(false);

const recommendationRegionLabels: Record<RecommendationRegionKey, string> = {
  all: "全部",
  north: "北部",
  central: "中部",
  south: "南部",
  east: "宜花東",
};

const allRecommendationHospitals = computed(() =>
  Array.from(new Set(recommendationProducts.flatMap((item) => item.hospitals))),
);

function getRegionHospitalCount(regionKey: HospitalRegionKey): number {
  const hospitals = new Set<string>();

  for (const group of recommendationProducts) {
    for (const hospital of group.hospitals) {
      if (getProductHospitalRegions(group.product, hospital).includes(regionKey)) {
        hospitals.add(hospital);
      }
    }
  }

  return hospitals.size;
}

const recommendationRegions = computed(() => {
  const keys: RecommendationRegionKey[] = [
    "all",
    "north",
    "central",
    "south",
    "east",
  ];

  return keys.map((key) => ({
    key,
    label: recommendationRegionLabels[key],
    count:
      key === "all"
        ? allRecommendationHospitals.value.length
        : getRegionHospitalCount(key),
  }));
});

const currentRecommendationRegion = computed(() => {
  const regionKey = activeRecommendationRegion.value;

  const groups = recommendationProducts
    .map((group) => ({
      ...group,
      hospitals:
        regionKey === "all"
          ? group.hospitals
          : group.hospitals.filter((hospital) =>
              getProductHospitalRegions(group.product, hospital).includes(regionKey),
            ),
    }))
    .filter((group) => group.hospitals.length > 0);

  const hospitalCount = new Set(groups.flatMap((group) => group.hospitals)).size;

  return {
    key: regionKey,
    title: recommendationRegionLabels[regionKey] + "器材使用單位",
    hospitalCount,
    groups,
  };
});

// ============================================================
// 商品圖片預覽
// 功能：先綁定專案內現有且能明確對應品牌的圖片，其餘顯示待補提示。
// ============================================================
type ProductPreviewImage = {
  src: string;
  name: string;
};

function getProductPreviewImages(productName: string): ProductPreviewImage[] {
  // ==========================================================
  // 舒派特系列商品圖片
  // 功能：每張圖片都可擁有自己的商品名稱；多圖切換時標題會同步切換。
  // ==========================================================
  if (productName === "舒派特凝膠") {
    return [{ src: savpet1, name: "舒派特凝膠" }];
  }

  if (productName === "舒派特敷料系列") {
    return [
      { src: savpet2, name: "抗菌無痛滲液敷料" },
      { src: savpet3, name: "好吸海藻敷料" },
      { src: savpet4, name: "抗菌含銀泡棉敷料" },
    ];
  }
  
  if (productName === "PETTRUST 血壓計") {
    return [{ src: savpet1, name: "舒派特凝膠" }];
  }

  // 功能：其他已存在的品牌圖片維持原本對應，名稱沿用目前商品名稱。
  if (productName.includes("PETTRUST")) return [{ src: pettrustLogo, name: productName }];
  if (productName.includes("BOWA")) return [{ src: bowaLogo, name: productName }];
  if (productName.includes("MTS")) return [{ src: mtsLogo, name: productName }];
  if (productName.includes("WOLF")) return [{ src: wolfLogo, name: productName }];

  return [];
}

function getProductPreviewImage(productName: string): string | null {
  return getProductPreviewImages(productName)[0]?.src ?? null;
}

// ============================================================
// 手機商品圖片全螢幕檢視器
// 功能：雙指縮放、放大後單指拖曳、按鈕縮放與重設。
// ============================================================
const mobilePreviewProduct = ref<string | null>(null);
const mobilePreviewIndex = ref(0);
const mobilePreviewScale = ref(1);
const mobilePreviewTranslateX = ref(0);
const mobilePreviewTranslateY = ref(0);

let previewInitialPinchDistance = 0;
let previewInitialPinchScale = 1;
let previewPanStartX = 0;
let previewPanStartY = 0;
let previewPanOriginX = 0;
let previewPanOriginY = 0;
let previewSwipeStartX = 0;
let previewSwipeStartY = 0;

const mobilePreviewImages = computed(() =>
  mobilePreviewProduct.value
    ? getProductPreviewImages(mobilePreviewProduct.value)
    : [],
);

const mobilePreviewCurrentItem = computed(
  () => mobilePreviewImages.value[mobilePreviewIndex.value] ?? null,
);

const mobilePreviewImage = computed(
  () => mobilePreviewCurrentItem.value?.src ?? null,
);

const mobilePreviewCurrentName = computed(
  () => mobilePreviewCurrentItem.value?.name ?? mobilePreviewProduct.value ?? "",
);

const mobilePreviewImageStyle = computed(() => ({
  transform:
    `translate3d(${mobilePreviewTranslateX.value}px, ${mobilePreviewTranslateY.value}px, 0) scale(${mobilePreviewScale.value})`,
}));

function openMobileProductPreview(productName: string) {
  if (!import.meta.client) return;

  mobilePreviewProduct.value = productName;
  mobilePreviewIndex.value = 0;
  resetMobileProductPreview();
}

function closeMobileProductPreview() {
  mobilePreviewProduct.value = null;
  mobilePreviewIndex.value = 0;
  resetMobileProductPreview();
}

function resetMobileProductPreview() {
  mobilePreviewScale.value = 1;
  mobilePreviewTranslateX.value = 0;
  mobilePreviewTranslateY.value = 0;
  previewInitialPinchDistance = 0;
}

function changeMobilePreviewScale(delta: number) {
  const nextScale = Math.min(4, Math.max(1, mobilePreviewScale.value + delta));
  mobilePreviewScale.value = nextScale;

  if (nextScale === 1) {
    mobilePreviewTranslateX.value = 0;
    mobilePreviewTranslateY.value = 0;
  }
}

function showPreviousMobilePreviewImage() {
  if (mobilePreviewImages.value.length <= 1) return;
  mobilePreviewIndex.value =
    (mobilePreviewIndex.value - 1 + mobilePreviewImages.value.length) %
    mobilePreviewImages.value.length;
  resetMobileProductPreview();
}

function showNextMobilePreviewImage() {
  if (mobilePreviewImages.value.length <= 1) return;
  mobilePreviewIndex.value =
    (mobilePreviewIndex.value + 1) % mobilePreviewImages.value.length;
  resetMobileProductPreview();
}

function getTouchDistance(touches: TouchList) {
  // 功能：TouchList 使用 item() 安全取得觸控點，避免索引值可能為 undefined。
  const firstTouch = touches.item(0);
  const secondTouch = touches.item(1);

  if (!firstTouch || !secondTouch) return 0;

  const dx = firstTouch.clientX - secondTouch.clientX;
  const dy = firstTouch.clientY - secondTouch.clientY;
  return Math.hypot(dx, dy);
}

function onPreviewTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    previewInitialPinchDistance = getTouchDistance(event.touches);
    previewInitialPinchScale = mobilePreviewScale.value;
    return;
  }

  if (event.touches.length === 1) {
    // 功能：先安全取得唯一觸控點，再處理拖曳或左右滑動。
    const touch = event.touches.item(0);
    if (!touch) return;

    if (mobilePreviewScale.value > 1) {
      previewPanStartX = touch.clientX;
      previewPanStartY = touch.clientY;
      previewPanOriginX = mobilePreviewTranslateX.value;
      previewPanOriginY = mobilePreviewTranslateY.value;
      return;
    }

    previewSwipeStartX = touch.clientX;
    previewSwipeStartY = touch.clientY;
  }
}

function onPreviewTouchMove(event: TouchEvent) {
  if (event.touches.length === 2 && previewInitialPinchDistance > 0) {
    const distance = getTouchDistance(event.touches);
    const ratio = distance / previewInitialPinchDistance;
    mobilePreviewScale.value = Math.min(4, Math.max(1, previewInitialPinchScale * ratio));

    if (mobilePreviewScale.value === 1) {
      mobilePreviewTranslateX.value = 0;
      mobilePreviewTranslateY.value = 0;
    }
    return;
  }

  if (event.touches.length === 1 && mobilePreviewScale.value > 1) {
    // 功能：放大圖片後，使用單一觸控點進行平移。
    const touch = event.touches.item(0);
    if (!touch) return;

    mobilePreviewTranslateX.value =
      previewPanOriginX + (touch.clientX - previewPanStartX);
    mobilePreviewTranslateY.value =
      previewPanOriginY + (touch.clientY - previewPanStartY);
  }
}

function onPreviewTouchEnd(event: TouchEvent) {
  if (event.touches.length < 2) {
    previewInitialPinchDistance = 0;
  }

  if (
    event.touches.length === 0 &&
    mobilePreviewScale.value === 1 &&
    mobilePreviewImages.value.length > 1 &&
    event.changedTouches.length > 0
  ) {
    // 功能：changedTouches 也先安全取值，避免 TouchList 索引的 undefined 型別錯誤。
    const changedTouch = event.changedTouches.item(0);

    if (changedTouch) {
      const endX = changedTouch.clientX;
      const endY = changedTouch.clientY;
      const deltaX = endX - previewSwipeStartX;
      const deltaY = endY - previewSwipeStartY;

      // 功能：只接受明顯的水平滑動，避免一般點擊或上下操作誤觸換圖。
      if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) showNextMobilePreviewImage();
        else showPreviousMobilePreviewImage();
      }
    }
  }

  if (event.touches.length === 1 && mobilePreviewScale.value > 1) {
    const touch = event.touches.item(0);
    if (!touch) return;

    previewPanStartX = touch.clientX;
    previewPanStartY = touch.clientY;
    previewPanOriginX = mobilePreviewTranslateX.value;
    previewPanOriginY = mobilePreviewTranslateY.value;
  }
}

const brands = [
  { id: 1, name: "BOWA", logo: bowaLogo },
  { id: 2, name: "blue", logo: blueLogo },
  { id: 3, name: "PETTRUST", logo: pettrustLogo },
  { id: 4, name: "Wolf", logo: wolfLogo },
  { id: 5, name: "MTS", logo: mtsLogo },
  { id: 6, name: "Pedgrace", logo: pedgraceLogo },
];

// ============================================================
// 手機版推薦器材 Modal 狀態
// 功能：搜尋、Accordion 單一展開，以及醫院先顯示 6 家。
// ============================================================
const recommendationSearchKeyword = ref("");
const selectedDesktopProductId = ref<number | null>(null);
const selectedMobileProductId = ref<number | null>(null);
const expandedHospitalProductId = ref<number | null>(null);
const mobileHospitalPreviewCount = 6;

// 功能：桌機器材列表依視窗寬度切換每頁數量。
// >= 1200px：3 欄 × 6 列 = 18 項；940~1199px：2 欄 × 6 列 = 12 項。
const desktopProductPageSize = ref(18);
const desktopProductPage = ref(1);

function syncDesktopProductPageSize() {
  if (!import.meta.client) return;

  const width = window.innerWidth;
  const nextPageSize = width >= 940 && width < 1200 ? 12 : 18;

  if (desktopProductPageSize.value === nextPageSize) return;

  desktopProductPageSize.value = nextPageSize;
  desktopProductPage.value = 1;
  selectedDesktopProductId.value = null;
}

onMounted(() => {
  syncDesktopProductPageSize();
  window.addEventListener("resize", syncDesktopProductPageSize);
});

const filteredRecommendationGroups = computed(() => {
  const keyword = recommendationSearchKeyword.value.trim().toLocaleLowerCase();
  const groups = currentRecommendationRegion.value.groups;

  if (!keyword) return groups;

  return groups.flatMap((group) => {
    const productMatched = group.product.toLocaleLowerCase().includes(keyword);
    const descriptionMatched = group.description
      .toLocaleLowerCase()
      .includes(keyword);

    // 功能：搜尋商品時保留該商品全部使用單位；
    // 搜尋單位名稱時，只留下符合關鍵字的使用單位，讓結果更精準。
    if (productMatched || descriptionMatched) return [group];

    const matchedHospitals = group.hospitals.filter((hospital) =>
      hospital.toLocaleLowerCase().includes(keyword),
    );

    return matchedHospitals.length > 0
      ? [{ ...group, hospitals: matchedHospitals }]
      : [];
  });
});

// 功能：依搜尋／地區結果計算桌機器材總頁數。
const desktopProductTotalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRecommendationGroups.value.length / desktopProductPageSize.value)),
);

// 功能：提供桌機分頁按鈕，目前資料量不大，直接顯示所有頁碼最清楚。
const desktopProductPageNumbers = computed(() =>
  Array.from({ length: desktopProductTotalPages.value }, (_, index) => index + 1),
);

// 功能：依目前桌機寬度，只提供該頁 12 或 18 項器材給左側目錄。
const paginatedDesktopRecommendationGroups = computed(() => {
  const start = (desktopProductPage.value - 1) * desktopProductPageSize.value;
  return filteredRecommendationGroups.value.slice(
    start,
    start + desktopProductPageSize.value,
  );
});

// 功能：桌機右側永遠顯示目前選中的商品；若搜尋後商品不存在，
// 自動顯示搜尋結果的第一項，不需要使用者再手動點一次。
const selectedDesktopRecommendationGroup = computed(() => {
  const groups = paginatedDesktopRecommendationGroups.value;
  if (groups.length === 0) return null;

  return (
    groups.find((group) => group.id === selectedDesktopProductId.value) ??
    groups.at(0) ??
    null
  );
});

// 功能：手機採「列表 → 詳細」兩層瀏覽，未選商品時回傳 null。
const selectedMobileRecommendationGroup = computed(() => {
  if (selectedMobileProductId.value === null) return null;

  return (
    filteredRecommendationGroups.value.find(
      (group) => group.id === selectedMobileProductId.value,
    ) ?? null
  );
});

function selectRecommendationRegion(regionKey: RecommendationRegionKey) {
  activeRecommendationRegion.value = regionKey;
  mobileRegionFilterExpanded.value = false;
  desktopProductPage.value = 1;
  selectedDesktopProductId.value = null;
  selectedMobileProductId.value = null;
  expandedHospitalProductId.value = null;
}

function selectDesktopProduct(productId: number) {
  selectedDesktopProductId.value = productId;
}

// 功能：切換桌機器材頁面，並重設右側商品為新頁面的第一項。
function goToDesktopProductPage(page: number) {
  const targetPage = Math.min(
    Math.max(page, 1),
    desktopProductTotalPages.value,
  );

  desktopProductPage.value = targetPage;
  selectedDesktopProductId.value = null;
}

// 功能：搜尋條件改變時回到第 1 頁，避免停留在不存在的頁碼。
watch(recommendationSearchKeyword, () => {
  desktopProductPage.value = 1;
  selectedDesktopProductId.value = null;
});

function selectMobileProduct(productId: number) {
  selectedMobileProductId.value = productId;
  expandedHospitalProductId.value = null;
}

function backToMobileProductList() {
  selectedMobileProductId.value = null;
  expandedHospitalProductId.value = null;
}

function toggleMobileHospitals(productId: number) {
  expandedHospitalProductId.value =
    expandedHospitalProductId.value === productId ? null : productId;
}

function getVisibleMobileHospitals(group: (typeof recommendationProducts)[number]) {
  if (expandedHospitalProductId.value === group.id) return group.hospitals;
  return group.hospitals.slice(0, mobileHospitalPreviewCount);
}

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
  closeMobileProductPreview();
  mobileRegionFilterExpanded.value = false;
  modalVisible.value = false;
  recommendationSearchKeyword.value = "";
  selectedDesktopProductId.value = null;
  selectedMobileProductId.value = null;
  desktopProductPage.value = 1;
  expandedHospitalProductId.value = null;
  unlockPageScroll();
}

function showAllRecommendations() {
  if (!import.meta.client) return;

  mobileRegionFilterExpanded.value = false;

  recommendationSearchKeyword.value = "";
  selectedDesktopProductId.value = null;
  selectedMobileProductId.value = null;
  desktopProductPage.value = 1;
  expandedHospitalProductId.value = null;
  modalVisible.value = true;
  lockPageScroll();
}

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("resize", syncDesktopProductPageSize);
  }
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .about-page {
    overflow-x: hidden;
  }

  .about-hero {
    height: clamp(420px, 46vw, 500px);
    min-height: 420px;
  }

  .about-hero-copy {
    width: min(62vw, 760px);
    padding: clamp(46px, 5vw, 64px) clamp(24px, 3vw, 36px)
      clamp(42px, 4vw, 56px) clamp(42px, 6vw, 72px);
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
    padding: clamp(46px, 5vw, 58px) clamp(24px, 4vw, 40px)
      clamp(52px, 5vw, 64px);
  }

  .mission-item {
    padding-inline: clamp(20px, 2.8vw, 34px);
  }

  .company-profile-section {
    padding: clamp(48px, 5vw, 62px) clamp(24px, 4vw, 40px)
      clamp(54px, 5vw, 68px);
  }

  .company-profile-container {
    grid-template-columns: minmax(300px, 0.95fr) minmax(0, 1.05fr);
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

  .recommendation-visual {
    min-height: 202px;
  }
  .recommendation-copy {
    padding: clamp(18px, 2vw, 22px);
  }

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

  .about-hero-overlay {
    display: none;
  }

  .about-hero-copy {
    width: 100%;
    height: auto;
    padding: clamp(34px, 5vw, 46px) clamp(24px, 5vw, 40px)
      clamp(40px, 6vw, 52px);
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

  .about-hero-copy p br {
    display: none;
  }

  .mission-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mission-item {
    padding: clamp(24px, 4vw, 32px) clamp(20px, 4vw, 28px);
  }

  .mission-item:nth-child(2)::after {
    display: none;
  }
  .mission-item:nth-child(-n + 2) {
    border-bottom: 1px solid var(--about-line);
  }

  .company-profile-container {
    grid-template-columns: 1fr;
    gap: clamp(28px, 5vw, 40px);
  }

  .company-profile-visual {
    width: min(100%, 680px);
    margin: 0 auto;
  }

  .company-profile-image {
    width: 100%;
    height: auto;
  }

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

  .recommendation-visual {
    min-height: 190px;
  }

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

  .region-tabs::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 640px) {
  .about-hero-media {
    height: clamp(230px, 62vw, 310px);
  }

  .about-hero-copy {
    padding: clamp(28px, 7vw, 36px) clamp(18px, 5vw, 24px)
      clamp(34px, 8vw, 44px);
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

  .mission-heading h2 {
    font-size: clamp(23px, 6.5vw, 27px);
  }

  .mission-grid {
    grid-template-columns: 1fr;
  }

  .mission-item,
  .mission-item:nth-child(-n + 2) {
    padding: 24px 16px;
    border-bottom: 1px solid var(--about-line);
  }

  .mission-item:last-child {
    border-bottom: 0;
  }
  .mission-item::after {
    display: none !important;
  }

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

  .company-profile-container {
    gap: 24px;
  }

  .company-profile-heading h2 {
    font-size: clamp(24px, 7vw, 30px);
  }

  .company-profile-heading span {
    margin-bottom: 18px;
  }

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

  .recommendation-visual {
    min-height: 168px;
  }
  .recommendation-visual svg {
    width: 46px;
    height: 46px;
  }

  .recommendation-copy {
    padding: 16px 14px;
  }
  .recommendation-head h3 {
    font-size: 17px;
  }
  .recommendation-description {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.65;
  }
  .recommendation-hospitals {
    margin-top: 12px;
    padding-top: 12px;
  }
  .hospital-tags {
    gap: 6px;
  }
  .hospital-tag,
  .hospital-more-badge {
    min-height: 32px;
    padding: 6px 11px;
    font-size: 12.5px;
    line-height: 1.4;
  }

  .partners-section {
    padding: 20px 0 48px;
  }
  .partners-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 22px;
  }

  .partner-item {
    min-height: 58px;
    padding: 6px 2px;
  }
  .partner-item img {
    max-height: 42px;
  }

  .recommendation-modal {
    padding: 6px;
  }

  .recommendation-modal-panel {
    width: 100%;
    height: 94dvh;
    border-radius: 18px;
  }

  .recommendation-modal-header {
    padding: 18px 16px 12px;
  }

  .modal-title-block h2 {
    font-size: 20px;
  }
  .modal-title-block p {
    font-size: 11.5px;
  }

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

  .region-overview {
    margin-bottom: 12px;
  }
  .region-overview h3 {
    font-size: 18px;
  }

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

  .product-summary-copy h4 {
    font-size: 16px;
  }
  .product-summary-copy p {
    font-size: 11.5px;
  }

  .hospital-chip-list {
    gap: 6px;
  }
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
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.04) 32%,
      rgba(255, 255, 255, 0.72) 58%,
      rgba(255, 255, 255, 0.96) 72%,
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
    letter-spacing: 0.1em;
  }

  .about-hero h1 {
    max-width: 10.8em;
    margin: 0 0 14px;
    color: var(--about-ink);
    font-size: clamp(29px, 8vw, 36px);
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: 0.025em;
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
    padding: clamp(44px, 6vw, 68px) clamp(24px, 6vw, 56px)
      clamp(46px, 6vw, 64px);
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
.partner-item {
  animation: about-content-fade-in 0.68s cubic-bezier(0.22, 1, 0.36, 1)
    backwards;
}
.about-hero-media img,
.company-profile-visual {
  animation-name: about-media-fade-in;
  animation-duration: 0.8s;
}
.mission-item:nth-child(2),
.recommendation-card:nth-child(2),
.partner-item:nth-child(2) {
  animation-delay: 0.06s;
}
.mission-item:nth-child(3),
.recommendation-card:nth-child(3),
.partner-item:nth-child(3) {
  animation-delay: 0.12s;
}
.mission-item:nth-child(4),
.partner-item:nth-child(4) {
  animation-delay: 0.18s;
}
.partner-item:nth-child(5) {
  animation-delay: 0.24s;
}
.partner-item:nth-child(6) {
  animation-delay: 0.3s;
}
@keyframes about-content-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes about-media-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .about-hero-copy > *,
  .about-hero-media img,
  .mission-heading,
  .mission-item,
  .company-profile-visual,
  .company-profile-copy > *,
  .section-title-row,
  .recommendation-card,
  .recommendation-more,
  .partner-item {
    animation: none !important;
  }
}

/* ============================================================
   醫師使用器材推薦：三欄純文字卡片最終版
   功能：桌機三張同排，移除首頁推薦卡 icon 與色塊背景。
============================================================ */
.recommendation-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.recommendation-card {
  grid-template-columns: minmax(0, 1fr);
  min-height: 220px;
}

.recommendation-copy {
  grid-column: 1 / -1;
  padding: 26px 28px 24px;
}

@media (max-width: 1179px) {
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .recommendation-card {
    grid-template-columns: minmax(0, 1fr);
    min-height: 210px;
  }
}

@media (max-width: 640px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-card {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }

  .recommendation-copy {
    padding: 18px 16px;
  }
}

/* ============================================================
   推薦詳情 Modal：移除商品 icon
   功能：商品資訊改為純文字，移除左側圖示及其預留欄位。
============================================================ */
.product-summary {
  grid-template-columns: minmax(0, 1fr);
}

/* ============================================================
   商品圖片 Hover 預覽
   功能：商品名稱右側顯示圖片 icon；桌機 hover / focus、手機點擊聚焦後顯示預覽。
============================================================ */
.product-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-title-line h4 {
  margin: 4px 0 7px;
}

.product-preview-trigger {
  position: relative;
  display: inline-grid;
  width: 30px;
  height: 30px;
  padding: 0;
  flex: 0 0 auto;
  cursor: pointer;
  color: #3b8f91;
  background: #f3f8f8;
  border: 1px solid #dce8e8;
  border-radius: 50%;
  font-size: 13px;
  place-items: center;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.product-preview-trigger:hover,
.product-preview-trigger:focus-visible {
  background: #e9f4f4;
  border-color: #bcd8d8;
  transform: translateY(-1px);
}

.product-preview-popover {
  position: absolute;
  z-index: 40;
  top: calc(100% + 10px);
  left: 0;
  display: grid;
  width: 240px;
  min-height: 150px;
  padding: 10px;
  pointer-events: none;
  visibility: hidden;
  opacity: 0;
  background: #fff;
  border: 1px solid #dfe8e8;
  border-radius: 14px;
  box-shadow: 0 18px 44px rgba(22, 43, 60, 0.18);
  transform: translateY(6px);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    visibility 0.18s ease;
  place-items: center;
}

.product-preview-trigger:hover .product-preview-popover,
.product-preview-trigger:focus .product-preview-popover,
.product-preview-trigger:focus-visible .product-preview-popover {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.product-preview-popover img {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: contain;
  border-radius: 10px;
}

.product-preview-placeholder {
  display: grid;
  width: 100%;
  min-height: 150px;
  padding: 18px;
  color: #7d8c93;
  background: #f7f9f9;
  border: 1px dashed #d7e1e2;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  place-items: center;
}

@media (max-width: 640px) {
  .product-preview-popover {
    left: auto;
    right: 0;
    width: min(240px, 72vw);
  }
}

/* ============================================================
   推薦器材 Modal：手機 Accordion 最終版
   功能：手機只顯示精簡商品列，展開後先顯示 6 個使用單位，並提供搜尋。
============================================================ */
.mobile-recommendation-search,
.mobile-product-toggle,
.hospital-chip-list-mobile,
.mobile-hospital-more {
  display: none;
}

@media (max-width: 640px) {
  .recommendation-modal-content {
    padding: 14px 14px 20px;
  }

  .region-overview {
    margin-bottom: 12px;
  }

  .mobile-recommendation-search {
    display: flex;
    min-height: 44px;
    margin-bottom: 14px;
    padding: 0 12px;
    align-items: center;
    gap: 9px;
    color: #6c7c84;
    background: #f7f9f9;
    border: 1px solid #dfe7e8;
    border-radius: 12px;
  }

  .mobile-recommendation-search > i {
    flex: 0 0 auto;
    color: #3b8f91;
    font-size: 13px;
  }

  .mobile-recommendation-search input {
    width: 100%;
    min-width: 0;
    padding: 0;
    color: #173247;
    background: transparent;
    border: 0;
    outline: 0;
    font: inherit;
    font-size: 13px;
  }

  .mobile-recommendation-search input::-webkit-search-cancel-button {
    display: none;
  }

  .mobile-recommendation-search > button {
    display: grid;
    width: 28px;
    height: 28px;
    padding: 0;
    flex: 0 0 auto;
    cursor: pointer;
    color: #718087;
    background: transparent;
    border: 0;
    font-size: 18px;
    place-items: center;
  }

  .region-product-list {
    gap: 8px;
    border-top: 0;
  }

  .modal-product-row {
    display: block;
    padding: 0;
    overflow: visible;
    background: #fff;
    border: 1px solid #e1e8e9;
    border-radius: 13px;
  }

  .product-summary {
    display: block;
  }

  .product-summary-copy {
    padding: 13px 13px 12px;
  }

  .product-title-line {
    min-height: 34px;
    gap: 7px;
  }

  .product-title-line h4 {
    min-width: 0;
    margin: 0;
    flex: 1 1 auto;
    font-size: 15px;
    line-height: 1.45;
  }

  .product-preview-trigger {
    width: 28px;
    height: 28px;
  }

  .mobile-product-toggle {
    display: inline-flex;
    min-height: 30px;
    padding: 0 4px 0 7px;
    flex: 0 0 auto;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #668087;
    background: transparent;
    border: 0;
    font-size: 11px;
    font-weight: 800;
  }

  .mobile-product-toggle i {
    font-size: 10px;
    transition: transform 0.18s ease;
  }

  .modal-product-row.mobile-expanded .mobile-product-toggle i {
    transform: rotate(180deg);
  }

  .modal-product-row:not(.mobile-expanded) .product-summary-copy > p,
  .modal-product-row:not(.mobile-expanded) .product-hospitals {
    display: none;
  }

  .product-summary-copy > p {
    margin: 10px 0 0;
    color: #73838b;
    font-size: 11.5px;
    line-height: 1.65;
  }

  .product-hospitals {
    padding: 0 13px 13px;
    border-top: 1px solid #edf1f1;
  }

  .product-hospitals-heading {
    margin: 11px 0 9px;
  }

  .product-hospitals-heading > span {
    font-size: 10px;
  }

  .product-hospitals-heading strong {
    display: none;
  }

  .hospital-chip-list-desktop {
    display: none;
  }

  .hospital-chip-list-mobile {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .hospital-chip {
    width: 100%;
    min-height: 40px;
    padding: 9px 11px;
    justify-content: flex-start;
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.45;
  }

  .mobile-hospital-more {
    display: flex;
    width: 100%;
    min-height: 42px;
    margin-top: 8px;
    padding: 0 12px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    color: #327f82;
    background: #f1f7f7;
    border: 1px solid #dce9e9;
    border-radius: 9px;
    font-size: 12.5px;
    font-weight: 800;
    line-height: 1.4;
  }

  .mobile-hospital-more i {
    font-size: 9px;
    transition: transform 0.18s ease;
  }

  .mobile-hospital-more i.active {
    transform: rotate(180deg);
  }

  .product-preview-popover {
    position: fixed;
    z-index: 13000;
    top: 50%;
    right: 18px;
    left: 18px;
    width: auto;
    max-width: 320px;
    margin: 0 auto;
    transform: translateY(calc(-50% + 6px));
  }

  .product-preview-trigger:hover .product-preview-popover,
  .product-preview-trigger:focus .product-preview-popover,
  .product-preview-trigger:focus-visible .product-preview-popover {
    transform: translateY(-50%);
  }
}

/* ============================================================
   手機商品圖片預覽修正
   功能：避免 trigger 的 transform 讓 fixed 預覽框被限制在按鈕內。
============================================================ */
@media (max-width: 640px) {
  .product-preview-trigger,
  .product-preview-trigger:hover,
  .product-preview-trigger:focus,
  .product-preview-trigger:focus-visible {
    transform: none !important;
  }

  .product-preview-popover {
    position: fixed !important;
    z-index: 14000;
    top: 50% !important;
    left: 50% !important;
    right: auto !important;
    width: min(300px, calc(100vw - 40px)) !important;
    min-height: 180px;
    max-width: none;
    padding: 12px;
    transform: translate(-50%, calc(-50% + 8px)) !important;
  }

  .product-preview-trigger:hover .product-preview-popover,
  .product-preview-trigger:focus .product-preview-popover,
  .product-preview-trigger:focus-visible .product-preview-popover {
    transform: translate(-50%, -50%) !important;
  }

  .product-preview-popover img {
    width: 100%;
    height: 190px;
    object-fit: contain;
  }

  .product-preview-placeholder {
    width: 100%;
    min-height: 180px;
    white-space: normal;
    text-align: center;
    writing-mode: horizontal-tb;
  }
}

/* ============================================================
   手機商品圖片：全螢幕縮放檢視器
   功能：取代手機 hover 浮窗，支援 pinch zoom 與拖曳。
============================================================ */
@media (max-width: 640px) {
  .product-preview-popover {
    display: none !important;
  }

  .mobile-image-viewer {
    position: fixed;
    z-index: 16000;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
    color: #fff;
    background: rgba(7, 13, 18, 0.97);
    touch-action: none;
  }

  .mobile-image-viewer-header {
    display: flex;
    min-height: 58px;
    padding: max(12px, env(safe-area-inset-top)) 14px 6px;
    align-items: flex-start;
    justify-content: flex-end;
    background: rgba(7, 13, 18, 0.9);
  }


  .mobile-image-viewer-close {
    display: grid;
    width: 42px;
    height: 42px;
    padding: 0;
    flex: 0 0 auto;
    cursor: pointer;
    color: #fff;
    background: none;
    border: none;
    border-radius: 50%;
    font-size: 26px;
    place-items: center;
  }

  .mobile-image-viewer-stage {
    position: relative;
    display: grid;
    min-height: 0;
    overflow: hidden;
    place-items: center;
    touch-action: none;
    user-select: none;
  }

  .mobile-image-viewer-image {
    display: block;
    width: min(92vw, 900px);
    max-width: none;
    height: min(60dvh, 760px);
    max-height: none;
    object-fit: contain;
    transform-origin: center center;
    transition: transform 0.08s linear;
    will-change: transform;
    -webkit-user-drag: none;
    user-select: none;
  }

  .mobile-image-viewer-empty {
    display: grid;
    gap: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    place-items: center;
  }

  .mobile-image-viewer-empty i {
    font-size: 42px;
  }

  .mobile-image-viewer-controls {
    display: flex;
    min-height: 74px;
    padding: 10px 14px max(12px, env(safe-area-inset-bottom));
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: rgba(7, 13, 18, 0.9);
  }

  .mobile-image-viewer-controls button {
    display: inline-flex;
    min-width: 44px;
    height: 44px;
    padding: 0 14px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
    font-size: 20px;
    font-weight: 800;
  }

  .mobile-image-viewer-controls button:disabled {
    cursor: default;
    opacity: 0.35;
  }

  .mobile-image-viewer-controls > span {
    min-width: 58px;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
  }

  .mobile-image-viewer-controls .mobile-image-viewer-reset {
    min-width: 66px;
    font-size: 12px;
  }
}

/* ============================================================
   手機商品多圖切換
   功能：多張商品圖片顯示左右翻頁與目前張數；單張自動隱藏。
============================================================ */
@media (max-width: 640px) {
  .mobile-image-viewer-nav {
    position: absolute;
    z-index: 3;
    top: 50%;
    display: grid;
    width: 46px;
    height: 46px;
    padding: 0;
    cursor: pointer;
    color: #fff;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 50%;
    font-size: 15px;
    transform: translateY(-50%);
    place-items: center;
    backdrop-filter: blur(6px);
  }

  .mobile-image-viewer-nav-prev {
    left: 12px;
  }

  .mobile-image-viewer-nav-next {
    right: 12px;
  }

  .mobile-image-viewer-page {
    min-width: 52px !important;
    padding: 5px 8px;
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    font-size: 12px !important;
  }
}

/* ============================================================
   商品圖片全螢幕檢視器：桌機版
   功能：桌機點圖片 icon 後使用與手機一致的滿版檢視體驗。
============================================================ */
@media (min-width: 641px) {
  .mobile-image-viewer {
    position: fixed;
    z-index: 16000;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto auto;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    background: rgba(7, 13, 18, 0.97);
  }

  .mobile-image-viewer-header {
    display: flex;
    min-height: 66px;
    padding: 16px 24px 6px;
    align-items: flex-start;
    justify-content: flex-end;
    background: rgba(7, 13, 18, 0.9);
  }


  .mobile-image-viewer-close {
    display: grid;
    width: 46px;
    height: 46px;
    padding: 0;
    cursor: pointer;
    color: #fff;
    background: none;
    border: none;
    border-radius: 50%;
    font-size: 28px;
    place-items: center;
  }

  .mobile-image-viewer-stage {
    position: relative;
    display: grid;
    min-height: 0;
    overflow: hidden;
    place-items: center;
    user-select: none;
  }

  .mobile-image-viewer-image {
    display: block;
    width: min(82vw, 1200px);
    height: min(66vh, 860px);
    max-width: none;
    max-height: none;
    object-fit: contain;
    transform-origin: center center;
    transition: transform .08s linear;
    will-change: transform;
    user-select: none;
    -webkit-user-drag: none;
  }

  .mobile-image-viewer-empty {
    display: grid;
    gap: 14px;
    color: rgba(255,255,255,.72);
    text-align: center;
    place-items: center;
  }

  .mobile-image-viewer-empty i {
    font-size: 46px;
  }

  .mobile-image-viewer-controls {
    display: flex;
    min-height: 78px;
    padding: 12px 24px 18px;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(7, 13, 18, 0.9);
  }

  .mobile-image-viewer-controls button {
    display: inline-flex;
    min-width: 46px;
    height: 46px;
    padding: 0 15px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #fff;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 12px;
    font-size: 20px;
    font-weight: 800;
  }

  .mobile-image-viewer-controls button:disabled {
    cursor: default;
    opacity: .35;
  }

  .mobile-image-viewer-controls > span {
    min-width: 60px;
    text-align: center;
    font-size: 13px;
    font-weight: 800;
  }

  .mobile-image-viewer-controls .mobile-image-viewer-reset {
    min-width: 68px;
    font-size: 13px;
  }

  .mobile-image-viewer-nav {
    position: absolute;
    z-index: 3;
    top: 50%;
    display: grid;
    width: 52px;
    height: 52px;
    padding: 0;
    cursor: pointer;
    color: #fff;
    background: rgba(0,0,0,.42);
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 50%;
    font-size: 17px;
    transform: translateY(-50%);
    place-items: center;
    backdrop-filter: blur(6px);
  }

  .mobile-image-viewer-nav-prev { left: 28px; }
  .mobile-image-viewer-nav-next { right: 28px; }

  .mobile-image-viewer-page {
    min-width: 56px !important;
    padding: 5px 9px;
    color: rgba(255,255,255,.88);
    background: rgba(255,255,255,.08);
    border-radius: 999px;
    font-size: 12px !important;
  }
}

/* ============================================================
   全螢幕商品圖片名稱
   功能：商品名稱固定顯示於圖片正下方，桌機與手機共用。
============================================================ */
.mobile-image-viewer-caption {
  display: grid;
  gap: 5px;
  padding: 12px 20px 8px;
  color: #fff;
  text-align: center;
  background: rgba(7, 13, 18, 0.94);
}

.mobile-image-viewer-caption strong {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
}

.mobile-image-viewer-caption span {
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .mobile-image-viewer-caption {
    padding: 10px 16px 6px;
  }

  .mobile-image-viewer-caption strong {
    font-size: 18px;
  }

  .mobile-image-viewer-caption span {
    font-size: 12px;
  }
}

@media (min-width: 641px) {
  .mobile-image-viewer-caption {
    padding: 14px 24px 8px;
  }

  .mobile-image-viewer-caption strong {
    font-size: 26px;
  }

  .mobile-image-viewer-caption span {
    font-size: 13px;
  }
}

/* ============================================================
   推薦器材 Modal：地區篩選與快速閱讀版
   功能：桌機改為收合商品列，展開後以三欄目錄呈現醫院；
   搜尋與地區篩選則桌機、手機共用。
============================================================ */
.recommendation-search {
  display: flex;
  width: min(100%, 460px);
  min-height: 44px;
  margin: 0 0 18px;
  padding: 0 13px;
  align-items: center;
  gap: 10px;
  color: #6c7c84;
  background: #f7f9f9;
  border: 1px solid #dfe7e8;
  border-radius: 12px;
}
.recommendation-search > i { color: #3b8f91; font-size: 13px; }
.recommendation-search input { width:100%; min-width:0; padding:0; color:#173247; background:transparent; border:0; outline:0; font:inherit; font-size:13px; }
.recommendation-search input::-webkit-search-cancel-button { display:none; }
.recommendation-search > button { display:grid; width:28px; height:28px; padding:0; flex:0 0 auto; cursor:pointer; color:#718087; background:transparent; border:0; font-size:18px; place-items:center; }
.region-overview > div > p { margin:6px 0 0; color:#7a8990; font-size:12px; font-weight:700; }
.desktop-product-toggle, .desktop-hospital-preview { display:none; }
.recommendation-empty-state { display:grid; min-height:220px; padding:34px 20px; color:#7b8a91; text-align:center; place-items:center; align-content:center; gap:8px; }
.recommendation-empty-state i { margin-bottom:4px; color:#71a8aa; font-size:30px; }
.recommendation-empty-state strong { color:#24465a; font-size:15px; }
.recommendation-empty-state span { font-size:12px; }
@media (min-width: 761px) {
  .region-tabs { margin:2px auto 8px; }
  .recommendation-modal-content { padding:20px 30px 28px; }
  .region-overview { margin-bottom:14px; }
  .region-product-list { gap:10px; border-top:0; }
  .modal-product-row { display:block; padding:0; overflow:hidden; background:#fff; border:1px solid #e2e9ea; border-radius:14px; transition:border-color .18s ease, box-shadow .18s ease; }
  .modal-product-row:hover { border-color:#d2e1e2; }
  .modal-product-row.desktop-expanded { border-color:#cbdfe0; box-shadow:0 8px 26px rgba(40,82,96,.07); }
  .product-summary { display:block; }
  .product-summary-copy { padding:17px 20px 16px; }
  .product-title-line { display:flex; min-height:32px; align-items:center; gap:8px; }
  .product-title-line h4 { min-width:0; margin:0; color:#173247; font-size:16px; line-height:1.45; }
  .product-summary-copy > p { max-width:760px; margin:7px 0 0; color:#75868d; font-size:12px; line-height:1.65; }
  .desktop-product-toggle { display:inline-flex; min-height:34px; padding:0 8px 0 12px; margin-left:auto; flex:0 0 auto; align-items:center; gap:8px; cursor:pointer; color:#47747c; background:#f3f8f8; border:1px solid #dce8e8; border-radius:999px; font-size:12px; font-weight:800; }
  .desktop-product-toggle i { font-size:9px; transition:transform .18s ease; }
  .modal-product-row.desktop-expanded .desktop-product-toggle i { transform:rotate(180deg); }
  .desktop-hospital-preview { display:flex; margin-top:11px; flex-wrap:wrap; gap:6px; }
  .desktop-hospital-preview span, .desktop-hospital-preview strong { display:inline-flex; min-height:27px; padding:4px 9px; align-items:center; color:#52707c; background:#f8fafa; border:1px solid #e6ecec; border-radius:8px; font-size:11px; line-height:1.35; }
  .desktop-hospital-preview strong { color:#3b8588; background:#edf6f6; border-color:#d9eaea; font-weight:800; }
  .product-hospitals { display:none; padding:16px 20px 20px; border-top:1px solid #edf1f1; }
  .modal-product-row.desktop-expanded .product-hospitals { display:block; }
  .modal-product-row.desktop-expanded .desktop-hospital-preview { display:none; }
  .product-hospitals-heading { margin-bottom:8px; }
  .hospital-directory { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); column-gap:22px; }
  .hospital-directory-item { display:flex; min-width:0; min-height:42px; padding:9px 4px; align-items:center; gap:8px; color:#355665; border-bottom:1px solid #edf1f1; font-size:13px; line-height:1.45; }
  .hospital-directory-item > span:last-child { min-width:0; overflow-wrap:anywhere; }
}
@media (min-width: 761px) and (max-width: 980px) { .hospital-directory { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width: 760px) {
  .desktop-product-toggle, .desktop-hospital-preview { display:none !important; }
  .recommendation-search { width:100%; margin-bottom:14px; }
}

/* ============================================================
   推薦器材 Modal：大量商品 Master / Detail 瀏覽版
   功能：桌機左側商品目錄、右側單一商品詳細；手機改成列表與詳細兩層。
============================================================ */
.desktop-recommendation-browser { display: none; }
.mobile-recommendation-browser { display: block; }

@media (min-width: 940px) {
  .recommendation-modal-panel {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    height: min(88vh, 860px);
    max-height: none;
    overflow: hidden;
  }

  .recommendation-browser-content {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: 0;
    padding: 16px 24px 22px;
    overflow: hidden;
  }

  .recommendation-browser-content .region-overview {
    margin-bottom: 12px;
  }

  .desktop-recommendation-browser {
    display: grid;
    margin-top: 16px;
    grid-template-columns: minmax(260px, 310px) minmax(0, 1fr);
    min-height: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e1e8e9;
    border-radius: 16px;
  }

  .mobile-recommendation-browser { display: none; }

  .product-index-pane {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
    padding: 14px 12px 12px;
    background: #f7f9f9;
    border-right: 1px solid #e2e9ea;
  }

  .product-index-search {
    width: 100%;
    min-height: 42px;
    margin: 0 0 10px;
    background: #fff;
  }

  .product-index-meta {
    display: flex;
    padding: 2px 5px 9px;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    color: #718087;
    font-size: 11px;
  }

  .product-index-meta strong {
    color: #294a5d;
    font-size: 12px;
  }

  .product-index-list {
    min-height: 0;
    padding-right: 3px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }

  .product-index-item {
    display: flex;
    width: 100%;
    min-height: 58px;
    padding: 10px 10px 10px 12px;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    color: #365766;
    background: transparent;
    border: 0;
    border-radius: 11px;
    text-align: left;
    transition: background .16s ease, color .16s ease;
  }

  .product-index-item:hover { background: #eef5f5; }
  .product-index-item.active {
    color: #245f65;
    background: #e8f3f3;
  }

  .product-index-item-copy {
    display: grid;
    min-width: 0;
    gap: 3px;
  }

  .product-index-item-copy strong {
    overflow: hidden;
    font-size: 13px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-index-item-copy small {
    color: #7a8b92;
    font-size: 10.5px;
  }

  .product-index-item > i {
    flex: 0 0 auto;
    color: #87a4a6;
    font-size: 9px;
  }

  .product-index-item.active > i { color: #3b8f91; }

  .product-index-empty { min-height: 180px; }

  .product-detail-pane {
    min-width: 0;
    min-height: 0;
    padding: 22px 24px 26px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }

  .product-detail-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    padding-bottom: 18px;
    align-items: start;
    gap: 22px;
    border-bottom: 1px solid #e8eeee;
  }

  .product-detail-eyebrow {
    color: #3b8f91;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .12em;
  }

  .product-detail-title-row {
    display: flex;
    margin-top: 5px;
    align-items: center;
    gap: 9px;
  }

  .product-detail-title-row h4 {
    margin: 0;
    color: #173247;
    font-size: 22px;
    line-height: 1.4;
  }

  .product-detail-header p {
    max-width: 720px;
    margin: 9px 0 0;
    color: #718188;
    font-size: 12.5px;
    line-height: 1.7;
  }

  .product-detail-count {
    display: grid;
    min-width: 96px;
    padding: 12px 15px;
    color: #2e777c;
    background: #edf6f6;
    border: 1px solid #d8eaea;
    border-radius: 13px;
    text-align: center;
  }

  .product-detail-count strong { font-size: 24px; line-height: 1.1; }
  .product-detail-count span { margin-top: 3px; font-size: 10px; font-weight: 800; }

  .product-detail-usage-heading {
    display: flex;
    margin: 18px 0 8px;
    align-items: center;
    justify-content: space-between;
  }

  .product-detail-usage-heading > div { display: grid; gap: 2px; }
  .product-detail-usage-heading strong { color: #24485a; font-size: 14px; }
  .product-detail-usage-heading span { color: #8a979c; font-size: 10.5px; }

  .product-detail-hospital-directory {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 24px;
  }

  .product-detail-hospital-directory .hospital-directory-item {
    min-height: 44px;
    padding: 10px 4px;
    font-size: 13px;
  }

  .product-detail-empty {
    display: grid;
    color: #87969c;
    text-align: center;
    place-items: center;
    align-content: center;
    gap: 8px;
  }

  .product-detail-empty i { color: #72a6a8; font-size: 34px; }
  .product-detail-empty strong { color: #294a5d; font-size: 15px; }
  .product-detail-empty span { font-size: 12px; }
}

@media (min-width: 1180px) {
  .product-detail-hospital-directory {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 939px) {
  .recommendation-modal-panel {
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
    height: 94dvh;
    max-height: none;
    overflow: hidden;
  }

  .recommendation-browser-content {
    min-height: 0;
    padding: 12px 14px 16px;
    overflow: hidden;
  }

  .recommendation-browser-content .region-overview {
    margin-bottom: 10px;
  }

  .mobile-recommendation-browser {
    height: calc(100% - 52px);
    min-height: 0;
    overflow: hidden;
  }

  .mobile-browser-search {
    width: 100%;
    margin-bottom: 10px;
  }

  .mobile-product-index {
    height: calc(100% - 54px);
    min-height: 0;
    padding-right: 2px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .mobile-product-index-item {
    display: flex;
    width: 100%;
    min-height: 62px;
    padding: 11px 12px;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    cursor: pointer;
    color: #355665;
    background: #fff;
    border: 0;
    border-bottom: 1px solid #e7eded;
    text-align: left;
  }

  .mobile-product-index-item > span {
    display: grid;
    min-width: 0;
    gap: 4px;
  }

  .mobile-product-index-item strong {
    font-size: 14px;
    line-height: 1.4;
  }

  .mobile-product-index-item small {
    color: #7c8b92;
    font-size: 11px;
  }

  .mobile-product-index-item > i {
    color: #78a0a2;
    font-size: 10px;
  }

  .mobile-product-detail {
    height: 100%;
    min-height: 0;
    padding-right: 2px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .mobile-product-back {
    display: inline-flex;
    min-height: 38px;
    padding: 0 4px;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    color: #397f83;
    background: transparent;
    border: 0;
    font-size: 12px;
    font-weight: 800;
  }

  .mobile-product-back i { font-size: 9px; }

  .mobile-product-detail-heading {
    display: grid;
    padding: 8px 2px 14px;
    gap: 10px;
    border-bottom: 1px solid #e8eeee;
  }

  .mobile-product-detail-heading .product-detail-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mobile-product-detail-heading h4 {
    margin: 0;
    color: #173247;
    font-size: 18px;
    line-height: 1.45;
  }

  .mobile-product-detail-heading p {
    margin: 8px 0 0;
    color: #718188;
    font-size: 12px;
    line-height: 1.65;
  }

  .mobile-product-usage-count {
    width: fit-content;
    padding: 6px 10px;
    color: #397d81;
    background: #edf6f6;
    border-radius: 999px;
    font-size: 11px;
  }

  .mobile-product-hospital-list {
    display: grid;
    margin-top: 12px;
    gap: 7px;
  }

  .mobile-product-hospital-list .hospital-chip {
    width: 100%;
    min-height: 42px;
    padding: 9px 11px;
    justify-content: flex-start;
    border-radius: 9px;
    font-size: 13px;
  }
}

/* ============================================================
   推薦器材 Modal：寬版多欄器材索引
   功能：增加桌機可視範圍，器材目錄以多欄方式顯示，降低長距離垂直捲動。
============================================================ */
@media (min-width: 940px) {
  .recommendation-modal {
    padding: 18px;
  }

  .recommendation-modal-panel {
    width: min(calc(100vw - 36px), 1540px);
    height: min(92vh, 920px);
    max-width: none;
  }

  .recommendation-browser-content {
    padding-inline: 22px;
  }

  .desktop-recommendation-browser {
    grid-template-columns: minmax(430px, 44%) minmax(0, 1fr);
  }

  .product-index-pane {
    padding: 14px;
  }

  .product-index-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: min-content;
    align-content: start;
    gap: 6px;
    padding: 2px 4px 4px 0;
  }

  .product-index-item {
    min-width: 0;
    min-height: 62px;
    padding: 9px 10px;
    background: #fff;
    border: 1px solid #e5ebec;
    border-radius: 10px;
  }

  .product-index-item:hover {
    background: #f0f7f7;
    border-color: #d5e4e4;
  }

  .product-index-item.active {
    background: #e5f2f2;
    border-color: #c8dfe0;
    box-shadow: inset 3px 0 0 #3b8f91;
  }

  .product-index-item-copy strong {
    display: -webkit-box;
    overflow: hidden;
    font-size: 12.5px;
    line-height: 1.45;
    text-overflow: initial;
    white-space: normal;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .product-index-item-copy small {
    font-size: 10px;
  }

  .product-detail-pane {
    padding: 22px 26px 28px;
  }
}

/* 功能：一般桌機／筆電維持雙欄器材索引。 */
@media (min-width: 940px) and (max-width: 1199px) {
  .desktop-recommendation-browser {
    grid-template-columns: minmax(390px, 46%) minmax(0, 1fr);
  }
}

/* 功能：1200px 以上器材索引使用三欄，一頁維持 3 × 6 共 18 項。 */
@media (min-width: 1200px) {
  .desktop-recommendation-browser {
    grid-template-columns: minmax(620px, 44%) minmax(0, 1fr);
  }

  .product-index-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .product-detail-hospital-directory {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ============================================================
   地區切換：內容導覽式扁平 Tab
   功能：地區篩選與區域標題整合，不再使用獨立大型膠囊。
============================================================ */
.region-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding-bottom: 10px;
}

.region-toolbar .region-overview {
  margin: 0 !important;
  flex: 0 0 auto;
}

.region-tabs.region-tabs-inline {
  display: flex;
  width: auto;
  max-width: 100%;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: 22px;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.region-tabs.region-tabs-inline::-webkit-scrollbar {
  display: none;
}

.region-tabs-inline .region-tab {
  position: relative;
  display: inline-flex;
  min-width: 0;
  height: 38px;
  padding: 0 1px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #718087;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  font-size: 12.5px;
  font-weight: 800;
}

.region-tabs-inline .region-tab::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: "";
  background: #378f92;
  border-radius: 999px;
  opacity: 0;
  transform: scaleX(.35);
  transition: opacity .18s ease, transform .18s ease;
}

.region-tabs-inline .region-tab:hover {
  color: #356d74;
  background: transparent;
}

.region-tabs-inline .region-tab.active {
  color: #2c7e82;
  background: transparent;
  box-shadow: none;
}

.region-tabs-inline .region-tab.active::after {
  opacity: 1;
  transform: scaleX(1);
}

.region-tabs-inline .region-tab strong {
  display: grid;
  min-width: 24px;
  height: 22px;
  padding: 0 6px;
  color: #75868c;
  background: #f1f5f5;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 800;
  place-items: center;
}

.region-tabs-inline .region-tab.active strong {
  color: #2f7f83;
  background: #e5f1f1;
}

@media (max-width: 900px) {
  .region-toolbar {
    display: grid;
    gap: 8px;
    align-items: stretch;
  }

  .region-tabs.region-tabs-inline {
    width: 100%;
    margin: 0;
    gap: 20px;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .region-toolbar {
    padding-bottom: 6px;
  }

  .region-tabs.region-tabs-inline {
    width: 100%;
    max-width: none;
    padding: 0;
    gap: 18px;
  }

  .region-tabs-inline .region-tab {
    min-width: 0;
    height: 36px;
    padding: 0;
    font-size: 12px;
  }
}

/* ============================================================
   桌機器材列表分頁版
   功能：每頁固定 3 × 6，共 18 項；以翻頁取代長距離垂直捲動。
============================================================ */
@media (min-width: 940px) {
  .product-index-pane {
    grid-template-rows: auto auto minmax(0, 1fr) auto;
  }

  .product-index-meta {
    margin-top: 8px;
    padding-top: 4px;
    padding-bottom: 10px;
  }

  .product-index-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    /* 功能：940~1199px 固定 2 欄 × 6 列；1200px 以上再切回 3 欄。 */
    grid-template-rows: repeat(6, 68px);
    grid-auto-flow: row;
    grid-auto-rows: 68px;
    min-height: 0;
    padding: 0 2px 2px 0;
    align-content: start;
    gap: 6px;
    overflow: hidden;
  }

  .product-index-item {
    min-height: 68px;
    height: 68px;
    padding: 8px 10px;
  }

  .product-index-item-copy {
    gap: 2px;
  }

  .product-index-item-copy strong {
    font-size: 12px;
    line-height: 1.35;
  }

  .product-index-item-copy small {
    font-size: 9.5px;
    line-height: 1.3;
  }

  .product-index-pagination {
    display: flex;
    min-height: 46px;
    margin-top: 10px;
    padding-top: 9px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-top: 1px solid #e2e9ea;
  }

  .product-index-pagination button {
    display: grid;
    width: 30px;
    height: 30px;
    padding: 0;
    cursor: pointer;
    color: #5e777f;
    background: #fff;
    border: 1px solid #dce5e6;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    place-items: center;
    transition: .16s ease;
  }

  .product-index-pagination button:hover:not(:disabled) {
    color: #2f7f83;
    background: #eef6f6;
    border-color: #c9dddd;
  }

  .product-index-pagination .pagination-page.active {
    color: #fff;
    background: #388e91;
    border-color: #388e91;
  }

  .product-index-pagination button:disabled {
    cursor: default;
    opacity: .35;
  }

  .pagination-arrow i {
    font-size: 9px;
  }

  .pagination-summary {
    margin-left: 5px;
    color: #7b8a90;
    font-size: 10px;
    font-weight: 700;
  }
}

/* 功能：1200px 以上固定 3 欄 × 6 列；此規則放在分頁樣式之後，確保優先權正確。 */
@media (min-width: 1200px) {
  .product-index-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ============================================================
   手機版推薦器材：舒適閱讀版
   功能：增加各區塊呼吸感，並改用 Grid 自動分配可用高度，
   避免標題、地區、搜尋與器材列表互相擠壓。
============================================================ */
@media (max-width: 939px) {
  .recommendation-modal {
    padding: 12px 7px;
  }

  .recommendation-modal-panel {
    width: 100%;
    height: calc(100dvh - 24px);
    border-radius: 20px;
  }

  .recommendation-modal-header {
    padding: 22px 18px 16px;
  }

  .modal-title-block h2 {
    margin-top: 7px;
    font-size: 20px;
    line-height: 1.35;
  }

  .modal-title-block p {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
  }

  .recommendation-browser-content {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    min-height: 0;
    padding: 16px 16px 18px;
    gap: 16px;
    overflow: hidden;
  }

  .region-toolbar {
    display: grid;
    padding: 0 0 14px;
    gap: 12px;
    border-bottom: 1px solid #e7eded;
  }

  .region-toolbar .region-overview h3 {
    font-size: 19px;
    line-height: 1.35;
  }

  .region-toolbar .region-overview p {
    margin-top: 5px;
    font-size: 12px;
    line-height: 1.5;
  }

  /* 功能：地區 Tab 保持可橫向滑動，但每個選項有足夠點擊空間，不再全部擠在一排。 */
  .region-tabs.region-tabs-inline {
    width: 100%;
    margin: 0;
    padding: 0 1px 3px;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x proximity;
  }

  .region-tabs-inline .region-tab {
    min-width: max-content;
    height: 40px;
    padding: 0 9px;
    gap: 6px;
    scroll-snap-align: start;
    font-size: 12.5px;
  }

  .region-tabs-inline .region-tab strong {
    min-width: 25px;
    height: 23px;
    padding-inline: 6px;
    font-size: 9.5px;
  }

  .mobile-recommendation-browser {
    display: block;
    height: auto;
    min-height: 0;
    overflow: hidden;
  }

  .mobile-browser-search {
    min-height: 46px;
    margin: 0 0 16px;
    padding-inline: 14px;
    border-radius: 12px;
  }

  .mobile-browser-search input {
    font-size: 13px;
  }

  .mobile-product-index {
    height: calc(100% - 62px);
    min-height: 0;
    padding: 0 3px 8px 0;
    overflow-y: auto;
  }

  /* 功能：商品改成獨立卡片，不再只靠細分隔線區分，閱讀層次更清楚。 */
  .mobile-product-index-item {
    min-height: 72px;
    margin-bottom: 9px;
    padding: 13px 14px;
    background: #fff;
    border: 1px solid #e2e9ea;
    border-radius: 12px;
  }

  .mobile-product-index-item:last-child {
    margin-bottom: 0;
  }

  .mobile-product-index-item > span {
    gap: 6px;
  }

  .mobile-product-index-item strong {
    color: #234557;
    font-size: 15px;
    line-height: 1.45;
  }

  .mobile-product-index-item small {
    font-size: 11.5px;
    line-height: 1.4;
  }

  .mobile-product-index-item > i {
    margin-left: 8px;
    font-size: 11px;
  }

  /* ============================================================
     手機商品詳細
     功能：將返回、商品資訊、使用單位清單切成清楚的視覺層級。
  ============================================================ */
  .mobile-product-detail {
    height: 100%;
    min-height: 0;
    padding: 0 3px 10px 0;
    overflow-y: auto;
  }

  .mobile-product-back {
    min-height: 42px;
    margin-bottom: 8px;
    padding: 0 4px;
    gap: 8px;
    font-size: 12.5px;
  }

  .mobile-product-detail-heading {
    margin-bottom: 16px;
    padding: 14px 14px 16px;
    gap: 12px;
    background: #f8fafa;
    border: 1px solid #e2e9ea;
    border-radius: 13px;
  }

  .mobile-product-detail-heading .product-detail-title-row {
    gap: 10px;
  }

  .mobile-product-detail-heading h4 {
    font-size: 19px;
    line-height: 1.45;
  }

  .mobile-product-detail-heading p {
    margin-top: 9px;
    font-size: 12.5px;
    line-height: 1.7;
  }

  .mobile-product-usage-count {
    padding: 7px 11px;
    font-size: 11.5px;
  }

  .mobile-product-hospital-list {
    margin-top: 0;
    gap: 9px;
  }

  .mobile-product-hospital-list .hospital-chip {
    min-height: 48px;
    padding: 11px 13px;
    border-radius: 11px;
    font-size: 13.5px;
    line-height: 1.45;
  }

  .mobile-hospital-more {
    min-height: 46px;
    margin-top: 12px;
    font-size: 12.5px;
    border-radius: 11px;
  }
}

/* ============================================================
   手機版地區篩選：全部選項直接可見
   功能：取消橫向滑動，改成 3 欄 Grid，避免使用者不知道還有宜花東。
============================================================ */
@media (max-width: 939px) {
  .region-tabs.region-tabs-inline {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
    max-width: none;
    margin: 0;
    padding: 0;
    gap: 8px 10px;
    overflow: visible;
    scroll-snap-type: none;
  }

  .region-tabs-inline .region-tab {
    width: 100%;
    min-width: 0;
    height: 42px;
    padding: 0 8px;
    gap: 6px;
    justify-content: center;
    scroll-snap-align: none;
    border: 1px solid transparent;
    border-radius: 10px;
  }

  .region-tabs-inline .region-tab::after {
    right: 10px;
    bottom: 3px;
    left: 10px;
  }

  .region-tabs-inline .region-tab.active {
    background: #f0f7f7;
    border-color: #d9eaea;
  }

  .region-tabs-inline .region-tab strong {
    min-width: 24px;
    height: 22px;
    padding-inline: 5px;
  }
}

/* ============================================================
   手機版地區篩選收合
   功能：預設只顯示目前地區摘要，點擊後才展開全部地區。
============================================================ */
.mobile-region-filter-toggle {
  display: none;
}

@media (max-width: 939px) {
  .mobile-region-filter-toggle {
    display: grid;
    grid-template-columns: auto 1fr auto;
    width: 100%;
    min-height: 46px;
    padding: 0 12px;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: #365866;
    background: #f7fafa;
    border: 1px solid #dfe8e9;
    border-radius: 11px;
    text-align: left;
  }

  .mobile-region-filter-label {
    color: #73858c;
    font-size: 11.5px;
    font-weight: 700;
  }

  .mobile-region-filter-current {
    display: inline-flex;
    justify-self: end;
    align-items: center;
    gap: 7px;
    color: #2f777c;
    font-size: 13px;
    font-weight: 800;
  }

  .mobile-region-filter-current strong {
    display: grid;
    min-width: 26px;
    height: 24px;
    padding: 0 6px;
    color: #377b7f;
    background: #e7f2f2;
    border-radius: 999px;
    font-size: 10px;
    place-items: center;
  }

  .mobile-region-filter-toggle > i {
    color: #6f9195;
    font-size: 10px;
    transition: transform .18s ease;
  }

  .mobile-region-filter-toggle > i.open {
    transform: rotate(180deg);
  }

  .region-tabs.region-tabs-inline {
    display: none;
    margin-top: 2px;
  }

  .region-tabs.region-tabs-inline.mobile-expanded {
    display: grid;
  }
}

/* ============================================================
   商品圖片操作提示
   功能：桌機 hover icon 顯示「查看圖片」；手機改成明確文字按鈕。
============================================================ */
.product-preview-tooltip {
  position: absolute;
  z-index: 80;
  top: 50%;
  left: calc(100% + 9px);
  display: block;
  padding: 6px 9px;
  pointer-events: none;
  color: #fff;
  background: #173247;
  border-radius: 7px;
  box-shadow: 0 8px 20px rgba(20, 45, 60, .18);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  opacity: 0;
  transform: translate(4px, -50%);
  transition: opacity .16s ease, transform .16s ease;
}

.product-preview-tooltip::before {
  position: absolute;
  top: 50%;
  right: 100%;
  width: 0;
  height: 0;
  content: "";
  border-top: 5px solid transparent;
  border-right: 5px solid #173247;
  border-bottom: 5px solid transparent;
  transform: translateY(-50%);
}

.desktop-product-preview-trigger:hover .product-preview-tooltip,
.desktop-product-preview-trigger:focus-visible .product-preview-tooltip {
  opacity: 1;
  transform: translate(0, -50%);
}

.mobile-product-image-button {
  display: none;
}

@media (max-width: 939px) {
  .product-preview-tooltip {
    display: none;
  }

  .mobile-product-detail-heading {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    column-gap: 12px;
    row-gap: 13px;
  }

  .mobile-product-detail-copy {
    min-width: 0;
  }

  .mobile-product-detail-copy h4 {
    margin: 0;
  }

  .mobile-product-detail-copy p {
    margin: 9px 0 0;
  }

  .mobile-product-image-button {
    display: inline-flex;
    min-width: 78px;
    min-height: 36px;
    padding: 0 12px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #2f7f83;
    background: #fff;
    border: 1px solid #cfe2e3;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
  }

  .mobile-product-image-button:active {
    background: #eaf4f4;
  }

  .mobile-product-usage-count {
    grid-column: 1 / -1;
    justify-self: start;
  }
}

/* ============================================================
   桌機商品詳細：查看圖片文字按鈕
   功能：固定在 product-detail-header 最右側，比單獨 icon 更容易理解。
============================================================ */
.desktop-product-image-button {
  display: inline-flex;
  margin-top: 20px;
  min-width: 94px;
  min-height: 40px;
  padding: 0 15px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #2f7f83;
  background: #f5fafa;
  border: 1px solid #cfe2e3;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  transition: background .16s ease, border-color .16s ease, transform .16s ease;
}

.desktop-product-image-button:hover,
.desktop-product-image-button:focus-visible {
  background: #eaf4f4;
  border-color: #b8d7d8;
  transform: translateY(-1px);
}

@media (max-width: 939px) {
  .desktop-product-image-button {
    display: none;
  }
}
</style>
