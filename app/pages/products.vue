<template>
  <div class="products-page">
    <section class="products-shell">
      <button
        type="button"
        class="mobile-filter-toggle"
        :class="{ active: isFilterOpen }"
        @click="isFilterOpen = !isFilterOpen"
        :aria-expanded="isFilterOpen"
      >
        <span class="mobile-filter-toggle-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
        </span>
        <span>{{ $ui(isFilterOpen ? "收合篩選" : "篩選商品") }}</span>
        <span class="mobile-filter-toggle-arrow">{{
          isFilterOpen ? "−" : "+"
        }}</span>
      </button>
      <aside class="filter-panel" :class="{ 'is-open': isFilterOpen }">
        <div class="filter-block">
          <div class="filter-heading">
            <h2>{{ $ui('產品分類') }}</h2>
            <span>−</span>
          </div>
          <label
            v-for="category in sortedCategories"
            :key="category.id"
            class="filter-option"
          >
            <input
              type="checkbox"
              :checked="selectedCategory === category.id"
              @change="selectCategory(category.id)"
            />
            <span class="custom-check"></span><span>{{ $ui(category.name) }}</span>
          </label>
        </div>
        <div class="filter-block">
          <div class="filter-heading">
            <h2>{{ $ui('庫存狀態') }}</h2>
            <span>−</span>
          </div>
          <label class="filter-option"
            ><input v-model="stockFilter" type="radio" value="all" /><span
              class="custom-radio"
            ></span
            ><span>{{ $ui('全部商品') }}</span></label
          >
          <label class="filter-option"
            ><input v-model="stockFilter" type="radio" value="inStock" /><span
              class="custom-radio"
            ></span
            ><span>{{ $ui('有庫存') }}</span></label
          >
          <label class="filter-option"
            ><input
              v-model="stockFilter"
              type="radio"
              value="outOfStock"
            /><span class="custom-radio"></span><span>{{ $ui('無庫存') }}</span></label
          >
        </div>
        <button class="clear-filter-btn" type="button" @click="resetFilters">{{ $ui('清除全部條件') }}<span>↻</span>
        </button>
      </aside>

      <main class="products-main">
        <div class="toolbar">
          <div class="search-box">
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="$ui('搜尋產品名稱或關鍵字')"
            /><span>⌕</span>
          </div>
          <div class="product-count">
            {{ $ui('共 {count} 項產品').replace('{count}', String(filteredProducts.length)) }}
          </div>
        </div>

        <div v-if="selectedCategory !== 0" class="active-filter-row">
          <button
            type="button"
            class="active-filter-chip"
            @click="selectedCategory = 0"
          >
            {{ $ui(selectedCategoryName) }} <span>×</span>
          </button>
          <button type="button" class="clear-inline" @click="resetFilters">{{ $ui('清除全部') }}</button>
        </div>

        <div v-if="loading" class="skeleton-grid" aria-label="商品載入中" aria-busy="true">
          <article v-for="index in pageSize" :key="`skeleton-${index}`" class="product-card skeleton-card">
            <div class="product-image-wrap skeleton-image"></div>
            <div class="product-card-body">
              <div class="skeleton-line skeleton-line-short"></div>
              <div class="skeleton-line skeleton-line-title"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line skeleton-line-medium"></div>
            </div>
          </article>
        </div>
        <div v-else-if="loadError" class="state-box error">{{ $ui('商品載入失敗，請稍後再試。') }}</div>
        <div v-else-if="paginatedProducts.length === 0" class="state-box">{{ $ui('沒有符合條件的商品。') }}</div>
        <div v-else class="product-grid">
          <article
            v-for="product in paginatedProducts"
            :key="product.id"
            class="product-card"
            @click="openProduct(product)"
          >
            <div class="product-image-wrap">
              <img
                :src="product.imageUrl"
                :alt="$ui(product.name)"
                class="product-image"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="product-card-body">
              <div class="product-category-row">
                <span class="product-category">{{ $ui(getCategoryName(product.categoryId)) }}</span>
                <span
                  class="stock-badge"
                  :class="{ empty: product.stock === 0 }"
                >{{ $ui(product.stock === 0 ? "無庫存" : "有庫存") }}</span>
              </div>
              <h3>{{ $ui(product.name) }}</h3>
              <p>{{ truncate($ui(product.description), 56) }}</p>
              <div class="product-card-footer">
                <span class="detail-link">{{ $ui('查看詳情') }}</span>
                <div class="product-card-actions">
                  <!-- 洽詢客服類別：不顯示假價格，也不允許加入購物車。 -->
                  <template v-if="isInquiryProduct(product)">
                    <button
                      type="button"
                      class="inquiry-card-btn"
                      @click.stop="openInquiryModal(product)"
                    >
                      {{ $ui('洽詢客服') }}
                    </button>
                  </template>
                  <template v-else>
                    <span class="product-price">{{ formatPrice(product.price) }}</span>
                    <button
                      type="button"
                      class="quick-cart-btn"
                      :disabled="product.stock === 0 || addingProductIds.has(product.id)"
                      @click.stop="addToCart(product)"
                      :aria-label="$ui('加入購物車')"
                    >
                      ＋
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </article>
        </div>

        <nav v-if="totalPages > 1" class="pagination">
          <button
            type="button"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            ‹
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            ›
          </button>
        </nav>
      </main>
    </section>

    <!-- 商品相關 Modal：Teleport 到 body，確保層級與首頁推薦商品一致，完整覆蓋 Header。 -->
    <Teleport to="body">
      <div v-if="selectedProduct || inquiryProduct" class="products-page product-modal-teleport-root">
        <div
          v-if="selectedProduct"
          class="product-modal"
    >
      <div class="product-modal-panel product-modal-premium">
        <button
          class="modal-close modal-close-premium"
          type="button"
          @click="selectedProduct = null"
          :aria-label="$ui('關閉商品資訊')"
        >
          ×
        </button>

        <div class="modal-image-area modal-image-premium">
          <div class="modal-image-card">
            <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" />
          </div>
        </div>

        <div class="modal-copy modal-copy-premium">
          <div class="modal-heading-block">
            <div class="modal-meta-row">
              <span class="modal-category-label">{{ $ui(getCategoryName(selectedProduct.categoryId)) }}</span>
              <!-- 功能：庫存狀態與商品分類同一列，右側顯示庫存標籤。 -->
              <span
                class="modal-stock-pill"
                :class="{ empty: selectedProduct.stock === 0 }"
              >
                <span class="modal-stock-dot"></span>
                {{ $ui(selectedProduct.stock === 0 ? "目前無庫存" : "有庫存") }}
              </span>
            </div>
            <h2>{{ $ui(selectedProduct.name) }}</h2>
            <p
              :class="{ 'modal-description-scrollable': shouldScrollModalDescription }"
            >{{ $ui(selectedProduct.description) }}</p>
          </div>

          <template v-if="isInquiryProduct(selectedProduct)">
            <!-- 功能：洽詢客服商品不顯示價格/採購資訊區塊，只保留最底部客服按鈕。 -->
            <div class="modal-action-group inquiry-action-group">
              <button
                type="button"
                class="modal-cart-btn modal-cart-primary inquiry-primary-btn"
                @click="openInquiryModal(selectedProduct)"
              >
                {{ $ui('洽詢客服') }}
              </button>
            </div>
          </template>
          <template v-else>
            <div class="modal-purchase-panel">
              <div class="modal-price-block">
                <span class="modal-price-label">{{ $ui('商品價格') }}</span>
                <strong>{{ formatPrice(selectedProduct.price) }}</strong>
              </div>
            </div>

            <div class="modal-action-group">
              <button
                type="button"
                class="modal-cart-btn modal-cart-primary"
                :disabled="selectedProduct.stock === 0 || addingProductIds.has(selectedProduct.id)"
                @click="addToCart(selectedProduct)"
              >
                <span class="modal-cart-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 4h2l2.1 9.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7" />
                    <circle cx="10" cy="19" r="1.4" />
                    <circle cx="17" cy="19" r="1.4" />
                  </svg>
                </span>
                {{ $ui(selectedProduct.stock === 0 ? "目前無庫存" : "加入購物車") }}
              </button>
              <button type="button" class="modal-cart-secondary" @click="goToCart">{{ $ui('查看購物車') }}</button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 功能：商品專區與首頁共用同一個洽詢客服框，避免兩份聯絡資訊日後不同步。 -->
    <InquiryContactModal
      :is-visible="Boolean(inquiryProduct)"
      :product-name="inquiryProduct?.name ?? ''"
      @close="closeInquiryModal"
    />
      </div>
    </Teleport>

    <button
      type="button"
      class="floating-cart-btn"
      :class="{ 'cart-animation': isCartAnimating }"
      :style="floatingCartStyle"
      @click="goToCart"
      :aria-label="$ui('前往購物車')"
    >
      <span class="floating-cart-icon-wrap" aria-hidden="true"
        ><svg viewBox="0 0 24 24">
          <path
            d="M3 4h2l2.1 9.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7"
          />
          <circle cx="10" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" /></svg></span
      ><span class="floating-cart-copy"
        ><strong>{{ $ui('購物車') }}</strong
        ><small>{{ cartItemCount > 0 ? $ui('已選商品數').replace('{count}', String(cartItemCount)) : $ui('查看已選商品') }}</small></span
      >
      <span v-if="cartItemCount > 0" class="cart-badge">{{
        cartItemCount
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useApi } from "~/composables/utils/api";
import Swal from "sweetalert2";
interface ApiCategory {
  Id: number;
  Name: string;
  Sequence: number;
}
interface CategoryItem {
  id: number;
  name: string;
  sequence: number;
}
interface ApiProduct {
  Id: number;
  Name: string;
  Description?: string;
  Price?: number;
  ImageUrl?: string;
  CategoryId: number;
  Stock: number;
  Sequence: number;
  Meter?: boolean;
  IsActive?: boolean;
}
interface ProductItem {
  id: number;
  name: string;
  description: string;
  price?: number;
  imageUrl: string;
  categoryId: number;
  stock: number;
  sequence: number;
  meter: boolean;
  isActive: boolean;
}
interface CatalogResponse {
  categories: ApiCategory[];
  products: ApiProduct[];
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

const api = useApi();
const { formatCurrency } = useCurrency();
const route = useRoute();
const router = useRouter();
// 功能：商品詳情依目前介面語系決定長描述是否使用獨立捲動區。
const { locale } = useI18n();
const shouldScrollModalDescription = computed(
  () => !["zh-TW", "zh-CN"].includes(locale.value),
);
// 功能：改由 Nuxt 本機 API 取得商品目錄；Server 端會快取 60 秒，避免每次都直接等待外部 API。
const { data: catalogData, pending: loading, error: catalogError } = await useAsyncData<CatalogResponse>(
  "public-product-catalog",
  () => $fetch<CatalogResponse>("/api/catalog"),
  {
    lazy: true,
    default: () => ({ categories: [], products: [] }),
  },
);

const loadError = computed(() => Boolean(catalogError.value));

// 功能：API 原始 DTO 轉成前端使用格式；資料更新時 computed 會自動同步。
const categories = computed<CategoryItem[]>(() =>
  (catalogData.value?.categories ?? []).map((x) => ({
    id: x.Id,
    name: x.Name,
    sequence: x.Sequence,
  })),
);

const products = computed<ProductItem[]>(() =>
  (catalogData.value?.products ?? []).map((x) => ({
    id: x.Id,
    name: x.Name,
    description: x.Description ?? "",
    price: x.Price,
    imageUrl: x.ImageUrl || "",
    categoryId: x.CategoryId,
    stock: x.Stock ?? 0,
    sequence: x.Sequence ?? 999,
    meter: Boolean(x.Meter),
    isActive: x.IsActive !== false,
  })),
);
const selectedCategory = ref(0);
const searchKeyword = ref("");
const stockFilter = ref<"all" | "inStock" | "outOfStock">("all");
const sortBy = ref("sequence");
const currentPage = ref(1);
const pageSize = 9;
const selectedProduct = ref<ProductItem | null>(null);
// 洽詢客服專用 Modal 狀態，不影響一般商品詳情或購物車。
const inquiryProduct = ref<ProductItem | null>(null);
// 功能：記住開啟 Modal 前的頁面位置，關閉後回到原本位置。
const modalScrollY = ref(0);
const cartItems = ref<CartItem[]>([]);
const cartItemCount = ref(0);
const isCartAnimating = ref(false);

// 功能：浮動購物車平常固定右下角；Footer 進入 viewport 時會自動往上避讓。
const floatingCartBottom = ref(28);
const floatingCartStyle = computed<Record<string, string>>(() => ({
  "--floating-cart-bottom": `${floatingCartBottom.value}px`,
}));
let floatingCartRafId: number | null = null;
// 控制同一商品加入購物車時不可重複送出，避免快速連點造成競態。
const addingProductIds = ref<Set<number>>(new Set());
const isFilterOpen = ref(false);

const sortedCategories = computed(() => [
  { id: 0, name: "全部", sequence: 0 },
  // 運費是購物車費用，不是商品分類，因此不顯示在商品專區篩選器。
  ...categories.value
    .filter((category) => category.name.trim() !== "運費")
    .sort((a, b) => a.sequence - b.sequence),
]);
const activeCategory = computed(() =>
  selectedCategory.value === 0
    ? null
    : (categories.value.find((x) => x.id === selectedCategory.value) ?? null),
);

// 功能：已選分類標籤的顯示文字。
// 顯示條件改由 selectedCategory 控制，避免分類資料短暫更新時整個 active-filter-row 消失。
const selectedCategoryName = computed(() =>
  activeCategory.value?.name ?? getCategoryName(selectedCategory.value),
);
const filteredProducts = computed(() => {
  // ItemId 50 為運費，只能由購物車運費規則自動處理，不顯示在商品專區。
  let result = products.value.filter((x) => x.isActive && x.id !== 50);
  if (selectedCategory.value !== 0)
    result = result.filter((x) => x.categoryId === selectedCategory.value);
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (keyword)
    result = result.filter((x) =>
      `${x.name} ${x.description}`.toLowerCase().includes(keyword),
    );
  if (stockFilter.value === "inStock")
    result = result.filter((x) => x.stock > 0);
  else if (stockFilter.value === "outOfStock")
    result = result.filter((x) => x.stock === 0);
  const sorted = [...result];
  if (sortBy.value === "nameAsc")
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy.value === "nameDesc")
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  else if (sortBy.value === "priceAsc")
    sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  else if (sortBy.value === "priceDesc")
    sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  else sorted.sort((a, b) => a.sequence - b.sequence);
  return sorted;
});
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / pageSize)),
);
const paginatedProducts = computed(() =>
  filteredProducts.value.slice(
    (currentPage.value - 1) * pageSize,
    currentPage.value * pageSize,
  ),
);
const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});
watch(
  [selectedCategory, searchKeyword, stockFilter, sortBy],
  () => (currentPage.value = 1),
);
watch(totalPages, (v) => {
  if (currentPage.value > v) currentPage.value = v;
});
function selectCategory(id: number) {
  selectedCategory.value = selectedCategory.value === id ? 0 : id;
}
function resetFilters() {
  selectedCategory.value = 0;
  searchKeyword.value = "";
  stockFilter.value = "all";
  sortBy.value = "sequence";
  currentPage.value = 1;
}

