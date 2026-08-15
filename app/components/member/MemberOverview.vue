<template>
  <div class="member-dashboard">
    <!-- 推薦商品：改為大卡片，優先可讀性。 -->
    <section class="overview-section recommendation-section">
      <div class="overview-section-head readable-head">
        <div>
          <h2>{{ $ui("為您推薦") }}</h2>
          <p class="section-description">{{ $ui("商品專區") }}</p>
        </div>
        <button class="text-link" type="button" @click="goToShop">
          {{ $ui("查看更多") }}
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
      </div>

      <div
        v-if="visibleRecommendedProducts.length > 0"
        class="recommendation-carousel-shell"
      >
        <button
          v-if="visibleRecommendedProducts.length > 3"
          class="carousel-arrow carousel-arrow-prev"
          type="button"
          :aria-label="$ui('上一頁')"
          @click="scrollRecommendations(-1)"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div ref="recommendationTrack" class="recommendation-carousel-track">
          <article
            v-for="product in visibleRecommendedProducts"
            :key="product.id"
            class="recommendation-card"
          >
            <button
              class="recommendation-image"
              type="button"
              @click="GoToProduct(product)"
            >
              <img :src="product.image" :alt="$ui(product.name)" />
            </button>

            <div class="recommendation-info">
              <div class="recommendation-copy">
                <span class="product-label">{{ $ui("推薦商品") }}</span>
                <h3>{{ $ui(product.name) }}</h3>
              </div>

              <div class="recommendation-footer">
                <strong
                  class="recommendation-price"
                  :class="{ 'is-inquiry': isInquiryProduct(product) }"
                >{{
                  isInquiryProduct(product)
                    ? $ui("價格請洽詢客服")
                    : formatCurrency(product.price)
                }}</strong>
                <button
                  class="view-product-btn"
                  type="button"
                  @click="GoToProduct(product)"
                >
                  <span>{{ $ui("查看詳情") }}</span>
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </article>
        </div>

        <button
          v-if="visibleRecommendedProducts.length > 3"
          class="carousel-arrow carousel-arrow-next"
          type="button"
          :aria-label="$ui('下一頁')"
          @click="scrollRecommendations(1)"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div v-else class="overview-empty compact">
        <span class="empty-symbol"><i class="fas fa-box-open"></i></span>
        <strong>{{ $ui("目前沒有熱門產品資料。") }}</strong>
      </div>
    </section>
  </div>
</template>

<script>
import api from "@/assets/js/api"; // axios 模組
import { jwtDecode } from "jwt-decode"; // 解析 JWT 的工具

