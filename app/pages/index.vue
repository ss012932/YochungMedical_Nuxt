<template>
  <div
    class="home-page"
    :class="{ 'home-content-ready': isHomeContentVisible }"
  >
    <!-- ========================================================
      Hero 區塊
      說明：視覺改為新版設計稿的左右分欄，但保留舊首頁三組輪播內容與 5 秒切換邏輯。
    ========================================================= -->
    <section class="hero-section">
      <div class="hero-shell">
        <div class="hero-copy">
          <span class="hero-eyebrow">{{ $ui('祐強醫療儀器有限公司') }}</span>

          <Transition name="hero-copy" mode="out-in">
            <div :key="currentSlide" class="hero-copy-content">
              <h1>{{ $ui(carouselSlides[currentSlide]?.title) }}</h1>
              <p class="hero-description">
                {{ $ui(carouselSlides[currentSlide]?.description) }}
              </p>
            </div>
          </Transition>

          <p class="hero-intro">{{ $ui('祐強醫療儀器有限公司擁有超過 20 年的專業經驗，我們致力於提供醫療機構優質的設備與服務。') }}</p>

          <div class="hero-actions">
            <NuxtLink
              :to="carouselSlides[currentSlide]?.link || '/about'"
              class="button button-primary"
            >
              {{ $ui(carouselSlides[currentSlide]?.buttonText || "了解更多") }}
              <span aria-hidden="true">→</span>
            </NuxtLink>

            <NuxtLink to="/contact" class="button button-outline">{{ $ui('聯絡專員') }}<span aria-hidden="true">→</span>
            </NuxtLink>
          </div>

          <!-- 輪播狀態：不增加新的商業邏輯，只讓使用者知道目前是哪一張。 -->
          <div class="hero-dots" :aria-label="$ui('首頁輪播狀態')">
            <button
              v-for="(_, index) in carouselSlides"
              :key="`hero-dot-${index}`"
              type="button"
              :class="{ active: currentSlide === index }"
              :aria-label="$ui('顯示第 {index} 張').replace('{index}', String(index + 1))"
              @click="setSlide(index)"
            ></button>
          </div>
        </div>

        <div class="hero-media">
          <Transition name="hero-image" mode="out-in">
            <img
              :key="`${currentSlide}-${isMobile}`"
              :src="
                isMobile
                  ? carouselSlides[currentSlide]?.mobileImage
                  : carouselSlides[currentSlide]?.image
              "
              :alt="$ui(carouselSlides[currentSlide]?.title || '祐強醫療儀器')"
            />
          </Transition>
        </div>
      </div>

      <!-- 舊首頁原有四項服務優勢，改成設計稿的資訊卡排列。 -->
      <div class="service-strip">
        <article
          v-for="(feature, index) in serviceFeatures"
          :key="feature.title"
          class="service-card"
        >
          <div class="service-icon" aria-hidden="true">
            <svg v-if="index === 0" viewBox="0 0 24 24">
              <path
                d="M4 7h16l-1.4 8.3a2 2 0 0 1-2 1.7H8a2 2 0 0 1-2-1.6L4 7Z"
              />
              <path
                d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7M9 20h6"
              />
            </svg>
            <svg v-else-if="index === 1" viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 9h16M8 13h3M13 13h3M8 16h3" />
            </svg>
            <svg v-else-if="index === 2" viewBox="0 0 24 24">
              <path d="m14.5 6.5 3-3 3 3-3 3" />
              <path d="M13 8 5.5 15.5a2.1 2.1 0 0 0 3 3L16 11" />
              <path d="m4 4 4 4M16 16l4 4" />
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <path d="M4 15a8 8 0 0 1 16 0" />
              <path
                d="M4 15v3a2 2 0 0 0 2 2h2v-6H4ZM20 15v3a2 2 0 0 1-2 2h-2v-6h4Z"
              />
            </svg>
          </div>

          <div class="service-copy">
            <h2>{{ $ui(feature.title) }}</h2>
            <p>{{ $ui(feature.description) }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- ========================================================
      產品分類
      說明：資料沿用商品頁既有 GET /categories? API 與欄位轉換方式。
    ========================================================= -->
    <section class="home-section category-section">
      <div class="category-layout">
        <div class="category-content">
          <div v-if="loadingCategories" class="section-state">{{ $ui('正在載入產品分類...') }}</div>
          <div
            v-else-if="errorLoadingCategories"
            class="section-state error-state"
          >{{ $ui('目前無法載入產品分類，請稍後再試。') }}</div>
          <div v-else class="category-slider">
            <button
              v-if="hasCategoryOverflow"
              type="button"
              class="category-nav category-nav-prev"
              :disabled="!canScrollCategoryLeft"
              :aria-label="$ui('上一組產品分類')"
              @click="scrollCategories('left')"
            >
              <span aria-hidden="true">‹</span>
            </button>

            <div
              ref="categoryScroller"
              class="category-grid"
              :class="{ 'is-scrollable': hasCategoryOverflow }"
              @scroll="updateCategoryScrollState"
            >
              <NuxtLink
                v-for="(category, index) in visibleCategories"
                :key="category.id"
                to="/products"
                class="category-item"
              >
                <span class="category-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <template v-if="index % 8 === 0">
                      <rect x="4" y="5" width="16" height="13" rx="2" />
                      <path d="M7 14h3l2-5 2 6 1.5-3H18" />
                    </template>
                    <template v-else-if="index % 8 === 1">
                      <rect x="4" y="5" width="16" height="14" rx="2" />
                      <circle cx="9" cy="10" r="2" />
                      <path d="M13 9h4M13 13h4M7 16h10" />
                    </template>
                    <template v-else-if="index % 8 === 2">
                      <circle cx="8" cy="8" r="3" />
                      <circle cx="16" cy="8" r="3" />
                      <circle cx="8" cy="16" r="3" />
                      <circle cx="16" cy="16" r="3" />
                    </template>
                    <template v-else-if="index % 8 === 3">
                      <path
                        d="M8 3h8M10 3v5l-4 8a3 3 0 0 0 2.7 4.3h6.6A3 3 0 0 0 18 16l-4-8V3"
                      />
                      <path d="M8 14h8" />
                    </template>
                    <template v-else-if="index % 8 === 4">
                      <path
                        d="M8 4c3 2 5 5 5 8s-2 5-5 8M16 4c-3 2-5 5-5 8s2 5 5 8"
                      />
                      <path d="M5 8c2 1 3 2 4 4M19 8c-2 1-3 2-4 4" />
                    </template>
                    <template v-else-if="index % 8 === 5">
                      <path d="M7 4h4v16H7zM13 7h4v13h-4z" />
                      <path d="M8 8h2M8 12h2M14 11h2M14 15h2" />
                    </template>
                    <template v-else-if="index % 8 === 6">
                      <path
                        d="M7 3c4 3 4 6 0 9s-4 6 0 9M17 3c-4 3-4 6 0 9s4 6 0 9"
                      />
                      <path d="M9 7h6M9 17h6" />
                    </template>
                    <template v-else>
                      <circle cx="8" cy="8" r="2.5" />
                      <circle cx="16" cy="8" r="2.5" />
                      <circle cx="8" cy="16" r="2.5" />
                      <circle cx="16" cy="16" r="2.5" />
                      <path d="M10.5 8h3M8 10.5v3M16 10.5v3M10.5 16h3" />
                    </template>
                  </svg>
                </span>
                <span class="category-name">{{ $ui(category.name) }}</span>
              </NuxtLink>
            </div>

            <button
              v-if="hasCategoryOverflow"
              type="button"
              class="category-nav category-nav-next"
              :disabled="!canScrollCategoryRight"
              :aria-label="$ui('下一組產品分類')"
              @click="scrollCategories('right')"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================
      精選產品
      說明：沿用舊首頁 GET /products/top；仍排除 Id === 50。
      每 4 秒使用原本 productCurrentSlide 邏輯輪換顯示順序。
    ========================================================= -->
    <section class="home-section products-section">
      <div class="products-heading">
        <h2>{{ $ui('熱門產品') }}</h2>
        <NuxtLink to="/products" class="section-link"
          >{{ $ui('查看全部商品') }}<span>→</span></NuxtLink
        >
      </div>

      <div v-if="loadingProducts" class="section-state">{{ $ui('正在加載熱門產品...') }}</div>
      <div v-else-if="errorLoadingProducts" class="section-state error-state">{{ $ui('無法加載熱門產品數據，請稍後再試。') }}</div>
      <div v-else-if="visibleFeaturedProducts.length" class="product-grid">
        <article
          v-for="product in visibleFeaturedProducts"
          :key="product.id"
          class="product-card"
        >
          <NuxtLink
            :to="{ path: '/products', query: { id: product.id } }"
            class="product-image-link"
            :aria-label="$ui('查看商品').replace('{name}', $ui(product.name))"
          >
            <img
              :src="product.image"
              :alt="$ui(product.name)"
              loading="lazy"
              @error="handleImageError"
            />
          </NuxtLink>

          <div class="product-card-body">
            <span v-if="product.category" class="product-category">{{ $ui(product.category) }}</span>
            <h3>{{ $ui(product.name) }}</h3>
            <p>{{ $ui(product.shortDescription) }}</p>
            <NuxtLink :to="{ path: '/products', query: { id: product.id } }">{{ $ui('查看詳情') }}<span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </article>
      </div>
      <div v-else class="section-state">{{ $ui('目前沒有熱門產品資料。') }}</div>
    </section>

    <!-- ========================================================
      為什麼選擇我們
      說明：全部使用舊首頁既有公司介紹與服務優勢內容，不採用設計稿範例文字。
    ========================================================= -->
    <section class="home-section reasons-section reasons-soft-section">
      <div class="reasons-soft-heading">
        <div>
          <span class="reasons-soft-label">WHY YOCHUNG</span>
          <h2>{{ $ui('為什麼選擇祐強？') }}</h2>
        </div>
        <p>{{ $ui('祐強醫療儀器有限公司擁有超過 20 年的專業經驗，從產品品質、技術支援到配送安裝，持續提供穩定、可靠且貼近需求的服務。') }}</p>
      </div>

      <div class="reasons-soft-panel">
        <article v-if="reasons[0]" class="reason-experience-block">
          <div class="reason-experience-number">20<span>+</span></div>
          <span class="reason-experience-caption">YEARS OF EXPERIENCE</span>
          <div class="reason-experience-divider"></div>
          <h3>{{ $ui(reasons[0].title) }}</h3>
          <p>{{ $ui(reasons[0].description) }}</p>
        </article>

        <div class="reason-soft-list">
          <article
            v-for="(reason, index) in reasons.slice(1)"
            :key="reason.title"
            class="reason-soft-item"
          >
            <div class="reason-soft-meta">
              <span class="reason-soft-index">0{{ index + 2 }}</span>
              <span class="reason-soft-icon" aria-hidden="true">
                <svg v-if="index === 0" viewBox="0 0 24 24">
                  <path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" />
                  <path d="m9 12 2 2 4-5" />
                </svg>
                <svg v-else-if="index === 1" viewBox="0 0 24 24">
                  <path d="M4 15a8 8 0 0 1 16 0" />
                  <path d="M4 15v3a2 2 0 0 0 2 2h2v-6H4ZM20 15v3a2 2 0 0 1-2 2h-2v-6h4Z" />
                  <path d="M16 20c0 1-1 2-2 2h-2" />
                </svg>
                <svg v-else-if="index === 2" viewBox="0 0 24 24">
                  <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
                  <circle cx="12" cy="10" r="2.2" />
                  <path d="M7 21h10" />
                </svg>
                <svg v-else viewBox="0 0 24 24">
                  <rect x="5" y="3" width="12" height="16" rx="2" />
                  <path d="M8 7h6M8 10h6M8 13h4" />
                  <path d="m15 15 2 2 3-4" />
                </svg>
              </span>
            </div>
            <h3>{{ $ui(reason.title) }}</h3>
            <p>{{ $ui(reason.description) }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ========================================================
      產品影片
      說明：沿用舊 VideoPage 的既有 YouTube 清單，首頁只展示前三筆。
    ========================================================= -->
    <section class="home-section videos-section">
      <div class="videos-heading">
        <h2>{{ $ui('產品影片') }}</h2>
        <NuxtLink to="/video" class="section-link">{{ $ui('查看全部影片') }}<span>→</span></NuxtLink>
      </div>

      <div class="video-grid">
        <NuxtLink
          v-for="video in homeVideos"
          :key="video.id"
          to="/video"
          class="video-card"
        >
          <div class="video-thumb">
            <img
              :src="`https://i.ytimg.com/vi_webp/${video.youtubeId}/hqdefault.webp`"
              :alt="$ui(video.title)"
              loading="lazy"
            />
            <span class="play-button" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m9 7 8 5-8 5V7Z" /></svg>
            </span>
          </div>
          <h3>{{ $ui(video.title) }}</h3>
        </NuxtLink>
      </div>
    </section>

    <!-- 舊首頁原有推薦商品 Modal：保留顯示與 close/contact 事件邏輯。 -->
    <NewsView
      :is-visible="showNewsViewModal"
      @close="closeNewsViewModal"
      @contact="goToContact"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useApi } from "~/composables/utils/api";
import banner1 from "@/assets/image/banner1.webp";

import banner2 from "@/assets/image/banner2.webp";

import banner3 from "@/assets/image/banner3.webp";


// ============================================================
// SEO
// 說明：內容沿用舊首頁 home.js，不採用設計稿範例公司資料。
// ============================================================
useSeoMeta({
  title: "祐強醫療儀器｜專業醫療器材與設備解決方案",
  description:
    "祐強醫療提供優質的醫療器材、設備安裝與維護、技術支援與快速物流服務，是您醫療機構的最佳夥伴。",
  ogTitle: "祐強醫療儀器｜專業醫療器材與設備解決方案",
  ogDescription: "專業醫療設備供應與技術支援，打造高品質、高效率的醫療環境。",
  ogImage: "/og-cover.webp",
  twitterCard: "summary_large_image",
  twitterImage: "/og-cover.webp",
});

// 功能：Nuxt 目前的 useSeoMeta 型別不接受 keywords，改用 useHead 輸出同一個 meta 標籤。
// 網頁實際產生的 <meta name="keywords"> 內容維持不變。
useHead({
  meta: [
    {
      name: "keywords",
      content:
        "YoChung Medical, 祐強, 醫療器材, 醫療設備, 醫療供應商, 醫療維修, 醫療租賃, 醫療技術, 醫療物流, 醫療服務, 醫療解決方案",
    },
  ],
});

const router = useRouter();
const api = useApi();

interface CarouselSlide {
  image: string;
  mobileImage: string;
  title: string;
  description: string;
  buttonText: string;
  link: string;
}

interface ApiCategory {
  Id: number;
  Name: string;
  Sequence: number;
  CreatedDate?: string;
  UpdatedDate?: string;
}

interface CategoryItem {
  id: number;
  name: string;
  sequence: number;
  createdDate?: string;
  updatedDate?: string;
}

interface ApiTopProduct {
  Id: number;
  Name: string;
  ImageUrl: string;
  Description: string;
  Category: string;
}

interface FeaturedProduct {
  id: number;
  name: string;
  image: string;
  shortDescription: string;
  category: string;
}

const carouselSlides: CarouselSlide[] = [
  {
    image: banner1,
    mobileImage: banner1,
    title: "專業醫療儀器供應商",
    description: "提供全方位的醫療設備與解決方案",
    buttonText: "了解更多",
    link: "/about",
  },
  {
    image: banner2,
    mobileImage: banner2,
    title: "高品質醫療器材",
    description: "引進國際知名品牌",
    buttonText: "瀏覽產品",
    link: "/products",
  },
  {
    image: banner3,
    mobileImage: banner3,
    title: "專業技術支援",
    description: "完善售後服務與技術支持",
    buttonText: "聯絡我們",
    link: "/contact",
  },
];

// 舊首頁 feature-boxes 的內容與功能方向。
const serviceFeatures = [
  {
    title: "高品質保證",
    description: "所有產品均經過嚴格品質控管",
    link: "/products",
  },
  {
    title: "快速配送",
    description: "全台灣快速送達與安裝服務",
    link: "/contact",
  },
  {
    title: "設備租賃服務",
    description: "全台灣快速送達與安裝服務",
    link: "/contact",
  },
  {
    title: "專業技術支援",
    description: "售前售後全程技術諮詢",
    link: "/contact",
  },
];

const reasons = [
  {
    title: "20 年專業經驗",
    description: "祐強醫療儀器有限公司擁有超過 20 年的專業經驗。",
  },
  {
    title: "高品質保證",
    description: "所有產品均經過嚴格品質控管",
  },
  {
    title: "專業技術支援",
    description: "售前售後全程技術諮詢",
  },
  {
    title: "快速配送",
    description: "全台灣快速送達與安裝服務",
  },
  {
    title: "醫療設備解決方案",
    description:
      "無論是公立醫院、私人診所還是專業實驗室，我們都能提供符合您需求的解決方案。",
  },
];

// 舊 VideoPage 原始影片資料；首頁依設計稿只顯示前三筆。
const videos = [
  {
    id: 1,
    title: "DRF 40 數位X光+透視一體式系統",
    youtubeId: "jJ9_higsSHE",
  },
  { id: 2, title: "動物CT齒科成像", youtubeId: "PZAB0MDBRYQ" },
  { id: 3, title: "動物CT腹腔成像", youtubeId: "6Ik3VaXF_Og" },
  { id: 4, title: "動物CT腹部成像-30KG犬", youtubeId: "Um-FVMPMK0E" },
  { id: 5, title: "動物CT血管造影", youtubeId: "eJ_KmFhXxSg" },
  { id: 6, title: "動物CT胸腔成像", youtubeId: "QA3FhWigxtU" },
  { id: 7, title: "動物CT 3D渲染-貓", youtubeId: "YzVCmdwWYKI" },
  { id: 8, title: "動物CT 3D渲染-烏龜", youtubeId: "W1_L0y6UrGI" },
];

const homeVideos = videos.slice(0, 3);

// ============================================================
// 舊首頁狀態
// ============================================================
const showNewsViewModal = ref(true);
// 功能：首頁先讓推薦商品懸浮框完成顯示，再讓背景內容慢慢淡入，避免先看到尚未載入完成的畫面。
const isHomeContentVisible = ref(false);
// 功能：記住首頁推薦商品 Modal 開啟前的捲動位置，關閉後回到原位置。
const newsModalScrollY = ref(0);
const currentSlide = ref(0);
const productCurrentSlide = ref(0);
const featuredProducts = ref<FeaturedProduct[]>([]);
const loadingProducts = ref(true);
const errorLoadingProducts = ref(false);
const isMobile = ref(false);
const currentTestimonial = ref(0);

// 新版設計需要的分類資料，但 endpoint 與轉換邏輯沿用舊 ProductsPage。
const categories = ref<CategoryItem[]>([]);
const loadingCategories = ref(true);
const errorLoadingCategories = ref(false);

// ============================================================
// 產品分類水平滑動狀態
// 說明：7 個以內平均分配；超過 7 個才開啟左右滑動。
// ============================================================
const categoryScroller = ref<HTMLElement | null>(null);
const canScrollCategoryLeft = ref(false);
const canScrollCategoryRight = ref(false);

let homeContentRevealTimer: ReturnType<typeof setTimeout> | undefined;
let carouselInterval: ReturnType<typeof setInterval> | undefined;
let productCarouselInterval: ReturnType<typeof setInterval> | undefined;
let testimonialInterval: ReturnType<typeof setInterval> | undefined;

const testimonials = [
  { id: 1, content: "設備品質超群，售後服務非常好。" },
  { id: 2, content: "專業建議幫助我們節省不少成本。" },
  { id: 3, content: "技術支援反應迅速。" },
];

const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => a.sequence - b.sequence);
});