// 功能：切換商品分頁後回到頁面最上方，避免使用者停留在上一頁底部。
async function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;

  currentPage.value = page;
  await nextTick();

  if (import.meta.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
function getCategoryName(id: number) {
  return categories.value.find((x) => x.id === id)?.name ?? "其他產品";
}
function truncate(text: string, len: number) {
  if (!text) return "暫無產品說明";
  return text.length > len ? `${text.slice(0, len)}...` : text;
}
function formatPrice(price?: number) {
  return typeof price === "number" ? formatCurrency(price) : "請洽客服";
}
function openProduct(product: ProductItem) {
  selectedProduct.value = product;
}

// 功能：只以「洽詢客服」類別判斷，不使用 99999999 這類價格魔術數字。
function isInquiryProduct(product: ProductItem) {
  return getCategoryName(product.categoryId).trim() === "洽詢客服";
}

function openInquiryModal(product: ProductItem) {
  inquiryProduct.value = product;
}

function closeInquiryModal() {
  inquiryProduct.value = null;
}

// 功能：只要商品詳情或洽詢 Modal 任一開啟，就鎖住背景頁面，禁止上下捲動。
const isAnyProductModalOpen = computed(
  () => Boolean(selectedProduct.value || inquiryProduct.value),
);

function lockProductPageScroll() {
  if (!import.meta.client) return;

  modalScrollY.value = window.scrollY;

  // 功能：全站原本使用 scrollbar-gutter: stable 預留右側捲軸空間；
  // Modal 開啟並移除捲軸時改成 auto，避免右邊留下白色直條。
  document.documentElement.style.scrollbarGutter = "auto";
  document.documentElement.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${modalScrollY.value}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
}

function unlockProductPageScroll() {
  if (!import.meta.client) return;

  // 功能：清除 inline 設定，讓 app.vue 的 scrollbar-gutter: stable 重新生效。
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

watch(isAnyProductModalOpen, (isOpen, wasOpen) => {
  // 功能：由關閉 -> 開啟時才鎖一次；商品詳情上再開洽詢視窗時不重設捲動位置。
  if (isOpen && !wasOpen) {
    lockProductPageScroll();
    return;
  }

  // 功能：兩種 Modal 都關閉後才恢復背景捲動。
  if (!isOpen && wasOpen) {
    unlockProductPageScroll();
  }
});

function updateCartItemCountFromServer(cart: any) {
  // 運費 ItemId 50 不屬於使用者選購商品，因此不計入購物車件數。
  const details = Array.isArray(cart?.CartDetails) ? cart.CartDetails : [];
  cartItemCount.value = details
    .filter((item: any) => item.ItemId !== 50)
    .reduce((sum: number, item: any) => sum + Number(item.Quantity || 0), 0);
}

function updateCartItemCount() {
  cartItemCount.value = cartItems.value.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
}

function saveCartToLocalStorage() {
  if (!import.meta.client) return;
  localStorage.setItem("cart", JSON.stringify(cartItems.value));
}

function loadCartFromLocalStorage() {
  if (!import.meta.client) return;
  const savedCart = localStorage.getItem("cart");
  if (!savedCart) return;
  try {
    cartItems.value = JSON.parse(savedCart);
    updateCartItemCount();
  } catch (error) {
    console.error("購物車數據解析錯誤", error);
    cartItems.value = [];
    cartItemCount.value = 0;
  }
}

function addToLocalCart(product: ProductItem) {
  const existing = cartItems.value.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
  }
  updateCartItemCount();
  saveCartToLocalStorage();
}

function showSuccessToast(message: string) {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

function showErrorToast(message: string) {
  Swal.fire({
    toast: true,
    position: "bottom-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
}

function playCartAnimation() {
  isCartAnimating.value = true;
  setTimeout(() => {
    isCartAnimating.value = false;
  }, 500);
}

async function addToCart(product: ProductItem) {
  // 防呆：洽詢客服類別不可進購物車，即使未來其他地方誤呼叫 addToCart 也會被攔下。
  if (isInquiryProduct(product)) {
    openInquiryModal(product);
    return;
  }
  if (product.stock === 0 || addingProductIds.value.has(product.id)) return;

  addingProductIds.value.add(product.id);

  try {
    // 功能：維持原本登入檢查，未登入仍顯示登入提示。
    const authRes = await api.get<{ authenticated: boolean }>("/auth/me");
    if (!authRes.data.authenticated) {
      await Swal.fire({
        title: "請先登入",
        text: "登入後才能加入購物車",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "前往登入",
        cancelButtonText: "取消",
        confirmButtonColor: "#8b347f",
      }).then((result) => {
        if (result.isConfirmed) router.push("/login");
      });
      return;
    }

    // 功能：/cart/add 成功即代表商品已真正加入購物車。
    await api.post("/cart/add", { itemId: product.id, quantity: 1 });

    // 功能：先提供立即 UI 回饋，不讓後續 badge 同步失敗誤判為加入失敗。
    playCartAnimation();
    selectedProduct.value = null;

    // 功能：購物車數量刷新獨立容錯。若只是在刷新 badge 時失敗，
    // 商品仍已成功加入，因此以本地 +1 顯示，不跳「加入失敗」。
    try {
      const cartRes = await api.get<{ TotalQuantity: number }>("/cart");
      updateCartItemCountFromServer(cartRes.data);
    } catch (refreshError) {
      console.warn("購物車已加入，但刷新購物車數量失敗，先使用本地數量：", refreshError);
      cartItemCount.value += 1;
    }
  } catch (error) {
    // 只有登入檢查或 /cart/add 本身失敗，才顯示加入購物車失敗。
    console.error("加入購物車失敗", error);
    showErrorToast("加入購物車失敗，請稍後再試");
  } finally {
    addingProductIds.value.delete(product.id);
  }
}

async function syncLocalCartToServer() {
  try {
    const authRes = await api.get<{ authenticated: boolean }>("/auth/me");
    if (!authRes.data.authenticated) return;
    const localCart = cartItems.value;
    if (!localCart.length) {
      const cartRes = await api.get<{ TotalQuantity: number }>("/cart");
      updateCartItemCountFromServer(cartRes.data);
      return;
    }
    for (const item of localCart) {
      await api.post("/cart/add", { itemId: item.id, quantity: item.quantity });
    }
    cartItems.value = [];
    cartItemCount.value = 0;
    if (import.meta.client) localStorage.removeItem("cart");
    const cartRes = await api.get<{ TotalQuantity: number }>("/cart");
    updateCartItemCountFromServer(cartRes.data);
    showSuccessToast("購物車已同步");
  } catch (error) {
    console.error("同步失敗", error);
    showErrorToast("同步購物車失敗");
  }
}

function goToCart() {
  router.push("/cart");
}

// 功能：Footer 尚未出現時維持右下角；Footer 進入畫面後，購物車沿著 Footer 上緣往上移。
function updateFloatingCartPosition() {
  if (!import.meta.client || floatingCartRafId !== null) return;

  floatingCartRafId = window.requestAnimationFrame(() => {
    floatingCartRafId = null;

    const footer = document.querySelector<HTMLElement>(".site-footer");
    const isMobile = window.innerWidth <= 560;
    const baseBottom = isMobile ? 14 : 28;
    const footerGap = isMobile ? 10 : 12;

    // 找不到 Footer 時採用原本固定位置，避免影響購物車操作。
    if (!footer) {
      floatingCartBottom.value = baseBottom;
      return;
    }

    const footerTop = footer.getBoundingClientRect().top;
    const footerVisibleHeight = Math.max(0, window.innerHeight - footerTop);

    // Footer 進入 viewport 幾 px，按鈕就往上增加相同距離，並保留小間距。
    floatingCartBottom.value = Math.max(
      baseBottom,
      Math.round(footerVisibleHeight + footerGap),
    );
  });
}

// 功能：若網址帶 ?id=商品編號，等商品資料到達後自動開啟該商品詳情。
watch(
  products,
  (items) => {
    const requestedId = Number(route.query.id);
    if (!requestedId || selectedProduct.value) return;

    selectedProduct.value =
      items.find((x) => x.id === requestedId && x.id !== 50) ?? null;
  },
  { immediate: true },
);

useSeoMeta({
  title: "商品專區｜祐強醫療儀器有限公司",
  description: "瀏覽祐強醫療儀器有限公司提供的醫療與寵物照護相關產品。",
});
onBeforeUnmount(() => {
  // 功能：離開商品頁時移除浮動購物車監聽，避免切換頁面後殘留事件。
  if (import.meta.client) {
    window.removeEventListener("scroll", updateFloatingCartPosition);
    window.removeEventListener("resize", updateFloatingCartPosition);

    if (floatingCartRafId !== null) {
      window.cancelAnimationFrame(floatingCartRafId);
      floatingCartRafId = null;
    }
  }

  // 功能：離開商品頁時保證解除捲動鎖定，避免影響下一個頁面。
  if (isAnyProductModalOpen.value) {
    unlockProductPageScroll();
  }
});

onMounted(async () => {
  loadCartFromLocalStorage();

  // 功能：監聽頁面捲動與視窗尺寸，讓浮動購物車遇到 Footer 時自動上移避讓。
  window.addEventListener("scroll", updateFloatingCartPosition, { passive: true });
  window.addEventListener("resize", updateFloatingCartPosition);
  await nextTick();
  updateFloatingCartPosition();

  // 功能：商品目錄已由 useAsyncData 獨立載入；登入狀態與購物車同步不再阻塞商品資料流程。
  try {
    const authRes = await api.get<{ authenticated: boolean }>("/auth/me");
    if (authRes.data.authenticated) await syncLocalCartToServer();
  } catch (error) {
    console.error("確認登入狀態失敗", error);
  }
});
</script>

<style scoped>
.products-page {
  --ink: #183147;
  --muted: #71818a;
  --purple: #8b347f;
  --line: #e4e9e8;
  min-height: 100vh;
  padding: 38px 24px 58px;
  color: var(--ink);
  background: #fbfcfb;
}
.products-shell {
  display: grid;
  grid-template-columns: 238px minmax(0, 1fr);
  gap: 28px;
  width: min(100%, 1480px);
  margin: 0 auto;
}
.filter-panel {
  display: grid;
  align-content: start;
  gap: 18px;
}
.filter-block {
  padding: 22px 18px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 8px 22px rgba(31, 61, 72, 0.035);
}
.filter-heading {
  display: flex;
  margin-bottom: 18px;
  align-items: center;
  justify-content: space-between;
}
.filter-heading h2 {
  margin: 0;
  font-size: 15px;
}
.filter-heading span {
  color: #77916e;
}
.filter-option {
  position: relative;
  display: flex;
  min-height: 34px;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #546670;
  font-size: 12px;
}
.filter-option input {
  position: absolute;
  opacity: 0;
}
.custom-check,
.custom-radio {
  display: inline-grid;
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  border: 1px solid #ccd7d8;
  place-items: center;
}
.custom-check {
  border-radius: 3px;
}
.custom-radio {
  border-radius: 50%;
}
.filter-option input:checked + .custom-check,
.filter-option input:checked + .custom-radio {
  background: var(--purple);
  border-color: var(--purple);
}
.filter-option input:checked + .custom-check::after {
  width: 7px;
  height: 4px;
  content: "";
  border-bottom: 2px solid #fff;
  border-left: 2px solid #fff;
  transform: rotate(-45deg) translateY(-1px);
}
.filter-option input:checked + .custom-radio::after {
  width: 5px;
  height: 5px;
  content: "";
  background: #fff;
  border-radius: 50%;
}
.clear-filter-btn {
  min-height: 44px;
  cursor: pointer;
  color: #5e8557;
  background: #fff;
  border: 1px solid #aac3a5;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.products-main {
  min-width: 0;
}
.toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto 170px;
  gap: 16px;
  align-items: center;
  margin-bottom: 14px;
}
.search-box {
  position: relative;
}
.search-box input,
.sort-select {
  width: 100%;
  height: 44px;
  color: #425866;
  background: #fff;
  border: 1px solid #dfe6e7;
  border-radius: 8px;
  outline: none;
}
.search-box input {
  padding: 0 42px 0 14px;
}
.search-box span {
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translateY(-50%);
}
.sort-select {
  padding: 0 12px;
}
.product-count {
  color: #62747d;
  font-size: 12px;
  white-space: nowrap;
}
.active-filter-row {
  display: flex;
  min-height: 42px;
  margin-bottom: 14px;
  align-items: center;
  gap: 10px;
}
.active-filter-chip {
  display: inline-flex;
  min-height: 30px;
  padding: 0 12px;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #425b65;
  background: #f3f6f5;
  border: 1px solid #e0e7e6;
  border-radius: 999px;
  font-size: 11px;
}
.clear-inline {
  color: #699363;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 11px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.product-card {
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e2e7e8;
  border-radius: 10px;
  transition: 0.18s ease;
}
.product-card:hover {
  box-shadow: 0 14px 34px rgba(31, 61, 72, 0.08);
  transform: translateY(-3px);
}
.product-image-wrap {
  display: grid;
  height: 220px;
  padding: 18px;
  background: linear-gradient(180deg, #fff, #fafbfb);
  place-items: center;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.product-card-body {
  padding: 16px 17px 18px;
}
.product-category {
  color: #76966d;
  font-size: 10px;
  font-weight: 800;
}
.product-card h3 {
  margin: 7px 0 8px;
  font-size: 16px;
  line-height: 1.45;
}
.product-card p {
  min-height: 42px;
  margin: 0;
  color: #6b7c85;
  font-size: 11.5px;
  line-height: 1.7;
}
.product-card-footer {
  display: flex;
  margin-top: 15px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.detail-link {
  color: #6d9765;
  font-size: 11px;
  font-weight: 800;
}
.stock-badge {
  color: #4f7d58;
  font-size: 10px;
}
.stock-badge.empty {
  color: #9b6464;
}
.pagination {
  display: flex;
  margin-top: 28px;
  justify-content: center;
  gap: 8px;
}
.pagination button {
  width: 34px;
  height: 34px;
  cursor: pointer;
  color: #586b75;
  background: #fff;
  border: 1px solid #e1e6e7;
  border-radius: 6px;
}
.pagination button.active {
  color: #fff;
  background: var(--purple);
  border-color: var(--purple);
}
.pagination button:disabled {
  opacity: 0.35;
}
.state-box {
  display: grid;
  min-height: 320px;
  color: #7a8a92;
  background: #fff;
  border: 1px solid #e4e9ea;
  border-radius: 12px;
  place-items: center;
}
.state-box.error {
  color: #a35e5e;
}

/* ============================================================
   商品 Skeleton
   功能：資料尚未回來時先顯示與商品卡相同尺寸的骨架，避免整頁只看到載入文字。
============================================================ */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.skeleton-card {
  pointer-events: none;
}

.skeleton-image,
.skeleton-line {
  position: relative;
  overflow: hidden;
  background: #edf1f1 !important;
}

.skeleton-line {
  width: 100%;
  height: 12px;
  margin-bottom: 12px;
  border-radius: 999px;
}

.skeleton-line-short {
  width: 34%;
}

.skeleton-line-title {
  width: 74%;
  height: 18px;
}

.skeleton-line-medium {
  width: 58%;
}

.skeleton-image::after,
.skeleton-line::after {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.72), transparent);
  transform: translateX(-100%);
  animation: product-skeleton-shimmer 1.25s ease-in-out infinite;
}

@keyframes product-skeleton-shimmer {
  to {
    transform: translateX(100%);
  }
}

@media (max-width: 1180px) {
  .skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-image::after,
  .skeleton-line::after {
    animation: none;
  }
}
.product-modal {
  position: fixed;
  /* 功能：Modal 必須高於全站 Header（Header z-index: 5000），讓黑色遮罩連導覽列一起覆蓋。 */
  z-index: 12000;
  inset: 0 auto 0 0;
  /* 功能：使用完整 viewport 寬高，連 scrollbar 預留區也一起遮住，不留下頂部或右側空白。 */
  width: 100vw;
  min-height: 100dvh;
  display: grid;
  padding: 24px;
  background: rgba(20, 34, 43, 0.58);
  place-items: center;
  backdrop-filter: blur(8px);
}
.product-modal-panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
  width: min(100%, 900px);
  overflow: hidden;
  background: #fff;
  border-radius: 22px;
}
.modal-close {
  position: absolute;
  z-index: 2;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e2e8e9;
  border-radius: 50%;
  font-size: 24px;
}
.modal-image-area {
  display: grid;
  min-height: 420px;
  padding: 34px;
  background: #f7f9f8;
  place-items: center;
}
.modal-image-area img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.modal-copy {
  padding: 44px 38px;
}
.modal-copy > span {
  color: #76966d;
  font-size: 11px;
  font-weight: 800;
}
.modal-copy h2 {
  margin: 8px 0 18px;
  font-size: 28px;
}
.modal-copy p {
  color: #667984;
  font-size: 13px;
  line-height: 1.85;
}
.modal-meta {
  display: flex;
  margin-top: 24px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.modal-meta strong {
  color: var(--purple);
  font-size: 18px;
}
.modal-meta span {
  color: #5e8557;
  font-size: 12px;
}
@media (max-width: 1100px) {
  .products-shell {
    grid-template-columns: 210px minmax(0, 1fr);
    gap: 20px;
  }
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .products-page {
    padding: 22px 14px 40px;
  }
  .products-shell {
    grid-template-columns: 1fr;
  }
  .filter-panel {
    display: none;
  }
  .toolbar {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .product-count {
    order: 3;
  }
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .product-image-wrap {
    height: 170px;
    padding: 12px;
  }
  .product-card-body {
    padding: 13px;
  }
  .product-card h3 {
    font-size: 14px;
  }
  .product-card p {
    min-height: 38px;
    font-size: 10.5px;
  }
  .product-modal-panel {
    grid-template-columns: 1fr;
    max-height: 92vh;
    overflow-y: auto;
  }
  .modal-image-area {
    min-height: 280px;
  }
}
@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  .product-image-wrap {
    height: 210px;
  }
}

/* ===== Products Desktop Layout Hard Override ===== */
/* 功能：鎖定商品專區排版，避免被其他頁面共用 product-* 樣式干擾。 */
.products-page {
  padding: 28px 18px 56px;
  background: #fbfcfb;
}

.products-page .products-shell {
  display: grid !important;
  grid-template-columns: 220px minmax(0, 1fr) !important;
  gap: 22px !important;
  width: min(calc(100% - 12px), 1420px) !important;
  margin: 0 auto !important;
  align-items: start;
}

.products-page .filter-panel {
  display: grid !important;
  gap: 14px !important;
  align-content: start !important;
}

.products-page .filter-block {
  padding: 18px 16px !important;
  background: #fff !important;
  border: 1px solid #e3e8e8 !important;
  border-radius: 10px !important;
  box-shadow: 0 5px 16px rgba(31, 61, 72, 0.035) !important;
}

.products-page .filter-heading {
  margin-bottom: 14px !important;
}

.products-page .filter-heading h2 {
  font-size: 14px !important;
  font-weight: 800 !important;
}

.products-page .filter-option {
  min-height: 30px !important;
  font-size: 11.5px !important;
}

.products-page .clear-filter-btn {
  min-height: 40px !important;
  font-size: 11.5px !important;
}

.products-page .products-main {
  min-width: 0 !important;
}

.products-page .toolbar {
  display: grid !important;
  grid-template-columns: minmax(300px, 1fr) 170px !important;
  gap: 14px !important;
  align-items: center !important;
  margin-bottom: 14px !important;
}

.products-page .search-box input,
.products-page .sort-select {
  height: 42px !important;
  background: #fff !important;
  border: 1px solid #dce4e5 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
}

.products-page .search-box input {
  padding: 0 40px 0 14px !important;
  font-size: 12.5px !important;
}

.products-page .product-count {
  justify-self: end !important;
  text-align: right !important;
  font-size: 11.5px !important;
}

.products-page .active-filter-row {
  min-height: 34px !important;
  margin: 0 !important;
}

.products-page .product-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 18px !important;
  align-items: stretch !important;
}

.products-page .product-card {
  position: relative !important;
  display: flex !important;
  min-width: 0 !important;
  min-height: 390px !important;
  overflow: hidden !important;
  flex-direction: column !important;
  cursor: pointer !important;
  color: #183147 !important;
  background: #fff !important;
  background-image: none !important;
  border: 1px solid #e1e7e8 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transform: none;
}

.products-page .product-card:hover {
  box-shadow: 0 12px 26px rgba(31, 61, 72, 0.075) !important;
  transform: translateY(-2px) !important;
}

.products-page .product-image-wrap {
  position: relative !important;
  inset: auto !important;
  display: flex !important;
  width: 100% !important;
  height: 220px !important;
  min-height: 220px !important;
  padding: 14px 16px !important;
  overflow: hidden !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 220px !important;
  background: #fff !important;
  background-image: none !important;
}

.products-page .product-image {
  position: static !important;
  inset: auto !important;
  display: block !important;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  margin: 0 auto !important;
  padding: 0 !important;
  object-fit: contain !important;
  object-position: center !important;
  opacity: 1 !important;
  transform: none !important;
}

.products-page .product-card-body {
  position: relative !important;
  z-index: 2 !important;
  display: flex !important;
  min-height: 168px !important;
  padding: 15px 16px 16px !important;
  flex: 1 1 auto !important;
  flex-direction: column !important;
  color: #183147 !important;
  background: #fff !important;
  opacity: 1 !important;
}

.products-page .product-category {
  display: block !important;
  margin: 0 0 6px !important;
  color: #8b2f7e!important;
  font-size: 12px !important;
  font-weight: 800 !important;
}

.products-page .product-card h3 {
  display: -webkit-box !important;
  min-height: 44px !important;
  margin: 0 0 7px !important;
  overflow: hidden !important;
  color: #183147 !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  line-height: 1.45 !important;
  text-shadow: none !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 2 !important;
  white-space: normal !important;
}

.products-page .product-category-row {
  display: flex !important;
  min-height: 22px !important;
  margin: 0 0 6px !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
}

.products-page .product-category-row .product-category {
  margin: 0 !important;
}

.products-page .product-category-row .stock-badge {
  flex: 0 0 auto !important;
  padding: 3px 8px !important;
  color: #5f8b62 !important;
  background: #f0f7ef !important;
  border-radius: 999px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
}

.products-page .product-category-row .stock-badge.empty {
  color: #a45a62 !important;
  background: #fbf0f1 !important;
}

.products-page .product-price {
  margin: 0 !important;
  color: #8f2f83 !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  line-height: 1.3 !important;
  letter-spacing: 0.01em !important;
  white-space: nowrap !important;
}

.products-page .product-card p {
  display: -webkit-box !important;
  min-height: 38px !important;
  margin: 0 !important;
  overflow: hidden !important;
  color: #6a7a84 !important;
  font-size: 11px !important;
  line-height: 1.6 !important;
  text-shadow: none !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 2 !important;
}

.products-page .product-card-footer {
  display: flex !important;
  margin-top: auto !important;
  padding-top: 14px !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 10px !important;
}

.products-page .detail-link {
  color: #6d9765 !important;
  font-size: 11px !important;
  font-weight: 800 !important;
}

.products-page .stock-badge {
  font-size: 10px !important;
}

.products-page .pagination {
  margin-top: 24px !important;
}

@media (max-width: 1180px) {
  .products-page .products-shell {
    grid-template-columns: 205px minmax(0, 1fr) !important;
    gap: 18px !important;
  }

  .products-page .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 820px) {
  .products-page {
    padding: 20px 14px 42px !important;
  }

  .products-page .products-shell {
    grid-template-columns: 1fr !important;
    width: 100% !important;
  }

  .products-page .filter-panel {
    display: none !important;
  }

  .products-page .toolbar {
    grid-template-columns: 1fr 150px !important;
  }

  .products-page .search-box {
    grid-column: 1 / -1;
  }

  .products-page .product-count {
    order: 2;
  }
}

@media (max-width: 560px) {
  .products-page .toolbar {
    grid-template-columns: 1fr !important;
  }

  .products-page .product-grid {
    grid-template-columns: 1fr !important;
  }

  .products-page .product-card {
    min-height: 0 !important;
  }

  .products-page .product-image-wrap {
    height: 210px !important;
    min-height: 210px !important;
    flex-basis: 210px !important;
  }
}

/* ===== Product Cart Controls ===== */
.products-page .product-card-actions {
  display: flex;
  align-items: center;
  gap: 9px;
}
.products-page .quick-cart-btn {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  cursor: pointer;
  color: #fff;
  background: #6d9765;
  border: 0;
  border-radius: 50%;
  font-size: 18px;
  line-height: 1;
  place-items: center;
  transition: 0.18s ease;
}
.products-page .quick-cart-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #5f8958;
}
.products-page .quick-cart-btn:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}
.products-page .modal-cart-btn {
  width: 100%;
  min-height: 46px;
  margin-top: 24px;
  cursor: pointer;
  color: #fff;
  background: #8b347f;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}
.products-page .modal-cart-btn:disabled {
  cursor: not-allowed;
  background: #b8c0c3;
}
.products-page .floating-cart-btn {
  position: fixed;
  z-index: 1200;
  right: 26px;
  bottom: 26px;
  display: grid;
  width: 58px;
  height: 58px;
  padding: 0;
  cursor: pointer;
  color: #fff;
  background: #173f53;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 14px 30px rgba(23, 63, 83, 0.22);
  place-items: center;
}
.products-page .cart-symbol {
  font-size: 22px;
  line-height: 1;
}
.products-page .cart-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  display: grid;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  color: #fff;
  background: #8b347f;
  border: 2px solid #fff;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  place-items: center;
}
.products-page .cart-animation {
  animation: products-cart-bounce 0.5s ease;
}
@keyframes products-cart-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  35% {
    transform: translateY(-10px) scale(1.05);
  }
  60% {
    transform: translateY(2px) scale(0.99);
  }
  82% {
    transform: translateY(-3px) scale(1.01);
  }
}
@media (max-width: 560px) {
  .products-page .floating-cart-btn {
    right: 16px;
    bottom: 16px;
    width: 52px;
    height: 52px;
  }
}