export default {
  setup() {
    const { formatCurrency } = useCurrency();
    return { formatCurrency };
  },
  data() {
    return {
      userName: "陳會員",
      memberLevel: "普通會員",
      stats: {
        orders: 0, // 之後從訂單長度自動帶入
        pendingOrders: 0,
        favorites: 0,
        unreadMessages: 0,
        points: 0,
        revenue: 0,
      },
      recentOrders: [],
      // 區域：保留完整推薦池；畫面每次只從池中隨機挑 3 筆。
      recommendationPool: [],
      recommendedProducts: [],
      // 區域：KeepAlive 初次 mount 也會觸發 activated，用旗標避免第一次重複打 API。
      hasActivatedOnce: false,
      currentPage: 1,
      itemsPerPage: 3,
    };
  },
  computed: {
    visibleRecommendedProducts() {
      return this.recommendedProducts.filter(
        (product) => !String(product.name || "").includes("運費"),
      );
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.recentOrders.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.recentOrders.length / this.itemsPerPage);
    },
  },
  mounted() {
    // 區域：第一次進入商品推薦時載入資料。
    this.refreshOverviewData();
  },
  activated() {
    // 區域：KeepAlive 第一次載入時 mounted 與 activated 都會執行；第一次略過避免重複 API。
    if (!this.hasActivatedOnce) {
      this.hasActivatedOnce = true;
      return;
    }

    // 區域：之後每次從「我的訂單 / 個人資料」切回「商品推薦」，都重新隨機選 3 筆。
    this.randomizeRecommendedProducts();
    this.fetchRecentOrders();
  },
  methods: {
    async refreshOverviewData() {
      // 區域：統一刷新商品推薦所需資料，不修改既有 API 與資料來源。
      await Promise.all([this.fetchRecentOrders(), this.fetchTopProducts()]);
    },
    async fetchTopProducts() {
      try {
        // 區域：商品與分類互不相依，同時取得可縮短等待時間。
        const [productRes, categoryRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);

        // 區域：API 商品只回傳 CategoryId，因此建立 Id -> 分類名稱對照表。
        const categoryNameMap = new Map(
          (categoryRes.data || []).map((category) => [
            Number(category.Id),
            String(category.Name || "").trim(),
          ]),
        );

        // 區域：只保留上架商品，並在隨機前先排除運費，確保最後真的能選到 3 個商品。
        this.recommendationPool = (productRes.data || [])
          .filter((item) => {
            const categoryName = categoryNameMap.get(Number(item.CategoryId)) || "";
            return (
              item.IsActive !== false &&
              Number(item.Id) !== 50 &&
              categoryName !== "運費" &&
              !String(item.Name || "").includes("運費")
            );
          })
          .map((item) => ({
            id: item.Id,
            name: item.Name,
            price: item.Price,
            categoryId: item.CategoryId,
            categoryName:
              categoryNameMap.get(Number(item.CategoryId)) ||
              String(item.Category || "").trim(),
            image:
              item.ImageUrl ||
              "https://via.placeholder.com/200x200?text=無圖片",
            isFavorite: false,
          }));

        this.randomizeRecommendedProducts();
      } catch (err) {
        console.error("❌ 載入推薦商品失敗", err);
        this.recommendationPool = [];
        this.recommendedProducts = [];
      }
    },

    randomizeRecommendedProducts() {
      // 區域：Fisher-Yates 洗牌，不會重複選到同一商品；每次切回頁面重新抽 3 筆。
      const shuffled = [...this.recommendationPool];

      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[index],
        ];
      }

      this.recommendedProducts = shuffled.slice(0, 3);

      // 區域：中小尺寸可能停在前一次橫向捲動位置，重新抽商品後回到第一張。
      this.$nextTick(() => {
        const track = this.$refs.recommendationTrack;
        if (track) track.scrollLeft = 0;
      });
    },

    isInquiryProduct(product) {
      // 區域：只有「洽詢客服」分類改顯示洽詢文字，不用 9,999,999 當作實際售價。
      return String(product?.categoryName || "").trim() === "洽詢客服";
    },
    scrollRecommendations(direction) {
      // 區域：推薦商品輪播控制；依目前可視寬度一次滑動約一頁。
      const track = this.$refs.recommendationTrack;
      if (!track) return;
      const distance = Math.max(track.clientWidth * 0.92, 280);
      track.scrollBy({ left: direction * distance, behavior: "smooth" });
    },

    backhome() {
      this.$router.push("/");
    },

    formatNumber(num) {
      // 區域：防呆處理 undefined / null
      if (num === undefined || num === null) {
        return "0";
      }

      // 區域：轉字串並加千分位
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours(),
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    viewOrderDetail(merchantTradeNo) {
      this.$router.push(`/member/orders?selected=${merchantTradeNo}`);
    },

    translateStatus(apiStatus) {
      switch (apiStatus?.toLowerCase()) {
        case "pending":
          return "待付款";
        case "paid":
          return "已完成";
        case "cancelled":
          return "已取消";
        default:
          return "處理中";
      }
    },
    showOrderDetailById(merchantTradeNo) {
      const match = this.orders.find(
        (o) => o.merchantTradeNo === merchantTradeNo,
      );

      if (match) {
        this.selectedOrder = match;
        this.showOrderDetail = true;
      }
    },
    async fetchRecentOrders() {
      try {
        // 區域：與「我的訂單」使用相同 API，HttpOnly Cookie 由瀏覽器自動帶入。
        const response = await api.get("/orders/user");
        const rawOrders = Array.isArray(response.data) ? response.data : [];

        // 區域：同步商品推薦訂單數量。
        this.stats.orders = rawOrders.length;

        // 區域：複製陣列後排序，避免直接修改 API response 原陣列。
        const recent = [...rawOrders]
          .sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate))
          .slice(0, 10);

        this.recentOrders = recent.map((order) => ({
          id: order.OrderId,
          merchantTradeNo: order.MerchantTradeNo,
          date: order.CreatedDate,
          status: this.translateStatus(order.OrderStatus),
          amount: order.TotalAmount,
          products: Array.isArray(order.Details)
            ? order.Details.map((item) => ({
                name: item.ItemName,
                price: item.UnitPrice,
                quantity: item.Quantity,
                image: item.ImageUrl || require("@/assets/image/error.webp"),
              }))
            : [],
        }));
      } catch (err) {
        console.error("❌ 取得會員訂單失敗", err.response?.data || err);
        this.stats.orders = 0;
        this.recentOrders = [];
      }
    },
    getTokenFromCookie() {
      const name = "token=";
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(";");

      for (let c of cookies) {
        if (c.trim().startsWith(name)) return c.trim().substring(name.length);
      }
      return null;
    },
    async logUserOrders() {
      try {
        const token = this.getTokenFromCookie();
        if (!token) {
          console.warn("❌ 找不到登入 Token，請先登入");
          return;
        }

        const decoded = jwtDecode(token);
        const username = decoded.username;

        console.log("👤 當前登入帳號：", username);

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await api.get(
          `https://yochungmedical.azurewebsites.net/api/orders/user/${username}`,
          { headers },
        );

        console.log("📦 該用戶訂單如下：", response.data);
      } catch (err) {
        console.error("🚫 抓取訂單失敗：", err.response?.data || err);
      }
    },
    getStatusClass(status) {
      const statusMap = {
        待付款: "pending",
        處理中: "processing",
        已出貨: "shipped",
        已完成: "completed",
        已取消: "cancelled",
      };
      return statusMap[status] || "default";
    },
    goToOrders() {
      this.$router.push("/member/orders");
    },
    goToFavorites() {
      this.$router.push("/member/favorites");
    },
    goToMessages() {
      this.$router.push("/member/messages");
    },
    goToPoints() {
      this.$router.push("/member/points");
    },
    goToShop() {
      this.$router.push("/products");
    },
    reviewOrder(orderId) {
      this.$router.push(`/member/orders/${orderId}/review`);
    },
    payOrder(orderId) {
      this.$router.push(`/member/orders/${orderId}/payment`);
    },
    // toggleFavorite(product) {
    //   product.isFavorite = !product.isFavorite;
    //   // 實際應用中這裡應調用API保存變更
    // },
    GoToProduct(product) {
      this.$router.push({
        path: "/products",
        query: { id: product.id }, // 透過 query 傳商品 id
      });
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
  },
};
</script>
<style scoped>
.member-dashboard {
  width: 100%;
  display: grid;
  gap: 26px;
  color: #173149;
}

