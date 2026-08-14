import api from "@/assets/js/api"; // axios 模組
import { jwtDecode } from "jwt-decode"; // 解析 JWT 的工具
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  data() {
    return {
      searchQuery: "",
      statusFilter: "",
      timeFilter: "all",
      currentPage: 1,
      itemsPerPage: 5,
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
        this.showNotification("error", "無法載入訂單資料，請稍後再試");
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
            title: "已加入購物車",
            text: "訂單商品已成功加入購物車",
            confirmButtonText: "前往購物車",
          });

          this.$router.push("/cart"); // ✅ 導向購物車頁面
        } else {
          this.showErrorToast("沒有任何商品成功加入購物車！");
        }
      } catch (err) {
        console.error("❌ 再次購買流程失敗：", err);
        this.showErrorToast("操作失敗，請稍後再試");
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