/* ===== Products Typography + Cart Polish ===== */
/* 功能：放大商品專區字級，並重設浮動購物車按鈕視覺；購物車邏輯完全不變。 */
.products-page .filter-heading h2 {
  font-size: 16px !important;
}
.products-page .filter-option {
  min-height: 36px !important;
  font-size: 14px !important;
}
.products-page .custom-check,
.products-page .custom-radio {
  width: 17px !important;
  height: 17px !important;
}
.products-page .clear-filter-btn {
  min-height: 44px !important;
  font-size: 13px !important;
}
.products-page .search-box input {
  font-size: 14px !important;
}
.products-page .sort-select {
  font-size: 14px !important;
}
.products-page .product-count {
  font-size: 13px !important;
}
.products-page .active-filter-chip,
.products-page .clear-inline {
  font-size: 12.5px !important;
}
.products-page .product-category {
  font-size: 12px !important;
}
.products-page .product-card h3 {
  /* 功能：商品名稱依實際行數決定高度，避免單行標題硬撐成兩行高度，造成描述文字離太遠。 */
  min-height: 0 !important;
  margin-bottom: 6px !important;
  font-size: 18px !important;
  line-height: 1.45 !important;
}
.products-page .product-card p {
  min-height: 44px !important;
  font-size: 13.5px !important;
  line-height: 1.7 !important;
}
.products-page .detail-link {
  font-size: 13px !important;
}
.products-page .stock-badge {
  font-size: 12px !important;
}
.products-page .pagination button {
  font-size: 13px !important;
}
.products-page .modal-copy > span {
  font-size: 12px !important;
}
.products-page .modal-copy h2 {
  font-size: 30px !important;
}
.products-page .modal-copy p {
  font-size: 14px !important;
}
.products-page .modal-meta strong {
  font-size: 20px !important;
}
.products-page .modal-meta span {
  font-size: 13px !important;
}
.products-page .modal-cart-btn {
  font-size: 14px !important;
}