/* 區域：會員摘要，只保留已開放功能。 */
.overview-primary {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 18px;
}

.overview-order-summary {
  min-height: 210px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 28px;
  padding: 30px 32px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e0e7e8;
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 88% 18%,
      rgba(151, 62, 139, 0.09) 0 80px,
      transparent 81px
    ),
    linear-gradient(135deg, #ffffff 0%, #fbf8fb 100%);
  box-shadow: 0 12px 34px rgba(28, 52, 66, 0.055);
}

.overview-order-summary::before {
  content: "";
  position: absolute;
  left: 0;
  top: 30px;
  bottom: 30px;
  width: 4px;
  border-radius: 0 4px 4px 0;
  background: #963b8a;
}

.summary-copy {
  position: relative;
  z-index: 1;
}
.summary-eyebrow,
.section-kicker {
  display: block;
  color: #318d96;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.14em;
}
.summary-number {
  margin: 8px 0 2px;
  color: #183147;
  font-size: clamp(50px, 5vw, 72px);
  font-weight: 760;
  line-height: 1;
  letter-spacing: -0.045em;
}
.summary-copy p {
  margin: 8px 0 0;
  color: #75858e;
  font-size: 13px;
  line-height: 1.65;
}
.summary-action {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 0 0 auto;
  padding: 0 20px;
  border: 0;
  border-radius: 12px;
  background: #963b8a;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}
.summary-action:hover {
  transform: translateY(-2px);
  background: #842f79;
  box-shadow: 0 8px 18px rgba(150, 59, 138, 0.18);
}

.overview-shortcuts {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.shortcut-card {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border: 1px solid #e0e7e8;
  border-radius: 18px;
  background: #fff;
  color: inherit;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 7px 24px rgba(28, 52, 66, 0.035);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.shortcut-card:hover {
  transform: translateY(-2px);
  border-color: #d8c1d4;
  box-shadow: 0 10px 26px rgba(28, 52, 66, 0.06);
}
.shortcut-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f7edf5;
  color: #963b8a;
  font-size: 15px;
}
.shortcut-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.shortcut-copy strong {
  color: #223c4e;
  font-size: 14px;
  font-weight: 820;
}
.shortcut-copy small {
  color: #8a9aa2;
  font-size: 11px;
}
.shortcut-arrow {
  color: #a6b2b8;
  font-size: 11px;
}

/* 區域：共用內容 Section。 */
.overview-section {
  padding: 26px;
  border: 1px solid #e0e7e8;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(28, 52, 66, 0.035);
}
.overview-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.overview-section-head h2 {
  margin: 6px 0 0;
  color: #183147;
  font-size: 20px;
  font-weight: 850;
  line-height: 1.25;
}
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #963b8a;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

/* 區域：最近訂單列表。 */
.recent-order-list {
  display: grid;
  border-top: 1px solid #edf1f2;
}
.recent-order-row {
  width: 100%;
  min-height: 68px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 150px 16px;
  align-items: center;
  gap: 20px;
  padding: 12px 4px;
  border: 0;
  border-bottom: 1px solid #edf1f2;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.18s ease;
}
.recent-order-row:hover {
  background: #fbfcfc;
}
.recent-order-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.order-code {
  overflow: hidden;
  color: #294354;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-date {
  color: #91a0a7;
  font-size: 10px;
}
.order-status-pill {
  min-width: 64px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f2f5f5;
  color: #6d8089;
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}
.order-status-pill.completed {
  background: #edf7ef;
  color: #4c875a;
}
.order-status-pill.pending {
  background: #fff7e7;
  color: #9a7423;
}
.order-status-pill.processing,
.order-status-pill.shipped {
  background: #eef6f7;
  color: #347e86;
}
.order-status-pill.cancelled {
  background: #faeeee;
  color: #a75b5b;
}
.order-amount {
  color: #173149;
  font-size: 14px;
  font-weight: 850;
  text-align: right;
}
.order-row-arrow {
  color: #a7b3b9;
  font-size: 10px;
}

/* 區域：推薦商品，不產生自己的垂直捲軸。 */
.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.recommendation-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e3e9ea;
  border-radius: 16px;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.recommendation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 26px rgba(28, 52, 66, 0.07);
}
.recommendation-image {
  width: 100%;
  aspect-ratio: 1.28 / 1;
  display: block;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-bottom: 1px solid #edf1f2;
  background: #f6f8f8;
  cursor: pointer;
}
.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.recommendation-info {
  padding: 15px 16px 16px;
}
.recommendation-info h3 {
  min-height: 40px;
  margin: 0 0 14px;
  overflow: hidden;
  color: #263f50;
  font-size: 12px;
  font-weight: 780;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.recommendation-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.recommendation-bottom strong {
  color: #963b8a;
  font-size: 14px;
  font-weight: 850;
}
.product-arrow {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid #e2cce0;
  border-radius: 50%;
  background: #fff;
  color: #963b8a;
  cursor: pointer;
  font-size: 10px;
}

/* 區域：空狀態。 */
.overview-empty {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 26px;
  border: 1px dashed #dce5e7;
  border-radius: 15px;
  background: #fbfcfc;
}
.overview-empty.compact {
  min-height: 100px;
}
.empty-symbol {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #f4eaf2;
  color: #963b8a;
}
.overview-empty strong {
  display: block;
  color: #294354;
  font-size: 13px;
  font-weight: 820;
}
.overview-empty p {
  margin: 4px 0 0;
  color: #93a0a6;
  font-size: 11px;
}
.empty-action {
  min-height: 38px;
  margin-left: auto;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: #963b8a;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
}

@media (max-width: 1000px) {
  .overview-primary {
    grid-template-columns: 1fr;
  }
  .overview-shortcuts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
  }
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .member-dashboard {
    gap: 16px;
  }
  .overview-primary {
    gap: 12px;
  }
  .overview-order-summary {
    min-height: 180px;
    align-items: flex-start;
    flex-direction: column;
    padding: 24px 22px;
  }
  .summary-action {
    width: 100%;
  }
  .overview-shortcuts {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .shortcut-card {
    padding: 15px 16px;
  }
  .overview-section {
    padding: 20px 16px;
    border-radius: 16px;
  }
  .overview-section-head {
    align-items: center;
  }
  .recent-order-row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px 14px;
    padding: 14px 2px;
  }
  .order-status-pill {
    grid-column: 1;
    justify-self: start;
  }
  .order-amount {
    grid-column: 2;
    grid-row: 1;
  }
  .order-row-arrow {
    display: none;
  }
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .recommendation-info {
    padding: 12px;
  }
  .recommendation-info h3 {
    font-size: 11px;
  }
}

@media (max-width: 440px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
  .overview-empty {
    flex-direction: column;
    text-align: center;
  }
  .empty-action {
    width: 100%;
    margin-left: 0;
  }
}

/* ===== 商品推薦下半部閱讀優化 ===== */
.readable-head {
  align-items: center;
  margin-bottom: 24px;
}
.section-description {
  margin: 7px 0 0;
  color: #81919a;
  font-size: 13px;
  line-height: 1.6;
}
.readable-head .section-kicker {
  font-size: 11px;
}
.readable-head h2 {
  font-size: 24px;
}
.text-link {
  font-size: 13px;
  gap: 9px;
}

.recent-section {
  padding: 30px 32px;
}
.recent-order-list {
  border-top: 0;
  gap: 10px;
}
.recent-order-row {
  min-height: 82px;
  grid-template-columns: 46px minmax(0, 1fr) auto 170px 18px;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid #e4eaeb;
  border-radius: 14px;
  background: #fbfcfc;
}
.recent-order-row:hover {
  background: #fff;
  border-color: #d9c2d5;
  box-shadow: 0 8px 20px rgba(34, 56, 68, 0.05);
}
.order-leading-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f6ebf4;
  color: #963b8a;
  font-size: 14px;
}
.order-code {
  font-size: 15px;
}
.order-date {
  font-size: 12px;
}
.order-status-pill {
  min-width: 76px;
  padding: 7px 12px;
  font-size: 11px;
}
.order-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  text-align: right;
}
.order-amount small {
  color: #8a9aa2;
  font-size: 10px;
  font-weight: 700;
}
.order-amount strong {
  color: #963b8a;
  font-size: 16px;
  font-weight: 850;
}
.compact-order-empty {
  min-height: 112px;
  justify-content: flex-start;
}
.compact-order-empty .empty-copy {
  min-width: 0;
}
.compact-order-empty strong {
  font-size: 15px;
}
.compact-order-empty p {
  font-size: 12px;
}

