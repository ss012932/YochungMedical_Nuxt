<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2 class="dashboard-title">儀表板概覽</h2>
      <div class="time-selector">
        <button class="time-btn active">今日</button>
        <button class="time-btn">本週</button>
        <button class="time-btn">本月</button>
      </div>
    </div>

    <div class="stats-section-disabled">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-pills"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">商品總數</h3>
            <p class="stat-value">{{ stats.products }}</p>
            <p
              class="stat-change"
              :class="{
                positive: statsTrend.products > 0,
                negative: statsTrend.products < 0,
              }"
            >
              <i
                :class="
                  statsTrend.products > 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(statsTrend.products) }}% 相較上月
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orders">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">訂單總數</h3>
            <p class="stat-value">{{ stats.orders }}</p>
            <p
              class="stat-change"
              :class="{
                positive: statsTrend.orders > 0,
                negative: statsTrend.orders < 0,
              }"
            >
              <i
                :class="
                  statsTrend.orders > 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(statsTrend.orders) }}% 相較上月
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">用戶總數</h3>
            <p class="stat-value">{{ stats.users }}</p>
            <p
              class="stat-change"
              :class="{
                positive: statsTrend.users > 0,
                negative: statsTrend.users < 0,
              }"
            >
              <i
                :class="
                  statsTrend.users > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(statsTrend.users) }}% 相較上月
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">
            <i class="fas fa-dollar-sign"></i>
          </div>
          <div class="stat-info">
            <h3 class="stat-title">本月營收</h3>
            <p class="stat-value">NT$ {{ formatNumber(stats.revenue) }}</p>
            <p
              class="stat-change"
              :class="{
                positive: statsTrend.revenue > 0,
                negative: statsTrend.revenue < 0,
              }"
            >
              <i
                :class="
                  statsTrend.revenue > 0
                    ? 'fas fa-arrow-up'
                    : 'fas fa-arrow-down'
                "
              ></i>
              {{ Math.abs(statsTrend.revenue) }}% 相較上月
            </p>
          </div>
        </div>
        <div class="stats-overlay">
          <div class="overlay-message">
            <i class="fas fa-lock"></i>
            此功能尚未開放，敬請期待
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section recent-orders">
        <div class="section-header">
          <h3 class="section-title">最近訂單</h3>
          <button class="view-all-btn" @click="goToAdminOrders">
            查看全部 <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="table-container">
          <table v-if="recentOrders.length > 0">
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>客戶</th>
                <th>日期</th>
                <th>金額</th>
                <th>訂單狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in recentOrders"
                :key="order.merchantTradeNo"
                @click="viewOrderDetail(order.merchantTradeNo)"
              >
                <td class="order-id">#{{ order.merchantTradeNo }}</td>
                <td>{{ order.customer }}</td>
                <td>{{ formatDate(order.date) }}</td>
                <td class="amount">NT$ {{ formatNumber(order.amount) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="getStatusClass(order.status)"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="empty-state" v-else>
            <i class="fas fa-clipboard-list empty-icon"></i>
            <p>目前沒有訂單記錄</p>
          </div>
        </div>
      </div>

      <div class="section top-products">
        <div class="section-header">
          <h3 class="section-title">熱銷商品</h3>
          <button class="view-all-btn" @click="goToProduct">
            查看全部 <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="product-list scrollable-list" v-if="topProducts.length > 0">
          <div
            class="product-item"
            v-for="product in topProducts"
            :key="product.id"
          >
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-category">{{ product.category }}</p>
            </div>
            <div class="product-stats">
              <p class="product-sold">銷量: {{ product.sold }}</p>
              <p class="product-price">NT$ {{ formatNumber(product.price) }}</p>
            </div>
            <div class="product-progress">
              <div
                class="progress-bar"
                :style="{ width: `${product.soldPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div class="empty-state" v-else>
          <i class="fas fa-box empty-icon"></i>
          <p>尚無熱銷商品資料</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/assets/js/api.js";

export default {
  data() {
    return {
      stats: {
        products: 248,
        orders: 867,
        users: 1024,
        revenue: 1256789,
      },
      statsTrend: {
        products: 12,
        orders: 5,
        users: 8,
        revenue: -3,
      },
      recentOrders: [], // 改為由 API 動態取得
      topProducts: [],
    };
  },
  mounted() {
    this.fetchRecentOrders(); // 載入最近訂單
    this.fetchTopProducts(); // 載入熱銷商品
  },
  methods: {
    async fetchTopProducts() {
      try {
        const res = await api.get("/products/top");

        this.topProducts = res.data.map((item) => ({
          id: item.Id, // 商品 ID
          name: item.Name, // 商品名稱
          category: item.Category || "未分類", // 類別名稱
          price: item.Price, // 價格
          sold: item.Stock || 0, // 假設這裡暫時用庫存當成銷售量
          soldPercentage: Math.min(100, Math.round((item.Stock / 300) * 100)), // 假設最大量為 300 計算百分比
        }));
      } catch (err) {
        console.error("❌ 載入熱銷商品失敗", err);
      }
    },

    async fetchRecentOrders() {
      try {
        const res = await api.get("/GetAllOrders");

        this.recentOrders = res.data
          .sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)) // 按時間倒序
          .slice(0, 10) // 只取最新10筆
          .map((order) => ({
            id: order.OrderId, // 訂單編號
            merchantTradeNo: order.MerchantTradeNo, // 訂單交易編號
            customer: order.CustomerName?.trim() || "匿名顧客", // 顧客名稱
            date: order.CreatedDate, // 建立日期
            amount: order.TotalAmount, // 訂單金額
            status: this.convertOrderStatus(order.OrderStatus), // ✅ 改這行
            isPaid: order.PaymentStatus, // 狀態轉換為中文
          }));
      } catch (err) {
        console.error("❌ 無法載入最近訂單", err);
      }
    },

    viewOrderDetail(merchantTradeNo) {
      // 依你的訂單管理頁路由調整
      this.$router.push(`/admin/orders/${merchantTradeNo}`);
    },

    convertOrderStatus(status) {
      const map = {
        Pending: "待處理",
        Processing: "處理中",
        Shipped: "已出貨",
        Completed: "已完成",
        Cancelled: "已取消",
      };
      return map[status] || "未知狀態";
    },

    // 狀態轉換（英文轉中文）
    // ===== 付款狀態顯示 =====
    getPaymentText(isPaid) {
      return isPaid ? "已付款" : "未付款";
    },

    goToAdminOrders() {
      this.$router.push("/admin/orders"); // 🔁 導向後台訂單管理頁
    },
    goToProduct() {
      this.$router.push("/admin/products"); // 🔁 導向後台訂單管理頁
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    getStatusClass(status) {
      const statusMap = {
        待處理: "Pending",
        未付款: "Pending",
        已付款: "Paid",
        處理中: "Processing",
        已出貨: "Shipped",
        已完成: "Completed",
        已取消: "Cancelled",
      };
      return statusMap[status] || "default";
    },
  },
};
</script>

<script setup>
// 此頁直接承載原會員/管理功能，不再引用 legacy 元件。
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.time-selector {
  display: flex;
  background: #f7fafc;
  border-radius: 8px;
  padding: 4px;
}

.time-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  color: #4a5568;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn.active {
  background: #2c5282;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 14px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 52px;
  height: 52px;
  background: rgba(44, 82, 130, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #2c5282;
  font-size: 20px;
}

.stat-icon.orders {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
}

.stat-icon.users {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.stat-icon.revenue {
  background: rgba(246, 173, 85, 0.1);
  color: #dd6b20;
}

.stat-info {
  flex: 1;
}

.stat-title {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 6px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 6px 0;
}

.stat-change {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #718096;
}

.stat-change i {
  margin-right: 4px;
  font-size: 10px;
}

.stat-change.positive {
  color: #38a169;
}

.stat-change.negative {
  color: #e53e3e;
}

.dashboard-sections {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.view-all-btn {
  background: none;
  border: none;
  color: #2c5282;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.view-all-btn i {
  margin-left: 4px;
  font-size: 12px;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 11px 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

td {
  color: #2d3748;
  font-size: 14px;
}

.order-id {
  font-weight: 600;
  color: #2c5282;
}

.amount {
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.Pending {
  background: rgba(246, 173, 85, 0.1);
  color: #dd6b20;
}

.status-badge.Paid {
  background: rgba(90, 103, 216, 0.1);
  color: #4c51bf;
}

.status-badge.Processing {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
}

.status-badge.Shipped {
  background: rgba(44, 82, 130, 0.1);
  color: #2c5282;
}

.status-badge.Delivered {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.status-badge.Completed {
  background: rgba(56, 161, 105, 0.1);
  color: #2f855a;
}

.status-badge.Cancelled {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.scrollable-list {
  max-height: 550px;
  /* 根據畫面大小調整，例如 400px */
  overflow-y: auto;
  /* 垂直出現滾動條 */
  padding-right: 6px;
  /* 預留滾動條空間 */
}

/* 美化捲軸（可選） */
.scrollable-list::-webkit-scrollbar {
  width: 6px;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}


.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 28px;
  height: 28px;
  background: #f7fafc;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #ebf4ff;
  color: #2c5282;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  padding: 12px;
  border-radius: 8px;
  background: #f7fafc;
  transition: all 0.2s;
}

.product-item:hover {
  background: #ebf4ff;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.product-category {
  font-size: 12px;
  color: #718096;
  margin: 0;
  background: white;
  padding: 2px 8px;
  border-radius: 12px;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.product-sold,
.product-price {
  font-size: 12px;
  color: #4a5568;
  margin: 0;
}

.product-price {
  font-weight: 600;
}

.product-progress {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #2c5282;
  border-radius: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #a0aec0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.add-btn {
  margin-top: 16px;
  background: #2c5282;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #2b6cb0;
}

.stats-section-disabled {
  position: relative;
  pointer-events: none;
  /* 防止區塊互動 */
  opacity: 0.6;
  /* 讓整塊反灰 */
}

.stats-section-disabled .stats-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.stats-section-disabled .overlay-message {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
}

.stats-section-disabled .overlay-message i {
  font-size: 20px;
  color: #718096;
  margin-right: 8px;
}


@media screen and (max-width: 992px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .scrollable-list {
    max-height: 280px;
  }
}
</style>