.products-page .floating-cart-btn {
  position: fixed !important;
  z-index: 2500 !important;
  right: 28px !important;
  bottom: 28px !important;
  display: inline-flex !important;
  width: auto !important;
  min-width: 126px !important;
  height: 54px !important;
  padding: 0 20px 0 17px !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  cursor: pointer !important;
  color: #fff !important;
  background: linear-gradient(135deg, #2f8f91 0%, #236e78 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.28) !important;
  border-radius: 999px !important;
  box-shadow: 0 14px 30px rgba(28, 84, 91, 0.24) !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease !important;
}
.products-page .floating-cart-btn:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 18px 34px rgba(28, 84, 91, 0.3) !important;
  filter: brightness(1.04);
}
.products-page .cart-icon {
  display: grid !important;
  width: 25px !important;
  height: 25px !important;
  place-items: center !important;
}
.products-page .cart-icon svg {
  width: 25px !important;
  height: 25px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.8 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}
.products-page .cart-label {
  display: inline-block !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: 0.02em !important;
}
.products-page .cart-badge {
  position: absolute !important;
  top: -7px !important;
  right: -5px !important;
  display: grid !important;
  min-width: 24px !important;
  height: 24px !important;
  padding: 0 6px !important;
  color: #fff !important;
  background: #8b347f !important;
  border: 2px solid #fff !important;
  border-radius: 999px !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  place-items: center !important;
  box-shadow: 0 4px 10px rgba(87, 38, 81, 0.25) !important;
}
@media (max-width: 760px) {
  .products-page .filter-option {
    font-size: 13px !important;
  }
  .products-page .product-card h3 {
    font-size: 16px !important;
  }
  .products-page .product-card p {
    font-size: 12.5px !important;
  }
  .products-page .floating-cart-btn {
    right: 16px !important;
    bottom: 16px !important;
    min-width: 112px !important;
    height: 50px !important;
    padding-inline: 15px 18px !important;
  }
  .products-page .cart-label {
    font-size: 13px !important;
  }
}