.recommendation-section {
  padding: 30px 32px 32px;
}
.recommendation-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.recommendation-card {
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}
.recommendation-image {
  aspect-ratio: 1.45 / 1;
  background: #f8fafa;
  padding: 14px;
}
.recommendation-image img {
  object-fit: contain;
  border-radius: 10px;
}
.recommendation-info {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.recommendation-copy {
  flex: 1;
}
.product-label {
  display: block;
  margin-bottom: 7px;
  color: #963b8a;
  font-size: 11px;
  font-weight: 800;
}
.recommendation-info h3 {
  min-height: 52px;
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  font-weight: 800;
  -webkit-line-clamp: 2;
}
.recommendation-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #edf1f2;
}
.recommendation-price {
  color: #963b8a;
  font-size: 18px;
  font-weight: 850;
  white-space: nowrap;
}
.view-product-btn {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid #ddc5d9;
  border-radius: 10px;
  background: #fff;
  color: #8e347f;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
}
.view-product-btn:hover {
  background: #963b8a;
  border-color: #963b8a;
  color: #fff;
}

@media (max-width: 900px) {
  .recent-section,
  .recommendation-section {
    padding: 24px;
  }
  .recent-order-row {
    grid-template-columns: 42px minmax(0, 1fr) auto;
  }
  .order-status-pill {
    grid-column: 2;
    justify-self: start;
  }
  .order-amount {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
  .order-row-arrow {
    display: none;
  }
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .readable-head {
    align-items: flex-start;
  }
  .readable-head h2 {
    font-size: 21px;
  }
  .recent-section,
  .recommendation-section {
    padding: 20px 16px;
  }
  .recent-order-row {
    grid-template-columns: 38px minmax(0, 1fr);
    padding: 14px;
  }
  .order-leading-icon {
    width: 36px;
    height: 36px;
  }
  .order-status-pill {
    grid-column: 2;
  }
  .order-amount {
    grid-column: 2;
    grid-row: auto;
    align-items: flex-start;
    margin-top: 4px;
  }
  .recommendation-grid {
    grid-template-columns: 1fr;
  }
  .recommendation-info h3 {
    min-height: 0;
    font-size: 14px;
  }
  .recommendation-footer {
    align-items: flex-end;
  }
  .recommendation-price {
    font-size: 17px;
  }
}

/* ===== 會員推薦商品：所有商品橫向輪播 ===== */
.recommendation-carousel-shell {
  position: relative;
}

.recommendation-carousel-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% - 40px) / 3);
  gap: 20px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}
