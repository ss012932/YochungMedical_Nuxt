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
