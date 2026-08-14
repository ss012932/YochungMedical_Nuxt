import api from "@/assets/js/api"; // axios 模組
import { jwtDecode } from "jwt-decode"; // 解析 JWT 的工具

export default {
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
      recommendedProducts: [],
       currentPage: 1,
    itemsPerPage: 3,
    };
  },
  computed: {
  paginatedOrders() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.recentOrders.slice(start, end);
  },
  totalPages() {
    return Math.ceil(this.recentOrders.length / this.itemsPerPage);
  }
},
  mounted() {
    this.fetchRecentOrders(); // ✅ 載入時呼叫
    this.logUserOrders(); // 頁面載入時自動抓
    this.fetchTopProducts(); // 新增：載入推薦商品

    console.log("🔍 嘗試抓取登入者訂單...");

    const selectedId = this.$route.query.selected; // ✅ 從網址抓 selected 參數
    if (selectedId) {
      // 因為 fetchUserOrders 是非同步，要等 orders 資料載入完後再找訂單
      const timer = setInterval(() => {
        if (this.orders.length > 0) {
          const selectedOrder = this.orders.find(
            (o) => String(o.id) === String(selectedId)
          );
          if (selectedOrder) {
            this.selectedOrder = selectedOrder;
            this.showOrderDetail = true;
            console.log("✅ 自動展開訂單：", selectedOrder.id);
          }
          clearInterval(timer); // ✅ 記得清掉 interval
        }
      }, 100); // 每 100ms 檢查一次，直到訂單資料出現為止
    }
  },
  methods: {
    async fetchTopProducts() {
      try {
        const res = await api.get("/products/top");
        this.recommendedProducts = res.data.map((item) => ({
          id: item.Id,
          name: item.Name,
          price: item.Price,
          image:
            item.ImageUrl || "https://via.placeholder.com/200x200?text=無圖片",
          isFavorite: false,
        }));
      } catch (err) {
        console.error("❌ 載入推薦商品失敗", err);
      }
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
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
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
        (o) => o.merchantTradeNo === merchantTradeNo
      );

      if (match) {
        this.selectedOrder = match;
        this.showOrderDetail = true;
      }
    },
    async fetchRecentOrders() {
      try {
        // ✅ JWT 已在 HttpOnly Cookie，直接打 API
        const response = await api.get("/orders/user", {});

        const rawOrders = response.data;

        // ✅ 統計訂單數
        this.stats.orders = rawOrders.length;

        // ✅ 排序取前 10 筆
        const recent = rawOrders
          .sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate))
          .slice(0, 10);

        this.recentOrders = recent.map((order) => ({
          id: order.OrderId,
          merchantTradeNo: order.MerchantTradeNo,
          date: order.CreatedDate,
          status: this.translateStatus(order.OrderStatus),
          amount: order.TotalAmount,
          products: order.Details.map((item) => ({
            name: item.ItemName,
            price: item.UnitPrice,
            quantity: item.Quantity,
            image: require("@/assets/image/error.webp"),
          })),
        }));
      } catch (err) {
        console.error("❌ 取得會員訂單失敗", err);
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
          { headers }
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