.recommendation-carousel-track::-webkit-scrollbar {
  display: none;
}
.recommendation-carousel-track .recommendation-card {
  scroll-snap-align: start;
}

.carousel-arrow {
  position: absolute;
  z-index: 3;
  top: 50%;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  transform: translateY(-50%);
  border: 1px solid #dfd1dd;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  color: #8f3b86;
  box-shadow: 0 8px 22px rgba(31, 48, 59, 0.12);
  cursor: pointer;
}
.carousel-arrow:hover {
  background: #963b8a;
  border-color: #963b8a;
  color: #fff;
}
.carousel-arrow span {
  display: block;
  margin-top: -3px;
  font-size: 31px;
  line-height: 1;
}
.carousel-arrow-prev {
  left: -22px;
}
.carousel-arrow-next {
  right: -22px;
}

@media (max-width: 900px) {
  .recommendation-carousel-track {
    grid-auto-columns: calc((100% - 16px) / 2);
    gap: 16px;
  }
  .carousel-arrow {
    display: none;
  }
}

@media (max-width: 560px) {
  .recommendation-carousel-track {
    grid-auto-columns: 86%;
    gap: 14px;
  }
}


/* ============================================================
   商品推薦：流動式 RWD
   功能：推薦卡寬度依 viewport 連續伸縮；桌機可同時看到多張，
   平板 / 手機自然露出下一張卡片提示可橫向滑動，不再硬切固定欄數。
============================================================ */
.recommendation-section {
  padding: clamp(18px, 2.2vw, 32px) !important;
}