/* ===== Product Modal Premium + Floating Cart Card ===== */
.products-page .product-modal {
  padding: clamp(18px, 3vw, 36px) !important;
  background: rgba(21, 38, 46, 0.52) !important;
  backdrop-filter: blur(10px) !important;
}
.products-page .product-modal-premium {
  display: grid !important;
  grid-template-columns: minmax(360px, 0.92fr) minmax(0, 1.08fr) !important;
  width: min(100%, 1040px) !important;
  min-height: 590px !important;
  overflow: hidden !important;
  background: #fff !important;
  border: 1px solid #e1e9ea !important;
  border-radius: 28px !important;
  box-shadow: 0 32px 80px rgba(20, 46, 56, 0.22) !important;
}
.products-page .modal-close-premium {
  top: 20px !important;
  right: 20px !important;
  width: 46px !important;
  height: 46px !important;
  color: #304854 !important;
  background: #fff !important;
  border: 1px solid #dce5e6 !important;
  box-shadow: 0 8px 20px rgba(34, 58, 68, 0.08) !important;
  font-size: 27px !important;
}
.products-page .modal-image-premium {
  display: grid !important;
  min-height: 590px !important;
  padding: 40px !important;
  background:
    radial-gradient(
      circle at 12% 12%,
      rgba(139, 52, 127, 0.08),
      transparent 30%
    ),
    radial-gradient(
      circle at 88% 90%,
      rgba(54, 145, 147, 0.08),
      transparent 32%
    ),
    #f7faf9 !important;
  place-items: center !important;
}
.products-page .modal-image-card {
  display: grid !important;
  width: 100% !important;
  max-width: 430px !important;
  height: 430px !important;
  padding: 28px !important;
  overflow: visible !important;
  background: #fff !important;
  border: 1px solid #edf1f2 !important;
  border-radius: 24px !important;
  box-shadow: 0 18px 40px rgba(29, 58, 66, 0.09) !important;
  place-items: center !important;
}
.products-page .modal-image-card img {
  display: block !important;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  margin: auto !important;
  object-fit: contain !important;
  object-position: center !important;
}
.products-page .modal-copy-premium {
  display: flex !important;
  min-width: 0 !important;
  padding: 64px 48px 44px !important;
  flex-direction: column !important;
}
.products-page .modal-heading-block {
  padding-right: 28px !important;
}
 .products-page .modal-meta-row {
  display: flex !important;
  margin: 0 0 12px !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 16px !important;
}
.products-page .modal-category-label {
  display: inline-flex !important;
  width: fit-content !important;
  margin: 0 !important;
  color: #6f9468 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.products-page .modal-copy-premium h2 {
  margin: 0 0 18px !important;
  color: #173245 !important;
  font-size: clamp(30px, 3vw, 42px) !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
}
.products-page .modal-copy-premium p {
  margin: 0 !important;
  color: #647781 !important;
  font-size: 14.5px !important;
  line-height: 1.95 !important;
}
.products-page .modal-purchase-panel {
  display: flex !important;
  margin-top: auto !important;
  padding: 24px 0 22px !important;
  align-items: flex-end !important;
  justify-content: flex-end !important;
  gap: 20px !important;
  border-top: 1px solid #e8eeee !important;
}
 .products-page .modal-price-block {
  display: flex !important;
  align-items: flex-end !important;
  flex-direction: column !important;
  gap: 7px !important;
  text-align: right !important;
}
.products-page .modal-price-label {
  color: #85949b !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.products-page .modal-price-block strong {
  color: #8b347f !important;
  font-size: 34px !important;
  font-weight: 800 !important;
  line-height: 1 !important;
}
.products-page .modal-stock-pill {
  display: inline-flex !important;
  min-height: 38px !important;
  padding: 0 15px !important;
  align-items: center !important;
  gap: 8px !important;
  color: #4d7f59 !important;
  background: #eef7f0 !important;
  border-radius: 999px !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.products-page .modal-stock-pill.empty {
  color: #986064 !important;
  background: #fff1f2 !important;
}
.products-page .modal-stock-dot {
  width: 8px !important;
  height: 8px !important;
  background: currentColor !important;
  border-radius: 50% !important;
}
.products-page .modal-action-group {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 150px !important;
  gap: 12px !important;
}
.products-page .modal-cart-primary {
  display: inline-flex !important;
  min-height: 56px !important;
  margin: 0 !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  color: #fff !important;
  background: linear-gradient(135deg, #963787, #7d296f) !important;
  border: 0 !important;
  border-radius: 16px !important;
  box-shadow: 0 14px 26px rgba(139, 52, 127, 0.22) !important;
  font-size: 14px !important;
  font-weight: 800 !important;
}
.products-page .modal-cart-icon {
  display: grid !important;
  width: 22px !important;
  height: 22px !important;
  place-items: center !important;
}
.products-page .modal-cart-icon svg {
  width: 22px !important;
  height: 22px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.8 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}
.products-page .modal-cart-secondary {
  min-height: 56px !important;
  cursor: pointer !important;
  color: #2f5962 !important;
  background: #fff !important;
  border: 1px solid #cfdddd !important;
  border-radius: 16px !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.products-page .floating-cart-btn {
  right: 28px !important;
  bottom: 28px !important;
  display: flex !important;
  width: auto !important;
  min-width: 184px !important;
  height: 72px !important;
  padding: 10px 18px 10px 11px !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 12px !important;
  color: #193540 !important;
  background: rgba(255, 255, 255, 0.97) !important;
  border: 1px solid #dfe8e9 !important;
  border-radius: 22px !important;
  box-shadow: 0 18px 42px rgba(28, 58, 67, 0.17) !important;
  backdrop-filter: blur(10px) !important;
}
.products-page .floating-cart-btn:hover {
  background: #fff !important;
  box-shadow: 0 24px 48px rgba(28, 58, 67, 0.22) !important;
  transform: translateY(-4px) !important;
  filter: none !important;
}
.products-page .floating-cart-icon-wrap {
  display: grid !important;
  width: 50px !important;
  height: 50px !important;
  flex: 0 0 auto !important;
  color: #fff !important;
  background: linear-gradient(135deg, #3a9a9b, #267b80) !important;
  border-radius: 16px !important;
  box-shadow: 0 9px 18px rgba(38, 123, 128, 0.2) !important;
  place-items: center !important;
}
.products-page .floating-cart-icon-wrap svg {
  width: 25px !important;
  height: 25px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.8 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}
.products-page .floating-cart-copy {
  display: flex !important;
  min-width: 0 !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  text-align: left !important;
}
.products-page .floating-cart-copy strong {
  color: #193540 !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
}
.products-page .floating-cart-copy small {
  margin-top: 4px !important;
  color: #76868e !important;
  font-size: 11px !important;
  font-weight: 600 !important;
}
.products-page .cart-badge {
  top: -8px !important;
  right: -7px !important;
  min-width: 27px !important;
  height: 27px !important;
  background: #8b347f !important;
  border: 3px solid #fff !important;
  font-size: 11px !important;
}
@media (max-width: 900px) {
  .products-page .product-modal-premium {
    grid-template-columns: 1fr !important;
    width: min(100%, 680px) !important;
    max-height: 92dvh !important;
    overflow-y: auto !important;
  }
  .products-page .modal-image-premium {
    min-height: 330px !important;
    padding: 28px 28px 12px !important;
  }
  .products-page .modal-image-card {
    max-width: 360px !important;
    height: 300px !important;
  }
  .products-page .modal-copy-premium {
    padding: 28px 30px 30px !important;
  }
}
@media (max-width: 560px) {
  .products-page .product-modal {
    padding: 12px !important;
  }
  .products-page .product-modal-premium {
    border-radius: 22px !important;
  }
  .products-page .modal-image-premium {
    min-height: 260px !important;
    padding: 20px 20px 10px !important;
  }
  .products-page .modal-image-card {
    max-width: 100% !important;
    height: 240px !important;
    padding: 18px !important;
    border-radius: 18px !important;
  }
  .products-page .modal-copy-premium {
    padding: 22px 20px 24px !important;
  }
  .products-page .modal-copy-premium h2 {
    font-size: 25px !important;
  }
  .products-page .modal-copy-premium p {
    font-size: 13px !important;
    line-height: 1.8 !important;
  }
  .products-page .modal-purchase-panel {
    align-items: flex-start !important;
    flex-direction: column !important;
  }
  .products-page .modal-price-block strong {
    font-size: 28px !important;
  }
  .products-page .modal-action-group {
    grid-template-columns: 1fr !important;
  }
  .products-page .floating-cart-btn {
    right: 14px !important;
    bottom: 14px !important;
    min-width: 0 !important;
    width: 62px !important;
    height: 62px !important;
    padding: 6px !important;
    border-radius: 19px !important;
  }
  .products-page .floating-cart-icon-wrap {
    width: 48px !important;
    height: 48px !important;
  }
  .products-page .floating-cart-copy {
    display: none !important;
  }
}

/* ===== Product Purple Accent Final Polish ===== */
/* 功能：統一商品操作為紫色系，並將浮動購物車 icon 改成純線條。 */
.products-page .detail-link {
  color: #8b347f !important;
}

.products-page .quick-cart-btn {
  width: 34px !important;
  height: 34px !important;
  color: #8b347f !important;
  background: #fff !important;
  border: 1px solid #d9c2d4 !important;
  box-shadow: none !important;
  font-size: 20px !important;
  font-weight: 700 !important;
}
.products-page .quick-cart-btn:hover:not(:disabled) {
  color: #742867 !important;
  background: #fbf6fa !important;
  border-color: #cda8c5 !important;
  box-shadow: none !important;
}

.products-page .modal-cart-primary {
  box-shadow: none !important;
}
.products-page .modal-cart-primary:hover {
  box-shadow: none !important;
  filter: brightness(1.03) !important;
}

.products-page .floating-cart-btn {
  padding-left: 16px !important;
}
.products-page .floating-cart-icon-wrap {
  display: grid !important;
  width: 28px !important;
  height: 28px !important;
  flex: 0 0 auto !important;
  color: #2a7d86 !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  place-items: center !important;
}
.products-page .floating-cart-icon-wrap svg {
  width: 25px !important;
  height: 25px !important;
  fill: none !important;
  stroke: currentColor !important;
  stroke-width: 1.8 !important;
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
}
@media (max-width: 560px) {
  .products-page .floating-cart-btn {
    width: 58px !important;
    height: 58px !important;
    padding: 0 !important;
    justify-content: center !important;
  }
  .products-page .floating-cart-icon-wrap {
    width: 28px !important;
    height: 28px !important;
  }
}

/* ===== Responsive Filter Panel ===== */
/* 功能：中尺寸保留側邊篩選，小尺寸改為可展開的篩選面板。 */
.products-page .mobile-filter-toggle {
  display: none;
}

@media (max-width: 1180px) and (min-width: 821px) {
  .products-page .products-shell {
    grid-template-columns: 190px minmax(0, 1fr) !important;
  }

  .products-page .filter-panel {
    display: grid !important;
  }

  .products-page .filter-block {
    padding: 16px 14px !important;
  }

  .products-page .filter-option {
    font-size: 13px !important;
  }
}

@media (max-width: 820px) {
  .products-page .products-shell {
    grid-template-columns: 1fr !important;
  }

  .products-page .mobile-filter-toggle {
    display: flex !important;
    width: 100%;
    min-height: 50px;
    padding: 0 16px;
    align-items: center;
    gap: 10px;
    color: #233f4d;
    background: #fff;
    border: 1px solid #dfe6e7;
    border-radius: 12px;
    box-shadow: 0 5px 16px rgba(31, 61, 72, 0.04);
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .products-page .mobile-filter-toggle.active {
    border-color: #d7bfd2;
    background: #fdf9fc;
  }

  .products-page .mobile-filter-toggle-icon {
    display: grid;
    width: 24px;
    height: 24px;
    color: #8b347f;
    place-items: center;
  }

  .products-page .mobile-filter-toggle-icon svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
  }

  .products-page .mobile-filter-toggle-arrow {
    margin-left: auto;
    color: #8b347f;
    font-size: 20px;
    line-height: 1;
  }

  .products-page .filter-panel {
    display: none !important;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px !important;
    padding: 2px 0 8px;
  }

  .products-page .filter-panel.is-open {
    display: grid !important;
  }

  .products-page .filter-block {
    min-width: 0;
    margin: 0 !important;
    padding: 16px !important;
  }

  .products-page .clear-filter-btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}

@media (max-width: 560px) {
  .products-page .filter-panel {
    grid-template-columns: 1fr;
  }

  .products-page .clear-filter-btn {
    grid-column: auto;
  }

  .products-page .filter-option {
    min-height: 38px !important;
    font-size: 14px !important;
  }
}

/* ============================================================
   洽詢客服商品
   功能：只服務 category = 洽詢客服，不影響一般商品購物車流程。
============================================================ */
.inquiry-card-btn {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid #c98fbe;
  border-radius: 999px;
  background: #fff7fc;
  color: #8f347f;
  cursor: pointer;
  font-weight: 800;
  transition: all .18s ease;
  font-size: 13px;
}
.inquiry-card-btn:hover {
  color: #fff;
  background: #943f86;
  border-color: #943f86;
}
.inquiry-primary-btn { justify-content: center !important; }

/* 功能：移除洽詢客服價格區塊後，仍把客服按鈕固定推到右側資訊區最底部。 */
.inquiry-action-group {
  margin-top: auto !important;
  padding-top: 24px !important;
}

.inquiry-modal {
  position: fixed;
  inset: 0 auto 0 0;
  /* 功能：洽詢視窗可能由商品 Modal 內開啟，因此層級要再高於商品 Modal。 */
  z-index: 13000;
  width: 100vw;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(20, 39, 48, .58);
  backdrop-filter: blur(8px);
}
.inquiry-modal-panel {
  position: relative;
  width: min(100%, 620px);
  padding: clamp(26px, 4vw, 42px);
  border: 1px solid #e1e8e9;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 28px 70px rgba(20, 40, 50, .24);
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
.inquiry-modal-heading { padding-right: 48px; }
.inquiry-eyebrow {
  color: #30919a;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .14em;
}
.inquiry-modal-heading h2 { margin: 8px 0 12px; color: #173247; font-size: clamp(28px, 4vw, 38px); }
.inquiry-modal-heading p { margin: 0; color: #405b68; font-size: 15px; line-height: 1.7; }
.inquiry-modal-heading small { display: block; margin-top: 10px; color: #7c8e97; font-size: 13px; line-height: 1.7; }
.inquiry-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 26px; }
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
  transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease;
}
.inquiry-contact-card:hover { border-color: #c493bb; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(82,55,78,.08); }
.inquiry-contact-icon { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border-radius: 12px; color: #943f86; background: #f7edf5; }
.inquiry-contact-icon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.inquiry-contact-card span:last-child { min-width: 0; }
.inquiry-contact-card b { display: block; font-size: 13px; }
.inquiry-contact-card small { display: block; margin-top: 4px; color: #6f818a; font-size: 11px; overflow-wrap: anywhere; }
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
.inquiry-line-btn img { width: 25px; height: 25px; object-fit: contain; }
.inquiry-social-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 20px; padding-top: 18px; border-top: 1px solid #e7ecec; color: #70838d; font-size: 12px; }
.inquiry-social-links { display: flex; gap: 10px; }
.inquiry-social-links a { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid #e0e7e8; border-radius: 50%; background: #fff; }
.inquiry-social-links img { width: 22px; height: 22px; object-fit: contain; }
@media (max-width: 640px) {
  .inquiry-modal { padding: 14px; }
  .inquiry-modal-panel { padding: 26px 18px 22px; border-radius: 18px; }
  .inquiry-modal-heading { padding-right: 44px; }
  .inquiry-contact-grid { grid-template-columns: 1fr; }
  .inquiry-social-row { align-items: flex-start; }
}


/* 桌機版：已選篩選條件與商品列表保留適當距離。 */
@media (min-width: 1181px) {
  .products-page .active-filter-row {
    margin: 0 0 20px !important;
  }
}


/* ============================================================
   商品詳情 Modal viewport 最終修正
   功能：固定覆蓋真正 viewport 並永遠置中，不受商品頁淡入或內容高度影響。
============================================================ */
.products-page .product-modal {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100dvh !important;
  min-height: 0 !important;
  padding: clamp(12px, 3vh, 28px) clamp(12px, 3vw, 28px) !important;
  overflow-y: auto !important;
  align-items: center !important;
  justify-items: center !important;
}

.products-page .product-modal-premium {
  width: min(100%, 1040px) !important;
  max-height: calc(100dvh - clamp(24px, 6vh, 56px)) !important;
  margin: auto !important;
}

@media (max-width: 900px) {
  .products-page .product-modal-premium {
    width: min(100%, 680px) !important;
    max-height: calc(100dvh - 28px) !important;
  }
}

@media (max-width: 560px) {
  .products-page .product-modal {
    padding: 10px !important;
  }

  .products-page .product-modal-premium {
    max-height: calc(100dvh - 20px) !important;
  }
}


/* ============================================================
   商品 Modal Teleport 最上層
   功能：提供 Teleport 後的樣式作用域包裝；自身不參與版面，只讓 Modal 真正位於 body 最上層。
============================================================ */
.product-modal-teleport-root {
  position: static;
  width: 0;
  height: 0;
}

.product-modal-teleport-root .product-modal {
  z-index: 12000 !important;
}

.product-modal-teleport-root .inquiry-modal {
  z-index: 13000 !important;
}


/* ============================================================
   非中文商品描述捲動區
   功能：英文、日文、韓文、越南文、泰文等長描述限制高度並可上下捲動；繁中與簡中維持原本自然高度。
============================================================ */
.products-page .modal-copy-premium p.modal-description-scrollable {
  max-height: clamp(150px, 25dvh, 260px) !important;
  padding-right: 12px !important;
  overflow-y: auto !important;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.products-page .modal-copy-premium p.modal-description-scrollable::-webkit-scrollbar {
  width: 6px;
}

.products-page .modal-copy-premium p.modal-description-scrollable::-webkit-scrollbar-thumb {
  background: #c8d2d5;
  border-radius: 999px;
}

.products-page .modal-copy-premium p.modal-description-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 900px) {
  .products-page .modal-copy-premium p.modal-description-scrollable {
    max-height: min(220px, 28dvh) !important;
  }
}


/* ============================================================
   手機商品 Modal 長文與圖片防重疊
   功能：手機/平板由整個 Modal 負責上下捲動；描述不再有第二條捲軸，圖片也不可溢出蓋住標題。
============================================================ */
@media (max-width: 900px) {
  /* 非中文長描述：手機不限制高度，交由外層 product-modal-premium 捲動。 */
  .products-page .modal-copy-premium p.modal-description-scrollable {
    max-height: none !important;
    padding-right: 0 !important;
    overflow: visible !important;
    overscroll-behavior: auto !important;
    scrollbar-gutter: auto !important;
    scrollbar-width: auto !important;
  }

  /* 圖片區與文字區必須是兩個獨立區塊，避免高比例圖片溢出到標題。 */
  .products-page .modal-image-premium {
    position: relative !important;
    z-index: 0 !important;
    width: 100% !important;
    overflow: hidden !important;
  }

  .products-page .modal-image-card {
    overflow: hidden !important;
  }

  .products-page .modal-image-card img {
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }

  .products-page .modal-copy-premium {
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    background: #fff !important;
  }

  .products-page .modal-heading-block {
    min-width: 0 !important;
  }

  .products-page .modal-copy-premium h2 {
    overflow-wrap: anywhere !important;
    word-break: normal !important;
  }
}

@media (max-width: 560px) {
  .products-page .modal-image-premium {
    min-height: 0 !important;
    padding: 18px 18px 14px !important;
  }

  .products-page .modal-image-card {
    width: 100% !important;
    height: clamp(220px, 68vw, 310px) !important;
    padding: 14px !important;
  }

  .products-page .modal-copy-premium {
    padding: 20px 18px 24px !important;
  }

  .products-page .modal-meta-row {
    margin-bottom: 14px !important;
    align-items: flex-start !important;
  }

  .products-page .modal-copy-premium h2 {
    margin-top: 0 !important;
    font-size: clamp(24px, 7vw, 30px) !important;
    line-height: 1.22 !important;
  }
}


/* ============================================================
   手機商品圖完整顯示
   功能：560px 以下不再固定圖片卡高度，讓商品圖依原始比例完整顯示；Modal 本身負責上下捲動。
============================================================ */
@media (max-width: 560px) {
  .products-page .modal-image-card {
    height: auto !important;
    min-height: 0 !important;
    aspect-ratio: auto !important;
    padding: 14px !important;
    overflow: hidden !important;
  }

  .products-page .modal-image-card img {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: none !important;
    object-fit: contain !important;
  }
}


/* ============================================================
   商品詳情標題字級微調
   功能：降低商品名稱視覺重量，保留長標題換行空間。
============================================================ */
.products-page .modal-copy-premium h2 {
  font-size: clamp(26px, 2.35vw, 34px) !important;
  line-height: 1.24 !important;
}

@media (max-width: 900px) {
  .products-page .modal-copy-premium h2 {
    font-size: clamp(24px, 5.2vw, 30px) !important;
  }
}

@media (max-width: 560px) {
  .products-page .modal-copy-premium h2 {
    font-size: clamp(22px, 6.2vw, 27px) !important;
  }
}


/* ============================================================
   商品詳情價格與庫存左對齊
   功能：分類、庫存、價格統一沿右側內容左邊界排列，避免資訊一左一右分散。
============================================================ */
.products-page .modal-meta-row {
  justify-content: space-between !important;
  flex-wrap: nowrap !important;
  gap: 12px !important;
}

.products-page .modal-meta-row .modal-category-label {
  min-width: 0 !important;
  flex: 1 1 auto !important;
}

.products-page .modal-meta-row .modal-stock-pill {
  flex: 0 0 auto !important;
}

.products-page .modal-stock-pill {
  min-height: 38px !important;
  padding: 0 15px !important;
  color: #2f7445 !important;
  background: #e6f5e9 !important;
  border: 1px solid #b9ddc2 !important;
  border-radius: 999px !important;
  box-shadow: 0 5px 14px rgba(47, 116, 69, 0.13) !important;
  font-size: 13px !important;
  font-weight: 850 !important;
  letter-spacing: 0.02em !important;
}

.products-page .modal-stock-pill.empty {
  color: #a04e59 !important;
  background: #fff0f2 !important;
  border-color: #efc7cd !important;
  box-shadow: 0 5px 14px rgba(160, 78, 89, 0.11) !important;
}

.products-page .modal-stock-pill .modal-stock-dot {
  width: 9px !important;
  height: 9px !important;
  box-shadow: 0 0 0 4px rgba(47, 116, 69, 0.12) !important;
}

.products-page .modal-stock-pill.empty .modal-stock-dot {
  box-shadow: 0 0 0 4px rgba(160, 78, 89, 0.10) !important;
}

.products-page .modal-purchase-panel {
  justify-content: flex-start !important;
  align-items: flex-start !important;
}

.products-page .modal-price-block {
  align-items: flex-start !important;
  text-align: left !important;
}

@media (max-width: 560px) {
  .products-page .modal-meta-row {
    align-items: center !important;
  }

  .products-page .modal-stock-pill {
    min-height: 34px !important;
    padding: 0 12px !important;
    font-size: 12.5px !important;
  }
}


/* ============================================================
   浮動購物車跟隨頁面捲動
   功能：不再固定於 viewport，改為定位在商品頁內容底部，頁面捲動時會一起移動。
============================================================ */
.products-page {
  position: relative !important;
}

.products-page .floating-cart-btn {
  position: absolute !important;
  right: 28px !important;
  bottom: 28px !important;
}

@media (max-width: 560px) {
  .products-page .floating-cart-btn {
    right: 14px !important;
    bottom: 14px !important;
  }
}


/* ============================================================
   浮動購物車固定於視窗
   功能：購物車按鈕固定在 viewport 右下角；不論頁面捲到哪裡都會跟著畫面顯示。
============================================================ */
.products-page .floating-cart-btn {
  position: fixed !important;
  inset: auto 28px var(--floating-cart-bottom, 28px) auto !important;
  right: 28px !important;
  bottom: var(--floating-cart-bottom, 28px) !important;
  width: auto !important;
  min-width: 184px !important;
  margin: 0 !important;
}

@media (max-width: 560px) {
  .products-page .floating-cart-btn {
    position: fixed !important;
    inset: auto 14px var(--floating-cart-bottom, 14px) auto !important;
    right: 14px !important;
    bottom: var(--floating-cart-bottom, 14px) !important;
    width: 58px !important;
    min-width: 58px !important;
    margin: 0 !important;
  }
}


/* ============================================================
   商品詳情長形圖片完整顯示
   功能：桌機 / 平板改用絕對定位的固定圖片視窗。
   這樣不再受 img 原始長寬比與 CSS Grid intrinsic size 影響；
   直式長圖會強制完整縮放在白色卡片內，不裁切、不溢出。
============================================================ */
@media (min-width: 561px) {
  .products-page .modal-image-card {
    position: relative !important;
    overflow: hidden !important;
  }

  .products-page .modal-image-card img {
    position: absolute !important;
    inset: 28px !important;
    display: block !important;
    width: calc(100% - 56px) !important;
    height: calc(100% - 56px) !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    object-fit: contain !important;
    object-position: center center !important;
  }
}

</style>