// 首頁不顯示臨時用途分類；正式分類仍由 API 動態載入。
const hiddenHomeCategoryNames = new Set([
  '洽詢客服',
  '祐強醫療',
  '運費',
]);

const visibleCategories = computed(() => {
  return sortedCategories.value.filter(
    (category) => !hiddenHomeCategoryNames.has(category.name.trim()),
  );
});

const hasCategoryOverflow = computed(() => visibleCategories.value.length > 7);

// 將舊單張熱門產品輪播改成新版四卡視覺；輪播索引與 4 秒切換仍維持原邏輯。
const visibleFeaturedProducts = computed<FeaturedProduct[]>(() => {
  const products = featuredProducts.value;

  // 功能：沒有商品時直接回傳空陣列，避免索引存取到 undefined。
  if (products.length === 0) return [];

  // 功能：維持原本輪播邏輯；最多顯示 4 筆，少於 4 筆就顯示全部。
  const visibleCount = Math.min(products.length, 4);

  return Array.from({ length: visibleCount }, (_, index) => {
    const productIndex =
      (productCurrentSlide.value + index) % products.length;

    return products[productIndex];
  }).filter((product): product is FeaturedProduct => product !== undefined);
});

// ============================================================
// 舊首頁方法：名稱與切換時間維持原本 home.js 行為。
// ============================================================
function scrollToTop() {
  if (!import.meta.client) return;

  window.scrollTo(0, 0);
  [
    document.documentElement,
    document.body,
    document.querySelector("#app"),
    document.querySelector(".app"),
    document.querySelector(".main"),
    document.querySelector(".content"),
  ].forEach((element) => {
    if (element && "scrollTop" in element) {
      (element as HTMLElement).scrollTop = 0;
    }
  });
}