/* 功能：桌機版恢復原本一次完整顯示 3 張商品卡，不讓第 4 張露出破壞版面。 */
.recommendation-carousel-track {
  grid-auto-columns: calc((100% - 40px) / 3) !important;
  gap: 20px !important;
  scroll-padding-inline: 2px;
}

.recommendation-card {
  min-width: 0;
  border-radius: clamp(14px, 1.3vw, 18px) !important;
}

.recommendation-image {
  padding: clamp(10px, 1.2vw, 14px) !important;
}

.recommendation-info {
  padding: clamp(13px, 1.5vw, 20px) !important;
}

.recommendation-info h3 {
  min-height: 0 !important;
  font-size: clamp(13px, 1.05vw, 15px) !important;
}

.recommendation-footer {
  flex-wrap: wrap;
  gap: clamp(8px, 1vw, 12px) !important;
  margin-top: clamp(12px, 1.4vw, 18px) !important;
  padding-top: clamp(12px, 1.2vw, 16px) !important;
}

.recommendation-price {
  font-size: clamp(16px, 1.4vw, 18px) !important;
}

.view-product-btn {
  min-height: clamp(38px, 3.5vw, 40px) !important;
  padding-right: clamp(11px, 1.2vw, 15px) !important;
  padding-left: clamp(11px, 1.2vw, 15px) !important;
}

