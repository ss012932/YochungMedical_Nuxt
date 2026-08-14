<template>
  <div class="orders-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">訂單管理</h2>
        <div class="page-stats">
          <span class="stats-item"
            ><i class="fas fa-clipboard-list"></i> 共
            {{ totalOrders }} 個訂單</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-clock"></i> {{ pendingOrders }} 個待處理</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-truck"></i> {{ shippingOrders }} 個配送中</span
          >
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="openExportDialog">
          <i class="fas fa-file-export"></i> 匯出訂單
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜尋訂單編號、客戶名稱或聯絡電話..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="filter-options">
        <div class="filter-select">
          <select v-model="statusFilter">
            <option value="">所有狀態</option>
            <option value="Pending">待處理</option>
            <option value="Processing">處理中</option>
            <option value="Shipped">已出貨</option>
            <option value="Completed">已完成</option>
            <option value="Cancelled">已取消</option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="dateFilter">
            <option value="all">所有時間</option>
            <option value="today">今天</option>
            <option value="yesterday">昨天</option>
            <option value="thisWeek">本週</option>
            <option value="lastWeek">上週</option>
            <option value="thisMonth">本月</option>
            <option value="lastMonth">上個月</option>
            <option value="custom">自訂日期</option>
          </select>
        </div>

        <div class="date-range" v-if="dateFilter === 'custom'">
          <div class="date-input">
            <input type="date" v-model="startDate" />
          </div>
          <span class="date-separator">至</span>
          <div class="date-input">
            <input type="date" v-model="endDate" />
          </div>
        </div>

        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-redo-alt"></i> 重置
        </button>
      </div>
    </div>

    <div class="orders-table-container">
      <table class="orders-table" v-if="paginatedOrders.length > 0">
        <thead>
          <tr>
            <th class="sortable" @click="toggleSort('id')">
              訂單編號
              <i class="fas" :class="getSortIconClass('id')"></i>
            </th>
            <th class="sortable" @click="toggleSort('customer')">
              客戶名稱
              <i class="fas" :class="getSortIconClass('customer')"></i>
            </th>
            <th class="sortable" @click="toggleSort('date')">
              訂單日期
              <i class="fas" :class="getSortIconClass('date')"></i>
            </th>
            <th class="sortable" @click="toggleSort('amount')">
              訂單金額
              <i class="fas" :class="getSortIconClass('amount')"></i>
            </th>
            <th>付款方式</th>
            <th>付款狀態</th>
            <th class="sortable" @click="toggleSort('status')">
              訂單狀態
              <i class="fas" :class="getSortIconClass('status')"></i>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <!-- 使用 v-for 循環顯示所有過濾後的訂單 -->
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td class="order-id">
              <button
                class="id-text clickable"
                @click="viewOrderDetails(order)"
              >
                {{ order.merchantTradeNo }}
              </button>
            </td>
            <td>
              <div class="customer-info">
                <span class="customer-name">{{ order.customer }}</span>
                <span class="customer-phone">{{ order.phone }}</span>
              </div>
            </td>
            <td>
              <div class="date-info">
                <span class="date-value">{{ formatDate(order.date) }}</span>
                <span class="time-value">{{ formatTime(order.date) }}</span>
              </div>
            </td>
            <td class="amount">NT$ {{ formatNumber(order.amount) }}</td>
            <td>{{ order.paymentMethod }}</td>
            <!-- 付款狀態 -->
            <td>
              <span
                class="paymentstatus-badge"
                :class="order.isPaid ? 'Paid' : 'Pending'"
              >
                {{ order.paymentStatusText }}
              </span>
            </td>

            <!-- 訂單狀態 -->
            <td>
              <span class="status-badge" :class="order.status">
                {{ displayOrderStatus(order.status) }}
              </span>
            </td>

            <td class="actions">
              <div class="action-buttons">
                <!-- 查看詳情按鈕 -->
                <button class="action-button" @click="viewOrderDetails(order)">
                  <i class="fas fa-eye"></i>
                  <span class="tooltip">查看詳情</span>
                </button>

                <!-- 列印訂單按鈕 -->
                <button class="action-button" @click="printFromList(order)">
                  <i class="fas fa-print"></i>
                  <span class="tooltip">列印訂單</span>
                </button>

                <!-- 付款狀態 -->
                <div class="dropdown-wrapper">
                  <button
                    class="icon-btn"
                    @click.stop="openPaymentDropdown(order.id)"
                  >
                    <i class="fas fa-credit-card"></i>
                  </button>

                  <div
                    v-if="activePaymentDropdown === order.id"
                    class="custom-dropdown"
                  >
                    <button
                      class="dropdown-item"
                      @click="setPaymentStatus(order, false)"
                    >
                      未付款
                    </button>

                    <button
                      class="dropdown-item"
                      @click="setPaymentStatus(order, true)"
                    >
                      已付款
                    </button>
                  </div>
                </div>

                <!-- 訂單狀態 -->
                <div class="dropdown-wrapper">
                  <button
                    class="icon-btn"
                    @click.stop="openOrderDropdown(order.id)"
                  >
                    <i class="fas fa-box"></i>
                  </button>

                  <div
                    v-if="activeOrderDropdown === order.id"
                    class="custom-dropdown"
                  >
                    <button
                      class="dropdown-item"
                      @click="setOrderStatus(order, 'Pending')"
                    >
                      待處理
                    </button>
                    <button
                      class="dropdown-item"
                      @click="setOrderStatus(order, 'Processing')"
                    >
                      處理中
                    </button>
                    <button
                      class="dropdown-item"
                      @click="setOrderStatus(order, 'Shipped')"
                    >
                      已出貨
                    </button>
                    <button
                      class="dropdown-item"
                      @click="setOrderStatus(order, 'Completed')"
                    >
                      已完成
                    </button>
                    <button
                      class="dropdown-item danger"
                      @click="setOrderStatus(order, 'Cancelled')"
                    >
                      已取消
                    </button>
                  </div>
                </div>

                <!-- 取消訂單按鈕 - 僅在可取消時顯示 -->
                <button
                  v-if="canCancel(order)"
                  class="action-button warning"
                  @click="cancelOrder(order)"
                >
                  <i class="fas fa-ban"></i>
                  <span class="tooltip">取消訂單</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty-state" v-else>
        <div class="empty-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h3 class="empty-title">無符合條件的訂單</h3>
        <p class="empty-description">請嘗試調整過濾條件或新增訂單</p>
        <button class="primary-btn">
          <i class="fas fa-plus"></i> 新增訂單
        </button>
      </div>
    </div>

    <!-- 分頁 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <template v-for="pageNum in displayedPages" :key="pageNum">
        <span v-if="pageNum === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: pageNum === currentPage }"
          @click="goToPage(pageNum)"
        >
          {{ pageNum }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 訂單詳情彈窗 -->
    <div class="modal-overlay" v-if="showOrderModal">
      <div class="modal-container order-details-modal" id="shipping-pdf">
        <div class="modal-header">
          <h3 class="modal-title">
            訂單詳情 #{{ selectedOrder.merchantTradeNo }}
          </h3>
          <button class="modal-close" @click="closeOrderModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="order-info-section">
            <div class="section-header">
              <h4>訂單資訊</h4>
            </div>

            <div class="info-grid">
              <div class="info-group">
                <span class="info-label">訂單編號</span>
                <span class="info-value">{{
                  selectedOrder.merchantTradeNo
                }}</span>
              </div>
              <div class="info-group">
                <span class="info-label">下單日期</span>
                <span class="info-value"
                  >{{ formatDate(selectedOrder.date) }}
                  {{ formatTime(selectedOrder.date) }}</span
                >
              </div>
              <div class="info-group">
                <span class="info-label">付款方式</span>
                <span class="info-value">{{
                  selectedOrder.paymentMethod
                }}</span>
              </div>
              <div class="info-group">
                <span class="info-label">付款狀態</span>
                <span
                  class="status-badge"
                  :class="selectedOrder.isPaid ? 'Paid' : 'Pending'"
                >
                  {{ selectedOrder.paymentStatusText }}
                </span>
              </div>
            </div>
          </div>

          <div class="customer-info-section">
            <h4>客戶資訊</h4>
            <div class="info-grid">
              <div class="info-group">
                <span class="info-label">客戶名稱</span>
                <span class="info-value">{{ selectedOrder.customer }}</span>
              </div>
              <div class="info-group">
                <span class="info-label">聯絡電話</span>
                <span class="info-value">{{ selectedOrder.phone }}</span>
              </div>
              <div class="info-group">
                <span class="info-label">地址</span>
                <span class="info-value">{{ selectedOrder.address }}</span>
              </div>
              <div class="info-group full-width">
                <span class="info-label">備註</span>
                <span class="info-value note">{{
                  selectedOrder.note || "無備註"
                }}</span>
              </div>
            </div>
          </div>

          <div class="order-items-section">
            <h4>訂購項目</h4>
            <table class="items-table">
              <thead>
                <tr>
                  <th>商品</th>
                  <th>單價</th>
                  <th>數量</th>
                  <th>小計</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in selectedOrder.items" :key="index">
                  <td class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-sku">商品編號: {{ item.sku }}</div>
                  </td>
                  <td>NT$ {{ formatNumber(item.price) }}</td>
                  <td>{{ item.quantity }}</td>
                  <td class="subtotal">
                    NT$ {{ formatNumber(item.price * item.quantity) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <!-- <tr>
                  <td colspan="3" class="text-right">商品小計</td>
                  <td>
                    NT$
                    {{ formatNumber(calculateSubtotal(selectedOrder.items)) }}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">運費</td>
                  <td>NT$ {{ formatNumber(selectedOrder.shipping || 0) }}</td>
                </tr> -->
                <tr v-if="selectedOrder.discount">
                  <td colspan="3" class="text-right">折扣</td>
                  <td>NT$ -{{ formatNumber(selectedOrder.discount) }}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" class="text-right">總計</td>
                  <td>NT$ {{ formatNumber(selectedOrder.amount) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="order-history-section">
            <h4>訂單記錄</h4>
            <div class="history-timeline">
              <div
                class="timeline-item"
                v-for="(history, index) in selectedOrder.history"
                :key="index"
              >
                <div
                  class="timeline-icon"
                  :class="getHistoryIconClass(history.status)"
                >
                  <i :class="getHistoryIcon(history.status)"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-date">
                    {{ formatDate(history.date) }}
                    {{ formatTime(history.date) }}
                  </div>
                  <div class="timeline-status">{{ history.status }}</div>
                  <div class="timeline-note" v-if="history.note">
                    {{ history.note }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="exportShippingPDF">
            <i class="fas fa-print"></i> 列印訂單
          </button>
          <button
            class="btn-primary"
            v-if="canUpdateStatus(selectedOrder)"
            @click="updateOrderStatus(selectedOrder, 'next')"
          >
            <i class="fas fa-arrow-right"></i> 更新狀態
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import api from "@/assets/js/api.js";

export default {
  data() {
    return {
      searchQuery: "",
      statusFilter: "",
      dateFilter: "all",
      startDate: "",
      endDate: "",
      currentPage: 1,
      itemsPerPage: 6, // 確保每頁顯示至少10筆資料
      sortField: "date",
      sortDirection: "desc",
      showOrderModal: false,
      selectedOrder: {},
      activePaymentDropdown: null, // 控制付款狀態選單
      activeOrderDropdown: null, // 控制訂單狀態選單

      orders: [],
    };
  },
  computed: {
    totalOrders() {
      return this.orders.length;
    },
    pendingOrders() {
      return this.orders.filter((o) => o.status === "Pending").length;
    },

    shippingOrders() {
      return this.orders.filter((o) => o.status === "Shipped").length;
    },
    filteredOrders() {
      // 先確保沒有被過濾掉的資料
      let result = [...this.orders];

      // 當有搜尋條件時才過濾
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (order) =>
            order.id.toLowerCase().includes(query) ||
            order.customer.toLowerCase().includes(query) ||
            (order.phone &&
              order.phone
                .replace(/[- ]/g, "")
                .includes(query.replace(/[- ]/g, "")))
        );
      }

      // 狀態過濾
      if (this.statusFilter) {
        result = result.filter((order) => order.status === this.statusFilter);
      }

      // 日期過濾
      if (this.dateFilter !== "all") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        switch (this.dateFilter) {
          case "today":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return (
                orderDate >= today &&
                orderDate < new Date(today.getTime() + 86400000)
              );
            });
            break;
          case "yesterday":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return orderDate >= yesterday && orderDate < today;
            });
            break;
          case "thisWeek":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return orderDate >= thisWeekStart;
            });
            break;
          case "lastWeek":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
            });
            break;
          case "thisMonth":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return orderDate >= thisMonthStart;
            });
            break;
          case "lastMonth":
            result = result.filter((order) => {
              const orderDate = new Date(order.date);
              return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
            });
            break;
          case "custom":
            if (this.startDate) {
              const startDate = new Date(this.startDate);
              result = result.filter(
                (order) => new Date(order.date) >= startDate
              );
            }
            if (this.endDate) {
              const endDate = new Date(this.endDate);
              endDate.setHours(23, 59, 59, 999);
              result = result.filter(
                (order) => new Date(order.date) <= endDate
              );
            }
            break;
        }
      }

      // 排序
      result.sort((a, b) => {
        let aValue, bValue;

        switch (this.sortField) {
          case "id":
            aValue = a.id;
            bValue = b.id;
            break;
          case "customer":
            aValue = a.customer;
            bValue = b.customer;
            break;
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "amount":
            aValue = a.amount;
            bValue = b.amount;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            aValue = new Date(a.date);
            bValue = new Date(b.date);
        }

        if (this.sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // 將分頁邏輯移除，直接返回所有過濾後的結果
      // const startIdx = (this.currentPage - 1) * this.itemsPerPage;
      // const endIdx = startIdx + this.itemsPerPage;
      // return result.slice(startIdx, endIdx);

      return result; // 返回所有過濾後的訂單
    },

    paginatedOrders() {
      const startIdx = (this.currentPage - 1) * this.itemsPerPage;
      const endIdx = startIdx + this.itemsPerPage;
      return this.filteredOrders.slice(startIdx, endIdx);
    },

    totalFilteredOrders() {
      // 重新實現以確保與 filteredOrders 邏輯一致
      // 將與 filteredOrders 中相同的過濾邏輯放在這裡（但不包括分頁）
      // 為了簡化，這裡直接返回 filteredOrders 的長度

      return this.filteredOrders.length;
    },
    totalPages() {
      return Math.ceil(this.totalFilteredOrders / this.itemsPerPage);
    },
    displayedPages() {
      const displayedPages = [];
      if (this.totalPages <= 7) {
        // 顯示所有頁數
        for (let i = 1; i <= this.totalPages; i++) {
          displayedPages.push(i);
        }
      } else {
        // 複雜分頁邏輯
        displayedPages.push(1);

        if (this.currentPage > 3) {
          displayedPages.push("...");
        }

        const startPage = Math.max(2, this.currentPage - 1);
        const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
          displayedPages.push(i);
        }

        if (this.currentPage < this.totalPages - 2) {
          displayedPages.push("...");
        }

        displayedPages.push(this.totalPages);
      }

      return displayedPages;
    },
  },
  methods: {
    openPaymentDropdown(orderId) {
      this.activePaymentDropdown =
        this.activePaymentDropdown === orderId ? null : orderId;

      this.activeOrderDropdown = null;

      this.$nextTick(() => {
        const selects = this.$refs.paymentSelect;

        // v-for + ref 一定是陣列
        if (Array.isArray(selects)) {
          const target = selects.find(
            (el) => el?.__vueParentComponent?.props?.modelValue !== undefined
          );
          target && target.focus();
        }
      });
    },

    openOrderDropdown(orderId) {
      this.activeOrderDropdown =
        this.activeOrderDropdown === orderId ? null : orderId;

      this.activePaymentDropdown = null;

      this.$nextTick(() => {
        const selects = this.$refs.orderSelect;

        if (Array.isArray(selects)) {
          const target = selects.find(
            (el) => el?.__vueParentComponent?.props?.modelValue
          );
          target && target.focus();
        }
      });
    },

    closeAllDropdowns() {
      this.activePaymentDropdown = null;
      this.activeOrderDropdown = null;
    },

    displayOrderStatus(status) {
      const map = {
        Pending: "待處理",
        Processing: "處理中",
        Shipped: "已出貨",
        Completed: "已完成",
        Cancelled: "已取消",
      };
      return map[status] || status;
    },

    async onPaymentStatusChange(order) {
      const originalPaid = !order.isPaid; // 記住原本狀態（失敗要還原）

      try {
        Swal.fire({
          title: "更新付款狀態中...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await this.callUpdatePaymentStatusAPI(
          order.id,
          order.isPaid,
          order.status
        );

        order.paymentStatusText = order.isPaid ? "已付款" : "未付款";

        Swal.fire({
          icon: "success",
          title: "更新成功",
          text: "付款狀態已更新",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        // ❌ 失敗 → 還原狀態
        order.isPaid = originalPaid;

        Swal.fire({
          icon: "error",
          title: "更新失敗",
          text: "請稍後再試",
        });
      } finally {
        this.activePaymentDropdown = null;
      }
    },

    async onOrderStatusChange(order) {
      const originalStatus = order.status;

      try {
        Swal.fire({
          title: "更新訂單狀態中...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        await this.callUpdateOrderStatusAPI(order.id, order.status);

        Swal.fire({
          icon: "success",
          title: "更新成功",
          text: "訂單狀態已更新",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        // ❌ 還原狀態
        order.status = originalStatus;

        Swal.fire({
          icon: "error",
          title: "更新失敗",
          text: "請稍後再試",
        });
      } finally {
        this.activeOrderDropdown = null;
      }
    },
    async fetchOrders() {
      try {
        const response = await api.get("/GetAllOrders");
        const data = response.data; // ✅ Axios 用 .data

        const convertPaymentMethod = (method) => {
          const map = {
            cvs: "超商繳費",
            linepay: "LinePay",
            credit: "信用卡",
            cod: "貨到付款",
            transfer: "銀行轉帳",
            atm: "ATM 轉帳",
          };
          return map[method?.toLowerCase()] || "未指定";
        };

        this.orders = data.map((order, idx) => ({
          id: order.OrderId || `ORD-${idx + 1}`,
          merchantTradeNo: order.MerchantTradeNo,
          customer: order.CustomerName || "未提供",
          phone: order.Phone?.trim() || "",
          date: order.CreatedDate || new Date().toISOString(),
          amount: order.TotalAmount ?? 0,
          paymentMethod: convertPaymentMethod(order.PaymentMethod),
          status: order.OrderStatus, // ✅ 用外部變數取代 this
          paymentStatusText: order.PaymentStatus ? "已付款" : "未付款",
          isPaid: order.PaymentStatus === true,
          note: order.Note || "",
          shipping: order.ShippingFee ?? 0,
          discount: order.Discount ?? 0,
          address: order.Address || "未提供", // ✅ 新增這行，取後端地址
          items:
            order.Details?.map((d) => ({
              name: d.ItemName,
              sku: `ITEM-${d.ItemId}`,
              price: d.UnitPrice,
              quantity: d.Quantity,
            })) || [],
          history: order.History || [],
        }));
      } catch (error) {
        console.error("❌ 無法取得訂單資料", error);
      }
    },

    goToOrderDetail(merchantTradeNo) {
      this.$router.push(`/admin/orders/${merchantTradeNo}`);
    },

    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) {
        return "0";
      }
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
    },

    getHistoryIconClass(status) {
      const statusMap = {
        訂單建立: "Create",
        已付款: "Paid",
        處理中: "Processing",
        已出貨: "Shipped",
        已送達: "Delivered",
        已完成: "Completed",
        已取消: "Cancelled",
      };
      return statusMap[status] || "default";
    },
    getHistoryIcon(status) {
      const iconMap = {
        訂單建立: "fas fa-file-alt",
        已付款: "fas fa-credit-card",
        處理中: "fas fa-cog",
        已出貨: "fas fa-truck",
        已送達: "fas fa-home",
        已完成: "fas fa-check-circle",
        已取消: "fas fa-ban",
      };
      return iconMap[status] || "fas fa-circle";
    },
    toggleSort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortDirection = "asc";
      }
    },
    getSortIconClass(field) {
      if (this.sortField !== field) {
        return "fa-sort";
      }
      return this.sortDirection === "asc" ? "fa-sort-up" : "fa-sort-down";
    },
    resetFilters() {
      this.searchQuery = "";
      this.statusFilter = "";
      this.dateFilter = "all";
      this.startDate = "";
      this.endDate = "";
      this.currentPage = 1;
    },
    goToPage(page) {
      this.currentPage = page;
    },
    viewOrderDetails(order) {
      this.selectedOrder = JSON.parse(JSON.stringify(order)); // 深拷貝避免直接修改原始數據
      this.showOrderModal = true;
    },
    closeOrderModal() {
      this.showOrderModal = false;
    },

    async printFromList(order) {
      // ① 設定要列印的訂單
      this.selectedOrder = JSON.parse(JSON.stringify(order));

      // ② 打開 Modal，讓 #shipping-pdf 出現在 DOM
      this.showOrderModal = true;

      // ③ 等 Vue 把 DOM render 完
      await this.$nextTick();

      // ④ 再產生 PDF
      this.exportShippingPDF();
    },

    // 🔔 列印前提醒（只顯示一次）
    async remindPrintHeaderFooter() {
      // ✅ 如果已提醒過，直接略過
      if (localStorage.getItem("printHeaderFooterHintShown")) {
        return true; // 繼續列印
      }

      const result = await Swal.fire({
        icon: "info",
        title: "列印設定提醒",
        html: `
      <div style="text-align:left; font-size:14px; line-height:1.6;">
        <p>為了讓 <b>出貨單列印更乾淨</b>，請在瀏覽器列印設定中：</p>
        <ul style="margin-left:18px;">
          <li>關閉 <b>「頁首及頁尾」</b></li>
        </ul>
        <p style="color:#666; font-size:13px; margin-top:10px;">
          （此提醒只會顯示一次）
        </p>
      </div>
    `,
        confirmButtonText: "我知道了，繼續列印",
        allowOutsideClick: false,
      });

      if (result.isConfirmed) {
        // ✅ 記住已提醒
        localStorage.setItem("printHeaderFooterHintShown", "true");
        return true;
      }

      return false;
    },

    // ===== 列印訂單 PDF 功能 =====
    async exportShippingPDF() {
      // 🔔 列印前提醒
      const canPrint = await this.remindPrintHeaderFooter();
      if (!canPrint) return;
      try {
        Swal.fire({
          title: "準備列印出貨單...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        // 等待一下
        await this.$nextTick();

        // 生成 HTML
        const shippingHTML = this.generateShippingHTML();

        // 建立列印視窗
        const printWindow = window.open("", "_blank", "width=800,height=600");

        if (!printWindow) {
          throw new Error("無法開啟列印視窗，請檢查瀏覽器設定");
        }

        printWindow.document.write(shippingHTML);
        printWindow.document.close();

        // 等待內容載入
        await new Promise((resolve) => setTimeout(resolve, 500));

        Swal.close();

        // 觸發列印
        printWindow.focus();
        printWindow.print();

        // 列印後關閉視窗（可選）
        setTimeout(() => {
          printWindow.close();
        }, 100);
      } catch (error) {
        console.error("PDF生成失敗:", error);
        Swal.fire("生成失敗", error.message || "請稍後再試", "error");
      }
    },

    generateShippingHTML() {
      const order = this.selectedOrder;

      return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>出貨單 - ${order.merchantTradeNo}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 15mm;
      }
      
      body {
        margin: 0;
        padding: 0;
      }
      
      .no-print {
        display: none !important;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Microsoft JhengHei', '微軟正黑體', Arial, sans-serif;
      background: white;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
    }

    /* 公司抬頭 */
    .company-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #2c5f8d;
    }

    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2c5f8d;
      margin-bottom: 5px;
    }

    .company-name-en {
      font-size: 12px;
      color: #666;
      margin-bottom: 10px;
    }

    /* 出貨單標題 */
    .doc-title {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
    }

    .doc-title h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 5px;
    }

    .doc-title-en {
      font-size: 13px;
      color: #666;
    }

    /* 訂單資訊區 */
    .info-section {
      margin-bottom: 20px;
    }

    .info-table {
      width: 100%;
      border-collapse: collapse;
    }

    .info-table td {
      padding: 6px 0;
      font-size: 14px;
    }

    .info-table td:first-child {
      font-weight: bold;
      width: 100px;
    }

    /* 客戶資訊區 */
    .customer-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      border: 1px solid #dee2e6;
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 2px solid #dee2e6;
    }

    /* 商品明細表格 */
    .items-section {
      margin-bottom: 25px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #dee2e6;
      margin-top: 10px;
    }

    .items-table thead {
      background: #e9ecef;
    }

    .items-table th {
      padding: 10px;
      text-align: left;
      border: 1px solid #dee2e6;
      font-weight: bold;
      font-size: 13px;
    }

    .items-table th.center {
      text-align: center;
    }

    .items-table th.right {
      text-align: right;
    }

    .items-table td {
      padding: 10px;
      border: 1px solid #dee2e6;
      font-size: 13px;
    }

    .items-table td.center {
      text-align: center;
    }

    .items-table td.right {
      text-align: right;
    }

    .item-name {
      font-weight: 500;
      margin-bottom: 3px;
    }

    .item-sku {
      font-size: 11px;
      color: #666;
    }

    .items-table tfoot {
      background: #f8f9fa;
    }

    .items-table tfoot td {
      font-weight: bold;
    }

    .total-row td {
      padding: 12px 10px !important;
      font-size: 15px !important;
    }

    .total-amount {
      color: #28a745;
      font-size: 16px !important;
    }

    .discount-amount {
      color: #dc3545;
    }

    /* 簽收區 */
    .signature-section {
      margin-top: 40px;
      padding-top: 25px;
      border-top: 2px solid #dee2e6;
    }

    .signature-table {
      width: 100%;
      border-collapse: collapse;
    }

    .signature-table td {
      vertical-align: top;
      font-size: 13px;
    }

    .signature-label {
      font-weight: bold;
      margin-bottom: 35px;
    }

    .signature-line {
      border-bottom: 1px solid #333;
      width: 180px;
      height: 1px;
    }

    .date-line {
      border-bottom: 1px solid #333;
      width: 180px;
      text-align: center;
      display: inline-block;
    }

    /* 頁尾 */
    .footer {
      margin-top: 35px;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
      text-align: center;
      font-size: 11px;
      color: #666;
    }

    .footer p {
      margin: 4px 0;
    }

    /* 付款狀態標記 */
    .status-paid {
      color: #28a745;
      font-weight: bold;
    }

    .status-unpaid {
      color: #dc3545;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- 公司抬頭 -->
    <div class="company-header">
      <div class="company-name">祐強醫療儀器有限公司</div>
      <div class="company-name-en">Yu Qiang Medical Equipment Co., Ltd.</div>
    </div>

    <!-- 出貨單標題 -->
    <div class="doc-title">
      <h1>出 貨 單</h1>
      <div class="doc-title-en">SHIPPING ORDER</div>
    </div>

    <!-- 訂單基本資訊 -->
    <div class="info-section">
      <table class="info-table">
        <tr>
          <td>訂單編號:</td>
          <td>${order.merchantTradeNo}</td>
        </tr>
        <tr>
          <td>訂單日期:</td>
          <td>${this.formatDate(order.date)} ${this.formatTime(order.date)}</td>
        </tr>
        <tr>
          <td>付款方式:</td>
          <td>${order.paymentMethod}</td>
        </tr>
        <tr>
          <td>付款狀態:</td>
          <td class="${order.isPaid ? "status-paid" : "status-unpaid"}">
            ${order.paymentStatusText}
          </td>
        </tr>
      </table>
    </div>

    <!-- 客戶資訊 -->
    <div class="customer-section">
      <div class="section-title">客戶資訊</div>
      <table class="info-table">
        <tr>
          <td>客戶名稱:</td>
          <td>${order.customer}</td>
        </tr>
        <tr>
          <td>聯絡電話:</td>
          <td>${order.phone}</td>
        </tr>
        <tr>
          <td>配送地址:</td>
          <td>${order.address}</td>
        </tr>
        ${
          order.note
            ? `
        <tr>
          <td style="vertical-align: top;">備註:</td>
          <td>${order.note}</td>
        </tr>
        `
            : ""
        }
      </table>
    </div>

    <!-- 商品明細 -->
    <div class="items-section">
      <div class="section-title">商品明細</div>
      <table class="items-table">
        <thead>
          <tr>
            <th>商品名稱</th>
            <th class="center" style="width: 90px;">單價</th>
            <th class="center" style="width: 70px;">數量</th>
            <th class="right" style="width: 110px;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (item) => `
          <tr>
            <td>
              <div class="item-name">${item.name}</div>
              <div class="item-sku">編號: ${item.sku}</div>
            </td>
            <td class="center">NT$ ${this.formatNumber(item.price)}</td>
            <td class="center">${item.quantity}</td>
            <td class="right">NT$ ${this.formatNumber(
              item.price * item.quantity
            )}</td>
          </tr>
          `
            )
            .join("")}
        </tbody>
        <tfoot>
          ${
            order.discount
              ? `
          <tr>
            <td colspan="3" class="right">折扣:</td>
            <td class="right discount-amount">- NT$ ${this.formatNumber(
              order.discount
            )}</td>
          </tr>
          `
              : ""
          }
          <tr class="total-row">
            <td colspan="3" class="right">總計:</td>
            <td class="right total-amount">NT$ ${this.formatNumber(
              order.amount
            )}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- 簽收欄 -->
    <div class="signature-section">
      <table class="signature-table">
        <tr>
          <td style="width: 50%;">
            <div class="signature-label">收件人簽名:</div>
            <div class="signature-line"></div>
          </td>
          <td style="width: 50%; text-align: right;">
            <div class="signature-label">簽收日期:</div>
            <div class="date-line">_____ 年 _____ 月 _____ 日</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- 頁尾 -->
    <div class="footer">
      <p>此為系統自動產生之出貨單，如有疑問請聯繫客服</p>
      <p>列印時間: ${this.formatDate(new Date())} ${this.formatTime(
        new Date()
      )}</p>
    </div>

  </div>
</body>
</html>
  `;
    },

    async printSelectedOrder() {
      await this.printOrder(this.selectedOrder);
    },

    async openExportDialog() {
      const { value } = await Swal.fire({
        title: "選擇匯出時間範圍",
        input: "select",
        inputOptions: {
          all: "全部訂單",
          today: "今天",
          thisMonth: "本月",
          custom: "自訂日期",
        },
        inputPlaceholder: "請選擇",
        showCancelButton: true,
        confirmButtonText: "下一步",
        cancelButtonText: "取消",
      });

      if (!value) return;

      // 🔥 自訂日期 → 再跳一個視窗
      if (value === "custom") {
        const result = await Swal.fire({
          title: "選擇日期區間",
          html: `
        <input type="date" id="startDate" class="swal2-input">
        <input type="date" id="endDate" class="swal2-input">
      `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "匯出",
          preConfirm: () => {
            const startDate = document.getElementById("startDate").value;
            const endDate = document.getElementById("endDate").value;

            if (!startDate || !endDate) {
              Swal.showValidationMessage("請選擇起訖日期");
              return;
            }

            return { startDate, endDate };
          },
        });

        if (result.value) {
          this.exportOrdersByRange("custom", result.value);
        }
      } else {
        this.exportOrdersByRange(value);
      }
    },

    exportOrdersByRange(type, range = null) {
      let orders = [...this.orders];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (type === "today") {
        orders = orders.filter((o) => {
          const d = new Date(o.date);
          return d >= today;
        });
      }

      if (type === "thisMonth") {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        orders = orders.filter((o) => new Date(o.date) >= start);
      }

      if (type === "custom" && range) {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        end.setHours(23, 59, 59, 999);

        orders = orders.filter((o) => {
          const d = new Date(o.date);
          return d >= start && d <= end;
        });
      }

      // 🔥 呼叫真正的 Excel 匯出
      this.generateExcelFromOrders(orders);
    },
    // ===== 匯出訂單 Excel 功能 =====
    async generateExcelFromOrders(orders) {
      try {
        const XLSX = await import("xlsx");

        const exportData = orders.map((order) => ({
          訂單編號: order.merchantTradeNo,
          客戶名稱: order.customer,
          聯絡電話: order.phone,
          訂單日期: this.formatDate(order.date),
          商品名稱: order.items
            .map((i) => `${i.name}*${i.quantity}`)
            .join(", "),
          訂單金額: order.amount,
          付款方式: order.paymentMethod,
          付款狀態: order.paymentStatusText,
          訂單狀態: this.displayOrderStatus(order.status),
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        ws["!cols"] = [
          { wch: 22 },
          { wch: 12 },
          { wch: 15 },
          { wch: 12 },
          { wch: 50 }, // 商品
          { wch: 12 },
          { wch: 10 },
          { wch: 10 },
          { wch: 10 },
        ];

        XLSX.utils.book_append_sheet(wb, ws, "訂單報表");

        XLSX.writeFile(wb, `訂單報表_${this.formatDate(new Date())}.xlsx`);

        Swal.fire({
          icon: "success",
          title: "匯出完成",
          text: `共匯出 ${exportData.length} 筆訂單`,
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire("匯出失敗", "請稍後再試", "error");
      }
    },
    canCancel(order) {
      // 判斷訂單是否可以取消
      const nonCancelableStatus = [
        "已出貨",
        "已完成",
        "已取消",
        "已付款",
        "處理中",
      ];
      return !nonCancelableStatus.includes(order.status);
    },

    cancelOrder(order) {
      // ✅ 防呆：若狀態已鎖定就不做事
      const lockedStatuses = ["已完成", "已取消"];
      if (lockedStatuses.includes(order.status)) {
        Swal.fire({
          icon: "info",
          title: "無法取消訂單",
          text: "此訂單已標記為已完成或已取消，無法再操作。",
        });
        return;
      }

      // ✅ 確認是否取消
      Swal.fire({
        icon: "warning",
        title: `確定要取消訂單 ${order.id} 嗎？`,
        text: "取消後將無法復原，是否確認？",
        showCancelButton: true,
        confirmButtonText: "確定取消",
        cancelButtonText: "保留訂單",
      }).then((result) => {
        if (result.isConfirmed) {
          // ✅ 更新狀態
          order.status = "已取消";
          this.callUpdateStatusAPI(order.id, "Cancelled");

          // ✅ 顯示結果通知
          Swal.fire({
            icon: "success",
            title: "訂單已取消",
            text: `訂單 ${order.id} 已成功取消。`,
            confirmButtonText: "完成",
          });
        }
      });
    },
    canUpdateStatus(order) {
      // 判斷訂單狀態是否可以更新
      return order.status !== "已完成" && order.status !== "已取消";
    },

    callUpdatePaymentStatusAPI(orderId, isPaid, orderStatus) {
      return api.post("/UpdateOrderStatus", {
        OrderId: orderId,
        PaymentStatus: isPaid, // bool
        OrderStatus: orderStatus, // ⚠️ 必填
      });
    },
    callUpdateOrderStatusAPI(orderId, status) {
      return api.post("/UpdateOrderStatus", {
        OrderId: orderId,
        OrderStatus: status, // string
      });
    },
    calculateSubtotal(items) {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    setPaymentStatus(order, isPaid) {
      order.isPaid = isPaid; // 更新畫面
      this.activePaymentDropdown = null; // 關閉 dropdown
      this.onPaymentStatusChange(order); // 呼叫你原本 API
    },

    setOrderStatus(order, status) {
      order.status = status;
      this.activeOrderDropdown = null;
      this.onOrderStatusChange(order);
    },
  },
  async mounted() {
    // ===============================
    // 區域 1️⃣：載入訂單資料
    // ===============================
    await this.fetchOrders();

    // ===============================
    // 區域 2️⃣：路由帶訂單編號，自動開啟詳情
    // ===============================
    const tradeNo = this.$route.params.merchantTradeNo;
    if (tradeNo) {
      const order = this.orders.find((o) => o.merchantTradeNo === tradeNo);

      if (order) {
        this.viewOrderDetails(order); // ✅ 開啟 Modal
      }
    }

    // ===============================
    // 區域 3️⃣：註冊點擊外部關閉下拉選單
    // ===============================
    document.addEventListener("click", this.closeAllDropdowns);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.closeAllDropdowns);
  },
};
</script>

<script setup>
// 此頁直接承載原會員/管理功能，不再引用 legacy 元件。
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
</script>

<style scoped>
.orders-page {
  width: 100%;
  overflow: visible;
  padding: clamp(1rem, 3vw, 2rem);
  box-sizing: border-box;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
}

.page-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.page-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #718096;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
}

.stats-item {
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 1vw, 0.5rem);
}

.stats-divider {
  color: #e2e8f0;
}

.header-actions {
  display: flex;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.action-btn {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.action-btn i {
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.action-btn.secondary {
  background: #edf2f7;
  color: #4a5568;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.25rem) clamp(0.75rem, 2vw, 1rem) clamp(2.5rem, 6vw, 3rem);
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  transition: all 0.2s;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #2c5282;
  box-shadow: 0 0 0 0.1875rem rgba(44, 82, 130, 0.1);
}

.search-icon {
  position: absolute;
  left: clamp(0.75rem, 2vw, 1rem);
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.clear-btn {
  position: absolute;
  right: clamp(0.75rem, 2vw, 1rem);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: clamp(0.25rem, 1vw, 0.375rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.75rem, 2vw, 1rem);
}

.filter-select {
  flex: 1;
  min-width: clamp(7.5rem, 20vw, 10rem);
}

.filter-select select {
  width: 100%;
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(2rem, 5vw, 2.5rem) clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  background-color: white;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right clamp(0.75rem, 2vw, 1rem) center;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
}

.filter-select select:focus {
  outline: none;
  border-color: #2c5282;
  box-shadow: 0 0 0 0.1875rem rgba(44, 82, 130, 0.1);
}

.date-range {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  flex-wrap: wrap;
}

.date-input {
  position: relative;
}

.date-input input {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  background-color: white;
  cursor: pointer;
  box-sizing: border-box;
}

.date-input input:focus {
  outline: none;
  border-color: #2c5282;
  box-shadow: 0 0 0 0.1875rem rgba(44, 82, 130, 0.1);
}

.date-separator {
  color: #718096;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.filter-btn {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  background-color: white;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-btn:hover {
  background-color: #f7fafc;
}

.orders-table-container {
  background: white;
  border-radius: clamp(0.5rem, 1.5vw, 0.75rem);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.05);
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  overflow-x: auto;
  overflow-y: visible;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 62.5rem;
}

.orders-table th,
.orders-table td {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.8125rem, 2vw, 0.875rem);
  line-height: 1.4;
  text-align: left;
}

.orders-table th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  white-space: nowrap;
}

.orders-table th.sortable {
  cursor: pointer;
  transition: all 0.2s;
}

.orders-table th.sortable:hover {
  background-color: #edf2f7;
}

.orders-table th.sortable i {
  margin-left: clamp(0.25rem, 1vw, 0.375rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}

.orders-table td {
  border-bottom: 0.0625rem solid #e2e8f0;
  color: #2d3748;
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.order-id {
  font-weight: 600;
  color: #2c5282;
}

.id-text.clickable {
  background: none;
  border: none;
  color: #2c5282;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
}

.id-text.clickable:hover {
  color: #2b6cb0;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.375rem);
}

.customer-name {
  font-weight: 500;
}

.customer-phone {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #718096;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.375rem);
}

.time-value {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #718096;
}

.amount {
  font-weight: 600;
  color: #2d3748;
  font-size: clamp(0.8125rem, 2vw, 0.9375rem);
}

.status-badge,
.paymentstatus-badge {
  display: inline-block;
  padding: clamp(0.25rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.75rem);
  border-radius: clamp(0.5rem, 1.5vw, 0.75rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  min-width: clamp(4.375rem, 12vw, 5rem);
}

.status-badge.Pending {
  background: rgba(246, 173, 85, 0.1);
  color: #dd6b20;
}

.status-badge.Processing {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
}

.status-badge.Shipped {
  background: rgba(44, 82, 130, 0.1);
  color: #2c5282;
}

.status-badge.Completed {
  background: rgba(56, 161, 105, 0.1);
  color: #2f855a;
}

.status-badge.Cancelled {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.paymentstatus-badge.Paid {
  background: rgba(56, 161, 105, 0.12);
  color: #2f855a;
}

.paymentstatus-badge.Pending {
  background: rgba(245, 101, 101, 0.12);
  color: #e53e3e;
}

.actions {
  position: relative;
  overflow: visible;
}

.action-buttons {
  display: flex;
  gap: clamp(0.375rem, 1vw, 0.5rem);
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.action-button {
  position: relative;
  width: clamp(2rem, 5vw, 2.25rem);
  height: clamp(2rem, 5vw, 2.25rem);
  border-radius: clamp(0.25rem, 1vw, 0.375rem);
  background: #f7fafc;
  border: 0.0625rem solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.action-button:hover {
  background: #edf2f7;
  box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.05);
}

.action-button.warning {
  color: #e53e3e;
}

.action-button.warning:hover {
  background: #fff5f5;
  border-color: #fed7d7;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: clamp(0.375rem, 1vw, 0.5rem);
  background: #2d3748;
  color: white;
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 500;
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.625rem, 2vw, 0.75rem);
  border-radius: clamp(0.25rem, 1vw, 0.375rem);
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 100;
}

.tooltip:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: clamp(0.25rem, 1vw, 0.3125rem);
  border-style: solid;
  border-color: #2d3748 transparent transparent transparent;
}

.action-button:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.dropdown-wrapper {
  position: relative;
}

.icon-btn {
  width: clamp(2rem, 5vw, 2.25rem);
  height: clamp(2rem, 5vw, 2.25rem);
  border: 0.0625rem solid #dce3ed;
  background: #fff;
  padding: clamp(0.375rem, 1vw, 0.5rem);
  border-radius: clamp(0.25rem, 1vw, 0.375rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #f5f7fa;
}

.dropdown-wrapper select {
  position: absolute;
  top: clamp(2.25rem, 6vw, 2.5rem);
  left: 0;
  z-index: 10;
  padding: clamp(0.375rem, 1vw, 0.5rem) clamp(0.625rem, 2vw, 0.75rem);
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.25rem, 1vw, 0.375rem);
  background: white;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  font-size: clamp(0.8125rem, 2vw, 0.875rem);
  min-width: clamp(6.25rem, 18vw, 8.75rem);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 8vw, 4rem) clamp(1.5rem, 4vw, 2rem);
  text-align: center;
}

.empty-icon {
  font-size: clamp(2.5rem, 6vw, 3rem);
  color: #a0aec0;
  margin-bottom: clamp(1rem, 3vw, 1.25rem);
}

.empty-title {
  font-size: clamp(1.125rem, 3vw, 1.375rem);
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 clamp(0.5rem, 1.5vw, 0.75rem) 0;
}

.empty-description {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #718096;
  margin: 0 0 clamp(1.5rem, 4vw, 2rem) 0;
}

.primary-btn {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1.25rem, 3vw, 1.5rem);
  background: #2c5282;
  color: white;
  border: none;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  cursor: pointer;
  transition: all 0.2s;
}

.primary-btn:hover {
  background: #2b6cb0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  flex-wrap: wrap;
  margin-top: clamp(2rem, 5vw, 2.5rem);
}

.page-btn {
  min-width: clamp(2rem, 5vw, 2.25rem);
  height: clamp(2rem, 5vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.0625rem solid #e2e8f0;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  background: white;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-btn.active {
  background: #2c5282;
  color: white;
  border-color: #2c5282;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  min-width: clamp(2rem, 5vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #a0aec0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: clamp(1rem, 3vw, 2rem);
  box-sizing: border-box;
}

.modal-container {
  background-color: white;
  width: 100%;
  max-width: 50rem;
  border-radius: clamp(0.5rem, 1.5vw, 0.75rem);
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(1rem, 3vw, 1.5rem);
  border-bottom: 0.0625rem solid #e2e8f0;
}

.modal-title {
  font-size: clamp(1.125rem, 3vw, 1.375rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: clamp(1rem, 3vw, 1.25rem);
  cursor: pointer;
  transition: color 0.2s;
  padding: clamp(0.25rem, 1vw, 0.375rem);
}

.modal-close:hover {
  color: #4a5568;
}

.modal-body {
  padding: clamp(1.5rem, 4vw, 2rem);
  overflow-y: auto;
  flex: 1;
}

.order-info-section,
.customer-info-section,
.order-items-section,
.order-history-section {
  margin-bottom: clamp(2rem, 5vw, 2.5rem);
}

.order-info-section:last-child,
.customer-info-section:last-child,
.order-items-section:last-child,
.order-history-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1rem, 3vw, 1.25rem);
}

.section-header h4,
.customer-info-section h4,
.order-items-section h4,
.order-history-section h4 {
  font-size: clamp(1rem, 3vw, 1.25rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 clamp(1rem, 3vw, 1.25rem) 0;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 3vw, 1.25rem);
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.375rem);
}

.info-label {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #718096;
}

.info-value {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #2d3748;
  font-weight: 500;
}

.info-value.note {
  padding: clamp(0.75rem, 2vw, 1rem);
  background: #f7fafc;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-weight: normal;
  line-height: 1.5;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: clamp(1rem, 3vw, 1.25rem);
}

.items-table th {
  background-color: #f7fafc;
  padding: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  border-bottom: 0.0625rem solid #e2e8f0;
  text-align: left;
}

.items-table td {
  padding: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #2d3748;
  border-bottom: 0.0625rem solid #e2e8f0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 1vw, 0.375rem);
}

.item-name {
  font-weight: 500;
}

.item-sku {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #718096;
}

.subtotal {
  font-weight: 600;
}

.items-table tfoot td {
  padding: clamp(0.75rem, 2vw, 1rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  border-bottom: 0.0625rem solid #e2e8f0;
}

.text-right {
  text-align: right;
}

.total-row td {
  background-color: #f7fafc;
  font-weight: 600;
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: #2d3748;
}

.history-timeline {
  padding: clamp(1rem, 3vw, 1.25rem) 0;
}

.timeline-item {
  display: flex;
  margin-bottom: clamp(1.5rem, 4vw, 2rem);
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item:not(:last-child)::after {
  content: "";
  position: absolute;
  top: clamp(2rem, 5vw, 2.5rem);
  left: clamp(1rem, 3vw, 1.25rem);
  width: 0.125rem;
  height: calc(100% - clamp(0.75rem, 2vw, 1rem));
  background-color: #e2e8f0;
}

.timeline-icon {
  width: clamp(2rem, 5vw, 2.5rem);
  height: clamp(2rem, 5vw, 2.5rem);
  background: #f7fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: clamp(1rem, 3vw, 1.25rem);
  position: relative;
  z-index: 1;
  font-size: clamp(0.875rem, 2vw, 1rem);
  flex-shrink: 0;
}

.timeline-icon.create {
  background: rgba(160, 174, 192, 0.1);
  color: #718096;
}

.timeline-icon.paid {
  background: rgba(90, 103, 216, 0.1);
  color: #4c51bf;
}

.timeline-icon.processing {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
}

.timeline-icon.shipped {
  background: rgba(44, 82, 130, 0.1);
  color: #2c5282;
}

.timeline-icon.delivered {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.timeline-icon.completed {
  background: rgba(56, 161, 105, 0.1);
  color: #2f855a;
}

.timeline-icon.cancelled {
  background: rgba(245, 101, 101, 0.1);
  color: #e53e3e;
}

.timeline-content {
  flex: 1;
}

.timeline-date {
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #718096;
  margin-bottom: clamp(0.25rem, 1vw, 0.375rem);
}

.timeline-status {
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin-bottom: clamp(0.25rem, 1vw, 0.375rem);
}

.timeline-note {
  font-size: clamp(0.875rem, 2vw, 1rem);
  color: #4a5568;
  background: #f7fafc;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  margin-top: clamp(0.5rem, 1.5vw, 0.75rem);
}

.modal-footer {
  padding: clamp(1rem, 3vw, 1.5rem);
  border-top: 0.0625rem solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: clamp(0.75rem, 2vw, 1rem);
  flex-wrap: wrap;
}

.btn-secondary {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  background: #edf2f7;
  color: #4a5568;
  border: none;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.25rem);
  background: #2c5282;
  color: white;
  border: none;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.625rem);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2b6cb0;
}

.custom-dropdown {
  position: absolute;
  top: 42px;
  right: -1.5rem;
  background: #ffffff;
  border-radius: 8px;
  min-width: 80px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 9999;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  color: #2d3748;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f7fafc;
}

.dropdown-item.danger {
  color: #e53e3e;
}

.dropdown-item.danger:hover {
  background: #fff5f5;
}

/* 表格整條祖先鏈都要放行 */
.orders-table-container,
.orders-table,
.orders-table tbody,
.orders-table tr,
.orders-table td,
.actions,
.dropdown-wrapper {
  overflow: visible !important;
}

.custom-dropdown {
  z-index: 99999;
  position: absolute;
}



@media (min-width: 30rem) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-group.full-width {
    grid-column: span 2;
  }
}

@media (min-width: 48rem) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .filter-bar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .search-box {
    flex: 1;
    max-width: 25rem;
  }
  
  .filter-options {
    flex-wrap: nowrap;
  }
  
  .filter-select {
    flex: 0 1 auto;
  }
}

@media (max-width: 48rem) {
  .stats-divider {
    display: none;
  }
  
  .page-stats {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
