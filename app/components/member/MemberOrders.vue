<template>
  <div class="orders-page">

    <!-- 訂單管理面板：搜尋、篩選與列表整合在同一張卡片中 -->
    <section class="orders-manager-card">
      <div class="orders-manager-head">
        <div>
          <span class="manager-eyebrow">ORDER LIST</span>
          <h3>{{ $ui('訂單記錄') }}</h3>
          <p>{{ $ui('快速搜尋、篩選並查看您的歷史訂單') }}</p>
        </div>
        <div class="manager-count">{{ totalFilteredOrders }} {{ $ui('筆訂單') }}</div>
      </div>

      <div class="order-toolbar">
        <div class="toolbar-search">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input
            type="text"
            v-model="searchQuery"
            :placeholder="$ui('搜尋訂單編號或商品名稱...')"
          />
          <button v-if="searchQuery" class="toolbar-clear-input" type="button" @click="searchQuery = ''" :aria-label="$ui('清除')">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="toolbar-filter">
          <i class="fas fa-list-check" aria-hidden="true"></i>
          <select id="status-filter" v-model="statusFilter" :aria-label="$ui('訂單狀態')">
            <option value="">{{ $ui('全部狀態') }}</option>
            <option value="處理中">{{ $ui('處理中') }}</option>
            <option value="已出貨">{{ $ui('已出貨') }}</option>
            <option value="已送達">{{ $ui('已送達') }}</option>
            <option value="已完成">{{ $ui('已完成') }}</option>
            <option value="已取消">{{ $ui('已取消') }}</option>
          </select>
        </div>

        <div class="toolbar-filter">
          <i class="fas fa-calendar-days" aria-hidden="true"></i>
          <select id="time-filter" v-model="timeFilter" :aria-label="$ui('時間範圍')">
            <option value="all">{{ $ui('全部時間') }}</option>
            <option value="7">{{ $ui('最近 7 天') }}</option>
            <option value="30">{{ $ui('最近 30 天') }}</option>
            <option value="90">{{ $ui('最近 3 個月') }}</option>
            <option value="180">{{ $ui('最近 6 個月') }}</option>
            <option value="365">{{ $ui('最近一年') }}</option>
          </select>
        </div>

        <button v-if="hasFilters" class="reset-filter-btn" type="button" @click="resetFilters">
          <i class="fas fa-rotate-left"></i>
          <span>{{ $ui('清除篩選') }}</span>
        </button>
      </div>

      <div class="orders-compact-list" v-if="filteredOrders.length > 0">
        <article class="compact-order-card" v-for="order in filteredOrders" :key="order.id">
          <div class="compact-order-main">
            <div class="order-primary-info">
              <div class="order-id-line">
                <span class="order-id-label">{{ $ui('訂單編號') }}</span>
                <strong>{{ order.merchantTradeNo }}</strong>
              </div>
              <div class="order-secondary-line">
                <span><i class="far fa-calendar"></i>{{ formatDate(order.date) }}</span>
                <span><i class="fas fa-box"></i>{{ order.items.length }} {{ $ui('項商品') }}</span>
              </div>
            </div>

            <div class="order-status-column">
              <span class="badge order-status" :class="order.orderStatus">{{ $ui(order.orderStatusText) }}</span>
              <span class="badge payment-status" :class="order.paymentStatus ? 'paid' : 'unpaid'">{{ $ui(order.paymentStatusText) }}</span>
            </div>

            <div class="order-total-column">
              <span>{{ $ui('訂單總額') }}</span>
              <strong>{{ formatCurrency(order.total) }}</strong>
            </div>

            <div class="order-row-actions">
              <button class="summary-detail-toggle" type="button" @click="toggleOrderProducts(order.id)">
                <span>{{ isOrderExpanded(order.id) ? $ui('收合商品') : $ui('商品明細') }}</span>
                <i class="fas fa-chevron-down" :class="{ rotated: isOrderExpanded(order.id) }"></i>
              </button>
              <button class="summary-view-btn" type="button" @click="viewOrderDetail(order)">
                {{ $ui('查看詳情') }}
              </button>
            </div>
          </div>

          <div v-if="isOrderExpanded(order.id)" class="compact-products-panel">
            <div class="compact-products-head">
              <span>{{ $ui('商品') }}</span>
              <span>{{ $ui('單價') }}</span>
              <span>{{ $ui('數量') }}</span>
              <span>{{ $ui('小計') }}</span>
            </div>
            <div class="compact-product-row" v-for="(item, index) in order.items" :key="index">
              <div class="compact-product-main">
                <img :src="item.image" :alt="item.name" />
                <strong>{{ $ui(item.name) }}</strong>
              </div>
              <span>{{ formatCurrency(item.price) }}</span>
              <span>× {{ item.quantity }}</span>
              <strong class="compact-subtotal">{{ formatCurrency(item.price * item.quantity) }}</strong>
            </div>

            <div class="expanded-order-actions" v-if="order.status === '已送達' || ['已完成', '已取消'].includes(order.status)">
              <button v-if="order.status === '已送達'" class="btn btn-secondary" @click="confirmReceived(order)">
                <i class="fas fa-check"></i>{{ $ui('確認收貨') }}
              </button>
              <button v-if="['已完成', '已取消'].includes(order.status)" class="btn btn-success" @click="rebuyOrder(order)">
                <i class="fas fa-redo"></i>{{ $ui('再次購買') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 空狀態 -->
    <div class="empty-state" v-if="filteredOrders.length === 0">
      <div class="empty-icon">
        <i class="fas fa-shopping-bag"></i>
      </div>
      <h3 class="empty-title">{{ $ui('暫無訂單記錄') }}</h3>
      <p class="empty-description" v-if="hasFilters">{{ $ui('沒有符合篩選條件的訂單,請嘗試調整篩選條件') }}</p>
      <p class="empty-description" v-else>{{ $ui('您還沒有任何訂單記錄') }}</p>
      <button class="btn btn-primary" @click="goToShop">
        <i class="fas fa-shopping-cart"></i>{{ $ui('立即購物') }}</button>
    </div>

    <!-- 分頁 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <template v-for="page in displayedPages" :key="page">
        <span v-if="page === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 訂單詳情彈窗 -->
    <div class="modal-overlay" v-if="showOrderDetail">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-file-invoice"></i>
            {{ $ui('訂單詳情') }} #{{ selectedOrder.merchantTradeNo }}
          </h3>
        </div>

        <div class="modal-body">
          <!-- 訂單狀態時間軸 -->
          <div class="detail-section">
            <h4 class="section-title">{{ $ui('訂單狀態') }}</h4>
            <div
              v-if="selectedOrder.orderStatusText === '已取消'"
              class="cancelled-notice"
            >
              <i class="fas fa-times-circle"></i>{{ $ui('此訂單已取消') }}</div>
            <div class="order-timeline">
              <div
                v-for="(status, index) in orderStatuses"
                :key="status"
                class="timeline-step"
                :class="{
                  completed: isStatusCompleted(
                    selectedOrder.orderStatusText,
                    status
                  ),
                  active:
                    selectedOrder.orderStatusText === status &&
                    status !== '已取消',
                }"
              >
                <div class="step-marker"></div>
                <div class="step-content">
                  <div class="step-title">{{ $ui(status) }}</div>
                  <div
                    class="step-time"
                    v-if="getStatusDate(selectedOrder, status)"
                  >
                    {{ formatDateTime(getStatusDate(selectedOrder, status)) }}
                  </div>
                </div>
                <div
                  class="step-line"
                  v-if="index < orderStatuses.length - 1"
                ></div>
              </div>
            </div>
          </div>

          <!-- 訂購資訊 -->
          <div class="detail-section">
            <h4 class="section-title">{{ $ui('訂購資訊') }}</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">{{ $ui('訂單編號') }}</span>
                <span class="info-value">{{
                  selectedOrder.merchantTradeNo
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('下單時間') }}</span>
                <span class="info-value">{{
                  formatDateTime(selectedOrder.date)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('付款方式') }}</span>
                <span class="info-value">
                  {{ $ui(getPaymentMethodText(selectedOrder.paymentMethod)) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('付款狀態') }}</span>
                <span
                  class="info-value"
                  :class="
                    selectedOrder.paymentStatus ? 'text-success' : 'text-danger'
                  "
                >
                  {{ $ui(selectedOrder.paymentStatusText) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('配送方式') }}</span>
                <span class="info-value">{{
                  selectedOrder.shippingMethod
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('收件人') }}</span>
                <span class="info-value">{{ selectedOrder.recipient }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $ui('聯絡電話') }}</span>
                <span class="info-value">{{ selectedOrder.phone }}</span>
              </div>
              <div class="info-item wide">
                <span class="info-label">{{ $ui('收件地址') }}</span>
                <span class="info-value">{{ selectedOrder.address }}</span>
              </div>
              <div class="info-item wide" v-if="selectedOrder.note">
                <span class="info-label">{{ $ui('訂單備註') }}</span>
                <span class="info-value">{{ selectedOrder.note }}</span>
              </div>
            </div>
          </div>

          <!-- 訂購商品 -->
          <div class="detail-section">
            <h4 class="section-title">{{ $ui('訂購商品') }}</h4>
            <div class="products-list">
              <div
                class="product-row"
                v-for="(item, index) in selectedOrder.items"
                :key="index"
              >
                <div class="product-image">
                  <img :src="item.image" :alt="item.name" />
                </div>
                <div class="product-details">
                  <h5 class="product-name">{{ $ui(item.name) }}</h5>
                  <p class="product-specs" v-if="item.specs">
                    {{ $ui(item.specs) }}
                  </p>
                </div>
                <div class="product-pricing">
                  <div class="pricing-field">
                    <span class="pricing-label">{{ $ui('單價') }}</span>
                    <strong class="unit-price">{{ formatCurrency(item.price) }}</strong>
                  </div>
                  <div class="pricing-field quantity-field">
                    <span class="pricing-label">{{ $ui('數量') }}</span>
                    <strong class="quantity">× {{ item.quantity }}</strong>
                  </div>
                </div>
                <div class="product-subtotal">
                  <span class="pricing-label">{{ $ui('商品小計') }}</span>
                  <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
                </div>
              </div>
            </div>

            <div class="order-summary">
              <div class="summary-row" v-if="selectedOrder.discount > 0">
                <span class="summary-label">{{ $ui('折扣') }}</span>
                <span class="summary-value discount"
                  >-{{ formatCurrency(selectedOrder.discount) }}</span
                >
              </div>
              <div class="summary-row total">
                <span class="summary-label">{{ $ui('訂單總額') }}</span>
                <span class="summary-value"
                  >{{ formatCurrency(selectedOrder.total) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeOrderDetail">
            <i class="fas fa-times"></i>{{ $ui('關閉') }}</button>
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <div
      class="notification"
      v-if="notification.show"
      :class="notification.type"
    >
      <div class="notification-icon">
        <i
          :class="
            notification.type === 'success'
              ? 'fas fa-check-circle'
              : 'fas fa-exclamation-circle'
          "
        ></i>
      </div>
      <div class="notification-message">{{ notification.message }}</div>
      <button class="notification-close" @click="hideNotification">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import api from "@/assets/js/api"; // axios 模組
import { jwtDecode } from "jwt-decode"; // 解析 JWT 的工具
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  setup() {
    const { formatCurrency } = useCurrency();
    return { formatCurrency };
  },
  data() {
    return {
      searchQuery: "",
      statusFilter: "",
      timeFilter: "all",
      currentPage: 1,
      itemsPerPage: 5,
      expandedOrderIds: [],
      showOrderDetail: false,
      selectedOrder: {},

      // 訂單狀態列表
      orderStatuses: ["待處理", "處理中", "已出貨", "已完成"],

      // 通知
      notification: {
        show: false,
        type: "success",
        message: "",
        timer: null,
      },

      orders: [], // ✅ 將預設測試資料移除，從 API 載入
    };
  },
  mounted() {
    this.fetchUserOrders(); // ⬅ 先呼叫 API 取得訂單
    console.log("🔍 嘗試抓取登入者訂單...");
    this.fetchUserOrders().then(() => {
      const selectedId = this.$route.query.selected;
      if (selectedId) {
        this.showOrderDetailById(selectedId);
      }
    });
  },

  computed: {
    filteredOrders() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return this.applyOrderFilters(this.orders).slice(
        startIndex,
        startIndex + this.itemsPerPage
      );
    },
    totalFilteredOrders() {
      return this.applyOrderFilters(this.orders).length;
    },
    totalPages() {
      return Math.ceil(this.totalFilteredOrders / this.itemsPerPage);
    },
    displayedPages() {
      const pages = [];
      if (this.totalPages <= 5) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 顯示前後兩頁和當前頁
        const leftBound = Math.max(1, this.currentPage - 1);
        const rightBound = Math.min(this.totalPages, this.currentPage + 1);

        if (leftBound > 1) {
          pages.push(1);
          if (leftBound > 2) {
            pages.push("...");
          }
        }

        for (let i = leftBound; i <= rightBound; i++) {
          pages.push(i);
        }

        if (rightBound < this.totalPages) {
          if (rightBound < this.totalPages - 1) {
            pages.push("...");
          }
          pages.push(this.totalPages);
        }
      }
      return pages;
    },
    hasFilters() {
      return this.searchQuery || this.statusFilter || this.timeFilter !== "all";
    },
  },
  methods: {
    // 區域：控制訂單摘要中的商品明細展開／收合。
    toggleOrderProducts(orderId) {
      const index = this.expandedOrderIds.indexOf(orderId);
      if (index >= 0) {
        this.expandedOrderIds.splice(index, 1);
      } else {
        this.expandedOrderIds.push(orderId);
      }
    },
    isOrderExpanded(orderId) {
      return this.expandedOrderIds.includes(orderId);
    },
    resetFilters() {
      this.searchQuery = "";
      this.statusFilter = "";
      this.timeFilter = "all";
      this.currentPage = 1;
    },
    showOrderDetailById(merchantTradeNo) {
      // 區域：用 MerchantTradeNo 尋找訂單
      const match = this.orders.find(
        (o) => o.merchantTradeNo === merchantTradeNo
      );

      if (match) {
        this.selectedOrder = JSON.parse(JSON.stringify(match)); // 深拷貝
        this.showOrderDetail = true;
      } else {
        console.warn("❗ 找不到指定訂單 MerchantTradeNo：", merchantTradeNo);
      }
    },

    applyOrderFilters(orders) {
      let result = [...orders];

      // ===============================
      // 區域 1️⃣：關鍵字搜尋
      // ===============================
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter((order) => {
          const merchantNo = String(order.merchantTradeNo || "");
          const orderIdStr = String(order.id);

          if (
            orderIdStr.includes(query) ||
            merchantNo.toLowerCase().includes(query)
          ) {
            return true;
          }

          return order.items.some((item) =>
            item.name.toLowerCase().includes(query)
          );
        });
      }

      // ===============================
      // 區域 2️⃣：訂單狀態篩選（⭐你缺的就是這段）
      // ===============================
      if (this.statusFilter) {
        result = result.filter(
          (order) => order.orderStatusText === this.statusFilter
        );
      }

      // ===============================
      // 區域 3️⃣：時間範圍篩選
      // ===============================
      if (this.timeFilter !== "all") {
        const cutoffDate = new Date();
        cutoffDate.setDate(
          cutoffDate.getDate() - parseInt(this.timeFilter, 10)
        );

        result = result.filter((order) => {
          const orderDate = new Date(order.date);
          return !isNaN(orderDate) && orderDate >= cutoffDate;
        });
      }

      return result;
    },

    translateStatus(apiStatus) {
      switch (apiStatus?.toLowerCase()) {
        case "pending":
          return "未付款";
        case "paid":
          return "已付款";
        case "processing":
          return "處理中";
        case "shipped":
          return "已出貨";
        case "completed":
          return "已完成";
        case "cancelled":
          return "已取消";
        default:
          return "未付款"; // 預設 fallback
      }
    },

    async fetchUserOrders() {
      try {
        console.log("🔍 嘗試抓取登入者訂單（JWT only）");

        const response = await api.get("/orders/user"); // ✅ 不帶任何參數

        console.log("📦 API 回傳原始訂單：", response.data);

        const rawOrders = response.data;

        this.orders = rawOrders.map((order) => ({
          id: order.OrderId,
          merchantTradeNo: order.MerchantTradeNo, // ⭐ 新增這行
          date: order.CreatedDate,
          paymentStatus: order.PaymentStatus, // true / false
          orderStatus: order.OrderStatus.toLowerCase(), // processing / shipped / completed
          paymentStatusText: order.PaymentStatus ? "已付款" : "未付款",
          orderStatusText: this.translateOrderStatus(
            order.OrderStatus.toLowerCase()
          ),

          paymentMethod: order.PaymentMethod,
          shippingMethod: "宅配",
          recipient: order.CustomerName || "會員",
          phone: order.Phone || "",
          address: order.Address || "",
          note: "",
          discount: 0,
          total: order.Details.reduce(
            (sum, item) => sum + item.UnitPrice * item.Quantity,
            0
          ),
          tracking: "",
          statusHistory: [],
          trackingUpdates: [],
          items: order.Details.map((item) => ({
            id: item.ItemId,
            name: item.ItemName,
            specs: "",
            price: item.UnitPrice,
            quantity: item.Quantity,
            image: item.ImageUrl || "/api/placeholder/80/80",
          })),
        }));

        console.log("✅ 整理後的訂單：", this.orders);
      } catch (err) {
        console.error("❌ 獲取訂單失敗", err.response?.data || err);
        this.showNotification("error", this.ui("無法載入訂單資料，請稍後再試"));
      }
    },

    getPaymentMethodText(method) {
      const map = {
        credit: "信用卡",
        atm: "ATM 轉帳",
        cvs: "超商代碼繳費",
        linepay: "LINE Pay",
      };
      return map[method] || method;
    },
    translateOrderStatus(status) {
      switch (status) {
        case "pending":
          return "待處理";
        case "processing":
          return "處理中";
        case "shipped":
          return "已出貨";
        case "completed":
          return "已完成";
        case "cancelled":
          return "已取消";
        default:
          return "處理中";
      }
    },

    translatePaymentStatus(isPaid) {
      return isPaid ? "已付款" : "未付款";
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

    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}/${String(date.getDate()).padStart(2, "0")}`;
    },
    formatDateTime(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}/${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    calculateSubtotal(items) {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    goToShop() {
      // 導向商城頁面
      this.$router.push("/products");
    },
    viewOrderDetail(order) {
      this.selectedOrder = JSON.parse(JSON.stringify(order));
      this.showOrderDetail = true;
    },
    closeOrderDetail() {
      this.showOrderDetail = false;
    },
    // payOrder(order) {
    //   // 實際應用中應該導向到付款頁面
    //   // 這裡只是模擬處理
    //   alert(`前往支付訂單 ${order.id}`);
    // },
    // confirmReceived(order) {
    //   // 確認收貨的處理邏輯
    //   const orderIndex = this.orders.findIndex((o) => o.id === order.id);
    //   if (orderIndex !== -1) {
    //     // 更新訂單狀態
    //     this.orders[orderIndex].status = "已完成";
    //     this.orders[orderIndex].statusHistory.push({
    //       status: "已完成",
    //       date: new Date().toISOString(),
    //     });

    //     // 如果正在查看詳情，也更新選中的訂單
    //     if (this.showOrderDetail && this.selectedOrder.id === order.id) {
    //       this.selectedOrder.status = "已完成";
    //       this.selectedOrder.statusHistory.push({
    //         status: "已完成",
    //         date: new Date().toISOString(),
    //       });
    //     }

    //     this.showNotification("success", "已確認收貨，訂單完成");
    //   }
    // },
    async rebuyOrder(order) {
      const token = this.getTokenFromCookie(); // ✅ 取得登入用戶的 token
      const username = this.parseUsernameFromToken(token); // ✅ 解析帳號名稱

      if (!token || !username) return; // ✅ 防呆驗證

      try {
        let successCount = 0;

        for (const item of order.items) {
          if (!item.id) {
            console.warn("⚠️ 缺少 itemId，跳過此商品：", item); // ✅ 缺 id 不送出
            continue;
          }

          const payload = {
            itemId: item.id,
            quantity: item.quantity || 1,
            username,
          };

          console.log("🔁 再次購買送出資料：", payload); // ✅ 印出送出資料

          try {
            await api.post("/cart/add", payload); // ✅ 呼叫加入購物車 API
            console.log(`✅ 商品 ${item.name} 已加入購物車`);
            successCount++;
          } catch (err) {
            console.error(`❌ 商品 ${item.name} 加入購物車失敗`, err);
          }
        }

        if (successCount > 0) {
          // ✅ 加入成功後跳轉前提示
          await Swal.fire({
            icon: "success",
            title: this.ui("已加入購物車"),
            text: this.ui("訂單商品已成功加入購物車"),
            confirmButtonText: this.ui("前往購物車"),
          });

          this.$router.push("/cart"); // ✅ 導向購物車頁面
        } else {
          this.showErrorToast(this.ui("沒有任何商品成功加入購物車！"));
        }
      } catch (err) {
        console.error("❌ 再次購買流程失敗：", err);
        this.showErrorToast(this.ui("操作失敗，請稍後再試"));
      }
    },

    parseUsernameFromToken(token) {
      try {
        const decoded = jwtDecode(token);
        return decoded.username;
      } catch (e) {
        return null;
      }
    },

    isStatusCompleted(currentStatus, checkStatus) {
      // 區域：訂單狀態流程定義（與 orderStatuses 完全一致）
      const statusIndex = {
        待處理: 0,
        處理中: 1,
        已出貨: 2,
        已完成: 3,
        已取消: -1, // ⛔ 中斷狀態
      };

      // 區域：防呆，避免 undefined
      if (
        statusIndex[currentStatus] === undefined ||
        statusIndex[checkStatus] === undefined
      ) {
        return false;
      }

      // 區域：已取消 → 不亮任何後續進度
      if (currentStatus === "已取消") {
        return false;
      }

      // 區域：一般完成判斷
      return statusIndex[currentStatus] >= statusIndex[checkStatus];
    },

    getStatusDate(order, status) {
      // 查找指定狀態的時間
      const statusRecord = order.statusHistory.find((h) => h.status === status);
      return statusRecord ? statusRecord.date : null;
    },
    showNotification(type, message) {
      // 如果已經有通知，先清除計時器
      if (this.notification.timer) {
        clearTimeout(this.notification.timer);
      }

      // 顯示新通知
      this.notification.type = type;
      this.notification.message = message;
      this.notification.show = true;

      // 設定自動隱藏計時器
      this.notification.timer = setTimeout(() => {
        this.hideNotification();
      }, 5000);
    },
    hideNotification() {
      this.notification.show = false;
      this.notification.timer = null;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    statusFilter() {
      this.currentPage = 1;
    },
    timeFilter() {
      this.currentPage = 1;
    },
  },
};
</script>
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.orders-page {
  width: 100%;
  padding: 0;
}

/* 頁面標題 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1.25rem, 2.5vw, 2rem);
  padding-bottom: clamp(1rem, 2vw, 1.5rem);
  border-bottom: 2px solid #e2e8f0;
  gap: clamp(1rem, 2vw, 1.5rem);
  padding-top: 0.3rem;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 clamp(0.25rem, 0.5vw, 0.375rem) 0;
}

.page-subtitle {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #718096;
  margin: 0;
}

/* 篩選器區域 */
.filter-section {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  padding: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: clamp(1.25rem, 2.5vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.25rem);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: clamp(0.75rem, 1.25vw, 1rem);
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: clamp(0.875rem, 1.25vw, 1rem);
}

.search-input {
  width: 100%;
  padding: clamp(0.625rem, 1.25vw, 0.875rem) clamp(0.75rem, 1.25vw, 1rem)
    clamp(0.625rem, 1.25vw, 0.875rem) clamp(2.25rem, 3vw, 2.5rem);
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #4a5568;
  background: white;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #943f7e;
  box-shadow: 0 0 0 3px rgba(148, 63, 126, 0.1);
}

.search-input::placeholder {
  color: #a0aec0;
}

.clear-btn {
  position: absolute;
  right: clamp(0.75rem, 1.25vw, 1rem);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #4a5568;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(180px, 25vw, 220px), 1fr)
  );
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.filter-item label {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  color: #4a5568;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.form-control {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(2rem, 3vw, 2.5rem)
    clamp(0.5rem, 1vw, 0.625rem) clamp(0.625rem, 1.25vw, 0.75rem);
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  background-color: white;
  font-size:clamp(0.875rem, 1.25vw, 1.125rem);
  color: #4a5568;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right clamp(0.625rem, 1vw, 0.75rem) center;
  cursor: pointer;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #943f7e;
  box-shadow: 0 0 0 3px rgba(148, 63, 126, 0.1);
}

/* 訂單列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.25rem);
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}

.order-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.875rem, 1.75vw, 1.25rem);
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-bottom: 1px solid #e2e8f0;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  flex-wrap: wrap;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  flex: 1;
  min-width: 0;
}

.order-number {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  color: #4a5568;
}

.order-number i {
  color: #943f7e;
}

.order-number .label {
  color: #718096;
}

.order-number .value {
  font-weight: 600;
  color: #943f7e;
}

.order-time {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #718096;
}

.order-badges {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  flex-wrap: wrap;
}

.badge {
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem);
  border-radius: clamp(0.75rem, 1.25vw, 1rem);
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  font-weight: 500;
  white-space: nowrap;
}

.order-status.pending {
  background: rgba(246, 173, 85, 0.1);
  color: #dd6b20;
}

.order-status.paid {
  background: rgba(90, 103, 216, 0.1);
  color: #4c51bf;
}

.order-status.processing {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
}

.order-status.shipped {
  background: rgba(44, 82, 130, 0.1);
  color: #2c5282;
}

.order-status.delivered {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.order-status.completed {
  background: rgba(56, 161, 105, 0.1);
  color: #2f855a;
}

.order-status.cancelled {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.payment-status.paid {
  background: rgba(56, 161, 105, 0.12);
  color: #2f855a;
}

.payment-status.unpaid {
  background: rgba(229, 62, 62, 0.12);
  color: #c53030;
}

.order-body {
  padding: clamp(0.875rem, 1.75vw, 1.25rem);
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.product-item {
  display: flex;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding-bottom: clamp(0.75rem, 1.5vw, 1rem);
  border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.product-image {
  width: clamp(3.5rem, 8vw, 5rem);
  height: clamp(3.5rem, 8vw, 5rem);
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  overflow: hidden;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.product-name {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  font-weight: 500;
  color: #2d3748;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-specs {
  font-size: clamp(0.65rem, 0.9vw, 0.75rem);
  color: #718096;
  margin: 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.quantity {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  color: #718096;
}

.price {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  font-weight: 600;
  color: #2d3748;
}

.order-footer {
  padding: clamp(0.875rem, 1.75vw, 1.25rem);
  background: #fafafa;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  flex-wrap: wrap;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: clamp(1rem, 2vw, 1.5rem);
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
}

.total-row .label {
  color: #718096;
}

.total-row .value {
  color: #2d3748;
  font-weight: 500;
  min-width: clamp(5rem, 10vw, 6rem);
  text-align: right;
}

.total-row.final {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  padding-top: clamp(0.375rem, 0.75vw, 0.5rem);
  border-top: 1px dashed #cbd5e0;
}

.total-row.final .label {
  color: #2d3748;
  font-weight: 600;
}

.total-row.final .value {
  color: #943f7e;
  font-weight: 700;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
}

.value.discount {
  color: #e53e3e;
}

.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.btn {
  padding: clamp(0.4rem, 0.85vw, 0.5rem) clamp(0.625rem, 1.25vw, 0.75rem);
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  border: none;
}

.btn-primary {
  background: #943f7e;
  color: white;
}

.btn-primary:hover {
  background: #753263;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-success {
  background: #2eb01d;
  color: white;
}

.btn-success:hover {
  background: #2ba11b;
}

.btn-outline {
  background: transparent;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f7fafc;
}

/* 空狀態 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2.5rem, 5vw, 3.5rem) clamp(1rem, 2vw, 1.5rem);
  background: white;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  text-align: center;
}

.empty-icon {
  font-size: clamp(2.5rem, 5vw, 3rem);
  color: #a0aec0;
  margin-bottom: clamp(0.875rem, 1.75vw, 1.25rem);
}

.empty-title {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 clamp(0.375rem, 0.75vw, 0.5rem) 0;
}

.empty-description {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #718096;
  margin: 0 0 clamp(1.25rem, 2.5vw, 1.75rem) 0;
}

/* 分頁 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-top: clamp(1.25rem, 2.5vw, 2rem);
  flex-wrap: wrap;
}

.page-btn {
  width: clamp(2.25rem, 9vw, 2.75rem);
  height: clamp(2.25rem, 9vw, 2.75rem);
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
}

.page-btn:hover:not(:disabled) {
  border-color: #943f7e;
  color: #943f7e;
}

.page-btn.active {
  background: #943f7e;
  color: white;
  border-color: #943f7e;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-ellipsis {
  width: clamp(2rem, 4vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #a0aec0;
}

/* 訂單詳情彈窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: clamp(1rem, 2vw, 1.5rem);
}

.modal-container {
  background: white;
  width: 100%;
  max-width: clamp(600px, 80vw, 800px);
  max-height: 90vh;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.875rem, 1.75vw, 1.25rem) clamp(1rem, 2vw, 1.5rem);
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #943f7e 0%, #753263 100%);
}

.modal-title {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 600;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: clamp(1.75rem, 3vw, 2rem);
  height: clamp(1.75rem, 3vw, 2rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: clamp(1rem, 2vw, 1.5rem);
  overflow-y: auto;
  flex: 1;
}

.detail-section {
  margin-bottom: clamp(1.25rem, 2.5vw, 2rem);
  padding-bottom: clamp(1rem, 2vw, 1.25rem);
  border-bottom: 1px solid #e2e8f0;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 clamp(0.875rem, 1.75vw, 1.25rem) 0;
  padding-bottom: clamp(0.5rem, 1vw, 0.75rem);
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: clamp(3rem, 6vw, 4rem);
  height: 3px;
  background: #943f7e;
  border-radius: 2px;
}

.cancelled-notice {
  padding: clamp(0.625rem, 1.25vw, 0.875rem) clamp(0.875rem, 1.75vw, 1.25rem);
  background: rgba(229, 62, 62, 0.1);
  border-left: 3px solid #e53e3e;
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  color: #e53e3e;
  font-weight: 600;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  margin-bottom: clamp(1rem, 2vw, 1.25rem);
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
}

.order-timeline {
  display: flex;
  margin: clamp(1.25rem, 2.5vw, 1.75rem) 0;
  position: relative;
}

.timeline-step {
  flex: 1;
  text-align: center;
  padding-top: clamp(1.25rem, 2.5vw, 1.5rem);
  position: relative;
}

.step-marker {
  width: clamp(0.875rem, 1.5vw, 1rem);
  height: clamp(0.875rem, 1.5vw, 1rem);
  border-radius: 50%;
  background: #cbd5e0;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  transition: all 0.3s;
}

.step-line {
  position: absolute;
  top: clamp(0.4375rem, 0.75vw, 0.5rem);
  left: calc(50% + clamp(0.4375rem, 0.75vw, 0.5rem));
  width: calc(100% - clamp(0.875rem, 1.5vw, 1rem));
  height: 2px;
  background: #cbd5e0;
  transition: all 0.3s;
}

.timeline-step.completed .step-marker,
.timeline-step.completed .step-line {
  background: #943f7e;
}

.timeline-step.active .step-marker {
  background: #943f7e;
  width: clamp(1.125rem, 1.875vw, 1.25rem);
  height: clamp(1.125rem, 1.875vw, 1.25rem);
  top: clamp(-0.125rem, -0.1875vw, -0.125rem);
  box-shadow: 0 0 0 clamp(0.25rem, 0.5vw, 0.375rem) rgba(148, 63, 126, 0.2);
}

.step-content {
  padding-top: clamp(0.5rem, 1vw, 0.75rem);
}

.step-title {
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
  font-weight: 500;
  color: #718096;
  margin-bottom: clamp(0.25rem, 0.5vw, 0.375rem);
}

.timeline-step.completed .step-title,
.timeline-step.active .step-title {
  color: #2d3748;
  font-weight: 600;
}

.step-time {
  font-size: clamp(0.625rem, 0.875vw, 0.75rem);
  color: #a0aec0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(200px, 30vw, 250px), 1fr)
  );
  gap: clamp(0.875rem, 1.75vw, 1.25rem);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.info-item.wide {
  grid-column: 1 / -1;
}

.info-label {
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
  color: #718096;
  font-weight: 500;
}

.info-value {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #2d3748;
  font-weight: 500;
}

.info-value.text-success {
  color: #38a169;
}

.info-value.text-danger {
  color: #e53e3e;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.875rem, 1.75vw, 1.25rem);
}

.product-row {
  display: flex;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  padding: clamp(0.875rem, 1.75vw, 1.25rem);
  background: #f7fafc;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  align-items: center;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-details .product-name {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  font-weight: 500;
  color: #2d3748;
  margin: 0 0 clamp(0.25rem, 0.5vw, 0.375rem) 0;
}

.product-details .product-specs {
  font-size: clamp(0.65rem, 0.9vw, 0.75rem);
  color: #718096;
  margin: 0;
}

.product-pricing {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  min-width: clamp(5rem, 10vw, 6rem);
}

.unit-price {
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
  color: #4a5568;
}

.product-subtotal {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  font-weight: 600;
  color: #2d3748;
  min-width: clamp(5rem, 10vw, 6rem);
  text-align: right;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-top: clamp(1rem, 2vw, 1.25rem);
  padding-top: clamp(0.875rem, 1.75vw, 1.25rem);
  border-top: 2px solid #e2e8f0;
  align-items: flex-end;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: clamp(12rem, 25vw, 15rem);
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

.summary-label {
  color: #718096;
  font-weight: 500;
}

.summary-value {
  color: #2d3748;
  font-weight: 600;
  text-align: right;
}

.summary-value.discount {
  color: #e53e3e;
}

.summary-row.total {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  padding-top: clamp(0.5rem, 1vw, 0.75rem);
  border-top: 1px dashed #cbd5e0;
  margin-top: clamp(0.25rem, 0.5vw, 0.375rem);
}

.summary-row.total .summary-label {
  color: #2d3748;
  font-weight: 600;
}

.summary-row.total .summary-value {
  color: #943f7e;
  font-weight: 700;
  font-size: clamp(1rem, 1.5vw, 1.125rem);
}

.modal-footer {
  padding: clamp(0.875rem, 1.75vw, 1.25rem) clamp(1rem, 2vw, 1.5rem);
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
  display: flex;
  justify-content: flex-end;
}

/* 通知 */
.notification {
  position: fixed;
  bottom: clamp(1rem, 2vw, 1.5rem);
  right: clamp(1rem, 2vw, 1.5rem);
  display: flex;
  align-items: center;
  padding: clamp(0.625rem, 1.25vw, 0.875rem) clamp(0.875rem, 1.75vw, 1.25rem);
  background: white;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: clamp(280px, 40vw, 400px);
  animation: fadeIn 0.3s ease-out;
  z-index: 1001;
  gap: clamp(0.625rem, 1.25vw, 0.875rem);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification.success {
  border-left: 4px solid #38a169;
}

.notification.error {
  border-left: 4px solid #e53e3e;
}

.notification-icon {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  flex-shrink: 0;
}

.notification.success .notification-icon {
  color: #38a169;
}

.notification.error .notification-icon {
  color: #e53e3e;
}

.notification-message {
  flex: 1;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #2d3748;
  min-width: 0;
}

.notification-close {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  width: clamp(1.25rem, 2vw, 1.5rem);
  height: clamp(1.25rem, 2vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #718096;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .page-header {
    display: none;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    align-items: stretch;
  }

  .order-badges {
    justify-content: flex-start;
  }

  .order-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .order-actions {
    width: 100%;
    justify-content: center;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .btn.view {
    flex: none; /* ⭐ 關鍵：取消撐滿 */
    width: auto; /* 依內容寬度 */
    padding: 0.4rem 0.75rem; /* 縮短左右 */
    font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  }

  .order-timeline {
    flex-direction: column;
    margin-left: clamp(1rem, 2vw, 1.25rem);
  }

  .timeline-step {
    flex: none;
    text-align: left;
    padding-left: clamp(1.25rem, 2.5vw, 1.5rem);
    padding-top: 0;
    margin-bottom: clamp(1rem, 2vw, 1.25rem);
  }

  .timeline-step:last-child {
    margin-bottom: 0;
  }

  .step-marker {
    left: 0;
    top: clamp(0.125rem, 0.25vw, 0.1875rem);
    transform: none;
  }

  .step-line {
    left: clamp(0.4375rem, 0.75vw, 0.5rem);
    top: clamp(0.5625rem, 0.9375vw, 0.625rem);
    width: 2px;
    height: calc(100% + clamp(0.5rem, 1vw, 0.625rem));
    transform: none;
  }

  .step-content {
    padding-top: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .product-row {
    flex-wrap: wrap;
  }

  .product-pricing {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .product-subtotal {
    width: 100%;
    text-align: left;
    margin-top: clamp(0.5rem, 1vw, 0.75rem);
  }

  .notification {
    left: clamp(1rem, 2vw, 1.5rem);
    right: clamp(1rem, 2vw, 1.5rem);
    max-width: none;
  }
}

@media (max-width: 480px) {
  .product-item {
    flex-direction: column;
    align-items: stretch;
  }

  .product-image {
    display: none;
  }

  .product-meta {
    margin-top: clamp(0.5rem, 1vw, 0.75rem);
  }
}

@media (min-width: 1024px) {
  .page-btn {
  width: clamp(2.25rem, 9vw, 2.75rem);
  height: clamp(2.25rem, 9vw, 2.75rem);
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
}
}

/* ORDERS PAGE REDESIGN 2026 */
.orders-page {
  width: 100% !important;
  min-height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  color: #183147 !important;
  background: #f5f7f8 !important;
}

/* 頁首：直接貼齊內容區，不留外框空白 */
.orders-page .page-header {
  display: flex !important;
  width: 100% !important;
  min-height: 104px !important;
  margin: 0 !important;
  padding: 24px 30px 20px !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #fff !important;
  border: 0 !important;
  border-bottom: 1px solid #e4e9ea !important;
}
.orders-page .page-title {
  margin: 0 0 6px !important;
  color: #183147 !important;
  font-size: 26px !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
}
.orders-page .page-subtitle {
  margin: 0 !important;
  color: #7e8d96 !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
}

/* 篩選工具列：整列滿寬 */
.orders-page .filter-section {
  display: grid !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 18px 30px !important;
  grid-template-columns: minmax(260px, 1.25fr) minmax(420px, 1fr) !important;
  align-items: end !important;
  gap: 18px !important;
  background: #fff !important;
  border: 0 !important;
  border-bottom: 1px solid #e4e9ea !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
.orders-page .search-box {
  width: 100% !important;
}
.orders-page .filter-controls {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 12px !important;
}
.orders-page .filter-item {
  gap: 6px !important;
}
.orders-page .filter-item label {
  color: #526672 !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}
.orders-page .search-input,
.orders-page .filter-section .form-control {
  min-height: 42px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  color: #263d50 !important;
  background-color: #fff !important;
  border: 1px solid #d9e2e4 !important;
  border-radius: 9px !important;
  font-size: 13px !important;
  box-shadow: none !important;
}
.orders-page .search-input:focus,
.orders-page .filter-section .form-control:focus {
  border-color: #9b438e !important;
  box-shadow: 0 0 0 3px rgba(143, 59, 134, .08) !important;
}

/* 訂單列表背景延伸到底，不產生左右空白區 */
.orders-page .orders-list {
  display: grid !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 20px 30px 30px !important;
  gap: 14px !important;
  background: #f5f7f8 !important;
}
.orders-page .order-card {
  width: 100% !important;
  margin: 0 !important;
  background: #fff !important;
  border: 1px solid #dfe6e8 !important;
  border-radius: 13px !important;
  box-shadow: 0 4px 14px rgba(29, 54, 68, .045) !important;
  overflow: hidden !important;
  transform: none !important;
}
.orders-page .order-card:hover {
  border-color: #d2dcde !important;
  box-shadow: 0 8px 22px rgba(29, 54, 68, .075) !important;
  transform: none !important;
}
.orders-page .order-header {
  display: flex !important;
  min-height: 62px !important;
  padding: 13px 18px !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 16px !important;
  background: #fbfcfc !important;
  border-bottom: 1px solid #edf1f2 !important;
}
.orders-page .order-meta {
  display: flex !important;
  min-width: 0 !important;
  flex: 1 1 auto !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 22px !important;
}
.orders-page .order-number,
.orders-page .order-time {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  color: #6d7e88 !important;
  font-size: 12px !important;
}
.orders-page .order-number .value {
  color: #263d50 !important;
  font-weight: 800 !important;
}
.orders-page .order-badges {
  display: flex !important;
  gap: 7px !important;
  flex-wrap: wrap !important;
}
.orders-page .badge {
  padding: 5px 9px !important;
  border-radius: 999px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
}
.orders-page .order-body {
  padding: 4px 18px !important;
  background: #fff !important;
}
.orders-page .product-item {
  display: grid !important;
  grid-template-columns: 64px minmax(0, 1fr) !important;
  padding: 12px 0 !important;
  align-items: center !important;
  gap: 14px !important;
  border-bottom: 1px solid #edf1f2 !important;
}
.orders-page .product-item:last-child {
  border-bottom: 0 !important;
}
.orders-page .product-image {
  width: 64px !important;
  height: 64px !important;
  background: #f8fafa !important;
  border: 1px solid #edf1f2 !important;
  border-radius: 10px !important;
  overflow: hidden !important;
}
.orders-page .product-image img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}
.orders-page .product-name {
  margin: 0 0 5px !important;
  color: #263d50 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.orders-page .product-specs {
  margin: 0 0 6px !important;
  color: #89979f !important;
  font-size: 11px !important;
}
.orders-page .product-meta {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 12px !important;
  color: #71818b !important;
  font-size: 11px !important;
}
.orders-page .product-meta .price {
  color: #8f3b86 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.orders-page .order-footer {
  display: flex !important;
  padding: 14px 18px 16px !important;
  align-items: flex-end !important;
  justify-content: space-between !important;
  gap: 18px !important;
  background: #fcfdfd !important;
  border-top: 1px solid #edf1f2 !important;
}
.orders-page .order-total {
  min-width: 220px !important;
  margin-left: auto !important;
}
.orders-page .total-row {
  display: flex !important;
  justify-content: space-between !important;
  gap: 22px !important;
  color: #71818b !important;
  font-size: 11px !important;
}
.orders-page .total-row.final {
  margin-top: 6px !important;
  color: #263d50 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.orders-page .total-row.final .value {
  color: #8f3b86 !important;
  font-size: 17px !important;
}
.orders-page .order-actions {
  display: flex !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
}
.orders-page .order-actions .btn {
  min-height: 36px !important;
  padding: 0 13px !important;
  border-radius: 8px !important;
  font-size: 11px !important;
  font-weight: 800 !important;
}
.orders-page .order-actions .btn-primary {
  color: #fff !important;
  background: #8f3b86 !important;
  border-color: #8f3b86 !important;
}

/* 空訂單狀態也要完整填滿內容區 */
.orders-page > .empty-state {
  width: 100% !important;
  min-height: calc(100dvh - 240px) !important;
  margin: 0 !important;
  padding: 48px 24px !important;
  background: #f5f7f8 !important;
  border: 0 !important;
  border-radius: 0 !important;
}
.orders-page .pagination {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 30px 30px !important;
  background: #f5f7f8 !important;
}

@media (max-width: 1024px) {
  .orders-page .filter-section {
    grid-template-columns: 1fr !important;
  }
  .orders-page .order-meta {
    gap: 12px !important;
    flex-wrap: wrap !important;
  }
}

@media (max-width: 768px) {
  .orders-page .page-header {
    min-height: 88px !important;
    padding: 18px 16px !important;
  }
  .orders-page .page-title {
    font-size: 22px !important;
  }
  .orders-page .filter-section {
    padding: 14px 16px !important;
  }
  .orders-page .filter-controls {
    grid-template-columns: 1fr !important;
  }
  .orders-page .orders-list {
    padding: 14px 12px 24px !important;
    gap: 10px !important;
  }
  .orders-page .order-header {
    padding: 12px 14px !important;
    align-items: flex-start !important;
    flex-direction: column !important;
  }
  .orders-page .order-meta {
    width: 100% !important;
    align-items: flex-start !important;
    flex-direction: column !important;
    gap: 6px !important;
  }
  .orders-page .order-body {
    padding: 2px 14px !important;
  }
  .orders-page .product-item {
    grid-template-columns: 54px minmax(0, 1fr) !important;
    gap: 10px !important;
  }
  .orders-page .product-image {
    width: 54px !important;
    height: 54px !important;
  }
  .orders-page .order-footer {
    padding: 12px 14px 14px !important;
    align-items: stretch !important;
    flex-direction: column !important;
  }
  .orders-page .order-total {
    width: 100% !important;
    min-width: 0 !important;
  }
  .orders-page .order-actions {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  .orders-page .pagination {
    padding: 0 12px 24px !important;
  }
}


/* ORDER DETAIL PRICING CLARITY */
.modal-container .product-row {
  display: grid !important;
  grid-template-columns: 64px minmax(0, 1fr) 190px 130px !important;
  gap: 16px !important;
  padding: 16px 18px !important;
  align-items: center !important;
  background: #f8fafb !important;
  border: 1px solid #edf1f2 !important;
  border-radius: 12px !important;
}
.modal-container .product-pricing {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  min-width: 0 !important;
  gap: 16px !important;
  align-items: center !important;
}
.modal-container .pricing-field,
.modal-container .product-subtotal {
  display: flex !important;
  min-width: 0 !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  gap: 5px !important;
}
.modal-container .pricing-label {
  color: #8a98a1 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: .04em !important;
  line-height: 1.2 !important;
  white-space: nowrap !important;
}
.modal-container .unit-price,
.modal-container .quantity {
  color: #4f6370 !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  line-height: 1.35 !important;
  white-space: nowrap !important;
}
.modal-container .quantity { color: #687c88 !important; }
.modal-container .product-subtotal {
  min-width: 0 !important;
  text-align: right !important;
}
.modal-container .product-subtotal strong {
  color: #8f3b86 !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
  white-space: nowrap !important;
}
.modal-container .order-summary {
  margin-top: 18px !important;
  padding: 16px 0 0 !important;
  border-top: 1px solid #dce5e7 !important;
}
.modal-container .summary-row {
  min-width: 280px !important;
  padding: 5px 0 !important;
}
.modal-container .summary-row.total {
  margin-top: 6px !important;
  padding-top: 14px !important;
  border-top: 1px dashed #cfdadd !important;
}
.modal-container .summary-row.total .summary-label {
  color: #263d50 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
}
.modal-container .summary-row.total .summary-value {
  color: #9a3d8d !important;
  font-size: 20px !important;
  font-weight: 900 !important;
  letter-spacing: .01em !important;
}
@media (max-width: 760px) {
  .modal-container .product-row {
    grid-template-columns: 54px minmax(0, 1fr) !important;
    gap: 10px 12px !important;
    padding: 14px !important;
  }
  .modal-container .product-pricing,
  .modal-container .product-subtotal { grid-column: 2 !important; }
  .modal-container .product-pricing {
    width: 100% !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px !important;
  }
  .modal-container .pricing-field,
  .modal-container .product-subtotal { align-items: flex-start !important; }
  .modal-container .product-subtotal {
    margin-top: 2px !important;
    padding-top: 8px !important;
    border-top: 1px dashed #dfe6e8 !important;
  }
  .modal-container .summary-row {
    width: 100% !important;
    min-width: 0 !important;
  }
}


/* ===== 訂單列表高度優化：摘要卡模式 ===== */
.orders-page .order-card {
  overflow: hidden;
}

.orders-page .order-body {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.orders-page .product-item {
  min-height: 76px !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}

.orders-page .product-item + .product-item {
  border-top: 1px solid #edf1f2 !important;
}

.orders-page .product-image {
  width: 58px !important;
  height: 58px !important;
}

.orders-page .product-name {
  margin-bottom: 5px !important;
  font-size: 13px !important;
  line-height: 1.45 !important;
}

.orders-page .product-meta {
  margin-top: 0 !important;
}

.more-items-summary {
  width: calc(100% - 36px);
  min-height: 42px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin: 0 18px 12px;
  padding: 0 14px;
  border: 1px dashed #dbc9d8;
  border-radius: 10px;
  background: #fcf9fb;
  color: #8f3b86;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  font-weight: 800;
}

.more-items-summary:hover {
  border-color: #b985b2;
  background: #f8f0f6;
}

.more-items-hint {
  color: #81919a;
  font-size: 11px;
  font-weight: 600;
}

.more-items-summary i {
  color: #a26a99;
  font-size: 10px;
}

/* 每張摘要卡最多只會出現兩個商品，5 筆訂單也維持合理頁高。 */
.orders-page .order-footer {
  min-height: 64px !important;
}

@media (max-width: 640px) {
  .more-items-summary {
    width: calc(100% - 28px);
    margin: 0 14px 10px;
    grid-template-columns: auto 1fr auto;
  }
  .more-items-hint {
    display: none;
  }
}


/* ===== 我的訂單：摘要列表 + 緊湊搜尋工具列 ===== */
.order-toolbar {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 210px 210px auto;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-top: 1px solid #e8edef;
  border-bottom: 1px solid #e8edef;
  background: #fff;
}
.toolbar-search,
.toolbar-filter {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid #dce5e8;
  border-radius: 10px;
  background: #fff;
}
.toolbar-search:focus-within,
.toolbar-filter:focus-within {
  border-color: #b783b1;
  box-shadow: 0 0 0 3px rgba(154, 61, 140, .08);
}
.toolbar-search > i,
.toolbar-filter > i { color: #8c9aa2; font-size: 12px; flex: 0 0 auto; }
.toolbar-search input,
.toolbar-filter select {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #18354a;
  font-size: 13px;
}
.toolbar-filter select { cursor: pointer; }
.toolbar-clear-input { border:0; background:transparent; color:#9aabb3; cursor:pointer; padding:4px; }
.reset-filter-btn {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 1px solid #d9c6d6;
  border-radius: 10px;
  background: #fff;
  color: #8f3b86;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}
.reset-filter-btn:hover { background:#f8f0f6; }

.orders-compact-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px 8px;
}
.compact-order-card {
  overflow: hidden;
  border: 1px solid #dfe7e9;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(31, 52, 64, .035);
}
.compact-order-summary {
  min-height: 92px;
  display: grid;
  grid-template-columns: minmax(260px, 1.6fr) auto 110px 150px auto;
  align-items: center;
  gap: 18px;
  padding: 16px 18px;
}
.summary-order-id { display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 10px; min-width:0; }
.summary-order-id .summary-label { width:100%; }
.summary-order-id strong { color:#18354a; font-size:13px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.summary-order-id small { color:#84949c; font-size:11px; }
.summary-label { display:block; margin-bottom:4px; color:#8b9aa2; font-size:10px; font-weight:700; letter-spacing:.04em; }
.summary-statuses { display:flex; align-items:center; gap:6px; }
.summary-item-count strong { color:#405867; font-size:13px; font-weight:800; white-space:nowrap; }
.summary-total { text-align:right; }
.summary-total strong { color:#963b8a; font-size:17px; font-weight:850; white-space:nowrap; }
.summary-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; }
.summary-detail-toggle, .summary-view-btn {
  min-height: 38px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  padding:0 13px;
  border-radius:9px;
  cursor:pointer;
  white-space:nowrap;
  font-size:11px;
  font-weight:800;
}
.summary-detail-toggle { border:1px solid #dce5e7; background:#fff; color:#536b78; }
.summary-detail-toggle:hover { border-color:#c79bc1; color:#8f3b86; }
.summary-detail-toggle i { font-size:9px; transition:transform .2s ease; }
.summary-detail-toggle i.rotated { transform:rotate(180deg); }
.summary-view-btn { border:1px solid #963b8a; background:#963b8a; color:#fff; }
.summary-view-btn:hover { background:#7f2e75; }

.compact-products-panel { padding:0 18px 16px; border-top:1px solid #edf1f2; background:#fbfcfc; }
.compact-products-head, .compact-product-row {
  display:grid;
  grid-template-columns:minmax(0,1fr) 130px 80px 140px;
  gap:14px;
  align-items:center;
}
.compact-products-head { padding:11px 10px 8px; color:#85959d; font-size:10px; font-weight:800; }
.compact-products-head span:not(:first-child) { text-align:right; }
.compact-product-row { min-height:62px; padding:9px 10px; border-top:1px solid #e8edef; color:#526875; font-size:12px; }
.compact-product-row > span, .compact-product-row > .compact-subtotal { text-align:right; }
.compact-product-main { min-width:0; display:flex; align-items:center; gap:11px; }
.compact-product-main img { width:46px; height:46px; flex:0 0 auto; object-fit:cover; border-radius:8px; border:1px solid #e2e9eb; }
.compact-product-main strong { min-width:0; color:#18354a; font-size:12px; line-height:1.45; }
.compact-subtotal { color:#8f3b86; font-weight:850; white-space:nowrap; }
.expanded-order-actions { display:flex; justify-content:flex-end; gap:8px; padding-top:12px; border-top:1px solid #e8edef; }

/* 舊的大型訂單卡不再使用，避免舊 CSS 影響新摘要列表。 */
.orders-page > .filter-section,
.orders-page > .orders-list { display:none !important; }

@media (max-width: 1100px) {
  .order-toolbar { grid-template-columns:1fr 180px 180px; }
  .reset-filter-btn { grid-column:1 / -1; justify-self:end; min-height:36px; }
  .compact-order-summary { grid-template-columns:minmax(220px,1fr) auto 120px auto; }
  .summary-item-count { display:none; }
}
@media (max-width: 760px) {
  .order-toolbar { grid-template-columns:1fr 1fr; padding:14px; }
  .toolbar-search { grid-column:1 / -1; }
  .reset-filter-btn { grid-column:1 / -1; width:100%; }
  .compact-order-summary { grid-template-columns:1fr auto; gap:12px; padding:14px; }
  .summary-order-id { grid-column:1 / -1; }
  .summary-statuses { align-self:start; }
  .summary-total { align-self:start; }
  .summary-actions { grid-column:1 / -1; justify-content:stretch; }
  .summary-detail-toggle, .summary-view-btn { flex:1; }
  .compact-products-head { display:none; }
  .compact-product-row { grid-template-columns:1fr auto; gap:7px 12px; padding:12px 4px; }
  .compact-product-main { grid-column:1 / -1; }
  .compact-product-row > span { text-align:left; }
  .compact-subtotal { text-align:right; }
}


/* ===== 我的訂單：前台風格整合式管理面板 ===== */
.orders-page {
  background: transparent !important;
}

.orders-page .page-header {
  padding-bottom: 22px !important;
  border-bottom: 0 !important;
}

.orders-manager-card {
  overflow: hidden;
  margin: 0 20px 26px;
  border: 1px solid #dfe7e9;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(34, 56, 68, .05);
}

.orders-manager-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px 18px;
}

.manager-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #2a8690;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .14em;
}

.orders-manager-head h3 {
  margin: 0;
  color: #17354a;
  font-size: 22px;
  font-weight: 850;
  line-height: 1.25;
}

.orders-manager-head p {
  margin: 6px 0 0;
  color: #81919a;
  font-size: 12px;
  line-height: 1.5;
}

.manager-count {
  flex: 0 0 auto;
  color: #8f3b86;
  font-size: 12px;
  font-weight: 800;
}

.order-toolbar {
  display: grid !important;
  grid-template-columns: minmax(280px, 1fr) 190px 190px auto !important;
  gap: 10px !important;
  padding: 14px 24px !important;
  border-top: 1px solid #edf1f2 !important;
  border-bottom: 1px solid #edf1f2 !important;
  background: #fbfcfc !important;
}

.toolbar-search, .toolbar-filter {
  min-height: 42px !important;
  border-radius: 9px !important;
  background: #fff !important;
}

.orders-compact-list {
  gap: 0 !important;
  padding: 0 !important;
}

.compact-order-card {
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.compact-order-card + .compact-order-card {
  border-top: 1px solid #edf1f2 !important;
}

.compact-order-main {
  display: grid;
  grid-template-columns: minmax(300px, 1.6fr) auto 150px auto;
  align-items: center;
  gap: 22px;
  min-height: 102px;
  padding: 18px 24px;
}

.order-primary-info { min-width: 0; }

.order-id-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.order-id-label {
  flex: 0 0 auto;
  color: #8b9aa2;
  font-size: 10px;
  font-weight: 700;
}

.order-id-line strong {
  min-width: 0;
  overflow: hidden;
  color: #17354a;
  font-size: 14px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-secondary-line {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 8px;
  color: #84949c;
  font-size: 11px;
}

.order-secondary-line span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.order-secondary-line i { color: #9aacb3; font-size: 10px; }

.order-status-column {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-total-column { text-align: right; }
.order-total-column span { display:block; margin-bottom:4px; color:#8b9aa2; font-size:10px; font-weight:700; }
.order-total-column strong { color:#963b8a; font-size:18px; font-weight:850; white-space:nowrap; }

.order-row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.summary-detail-toggle, .summary-view-btn { min-height: 38px !important; }

.compact-products-panel {
  padding: 4px 24px 18px !important;
  border-top: 1px solid #edf1f2 !important;
  background: #fafcfc !important;
}

.orders-page .pagination {
  padding: 18px 20px 28px !important;
}

@media (max-width: 1080px) {
  .order-toolbar {
    grid-template-columns: minmax(0, 1fr) 170px 170px !important;
  }
  .reset-filter-btn { grid-column: 1 / -1; justify-self: end; }
  .compact-order-main {
    grid-template-columns: minmax(240px, 1fr) auto 130px;
  }
  .order-row-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
    margin-top: -6px;
  }
}

@media (max-width: 760px) {
  .orders-manager-card { margin: 0 12px 20px; border-radius: 14px; }
  .orders-manager-head { padding: 18px 16px 14px; align-items: flex-start; }
  .orders-manager-head h3 { font-size: 19px; }
  .order-toolbar {
    grid-template-columns: 1fr 1fr !important;
    padding: 12px 14px !important;
  }
  .toolbar-search { grid-column: 1 / -1; }
  .reset-filter-btn { grid-column: 1 / -1; width: 100%; }
  .compact-order-main {
    grid-template-columns: 1fr auto;
    gap: 12px;
    padding: 16px;
  }
  .order-primary-info { grid-column: 1 / -1; }
  .order-status-column { align-self: start; }
  .order-total-column { align-self: start; }
  .order-row-actions { grid-column: 1 / -1; justify-content: stretch; margin-top: 0; }
  .summary-detail-toggle, .summary-view-btn { flex: 1; }
  .compact-products-panel { padding: 4px 14px 14px !important; }
}
</style>