// 功能：首頁推薦商品 Modal 開啟時鎖住背景頁面，並移除 scrollbar-gutter 預留空間。
function lockNewsModalPageScroll() {
  if (!import.meta.client) return;

  newsModalScrollY.value = window.scrollY;
  document.documentElement.style.scrollbarGutter = "auto";
  document.documentElement.style.overflow = "hidden";

  document.body.style.position = "fixed";
  document.body.style.top = `-${newsModalScrollY.value}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

// 功能：關閉推薦商品 Modal 後恢復全站捲動設定與原本頁面位置。
function unlockNewsModalPageScroll() {
  if (!import.meta.client) return;

  document.documentElement.style.scrollbarGutter = "";
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";

  window.scrollTo(0, newsModalScrollY.value);
}

function closeNewsViewModal() {
  showNewsViewModal.value = false;
  unlockNewsModalPageScroll();
}

function goToContact() {
  router.push("/contact");
}

async function fetchTopProducts() {
  try {
    const res = await api.get<ApiTopProduct[]>("/products/top");

    featuredProducts.value = res.data
      .filter((item) => item.Id !== 50)
      .map((item) => ({
        id: item.Id,
        name: item.Name,
        image: item.ImageUrl,
        shortDescription: item.Description,
        category: item.Category,
      }));
  } catch (error) {
    console.error("載入熱門產品失敗", error);
    errorLoadingProducts.value = true;
  } finally {
    loadingProducts.value = false;
  }
}

function updateCategoryScrollState() {
  const scroller = categoryScroller.value;

  if (!scroller || !hasCategoryOverflow.value) {
    canScrollCategoryLeft.value = false;
    canScrollCategoryRight.value = false;
    return;
  }

  const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
  canScrollCategoryLeft.value = scroller.scrollLeft > 2;
  canScrollCategoryRight.value = scroller.scrollLeft < maxScrollLeft - 2;
}

function scrollCategories(direction: "left" | "right") {
  const scroller = categoryScroller.value;
  if (!scroller) return;

  // 每次滑動約 3 個分類，保留前後內容讓使用者知道仍可繼續瀏覽。
  const firstItem = scroller.querySelector<HTMLElement>(".category-item");
  const itemWidth =
    firstItem?.getBoundingClientRect().width || scroller.clientWidth / 7;
  const distance = itemWidth * 3;

  scroller.scrollBy({
    left: direction === "right" ? distance : -distance,
    behavior: "smooth",
  });
}

async function fetchCategories() {
  try {
    loadingCategories.value = true;
    const res = await api.get<ApiCategory[]>("/categories?");

    categories.value = res.data.map((item) => ({
      id: item.Id,
      name: item.Name,
      sequence: item.Sequence,
      createdDate: item.CreatedDate,
      updatedDate: item.UpdatedDate,
    }));

    await nextTick();
    updateCategoryScrollState();
  } catch (error) {
    console.error("載入分類失敗", error);
    errorLoadingCategories.value = true;
  } finally {
    loadingCategories.value = false;
  }
}

function startCarousel() {
  carouselInterval = setInterval(nextSlide, 5000);
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.length;
}

function setSlide(index: number) {
  currentSlide.value = index;
}

function startProductCarousel() {
  productCarouselInterval = setInterval(() => {
    if (featuredProducts.value.length > 1) nextProduct();
  }, 4000);
}

function nextProduct() {
  if (featuredProducts.value.length <= 1) return;

  productCurrentSlide.value =
    (productCurrentSlide.value + 1) % featuredProducts.value.length;
}

function startTestimonialSlider() {
  testimonialInterval = setInterval(nextTestimonial, 6000);
}

function nextTestimonial() {
  currentTestimonial.value =
    (currentTestimonial.value + 1) % testimonials.length;
}

function checkIsMobile() {
  if (!import.meta.client) return;
  isMobile.value = window.innerWidth <= 768;
}

function handleImageError(event: Event) {
  const image = event.target as HTMLImageElement;
  image.style.visibility = "hidden";
  image.parentElement?.classList.add("image-fallback");
}

onMounted(() => {
  // 舊 beforeRouteEnter + mounted 的效果。
  scrollToTop();
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);
  window.addEventListener("resize", updateCategoryScrollState);

  showNewsViewModal.value = true;
  // 功能：首頁載入即顯示推薦商品，因此同步鎖住背景捲動並消除右側 scrollbar 空白。
  lockNewsModalPageScroll();

  // 功能：NewsView 的 appear 淡入為 0.3 秒；稍後才顯示首頁背景，確保懸浮框永遠先出現。
  isHomeContentVisible.value = false;
  homeContentRevealTimer = setTimeout(() => {
    isHomeContentVisible.value = true;
  }, 360);

  productCurrentSlide.value = 0;

  startCarousel();
  startTestimonialSlider();
  startProductCarousel();
  fetchTopProducts();
  fetchCategories();
});

onBeforeUnmount(() => {
  // 功能：若使用者在 Modal 尚未關閉時離開首頁，保證解除背景捲動鎖定。
  if (showNewsViewModal.value) {
    unlockNewsModalPageScroll();
  }

  if (homeContentRevealTimer) clearTimeout(homeContentRevealTimer);
  if (carouselInterval) clearInterval(carouselInterval);
  if (testimonialInterval) clearInterval(testimonialInterval);
  if (productCarouselInterval) clearInterval(productCarouselInterval);

  if (import.meta.client) {
    window.removeEventListener("resize", checkIsMobile);
    window.removeEventListener("resize", updateCategoryScrollState);
  }
});
</script>

<style scoped>
/* ============================================================
   首頁共同設定
   說明：採用設計稿的清爽白底、青綠 + 紫色品牌色，但字級依完整桌機畫面重新校正。
============================================================ */
.home-page {
  --brand-purple: #8a2f7e;
  --brand-purple-dark: #702267;
  --brand-teal: #3e9a9b;
  --brand-teal-dark: #267b80;
  --brand-green: #95bc79;
  --ink: #13283a;
  --muted: #647482;
  --line: #e7ebec;
  --soft: #f7f9f8;
  width: 100%;
  overflow: hidden;
  color: var(--ink);
  background: #fff;
  font-family: "Microsoft JhengHei", "微軟正黑體", system-ui, sans-serif;
}

.home-page *,
.home-page *::before,
.home-page *::after {
  box-sizing: border-box;
}

.home-page img {
  display: block;
  max-width: 100%;
}

/* ============================================================
   Hero
============================================================ */
.hero-section {
  position: relative;
  padding: 52px 28px 0;
  background:
    radial-gradient(
      circle at 4% 46%,
      rgba(143, 59, 134, 0.08) 0 70px,
      transparent 72px
    ),
    linear-gradient(180deg, #fff 0%, #fcfdfc 100%);
}

.hero-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(420px, 1.05fr);
  width: min(100%, 1320px);
  min-height: 470px;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  border: 1px solid #edf0f0;
  border-radius: 24px;
  box-shadow: 0 18px 52px rgba(38, 65, 76, 0.08);
}

.hero-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: clamp(48px, 6vw, 82px);
  background:
    radial-gradient(circle at 0 0, rgba(152, 190, 121, 0.15), transparent 42%),
    #fff;
}

.hero-eyebrow,
.section-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  color: var(--brand-teal-dark);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.hero-eyebrow::before {
  width: 22px;
  height: 2px;
  margin-right: 9px;
  content: "";
  background: var(--brand-purple);
}

.hero-copy h1 {
  max-width: 10em;
  margin: 16px 0 10px;
  color: var(--ink);
  font-size: clamp(32px, 3.4vw, 50px);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: 0.015em;
}

.hero-description {
  margin: 0;
  color: var(--brand-purple);
  font-size: clamp(18px, 1.6vw, 23px);
  font-weight: 800;
  line-height: 1.5;
}

.hero-intro {
  max-width: 610px;
  margin: 20px 0 0;
  color: #536673;
  font-size: 14px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 27px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 32px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  border-radius: 999px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.button:hover {
  transform: translateY(-2px);
}

.button-primary {
  color: #fff;
  background: linear-gradient(
    90deg,
    var(--brand-purple-dark),
    var(--brand-purple)
  );
}

.button-outline {
  color: var(--ink);
  background: #fff;
  border: 1px solid #cfd7d9;
}

.hero-dots {
  display: flex;
  gap: 7px;
  margin-top: 27px;
}

.hero-dots button {
  width: 7px;
  height: 7px;
  padding: 0;
  cursor: pointer;
  background: #cbd5d7;
  border: 0;
  border-radius: 999px;
  transition:
    width 0.2s ease,
    background-color 0.2s ease;
}

.hero-dots button.active {
  width: 24px;
  background: var(--brand-purple);
}

.hero-media {
  position: relative;
  min-height: 470px;
  overflow: hidden;
  background: #eef3f2;
}

.hero-media::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.12),
    transparent 24%
  );
}

.hero-media img {
  width: 100%;
  height: 100%;
  min-height: 470px;
  object-fit: cover;
  object-position: center;
}

/* 四項服務卡 */
.service-strip {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: min(calc(100% - 44px), 1220px);
  margin: -42px auto 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8ecec;
  border-radius: 15px;
  box-shadow: 0 14px 34px rgba(38, 65, 76, 0.11);
}

.service-card {
  display: grid;
  grid-template-columns: 45px minmax(0, 1fr);
  gap: 13px;
  min-width: 0;
  padding: 22px 20px;
  border-right: 1px solid #edf0f0;
}

.service-card:last-child {
  border-right: 0;
}

.service-icon {
  display: grid;
  width: 42px;
  height: 42px;
  color: #fff;
  background: var(--brand-teal);
  border-radius: 50%;
  place-items: center;
}

.service-card:nth-child(2) .service-icon {
  background: var(--brand-green);
}

.service-card:nth-child(3) .service-icon {
  background: var(--brand-purple);
}

.service-card:nth-child(4) .service-icon {
  background: #507db2;
}

.service-icon svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.service-copy h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.service-copy p {
  min-height: 38px;
  margin: 6px 0 10px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
}

.service-copy a {
  color: var(--brand-teal-dark);
  font-size: 11px;
  font-weight: 750;
  text-decoration: none;
}

/* ============================================================
   共用 Section
============================================================ */
.home-section {
  width: min(calc(100% - 56px), 1320px);
  padding: 58px 0;
  margin: 0 auto;
}

.category-section {
  padding-top: 68px;
  padding-bottom: 36px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 6px 0 0;
  color: var(--ink);
  font-size: clamp(21px, 2vw, 28px);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.section-link {
  flex: 0 0 auto;
  color: var(--brand-teal-dark);
  font-size: 12px;
  font-weight: 750;
  text-decoration: none;
}

.section-link span {
  margin-left: 5px;
}

.centered-heading {
  justify-content: center;
  text-align: center;
}

.centered-heading .section-kicker {
  margin: 0 auto;
}

.section-state {
  display: grid;
  min-height: 120px;
  color: var(--muted);
  font-size: 13px;
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 12px;
  place-items: center;
}

.error-state {
  color: #8d4651;
  background: #fff8f8;
  border-color: #f0dede;
}

/* ============================================================
   產品分類
============================================================ */
.category-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 102px;
  padding: 13px 9px;
  color: #344956;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  border-right: 1px solid var(--line);
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.category-item:last-child {
  border-right: 0;
}

.category-item:hover {
  color: var(--brand-teal-dark);
  background: #f5faf9;
}

.category-icon {
  display: grid;
  width: 34px;
  height: 34px;
  color: var(--brand-teal);
  place-items: center;
}

.category-icon svg {
  width: 27px;
  height: 27px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
}

/* ============================================================
   熱門產品
============================================================ */
.products-section {
  padding-top: 34px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.product-card {
  min-width: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7ebeb;
  border-radius: 14px;
  box-shadow: 0 7px 24px rgba(31, 66, 75, 0.055);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 14px 32px rgba(31, 66, 75, 0.11);
  transform: translateY(-4px);
}

.product-image-link {
  position: relative;
  display: grid;
  height: 205px;
  overflow: hidden;
  background: linear-gradient(180deg, #f7f9f9, #fff);
  place-items: center;
}

.product-image-link img {
  width: 100%;
  height: 100%;
  padding: 16px;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.product-card:hover .product-image-link img {
  transform: scale(1.035);
}

.product-image-link.image-fallback::after {
  color: #9aa7ad;
  font-size: 12px;
  content: "暫無產品圖片";
}

.product-card-body {
  padding: 17px 17px 18px;
}

.product-category {
  display: inline-block;
  margin-bottom: 7px;
  color: var(--brand-teal-dark);
  font-size: 10px;
  font-weight: 750;
}

.product-card h3 {
  margin: 0;
  overflow: hidden;
  color: var(--ink);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card p {
  display: -webkit-box;
  min-height: 47px;
  margin: 8px 0 12px;
  overflow: hidden;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card-body > a {
  color: var(--brand-teal-dark);
  font-size: 11px;
  font-weight: 750;
  text-decoration: none;
}

/* ============================================================
   為什麼選擇我們
============================================================ */
.reasons-section {
  width: 100%;
  max-width: none;
  padding: 48px max(28px, calc((100% - 1320px) / 2));
  background: linear-gradient(180deg, #f7f8f6, #fafbfa);
}

.reason-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0;
  width: min(100%, 1180px);
  margin: 28px auto 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid #e5e9e7;
  border-radius: 14px;
}

.reason-item {
  position: relative;
  padding: 25px 18px 23px;
  text-align: center;
  border-right: 1px solid #e7ebea;
}

.reason-item:last-child {
  border-right: 0;
}

.reason-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin: 0 auto 11px;
  color: var(--brand-teal);
  place-items: center;
}

.reason-icon svg {
  width: 34px;
  height: 34px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.reason-item h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
}

.reason-item p {
  margin: 8px auto 0;
  color: var(--muted);
  font-size: 10.5px;
  line-height: 1.65;
}

/* ============================================================
   產品影片
============================================================ */
.videos-section {
  padding-top: 50px;
  padding-bottom: 72px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.video-card {
  min-width: 0;
  color: var(--ink);
  text-decoration: none;
}

.video-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #e7ecec;
  border-radius: 12px;
  box-shadow: 0 7px 22px rgba(33, 58, 69, 0.09);
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.video-card:hover .video-thumb img {
  transform: scale(1.035);
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 46px;
  height: 46px;
  color: #fff;
  background: rgba(13, 29, 40, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 50%;
  place-items: center;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(4px);
}

.play-button svg {
  width: 23px;
  height: 23px;
  margin-left: 2px;
  fill: currentColor;
  stroke: none;
}

.video-card h3 {
  margin: 11px 2px 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================
   動畫
============================================================ */
.hero-copy-enter-active,
.hero-copy-leave-active,
.hero-image-enter-active,
.hero-image-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.hero-copy-enter-from,
.hero-copy-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.hero-image-enter-from,
.hero-image-leave-to {
  opacity: 0;
  transform: scale(1.015);
}

/* ============================================================
   響應式
============================================================ */
@media (max-width: 1120px) {
  .hero-shell {
    grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
  }

  .service-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-card:nth-child(2) {
    border-right: 0;
  }

  .service-card:nth-child(-n + 2) {
    border-bottom: 1px solid #edf0f0;
  }

  .category-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .category-item:nth-child(4n) {
    border-right: 0;
  }

  .category-item:nth-child(-n + 4) {
    border-bottom: 1px solid var(--line);
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .hero-section {
    padding: 28px 18px 0;
  }

  .hero-shell {
    grid-template-columns: 1fr;
  }

  .hero-copy {
    padding: 44px 36px 38px;
  }

  .hero-media,
  .hero-media img {
    min-height: 360px;
  }

  .hero-media {
    order: -1;
  }

  .service-strip {
    margin-top: -24px;
  }

  .home-section {
    width: min(calc(100% - 36px), 760px);
  }

  .reason-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reason-item {
    border-bottom: 1px solid #e7ebea;
  }

  .reason-item:nth-child(2n) {
    border-right: 0;
  }

  .reason-item:last-child {
    grid-column: 1 / -1;
    border-bottom: 0;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .video-card h3 {
    white-space: normal;
  }
}

@media (max-width: 620px) {
  .hero-section {
    padding: 16px 12px 0;
  }

  .hero-shell {
    border-radius: 16px;
  }

  .hero-copy {
    padding: 32px 22px 34px;
  }

  .hero-copy h1 {
    max-width: none;
    font-size: 30px;
  }

  .hero-description {
    font-size: 17px;
  }

  .hero-intro {
    font-size: 13px;
  }

  .hero-media,
  .hero-media img {
    min-height: 260px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .button {
    padding-inline: 14px;
  }

  .service-strip {
    grid-template-columns: 1fr;
    width: calc(100% - 24px);
    margin-top: -16px;
  }

  .service-card,
  .service-card:nth-child(2) {
    border-right: 0;
    border-bottom: 1px solid #edf0f0;
  }

  .service-card:last-child {
    border-bottom: 0;
  }

  .home-section {
    width: calc(100% - 28px);
    padding: 42px 0;
  }

  .category-section {
    padding-top: 54px;
    padding-bottom: 24px;
  }

  .section-heading {
    align-items: flex-start;
  }

  .section-heading h2 {
    font-size: 22px;
  }

  .section-link {
    margin-top: 5px;
    font-size: 11px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-item {
    border-right: 1px solid var(--line) !important;
    border-bottom: 1px solid var(--line);
  }

  .category-item:nth-child(2n) {
    border-right: 0 !important;
  }

  .category-item:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-image-link {
    height: 220px;
  }

  .reasons-section {
    width: 100%;
    padding: 42px 14px;
  }

  .reason-grid {
    grid-template-columns: 1fr;
  }

  .reason-item,
  .reason-item:nth-child(2n) {
    grid-column: auto;
    border-right: 0;
    border-bottom: 1px solid #e7ebea;
  }

  .reason-item:last-child {
    border-bottom: 0;
  }

  .videos-section {
    padding-bottom: 52px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .hero-copy-enter-active,
  .hero-copy-leave-active,
  .hero-image-enter-active,
  .hero-image-leave-active,
  .product-card,
  .product-image-link img,
  .video-thumb img,
  .button {
    transition-duration: 0.01ms !important;
  }
}

/* ============================================================
   Desktop Hero — 1440px 精準版型
   說明：只調整 Hero 視覺，不修改 API、輪播、商品與資料邏輯。
============================================================ */
@media (min-width: 861px) {
  .hero-section {
    position: relative;
    min-height: 590px;
    padding: 0;
    overflow: visible;
    background:
      radial-gradient(
        circle at 2% 82%,
        rgba(139, 47, 126, 0.085) 0 68px,
        transparent 70px
      ),
      radial-gradient(
        circle at 43% 2%,
        rgba(149, 188, 121, 0.09) 0 118px,
        transparent 120px
      ),
      radial-gradient(
        circle at 48% 100%,
        rgba(96, 124, 137, 0.045) 0 92px,
        transparent 94px
      ),
      #fff;
  }

  .hero-shell {
    position: relative;
    display: block;
    width: 100%;
    height: 530px;
    min-height: 530px;
    margin: 0;
    overflow: hidden;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .hero-copy {
    position: relative;
    z-index: 4;
    display: flex;
    width: 50%;
    height: 530px;
    min-height: 530px;
    padding: 86px 36px 64px 15vw;
    flex-direction: column;
    justify-content: flex-start;
    background: transparent;
    margin-top: 2rem;
  }

  .hero-copy::before,
  .hero-copy::after,
  .hero-eyebrow {
    display: none;
  }

  .hero-copy-content {
    min-height: 122px;
  }

  .hero-copy h1 {
    max-width: 550px;
    margin: 0 0 6px;
    color: #14293d;
    font-size: 44px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.012em;
  }

  .hero-description {
    margin: 0;
    color: #8f2f7d;
    font-size: 24px;
    font-weight: 750;
    line-height: 1.45;
  }

  .hero-intro {
    margin-top: 0rem;
    color: #556572;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.8;
  }

  .hero-actions {
    display: flex;
    gap: 14px;
    margin-top: 24px;
  }

  .button {
    display: inline-flex;
    min-width: 142px;
    min-height: 52px;
    padding: 0 25px;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 750;
    text-decoration: none;
    border-radius: 999px;
  }

  .button-primary {
    color: #fff;
    background: #8b2f7e;
  }

  .button-outline {
    color: #183045;
    background: #fff;
    border: 1.5px solid #aab9c3;
    box-shadow: none;
  }

  .hero-dots {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /*
    右側圖片從畫面約 42% 開始鋪底，
    再用巨大橢圓 clip-path 形成設計稿的連續柔和曲線。
  */
  .hero-media {
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    width: 58%;
    height: 530px;
    min-height: 530px;
    overflow: hidden;
    background: #edf2f1;
    clip-path: ellipse(88% 130% at 100% 50%);
  }

  .hero-media::before,
  .hero-media::after {
    display: none;
  }

  .hero-media img {
    width: 100%;
    height: 530px;
    min-height: 530px;
    padding: 0;
    object-fit: cover;
    object-position: center center;
  }

  /* 服務卡固定設計內容寬度，避免超寬螢幕被無限拉伸。 */
  .service-strip {
    position: absolute;
    z-index: 10;
    top: 440px;
    left: 50%;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: center;
    gap: 16px;
    width: calc(100% - 112px);
    max-width: 1280px;
    height: auto;
    margin: 0;
    overflow: visible;
    background: transparent;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    transform: translateX(-50%);
  }

  .service-card,
  .service-card:nth-child(2) {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
    min-height: 112px;
    height: 112px;
    padding: 14px 20px;
    background: #fff;
    border: 0 !important;
    border-radius: 18px;
    box-shadow: 0 12px 30px rgba(35, 61, 73, 0.105);
  }

  .service-icon {
    flex: 0 0 auto;
    display: grid;
    width: 56px;
    height: 56px;
    color: #fff;
    border-radius: 50%;
    place-items: center;
  }

  .service-icon svg {
    width: 28px;
    height: 28px;
    stroke-width: 1.6;
  }

  .service-copy {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 6px;
  }

  .service-copy h2 {
    margin: 0;
    color: #172d40;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.35;
  }

  .service-copy p {
    min-height: 0;
    margin: 0;
    color: #657480;
    font-size: 12px;
    line-height: 1.65;
  }



  .category-section {
    padding-top: 52px;
  }
}

/* 1440 左右維持設計稿原始比例。 */
@media (min-width: 1180px) and (max-width: 1500px) {
  .hero-copy h1 {
    font-size: clamp(40px, 3.055vw, 44px);
  }

  .hero-description {
    font-size: clamp(21px, 1.67vw, 24px);
  }
}

/* 861~1179：仍維持雙欄，但縮小避免擁擠。 */
@media (min-width: 861px) and (max-width: 1179px) {
  .hero-copy {
    width: 53%;
    padding: 70px 26px 58px 5.5vw;
  }

  .hero-copy h1 {
    font-size: 36px;
  }

  .hero-description {
    font-size: 19px;
  }

  .hero-intro {
    font-size: 12px;
  }

  .hero-media {
    width: 57%;
  }

  .service-strip {
    width: calc(100% - 56px);
    gap: 10px;
  }

  .service-card,
  .service-card:nth-child(2) {
    gap: 12px;
    min-height: 104px;
    height: 104px;
    padding: 12px 15px;
  }

  .service-icon {
    width: 46px;
    height: 46px;
  }

  .service-copy h2 {
    font-size: 13px;
  }

  .service-copy p,
  .service-copy a {
    font-size: 10.5px;
  }
}

/* Tablet / Mobile */
@media (max-width: 860px) {
  .hero-section {
    min-height: auto;
    padding: 0 0 34px;
    overflow: hidden;
    background: #fff;
  }

  .hero-shell {
    position: relative;
    display: flex;
    width: 100%;
    min-height: auto;
    margin: 0;
    overflow: hidden;
    flex-direction: column;
    background: #fff;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .hero-copy {
    order: 1;
    width: 100%;
    min-height: auto;
    padding: 40px 30px 34px;
    background: #fff;
  }

  .hero-copy::before,
  .hero-copy::after,
  .hero-eyebrow {
    display: none;
  }

  .hero-copy-content {
    min-height: auto;
  }

  .hero-copy h1 {
    max-width: 550px;
    margin-top: 0;
    font-size: 34px;
  }

  .hero-description {
    font-size: 19px;
  }

  .hero-media {
    position: relative;
    order: 2;
    width: 100%;
    height: 320px;
    min-height: 320px;
    clip-path: none;
  }

  .hero-media img {
    width: 100%;
    height: 320px;
    min-height: 320px;
    object-fit: cover;
  }

  .hero-dots {
    display: none;
  }

  .service-strip {
    position: relative;
    top: auto;
    left: auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    width: calc(100% - 36px);
    max-width: none;
    height: auto;
    margin: -54px auto 0;
    overflow: visible;
    background: transparent;
    border: 0;
    box-shadow: none;
    transform: none;
  }

  .service-card,
  .service-card:nth-child(2) {
    min-height: 165px;
    height: auto;
    background: #fff;
    border: 0 !important;
    border-radius: 16px;
    box-shadow: 0 9px 24px rgba(35, 61, 73, 0.09);
  }
}

@media (max-width: 620px) {
  .hero-copy {
    padding: 31px 20px 28px;
  }

  .hero-copy h1 {
    font-size: 29px;
  }

  .hero-description {
    font-size: 17px;
  }

  .hero-intro {
    font-size: 13px;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .button {
    min-width: 0;
    min-height: 46px;
    padding: 0 14px;
  }

  .hero-media,
  .hero-media img {
    height: 250px;
    min-height: 250px;
  }

  .service-strip {
    grid-template-columns: 1fr;
    width: calc(100% - 24px);
    margin-top: -36px;
  }

  .service-card,
  .service-card:nth-child(2) {
    min-height: 150px;
  }
}

/* ============================================================
   產品分類 + 熱門產品 — 依設計稿重做
   說明：只調整首頁視覺，不修改 API 與資料邏輯。
============================================================ */
.home-section.category-section,
.home-section.products-section {
  width: min(calc(100% - 112px), 1680px);
  max-width: none;
  margin-right: auto;
  margin-left: auto;
}

.category-section {
  padding-top: 54px;
  padding-bottom: 28px;
}

.category-layout {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 28px;
  align-items: center;
}

.category-title-block h2,
.products-heading h2 {
  margin: 0;
  color: #14293d;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.category-content {
  min-width: 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  min-height: 118px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e8ea;
  border-radius: 14px;
}

.category-item {
  display: flex;
  min-width: 0;
  min-height: 118px;
  padding: 16px 9px 14px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: #223848;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
  text-align: center;
  text-decoration: none;
  border-right: 1px solid #e7ecee;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.category-item:last-child {
  border-right: 0;
}

.category-item:hover {
  color: #27888c;
  background: #f8fbfb;
}

.category-icon {
  display: grid;
  width: 38px;
  height: 38px;
  color: #8b2f7e;
  place-items: center;
}

.category-icon svg {
  width: 32px;
  height: 32px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.category-name {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.products-section {
  padding-top: 18px;
  padding-bottom: 58px;
}

.products-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.products-heading .section-link {
  color: #8b2f7e;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px;
}

.product-card {
  min-width: 0;
  min-height: 430px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e2e7e9;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(31, 66, 75, 0.055);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 14px 32px rgba(31, 66, 75, 0.1);
  transform: translateY(-3px);
}

.product-image-link {
  position: relative;
  display: grid;
  height: clamp(220px, 15.5vw, 285px);
  overflow: hidden;
  background: #fff;
  place-items: center;
}

.product-image-link img {
  width: 100%;
  height: 100%;
  padding: 18px 20px 8px;
  object-fit: contain;
  object-position: center;
}

.product-card-body {
  padding: 18px 22px 22px;
}

.product-category {
  display: inline-block;
  margin-bottom: 8px;
  color: #8b2f7e;
  font-size: 12px;
  font-weight: 750;
}

.product-card h3 {
  margin: 0;
  overflow: hidden;
  color: #14293d;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card p {
  display: -webkit-box;
  min-height: 72px;
  margin: 10px 0 14px;
  overflow: hidden;
  color: #5f6f7a;
  font-size: 14px;
  line-height: 1.75;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.product-card-body > a {
  color: #8b2f7e;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 1320px) {
  .home-section.category-section,
  .home-section.products-section {
    width: calc(100% - 72px);
  }

  .category-layout {
    grid-template-columns: 130px minmax(0, 1fr);
    gap: 22px;
  }

  .category-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .category-item:nth-child(4n) {
    border-right: 0;
  }

  .category-item:nth-child(-n + 4) {
    border-bottom: 1px solid #e7ecee;
  }

  .product-grid {
    gap: 18px;
  }
}

@media (max-width: 860px) {
  .home-section.category-section,
  .home-section.products-section {
    width: calc(100% - 36px);
  }

  .category-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-item {
    min-height: 108px;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .product-image-link {
    height: 240px;
  }
}

@media (max-width: 620px) {
  .category-title-block h2,
  .products-heading h2 {
    font-size: 24px;
  }

  .products-heading .section-link {
    font-size: 12px;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    min-height: 0;
  }

  .product-image-link {
    height: 230px;
  }
}

/* ============================================================
   產品分類自適應寬度 / 超過 7 個水平滑動
============================================================ */
.category-slider {
  position: relative;
  min-width: 0;
}

.category-grid {
  display: flex;
  grid-template-columns: none;
  width: 100%;
  min-height: 118px;
  overflow-x: hidden;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  background: #fff;
  border: 1px solid #e2e8ea;
  border-radius: 14px;
}

.category-grid::-webkit-scrollbar {
  display: none;
}

/* 7 個以內：依實際類別數自動平均撐滿整個容器。 */
.category-grid:not(.is-scrollable) .category-item {
  flex: 1 1 0;
  width: auto;
  min-width: 0;
}

/* 超過 7 個：桌機固定一次顯示 7 格。 */
.category-grid.is-scrollable .category-item {
  flex: 0 0 calc(100% / 7);
  width: calc(100% / 7);
  min-width: calc(100% / 7);
}

.category-grid .category-item {
  border-bottom: 0 !important;
}

.category-grid .category-item:last-child {
  border-right: 0;
}

.category-nav {
  position: absolute;
  z-index: 5;
  top: 50%;
  display: grid;
  width: 42px;
  height: 42px;
  padding: 0;
  cursor: pointer;
  color: #2d8589;
  background: #fff;
  border: 1px solid #d6e1e3;
  border-radius: 50%;
  box-shadow: 0 7px 20px rgba(33, 67, 77, 0.13);
  place-items: center;
  transform: translateY(-50%);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    background-color 0.18s ease;
}

.category-nav:hover:not(:disabled) {
  background: #f4fafa;
  transform: translateY(-50%) scale(1.04);
}

.category-nav:disabled {
  cursor: default;
  opacity: 0.28;
  box-shadow: none;
}

.category-nav span {
  display: block;
  margin-top: -2px;
  font-size: 30px;
  font-weight: 400;
  line-height: 1;
}

.category-nav-prev {
  left: -21px;
}

.category-nav-next {
  right: -21px;
}

@media (max-width: 1320px) {
  .category-grid {
    display: flex;
    grid-template-columns: none;
  }

  /* 較窄桌機 / 平板若類別超過 7 個，一次顯示 4 格。 */
  .category-grid.is-scrollable .category-item {
    flex-basis: 25%;
    width: 25%;
    min-width: 25%;
  }
}

@media (max-width: 860px) {
  .category-grid:not(.is-scrollable) {
    flex-wrap: wrap;
  }

  .category-grid:not(.is-scrollable) .category-item {
    flex: 0 0 50%;
    width: 50%;
    min-width: 50%;
  }

  .category-grid.is-scrollable .category-item {
    flex-basis: 50%;
    width: 50%;
    min-width: 50%;
  }

  .category-nav-prev {
    left: -14px;
  }

  .category-nav-next {
    right: -14px;
  }
}

/* 產品分類標題移除後，分類列改為整體水平置中。 */
.category-layout {
  display: block;
}

.category-content {
  width: min(100%, 1500px);
  margin: 0 auto;
}

@media (max-width: 1320px) {
  .category-layout {
    display: block;
  }
}

@media (max-width: 860px) {
  .category-layout {
    display: block;
  }
}

/* ============================================================
   熱門產品圖片安全顯示
   說明：直式／高比例商品完整縮放進預覽區，不裁切。
============================================================ */
.product-image-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: #fff;
}

.product-image-link img {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
  object-fit: scale-down;
  object-position: center;
}


/* ============================================================
   為什麼選擇我們 + 產品影片 — 質感版型
   說明：使用編輯式留白、不對稱結構與細節層次，降低制式卡片感。
============================================================ */
.home-section.reasons-section,
.home-section.videos-section {
  width: min(calc(100% - 112px), 1600px);
  max-width: none;
  margin-right: auto;
  margin-left: auto;
}

.reasons-section {
  padding: 46px 0 58px;
  background: transparent;
}

.reasons-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(300px, 0.8fr) minmax(0, 1.7fr);
  overflow: hidden;
  background: #f5f7f6;
  border-radius: 28px;
}

.reasons-panel::after {
  position: absolute;
  right: -90px;
  bottom: -125px;
  width: 310px;
  height: 310px;
  content: '';
  pointer-events: none;
  background: rgba(143, 47, 126, 0.035);
  border-radius: 50%;
}

.reasons-intro {
  position: relative;
  z-index: 1;
  padding: 58px 52px 54px;
  background: #173245;
}

.reasons-label,
.videos-label {
  display: inline-block;
  margin-bottom: 14px;
  color: #58a7a8;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.reasons-intro h2 {
  max-width: 320px;
  margin: 0;
  color: #fff;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.3;
}

.reasons-intro p {
  max-width: 365px;
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 1.9;
}

.reasons-accent {
  display: block;
  width: 68px;
  height: 4px;
  margin-top: 34px;
  background: #8d347f;
  border-radius: 999px;
}

.reason-list {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 18px 24px;
}

.reason-row {
  display: grid;
  grid-template-columns: 32px 48px minmax(0, 1fr);
  gap: 14px;
  min-height: 138px;
  padding: 26px 26px 24px;
  align-items: start;
  border-bottom: 1px solid #dfe6e4;
}

.reason-row:nth-child(odd) {
  border-right: 1px solid #dfe6e4;
}

.reason-row:nth-child(3),
.reason-row:nth-child(4) {
  border-bottom: 0;
}

.reason-row-wide {
  grid-column: 1 / -1;
  min-height: 122px;
  border-top: 1px solid #dfe6e4;
  border-right: 0 !important;
  border-bottom: 0;
}

.reason-number {
  padding-top: 5px;
  color: #9baaaa;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.reason-icon {
  display: grid;
  width: 44px;
  height: 44px;
  margin: 0;
  color: #3f999c;
  background: rgba(63, 153, 156, 0.08);
  border-radius: 14px;
  place-items: center;
}

.reason-icon svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.reason-copy h3 {
  margin: 1px 0 0;
  color: #173245;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
}

.reason-copy p {
  max-width: 390px;
  margin: 8px 0 0;
  color: #687984;
  font-size: 13px;
  line-height: 1.75;
}

.reason-row-wide .reason-copy p {
  max-width: 760px;
}

.videos-section {
  padding: 64px 0 84px;
}

.premium-videos-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.premium-videos-heading h2 {
  margin: 0;
  color: #173245;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.3;
}

.video-more-link {
  position: relative;
  padding-bottom: 5px;
  color: #3c8f91;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
}

.video-more-link::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  content: '';
  background: rgba(60, 143, 145, 0.34);
}

.video-showcase {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(360px, 0.9fr);
  gap: 24px;
}

.video-featured,
.video-secondary {
  color: inherit;
  text-decoration: none;
}

.video-featured-media {
  position: relative;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: #dfe5e4;
  border-radius: 24px;
}

.video-featured-media::after {
  position: absolute;
  inset: 40% 0 0;
  content: '';
  background: linear-gradient(180deg, transparent 0%, rgba(8, 22, 31, 0.78) 100%);
}

.video-featured-media img {
  width: 100%;
  height: 100%;
  min-height: 520px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.video-featured:hover img,
.video-secondary:hover img {
  transform: scale(1.025);
}

.video-featured-overlay {
  position: absolute;
  z-index: 3;
  right: 36px;
  bottom: 34px;
  left: 36px;
  color: #fff;
}

.video-featured-overlay > span,
.video-secondary-copy > span {
  color: #80c0c0;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.video-featured-overlay h3 {
  max-width: 760px;
  margin: 8px 0 0;
  color: #fff;
  font-size: 25px;
  font-weight: 750;
  line-height: 1.5;
}

.play-button {
  position: absolute;
  z-index: 4;
  display: grid;
  color: #fff;
  background: rgba(13, 31, 42, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 50%;
  place-items: center;
  backdrop-filter: blur(5px);
}

.play-button-large {
  top: 50%;
  left: 50%;
  width: 72px;
  height: 72px;
  transform: translate(-50%, -50%);
}

.play-button-large svg {
  width: 31px;
  height: 31px;
  margin-left: 4px;
  fill: currentColor;
  stroke: none;
}

.video-secondary-list {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.video-secondary {
  display: grid;
  grid-template-columns: 47% minmax(0, 1fr);
  min-height: 250px;
  overflow: hidden;
  background: #f6f8f7;
  border-radius: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.video-secondary:hover {
  box-shadow: 0 16px 34px rgba(30, 56, 68, 0.09);
  transform: translateY(-2px);
}

.video-secondary-media {
  position: relative;
  min-height: 250px;
  overflow: hidden;
  background: #dfe5e4;
}

.video-secondary-media img {
  width: 100%;
  height: 100%;
  min-height: 250px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.play-button-small {
  top: 50%;
  left: 50%;
  width: 48px;
  height: 48px;
  transform: translate(-50%, -50%);
}

.play-button-small svg {
  width: 21px;
  height: 21px;
  margin-left: 3px;
  fill: currentColor;
  stroke: none;
}

.video-secondary-copy {
  display: flex;
  padding: 28px 25px;
  flex-direction: column;
  justify-content: center;
}

.video-secondary-copy h3 {
  margin: 9px 0 0;
  color: #173245;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.55;
}

.video-secondary-copy p {
  margin: 18px 0 0;
  color: #3e8e91;
  font-size: 13px;
  font-weight: 750;
}

@media (max-width: 1180px) {
  .home-section.reasons-section,
  .home-section.videos-section {
    width: calc(100% - 72px);
  }

  .reasons-panel {
    grid-template-columns: 1fr;
  }

  .reasons-intro {
    padding: 42px 42px 38px;
  }

  .reasons-intro h2,
  .reasons-intro p {
    max-width: 680px;
  }

  .video-showcase {
    grid-template-columns: 1fr;
  }

  .video-secondary-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }
}

@media (max-width: 760px) {
  .home-section.reasons-section,
  .home-section.videos-section {
    width: calc(100% - 32px);
  }

  .reasons-panel {
    border-radius: 22px;
  }

  .reasons-intro {
    padding: 34px 28px 32px;
  }

  .reasons-intro h2 {
    font-size: 28px;
  }

  .reason-list {
    grid-template-columns: 1fr;
    padding: 10px 18px;
  }

  .reason-row,
  .reason-row:nth-child(odd),
  .reason-row:nth-child(3),
  .reason-row:nth-child(4),
  .reason-row-wide {
    grid-column: auto;
    min-height: 0;
    border-right: 0;
    border-bottom: 1px solid #dfe6e4;
    border-top: 0;
  }

  .reason-row:last-child {
    border-bottom: 0;
  }

  .videos-section {
    padding-top: 48px;
  }

  .premium-videos-heading h2 {
    font-size: 28px;
  }

  .video-featured-media,
  .video-featured-media img {
    min-height: 360px;
  }

  .video-secondary-list {
    grid-template-columns: 1fr;
  }

  .video-secondary {
    grid-template-columns: 1fr;
  }

  .video-secondary-media,
  .video-secondary-media img {
    min-height: 220px;
  }
}


/* ============================================================
   產品影片 — 復原為上一版三欄排版
============================================================ */
.home-section.videos-section {
  width: min(calc(100% - 112px), 1680px);
  max-width: none;
  margin-right: auto;
  margin-left: auto;
  padding: 34px 0 70px;
}

.videos-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.videos-heading h2 {
  margin: 0;
  color: #14293d;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.videos-heading .section-link {
  color: #8b2f7e;
  font-size: 14px;
  font-weight: 750;
  text-decoration: none;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.video-card {
  min-width: 0;
  color: #172d40;
  text-decoration: none;
}

.video-thumb {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 7.8;
  background: #e8eeee;
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(34, 58, 70, 0.09);
}

.video-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.24s ease;
}

.video-card:hover .video-thumb img {
  transform: scale(1.025);
}

.video-thumb .play-button {
  position: absolute;
  z-index: 4;
  top: 50%;
  left: 50%;
  display: grid;
  width: 58px;
  height: 58px;
  color: #fff;
  background: rgba(14, 29, 40, 0.72);
  border: 2px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  place-items: center;
  transform: translate(-50%, -50%);
  backdrop-filter: blur(3px);
}

.video-thumb .play-button svg {
  width: 28px;
  height: 28px;
  margin-left: 3px;
  fill: currentColor;
  stroke: none;
}

.video-card h3 {
  margin: 12px 4px 0;
  overflow: hidden;
  color: #233849;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.5;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1320px) {
  .home-section.videos-section {
    width: calc(100% - 72px);
  }
}

@media (max-width: 860px) {
  .home-section.videos-section {
    width: calc(100% - 36px);
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }

  .video-thumb {
    aspect-ratio: 16 / 9;
  }

  .video-card h3 {
    white-space: normal;
  }
}

@media (max-width: 620px) {
  .videos-heading h2 {
    font-size: 24px;
  }

  .videos-heading .section-link {
    font-size: 12px;
  }
}



/* ============================================================
   為什麼選擇祐強 — Premium Editorial Layout
============================================================ */
.reasons-premium-section {
  width: min(calc(100% - 112px), 1600px) !important;
  max-width: none !important;
  padding: 62px 0 66px !important;
  margin-right: auto !important;
  margin-left: auto !important;
  background: transparent !important;
}

.reasons-premium-heading {
  display: grid;
  grid-template-columns: minmax(320px, 0.9fr) minmax(420px, 1.1fr);
  gap: 72px;
  margin-bottom: 34px;
  align-items: end;
}

.reasons-premium-label {
  display: block;
  margin-bottom: 11px;
  color: #3b999b;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.reasons-premium-title h2 {
  margin: 0;
  color: #173245;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: 0.01em;
}

.reasons-premium-summary {
  max-width: 680px;
  margin: 0 0 2px auto;
  color: #687984;
  font-size: 14px;
  line-height: 1.9;
}

.reasons-premium-grid {
  display: grid;
  grid-template-columns: minmax(330px, 0.78fr) minmax(0, 1.72fr);
  gap: 22px;
  align-items: stretch;
}

.reason-featured-card {
  position: relative;
  display: flex;
  min-height: 410px;
  padding: 38px 38px 34px;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: #17364a;
  border-radius: 26px;
}

.reason-featured-card::before {
  position: absolute;
  top: -88px;
  right: -82px;
  width: 250px;
  height: 250px;
  content: '';
  background: rgba(83, 166, 168, 0.11);
  border-radius: 50%;
}

.reason-featured-card::after {
  position: absolute;
  right: 34px;
  bottom: 28px;
  width: 72px;
  height: 4px;
  content: '';
  background: #973887;
  border-radius: 999px;
}

.reason-featured-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.reason-featured-number {
  color: #fff;
  font-size: 72px;
  font-weight: 300;
  line-height: 0.9;
  letter-spacing: -0.055em;
}

.reason-featured-number span {
  margin-left: 3px;
  color: #64b3b4;
  font-size: 30px;
  font-weight: 500;
  vertical-align: top;
}

.reason-featured-tag {
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.13em;
  text-align: right;
}

.reason-featured-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  gap: 17px;
  align-items: start;
}

.reason-featured-icon,
.reason-secondary-icon {
  display: grid;
  place-items: center;
}

.reason-featured-icon {
  width: 52px;
  height: 52px;
  color: #73bfc0;
  background: rgba(255, 255, 255, 0.075);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
}

.reason-featured-icon svg,
.reason-secondary-icon svg {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.reason-featured-icon svg {
  width: 28px;
  height: 28px;
}

.reason-featured-content h3 {
  margin: 0;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.45;
}

.reason-featured-content p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.67);
  font-size: 13px;
  line-height: 1.8;
}

.reason-secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.reason-secondary-card {
  position: relative;
  min-height: 196px;
  padding: 27px 29px 26px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e1e8e7;
  border-radius: 22px;
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.reason-secondary-card:hover {
  border-color: #cadbd9;
  box-shadow: 0 14px 36px rgba(34, 62, 72, 0.075);
  transform: translateY(-3px);
}

.reason-secondary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.reason-secondary-index {
  color: #a6b3b5;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.reason-secondary-icon {
  width: 46px;
  height: 46px;
  color: #3e999b;
  background: #eef7f6;
  border-radius: 15px;
}

.reason-secondary-icon svg {
  width: 24px;
  height: 24px;
}

.reason-secondary-card h3 {
  margin: 0;
  color: #173245;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
}

.reason-secondary-card p {
  margin: 9px 0 0;
  color: #697984;
  font-size: 13px;
  line-height: 1.72;
}

@media (max-width: 1180px) {
  .reasons-premium-section {
    width: calc(100% - 72px) !important;
  }

  .reasons-premium-heading {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .reasons-premium-summary {
    max-width: 760px;
    margin-left: 0;
  }

  .reasons-premium-grid {
    grid-template-columns: 1fr;
  }

  .reason-featured-card {
    min-height: 300px;
  }
}

@media (max-width: 760px) {
  .reasons-premium-section {
    width: calc(100% - 32px) !important;
    padding: 46px 0 50px !important;
  }

  .reasons-premium-title h2 {
    font-size: 29px;
  }

  .reason-featured-card {
    min-height: 285px;
    padding: 30px 26px 28px;
    border-radius: 22px;
  }

  .reason-featured-number {
    font-size: 58px;
  }

  .reason-secondary-grid {
    grid-template-columns: 1fr;
  }

  .reason-secondary-card {
    min-height: 0;
  }
}



/* ============================================================
   為什麼選擇祐強 — Soft Premium Layout
   說明：統一淺色視覺語言，避免深色主卡與白卡產生突兀切割。
============================================================ */
.reasons-soft-section {
  width: min(calc(100% - 112px), 1600px) !important;
  max-width: none !important;
  padding: 60px 0 64px !important;
  margin-right: auto !important;
  margin-left: auto !important;
  background: transparent !important;
}

.reasons-soft-heading {
  display: grid;
  grid-template-columns: minmax(320px, 0.85fr) minmax(440px, 1.15fr);
  gap: 70px;
  margin-bottom: 30px;
  align-items: end;
}

.reasons-soft-label {
  display: block;
  margin-bottom: 10px;
  color: #3f9698;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.reasons-soft-heading h2 {
  margin: 0;
  color: #173245;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.25;
}

.reasons-soft-heading > p {
  max-width: 680px;
  margin: 0 0 2px auto;
  color: #697983;
  font-size: 14px;
  line-height: 1.9;
}

.reasons-soft-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(0, 1.68fr);
  overflow: hidden;
  background:
    radial-gradient(circle at 0% 100%, rgba(143, 47, 126, 0.045) 0 110px, transparent 112px),
    radial-gradient(circle at 100% 0%, rgba(70, 157, 159, 0.055) 0 150px, transparent 152px),
    #f7f9f8;
  border: 1px solid #e5ebea;
  border-radius: 26px;
}

.reason-experience-block {
  position: relative;
  padding: 44px 42px 40px;
  background: rgba(255, 255, 255, 0.62);
  border-right: 1px solid #e0e7e5;
}

.reason-experience-number {
  color: #173f53;
  font-size: 72px;
  font-weight: 300;
  line-height: 0.95;
  letter-spacing: -0.055em;
}

.reason-experience-number span {
  margin-left: 3px;
  color: #459fa1;
  font-size: 28px;
  font-weight: 500;
  vertical-align: top;
}

.reason-experience-caption {
  display: block;
  margin-top: 9px;
  color: #96a5a8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.reason-experience-divider {
  width: 58px;
  height: 3px;
  margin: 34px 0 28px;
  background: #973b86;
  border-radius: 999px;
}

.reason-experience-block h3 {
  margin: 0;
  color: #173245;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.4;
}

.reason-experience-block p {
  max-width: 330px;
  margin: 11px 0 0;
  color: #687984;
  font-size: 13px;
  line-height: 1.8;
}

.reason-soft-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.reason-soft-item {
  min-height: 192px;
  padding: 30px 32px 28px;
  border-right: 1px solid #e0e7e5;
  border-bottom: 1px solid #e0e7e5;
}

.reason-soft-item:nth-child(2n) {
  border-right: 0;
}

.reason-soft-item:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.reason-soft-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.reason-soft-index {
  color: #a6b1b3;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.reason-soft-icon {
  display: grid;
  width: 44px;
  height: 44px;
  color: #3d999b;
  background: rgba(67, 157, 159, 0.075);
  border-radius: 14px;
  place-items: center;
}

.reason-soft-icon svg {
  width: 23px;
  height: 23px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.reason-soft-item h3 {
  margin: 0;
  color: #173245;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.45;
}

.reason-soft-item p {
  max-width: 430px;
  margin: 9px 0 0;
  color: #687984;
  font-size: 13px;
  line-height: 1.75;
}

@media (max-width: 1180px) {
  .reasons-soft-section {
    width: calc(100% - 72px) !important;
  }

  .reasons-soft-heading {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .reasons-soft-heading > p {
    max-width: 760px;
    margin-left: 0;
  }

  .reasons-soft-panel {
    grid-template-columns: 1fr;
  }

  .reason-experience-block {
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-experience-block p {
    max-width: 680px;
  }
}

@media (max-width: 760px) {
  .reasons-soft-section {
    width: calc(100% - 32px) !important;
    padding: 46px 0 50px !important;
  }

  .reasons-soft-heading h2 {
    font-size: 29px;
  }

  .reasons-soft-panel {
    border-radius: 22px;
  }

  .reason-experience-block {
    padding: 34px 28px 30px;
  }

  .reason-experience-number {
    font-size: 58px;
  }

  .reason-soft-list {
    grid-template-columns: 1fr;
  }

  .reason-soft-item,
  .reason-soft-item:nth-child(2n),
  .reason-soft-item:nth-last-child(-n + 2) {
    min-height: 0;
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-soft-item:last-child {
    border-bottom: 0;
  }
}



/* ============================================================
   Fluid RWD Override
   說明：集中管理首頁的流動式響應版型，避免前方多組斷點互相覆蓋。
   原則：桌機使用 clamp() 平滑縮放；中尺寸重新排版；手機單欄。
============================================================ */
.home-page {
  --fluid-gutter: clamp(16px, 4vw, 56px);
  --fluid-section-space: clamp(42px, 5vw, 72px);
}

/* 共用內容寬度與上下留白，隨視窗平滑縮放。 */
.home-section.category-section,
.home-section.products-section,
.home-section.reasons-section,
.home-section.videos-section {
  width: min(calc(100% - (var(--fluid-gutter) * 2)), 1600px);
}

.home-section {
  padding-top: var(--fluid-section-space);
  padding-bottom: var(--fluid-section-space);
}

/* ============================================================
   Desktop / Laptop：861px 以上維持 Hero 左文右圖，尺寸使用 clamp()。
============================================================ */
@media (min-width: 861px) {
  .hero-section {
    min-height: calc(clamp(500px, 36.8vw, 560px) + 42px);
  }

  .hero-shell {
    height: clamp(500px, 36.8vw, 560px);
    min-height: clamp(500px, 36.8vw, 560px);
  }

  .hero-copy {
    width: 50%;
    height: clamp(500px, 36.8vw, 560px);
    min-height: clamp(500px, 36.8vw, 560px);
    padding:
      clamp(64px, 5.8vw, 86px)
      clamp(24px, 2.5vw, 36px)
      clamp(52px, 4.4vw, 64px)
      clamp(58px, 6.2vw, 104px);
  }

  .hero-copy-content {
    min-height: clamp(108px, 8.5vw, 122px);
  }

  .hero-copy h1 {
    font-size: clamp(34px, 3.05vw, 46px);
    margin-bottom: clamp(4px, 0.5vw, 7px);
  }

  .hero-description {
    font-size: clamp(18px, 1.65vw, 24px);
  }

  .hero-intro {
    max-width: min(550px, 92%);
    margin-top: clamp(12px, 1.2vw, 18px);
    font-size: clamp(12px, 0.92vw, 14px);
  }

  .hero-actions {
    margin-top: clamp(18px, 1.8vw, 26px);
  }

  .button {
    min-width: clamp(126px, 10vw, 142px);
    min-height: clamp(46px, 3.6vw, 52px);
    padding-inline: clamp(18px, 1.8vw, 25px);
    font-size: clamp(12px, 0.95vw, 14px);
  }

  .hero-media,
  .hero-media img {
    height: clamp(500px, 36.8vw, 560px);
    min-height: clamp(500px, 36.8vw, 560px);
  }

  .service-strip {
    top: calc(clamp(500px, 36.8vw, 560px) - 90px);
    width: min(calc(100% - (var(--fluid-gutter) * 2)), 1280px);
    gap: clamp(10px, 1.15vw, 16px);
  }

  .service-card,
  .service-card:nth-child(2) {
    height: clamp(104px, 7.8vw, 112px);
    min-height: clamp(104px, 7.8vw, 112px);
    padding: clamp(12px, 1vw, 14px) clamp(15px, 1.4vw, 20px);
    gap: clamp(12px, 1.25vw, 18px);
  }

  .service-icon {
    width: clamp(46px, 3.9vw, 56px);
    height: clamp(46px, 3.9vw, 56px);
  }

  .service-icon svg {
    width: clamp(23px, 1.95vw, 28px);
    height: clamp(23px, 1.95vw, 28px);
  }

  .service-copy h2 {
    font-size: clamp(13px, 1.1vw, 16px);
  }

  .service-copy p {
    font-size: clamp(10.5px, 0.82vw, 12px);
  }
}

/* ============================================================
   小筆電 / 橫向平板：861 ~ 1100px。
   服務卡改成 2 欄並回到正常文件流，避免四卡過度擁擠。
============================================================ */
@media (min-width: 861px) and (max-width: 1100px) {
  .hero-section {
    min-height: auto;
    padding-bottom: clamp(34px, 4vw, 48px);
  }

  .hero-copy {
    width: 54%;
    padding-left: clamp(42px, 5vw, 58px);
  }

  .hero-media {
    width: 55%;
  }

  .service-strip {
    position: relative;
    top: auto;
    left: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: min(calc(100% - (var(--fluid-gutter) * 2)), 920px);
    margin: -46px auto 0;
    transform: none;
  }

  .service-card,
  .service-card:nth-child(2) {
    height: 104px;
    min-height: 104px;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .reason-soft-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ============================================================
   Tablet：860px 以下。
============================================================ */
@media (max-width: 860px) {
  .hero-copy {
    padding: clamp(28px, 6vw, 40px) var(--fluid-gutter) clamp(28px, 5vw, 36px);
  }

  .hero-copy h1 {
    font-size: clamp(28px, 6vw, 34px);
  }

  .hero-description {
    font-size: clamp(16px, 3.5vw, 19px);
  }

  .hero-intro {
    max-width: 680px;
    font-size: clamp(12px, 2.3vw, 13px);
  }

  .hero-media,
  .hero-media img {
    height: clamp(250px, 43vw, 320px);
    min-height: clamp(250px, 43vw, 320px);
  }

  .service-strip {
    width: min(calc(100% - (var(--fluid-gutter) * 2)), 760px);
    gap: clamp(10px, 2vw, 14px);
  }

  .service-card,
  .service-card:nth-child(2) {
    display: flex;
    align-items: center;
    min-height: 112px;
    height: auto;
    padding: 14px 16px;
    gap: 14px;
  }

  .service-icon {
    flex: 0 0 auto;
  }

  .service-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
  }

  .service-copy p {
    min-height: 0;
    margin: 0;
  }

  .category-section,
  .products-section,
  .reasons-soft-section,
  .videos-section {
    padding-top: clamp(38px, 7vw, 54px) !important;
    padding-bottom: clamp(38px, 7vw, 54px) !important;
  }

  .category-grid:not(.is-scrollable) {
    flex-wrap: wrap;
  }

  .category-grid:not(.is-scrollable) .category-item,
  .category-grid.is-scrollable .category-item {
    flex: 0 0 50%;
    width: 50%;
    min-width: 50%;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(14px, 3vw, 20px);
  }

  .product-card {
    min-height: 0;
  }

  .product-image-link {
    height: clamp(210px, 30vw, 250px);
  }

  .reasons-soft-heading {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .reasons-soft-heading > p {
    margin-left: 0;
  }

  .reasons-soft-panel {
    grid-template-columns: 1fr;
  }

  .reason-experience-block {
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   Mobile：620px 以下，所有主要卡片改為單欄。
============================================================ */
@media (max-width: 620px) {
  .hero-actions {
    grid-template-columns: 1fr;
  }

  .button {
    width: 100%;
  }

  .service-strip {
    grid-template-columns: 1fr;
    width: calc(100% - (var(--fluid-gutter) * 2));
    margin-top: -28px;
  }

  .service-card,
  .service-card:nth-child(2) {
    min-height: 96px;
    padding: 12px 15px;
  }

  .category-grid:not(.is-scrollable) .category-item,
  .category-grid.is-scrollable .category-item {
    flex-basis: 50%;
    width: 50%;
    min-width: 50%;
  }

  .category-nav {
    width: 36px;
    height: 36px;
  }

  .products-heading,
  .videos-heading {
    align-items: flex-start;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .product-image-link {
    height: clamp(210px, 65vw, 250px);
  }

  .reasons-soft-heading h2,
  .videos-heading h2,
  .products-heading h2 {
    font-size: clamp(23px, 6vw, 28px);
  }

  .reason-soft-list {
    grid-template-columns: 1fr;
  }

  .reason-soft-item,
  .reason-soft-item:nth-child(2n),
  .reason-soft-item:nth-last-child(-n + 2) {
    min-height: 0;
    padding: 24px 22px;
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-soft-item:last-child {
    border-bottom: 0;
  }

  .video-grid {
    gap: 22px;
  }
}



/* ============================================================
   首頁流動式 RWD
   功能：只控制 1179px 以下的平板與手機；1180px 以上桌機版完全沿用既有排版。
============================================================ */

/* ------------------------------------------------------------
   小筆電 / 大平板：901px ~ 1179px
   功能：Hero 保留左右雙欄，但尺寸改用 clamp 流動縮放；服務卡改成 2 x 2。
------------------------------------------------------------ */
@media (min-width: 901px) and (max-width: 1179px) {
  .hero-section {
    min-height: 0;
    padding-bottom: clamp(38px, 5vw, 58px);
    overflow: hidden;
  }

  .hero-shell {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
    width: 100%;
    height: auto;
    min-height: clamp(460px, 48vw, 520px);
    overflow: hidden;
  }

  .hero-copy {
    position: relative;
    width: auto;
    height: auto;
    min-height: clamp(460px, 48vw, 520px);
    padding: clamp(50px, 6vw, 70px) clamp(28px, 4vw, 46px) clamp(54px, 6vw, 72px) clamp(48px, 6vw, 72px);
    justify-content: center;
  }

  .hero-copy-content {
    min-height: 0;
  }

  .hero-copy h1 {
    max-width: 11em;
    margin-bottom: clamp(5px, 0.8vw, 8px);
    font-size: clamp(34px, 4vw, 40px);
  }

  .hero-description {
    font-size: clamp(19px, 2.2vw, 22px);
  }

  .hero-intro {
    max-width: 520px;
    margin-top: clamp(14px, 2vw, 18px);
    font-size: clamp(12px, 1.25vw, 13px);
  }

  .hero-actions {
    gap: 12px;
    margin-top: clamp(20px, 2.5vw, 26px);
  }

  .button {
    min-width: clamp(122px, 14vw, 142px);
    min-height: 48px;
    padding-inline: clamp(18px, 2vw, 24px);
    font-size: 13px;
  }

  .hero-media {
    position: relative;
    top: auto;
    right: auto;
    width: auto;
    height: auto;
    min-height: clamp(460px, 48vw, 520px);
    clip-path: none;
  }

  .hero-media img {
    width: 100%;
    height: 100%;
    min-height: clamp(460px, 48vw, 520px);
    object-fit: cover;
    object-position: center;
  }

  .service-strip {
    position: relative;
    top: auto;
    left: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: min(calc(100% - 48px), 980px);
    max-width: none;
    height: auto;
    margin: -36px auto 0;
    transform: none;
  }

  .service-card,
  .service-card:nth-child(2) {
    min-height: 106px;
    height: auto;
    padding: 14px 18px;
    gap: 14px;
  }

  .service-icon {
    width: 50px;
    height: 50px;
  }

  .service-icon svg {
    width: 25px;
    height: 25px;
  }

  .service-copy h2 {
    font-size: 14px;
  }

  .service-copy p {
    font-size: 11px;
  }

  .home-section.category-section,
  .home-section.products-section,
  .home-section.reasons-section,
  .home-section.videos-section {
    width: calc(100% - clamp(48px, 6vw, 72px));
  }

  .category-section {
    padding-top: clamp(42px, 5vw, 56px);
  }

  .category-grid.is-scrollable .category-item {
    flex-basis: 25%;
    width: 25%;
    min-width: 25%;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(16px, 2vw, 22px);
  }

  .product-card {
    min-height: 0;
  }

  .product-image-link {
    height: clamp(220px, 28vw, 270px);
  }

  .reasons-soft-heading {
    grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
    gap: clamp(30px, 5vw, 54px);
  }

  .reasons-soft-heading > p {
    margin-left: 0;
  }

  .reasons-soft-panel {
    grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
  }

  .reason-experience-block {
    padding: clamp(32px, 4vw, 40px);
  }

  .reason-soft-item {
    min-height: 176px;
    padding: 26px 26px 24px;
  }

  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .video-card:last-child {
    grid-column: 1 / -1;
    width: min(50%, 520px);
    margin: 0 auto;
  }
}

/* ------------------------------------------------------------
   平板：641px ~ 900px
   功能：Hero 改成上圖下文字；兩欄卡片；各 Section 依可用寬度流動縮放。
------------------------------------------------------------ */
@media (min-width: 641px) and (max-width: 900px) {
  .hero-section {
    min-height: 0;
    padding: 0 0 clamp(34px, 5vw, 48px);
    overflow: hidden;
  }

  .hero-shell {
    display: flex;
    width: 100%;
    height: auto;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
  }

  .hero-media {
    position: relative;
    order: 1;
    width: 100%;
    height: clamp(300px, 44vw, 390px);
    min-height: 0;
    clip-path: none;
  }

  .hero-media img {
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: cover;
    object-position: center;
  }

  .hero-copy {
    order: 2;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: clamp(34px, 5vw, 48px) clamp(34px, 6vw, 56px) clamp(72px, 9vw, 88px);
    justify-content: flex-start;
  }

  .hero-copy-content {
    min-height: 0;
  }

  .hero-copy h1 {
    max-width: none;
    margin-bottom: 6px;
    font-size: clamp(32px, 5vw, 38px);
  }

  .hero-description {
    font-size: clamp(18px, 3vw, 21px);
  }

  .hero-intro {
    max-width: 660px;
    margin-top: 15px;
    font-size: 13px;
  }

  .hero-actions {
    margin-top: 22px;
  }

  .button {
    min-width: 136px;
    min-height: 48px;
  }

  .service-strip {
    position: relative;
    top: auto;
    left: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: calc(100% - 40px);
    max-width: 760px;
    height: auto;
    margin: -50px auto 0;
    transform: none;
  }

  .service-card,
  .service-card:nth-child(2) {
    display: flex;
    align-items: center;
    min-height: 106px;
    height: auto;
    padding: 14px 17px;
    gap: 14px;
  }

  .service-icon {
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
  }

  .service-icon svg {
    width: 24px;
    height: 24px;
  }

  .service-copy {
    flex: 1;
    gap: 5px;
  }

  .service-copy h2 {
    font-size: 14px;
  }

  .service-copy p {
    font-size: 11px;
  }

  .home-section.category-section,
  .home-section.products-section,
  .home-section.reasons-section,
  .home-section.videos-section {
    width: calc(100% - 40px);
  }

  .category-section {
    padding-top: 46px;
    padding-bottom: 24px;
  }

  .category-grid:not(.is-scrollable) {
    flex-wrap: wrap;
  }

  .category-grid:not(.is-scrollable) .category-item,
  .category-grid.is-scrollable .category-item {
    flex: 0 0 33.333%;
    width: 33.333%;
    min-width: 33.333%;
  }

  .category-item {
    min-height: 106px;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .product-card {
    min-height: 0;
  }

  .product-image-link {
    height: clamp(210px, 34vw, 250px);
  }

  .reasons-soft-heading {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .reasons-soft-heading > p {
    max-width: 720px;
    margin-left: 0;
  }

  .reasons-soft-panel {
    grid-template-columns: 1fr;
  }

  .reason-experience-block {
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-experience-block p {
    max-width: 680px;
  }

  .reason-soft-item {
    min-height: 170px;
  }

  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .video-card:last-child {
    grid-column: 1 / -1;
    width: min(60%, 520px);
    margin: 0 auto;
  }
}

/* ------------------------------------------------------------
   手機：640px 以下
   功能：單欄內容、觸控友善尺寸、避免水平溢出。
------------------------------------------------------------ */
@media (max-width: 640px) {
  .hero-section {
    min-height: 0;
    padding: 0 0 30px;
    overflow: hidden;
  }

  .hero-shell {
    display: flex;
    width: 100%;
    height: auto;
    min-height: 0;
    flex-direction: column;
  }

  .hero-media {
    position: relative;
    order: 1;
    width: 100%;
    height: clamp(220px, 64vw, 300px);
    min-height: 0;
    clip-path: none;
  }

  .hero-media img {
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: cover;
    object-position: center;
  }

  .hero-copy {
    order: 2;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 28px 20px 68px;
    justify-content: flex-start;
  }

  .hero-copy-content {
    min-height: 0;
  }

  .hero-copy h1 {
    max-width: none;
    margin-bottom: 5px;
    font-size: clamp(27px, 8vw, 32px);
    line-height: 1.22;
  }

  .hero-description {
    font-size: clamp(16px, 4.8vw, 18px);
    line-height: 1.45;
  }

  .hero-intro {
    margin-top: 14px;
    font-size: 12.5px;
    line-height: 1.75;
  }

  .hero-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 20px;
  }

  .button {
    min-width: 0;
    min-height: 44px;
    padding-inline: 10px;
    font-size: 12px;
  }

  .service-strip {
    position: relative;
    top: auto;
    left: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    width: calc(100% - 20px);
    max-width: none;
    height: auto;
    margin: -42px auto 0;
    transform: none;
  }

  .service-card,
  .service-card:nth-child(2) {
    display: flex;
    align-items: center;
    min-height: 96px;
    height: auto;
    padding: 12px 12px;
    gap: 9px;
    border-bottom: 0;
  }

  .service-icon {
    flex: 0 0 auto;
    width: 42px;
    height: 42px;
  }

  .service-icon svg {
    width: 21px;
    height: 21px;
  }

  .service-copy {
    flex: 1;
    gap: 4px;
  }

  .service-copy h2 {
    font-size: 14px;
  }

  .service-copy p {
    font-size: 11.5px;
    line-height: 1.5;
  }

  .home-section.category-section,
  .home-section.products-section,
  .home-section.reasons-section,
  .home-section.videos-section {
    width: calc(100% - 28px);
  }

  .category-section {
    padding-top: 38px;
    padding-bottom: 20px;
  }

  .category-grid:not(.is-scrollable) {
    flex-wrap: wrap;
  }

  .category-grid:not(.is-scrollable) .category-item,
  .category-grid.is-scrollable .category-item {
    flex: 0 0 50%;
    width: 50%;
    min-width: 50%;
  }

  .category-item {
    min-height: 96px;
    padding: 12px 8px;
    font-size: 12px;
  }

  .category-icon {
    width: 34px;
    height: 34px;
  }

  .category-icon svg {
    width: 28px;
    height: 28px;
  }

  .category-nav {
    width: 36px;
    height: 36px;
  }

  .category-nav-prev {
    left: -10px;
  }

  .category-nav-next {
    right: -10px;
  }

  .products-section {
    padding-top: 18px;
    padding-bottom: 44px;
  }

  .products-heading,
  .videos-heading {
    align-items: flex-start;
    gap: 14px;
  }

  .products-heading h2,
  .videos-heading h2 {
    font-size: 23px;
  }

  .products-heading .section-link,
  .videos-heading .section-link {
    margin-top: 4px;
    font-size: 11px;
  }

  .product-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .product-card {
    min-height: 0;
  }

  .product-image-link {
    height: clamp(210px, 68vw, 270px);
    padding: 14px;
  }

  .product-card-body {
    padding: 16px 18px 19px;
  }

  .product-card h3 {
    font-size: 16px;
  }

  .product-card p {
    min-height: 0;
    font-size: 12px;
    -webkit-line-clamp: 3;
  }

  .reasons-soft-section {
    padding-top: 42px !important;
    padding-bottom: 46px !important;
  }

  .reasons-soft-heading {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 22px;
  }

  .reasons-soft-heading h2 {
    font-size: 28px;
  }

  .reasons-soft-heading > p {
    margin-left: 0;
    font-size: 13px;
    line-height: 1.75;
  }

  .reasons-soft-panel {
    grid-template-columns: 1fr;
    border-radius: 20px;
  }

  .reason-experience-block {
    padding: 30px 24px 28px;
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-experience-number {
    font-size: 54px;
  }

  .reason-experience-divider {
    margin: 24px 0 20px;
  }

  .reason-soft-list {
    grid-template-columns: 1fr;
  }

  .reason-soft-item,
  .reason-soft-item:nth-child(2n),
  .reason-soft-item:nth-last-child(-n + 2) {
    min-height: 0;
    padding: 24px 24px 22px;
    border-right: 0;
    border-bottom: 1px solid #e0e7e5;
  }

  .reason-soft-item:last-child {
    border-bottom: 0;
  }

  .reason-soft-meta {
    margin-bottom: 18px;
  }

  .videos-section {
    padding-top: 38px;
    padding-bottom: 54px;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .video-card:last-child {
    width: 100%;
    margin: 0;
  }

  .video-thumb {
    aspect-ratio: 16 / 9;
  }

  .video-thumb .play-button {
    width: 50px;
    height: 50px;
  }

  .video-card h3 {
    margin-top: 10px;
    font-size: 14px;
    white-space: normal;
  }
}



/* ============================================================
   產品分類中小尺寸排版修正
   功能：桌機版不動；平板 4 欄、手機 2 欄，最後一列自動置中。
============================================================ */
@media (min-width: 641px) and (max-width: 900px) {
  .category-grid:not(.is-scrollable) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    overflow: hidden;
    padding: 10px 8px;
    background: #fff;
    border: 1px solid #e2e8ea;
    border-radius: 14px;
  }

  .category-grid:not(.is-scrollable) .category-item {
    flex: 0 0 25%;
    width: 25%;
    min-width: 25%;
    min-height: 112px;
    padding: 14px 10px;
    gap: 9px;
    border-right: 0 !important;
    border-bottom: 0 !important;
  }

  .category-grid:not(.is-scrollable) .category-icon {
    width: 38px;
    height: 38px;
  }

  .category-grid:not(.is-scrollable) .category-icon svg {
    width: 30px;
    height: 30px;
  }

  .category-grid:not(.is-scrollable) .category-name {
    overflow: visible;
    font-size: 13px;
    line-height: 1.45;
    text-overflow: clip;
    white-space: normal;
  }
}

@media (max-width: 640px) {
  .category-grid:not(.is-scrollable) {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: stretch;
    overflow: hidden;
    padding: 8px 6px;
    background: #fff;
    border: 1px solid #e2e8ea;
    border-radius: 14px;
  }

  .category-grid:not(.is-scrollable) .category-item {
    flex: 0 0 50%;
    width: 50%;
    min-width: 50%;
    min-height: 104px;
    padding: 12px 8px;
    gap: 8px;
    border-right: 0 !important;
    border-bottom: 0 !important;
  }

  .category-grid:not(.is-scrollable) .category-icon {
    width: 36px;
    height: 36px;
  }

  .category-grid:not(.is-scrollable) .category-icon svg {
    width: 28px;
    height: 28px;
  }

  .category-grid:not(.is-scrollable) .category-name {
    overflow: visible;
    font-size: 12.5px;
    line-height: 1.45;
    text-overflow: clip;
    white-space: normal;
  }
}



/* ============================================================
   手機版產品分類 Grid 修正
   功能：640px 以下改為真正 2 欄 Grid，最後單數項目跨兩欄置中。
============================================================ */
@media (max-width: 640px) {
  .category-grid:not(.is-scrollable) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    padding: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid #e2e8ea;
    border-radius: 14px;
  }

  .category-grid:not(.is-scrollable) .category-item {
    width: auto;
    min-width: 0;
    min-height: 88px;
    padding: 10px 8px;
    gap: 6px;
    border-right: 1px solid #e7ecee !important;
    border-bottom: 1px solid #e7ecee !important;
  }

  .category-grid:not(.is-scrollable) .category-item:nth-child(2n) {
    border-right: 0 !important;
  }

  .category-grid:not(.is-scrollable) .category-item:nth-last-child(-n + 2) {
    border-bottom: 0 !important;
  }

  .category-grid:not(.is-scrollable) .category-item:last-child:nth-child(odd) {
    grid-column: 1 / -1;
    width: 50%;
    justify-self: center;
    border-right: 0 !important;
    border-bottom: 0 !important;
  }

  .category-grid:not(.is-scrollable) .category-icon {
    width: 32px;
    height: 32px;
  }

  .category-grid:not(.is-scrollable) .category-icon svg {
    width: 25px;
    height: 25px;
  }

  .category-grid:not(.is-scrollable) .category-name {
    font-size: 12px;
    line-height: 1.35;
  }
}


/* ============================================================
   首頁內容物淡入
   功能：背景直接顯示；推薦商品懸浮框先出現後，只讓文字、圖片、卡片等內容物淡入。
============================================================ */
.home-page:not(.home-content-ready) .hero-eyebrow,
.home-page:not(.home-content-ready) .hero-copy-content,
.home-page:not(.home-content-ready) .hero-intro,
.home-page:not(.home-content-ready) .hero-actions,
.home-page:not(.home-content-ready) .hero-dots,
.home-page:not(.home-content-ready) .hero-media img,
.home-page:not(.home-content-ready) .service-card,
.home-page:not(.home-content-ready) .products-heading,
.home-page:not(.home-content-ready) .reasons-soft-heading,
.home-page:not(.home-content-ready) .videos-heading { opacity: 0; }

.home-page:not(.home-content-ready) .hero-eyebrow,
.home-page:not(.home-content-ready) .hero-copy-content,
.home-page:not(.home-content-ready) .hero-intro,
.home-page:not(.home-content-ready) .hero-actions,
.home-page:not(.home-content-ready) .hero-dots,
.home-page:not(.home-content-ready) .service-card,
.home-page:not(.home-content-ready) .products-heading,
.home-page:not(.home-content-ready) .reasons-soft-heading,
.home-page:not(.home-content-ready) .videos-heading { transform: translateY(10px); }

.home-content-ready .hero-eyebrow,
.home-content-ready .hero-copy-content,
.home-content-ready .hero-intro,
.home-content-ready .hero-actions,
.home-content-ready .hero-dots,
.home-content-ready .service-card,
.home-content-ready .products-heading,
.home-content-ready .reasons-soft-heading,
.home-content-ready .videos-heading {
  opacity: 1;
  transform: translateY(0);
  transition: opacity .75s cubic-bezier(.22,1,.36,1), transform .75s cubic-bezier(.22,1,.36,1);
}

.home-content-ready .hero-media img { opacity: 1; transition: opacity .85s ease; }

.home-content-ready .category-item,
.home-content-ready .product-card,
.home-content-ready .reason-experience-block,
.home-content-ready .reason-soft-item,
.home-content-ready .video-card { animation: home-object-fade-in .68s cubic-bezier(.22,1,.36,1) backwards; }
.home-content-ready .service-card:nth-child(2),
.home-content-ready .category-item:nth-child(2),
.home-content-ready .product-card:nth-child(2),
.home-content-ready .reason-soft-item:nth-child(2),
.home-content-ready .video-card:nth-child(2) { animation-delay: .06s; }
.home-content-ready .service-card:nth-child(3),
.home-content-ready .category-item:nth-child(3),
.home-content-ready .product-card:nth-child(3),
.home-content-ready .reason-soft-item:nth-child(3),
.home-content-ready .video-card:nth-child(3) { animation-delay: .12s; }
.home-content-ready .service-card:nth-child(4),
.home-content-ready .category-item:nth-child(4),
.home-content-ready .product-card:nth-child(4),
.home-content-ready .reason-soft-item:nth-child(4) { animation-delay: .18s; }
@keyframes home-object-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  .home-page:not(.home-content-ready) .hero-eyebrow,
  .home-page:not(.home-content-ready) .hero-copy-content,
  .home-page:not(.home-content-ready) .hero-intro,
  .home-page:not(.home-content-ready) .hero-actions,
  .home-page:not(.home-content-ready) .hero-dots,
  .home-page:not(.home-content-ready) .hero-media img,
  .home-page:not(.home-content-ready) .service-card,
  .home-page:not(.home-content-ready) .products-heading,
  .home-page:not(.home-content-ready) .reasons-soft-heading,
  .home-page:not(.home-content-ready) .videos-heading { transform: none; }
  .home-content-ready .hero-eyebrow,
  .home-content-ready .hero-copy-content,
  .home-content-ready .hero-intro,
  .home-content-ready .hero-actions,
  .home-content-ready .hero-dots,
  .home-content-ready .hero-media img,
  .home-content-ready .service-card,
  .home-content-ready .products-heading,
  .home-content-ready .reasons-soft-heading,
  .home-content-ready .videos-heading { transition-duration: .01ms !important; }
  .home-content-ready .category-item,
  .home-content-ready .product-card,
  .home-content-ready .reason-experience-block,
  .home-content-ready .reason-soft-item,
  .home-content-ready .video-card { animation: none !important; }
}

</style>