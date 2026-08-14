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