@media (max-width: 560px) {
  .recommendation-carousel-track {
    /* 手機仍採流動寬度，約顯示 1.2～1.5 張，讓使用者知道可以左右滑動。 */
    grid-auto-columns: clamp(220px, 78vw, 300px) !important;
  }

  .recommendation-section {
    padding-right: 14px !important;
    padding-left: 14px !important;
  }
}



/* ============================================================
   為您推薦：中小尺寸觸控左右滑動
   功能：允許手指水平拖曳、保留垂直頁面捲動，並用 snap 讓商品卡自然停靠。
============================================================ */
@media (max-width: 900px) {
  .recommendation-carousel-track {
    grid-auto-columns: clamp(230px, 46vw, 360px) !important;
    gap: clamp(12px, 1.6vw, 16px) !important;
  }

  .recommendation-carousel-shell {
    width: 100%;
    min-width: 0;
    overflow: visible;
  }

  .recommendation-carousel-track {
    width: 100%;
    max-width: 100%;
    overflow-x: auto !important;
    overflow-y: hidden;
    touch-action: pan-x pan-y;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-inline: contain;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    cursor: grab;
  }

  .recommendation-carousel-track:active {
    cursor: grabbing;
  }

  .recommendation-carousel-track .recommendation-card {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
}

@media (max-width: 560px) {
  .recommendation-carousel-track {
    /* 功能：保留下一張商品的一小部分，視覺上提示可以繼續左右滑。 */
    grid-auto-columns: minmax(220px, 82%) !important;
    padding-right: 12%;
  }
}



/* ============================================================
   推薦商品洽詢價格
   功能：洽詢客服分類不顯示假價格，文字可自然換行以支援多語系。
============================================================ */
.recommendation-price.is-inquiry {
  max-width: 170px;
  font-size: clamp(12px, 1.05vw, 14px) !important;
  line-height: 1.4;
  white-space: normal !important;
}

</style>
