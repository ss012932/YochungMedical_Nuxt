import { useState } from "#app";
import api from "@/assets/js/api"; // 你原本就有這行
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  data() {
    return {
      username: "", // 用來存放 FullName
      memberId: null, // 從 JWT 拿到的 ID
      allMembers: [], // 儲存 API 回傳的會員清單,
      unreadMessages: 3,
      cartItemsCount: 2,
      pageMapping: {
        "/member": "會員首頁",
        "/member/orders": "我的訂單",
        "/member/favorites": "收藏商品",
        "/member/profile": "個人資料",
        "/member/messages": "訊息中心",
        "/member/addresses": "地址管理",
        "/member/password": "修改密碼",
      },
      isSidebarOpen: false, // 用於控制側邊欄在手機版的顯示狀態
    };
  },
  computed: {
    currentPageTitle() {
      return this.pageMapping[this.$route.path] || "會員中心";
    },
  },

  mounted() {
    this.fetchCurrentUser();
    this.checkScreenSize(); // 檢查螢幕尺寸
    window.addEventListener("resize", this.checkScreenSize); // 監聽螢幕尺寸變化
  },

  beforeDestroy() {
    // 移除事件監聽器
    window.removeEventListener("resize", this.checkScreenSize);
  },

  methods: {
    async fetchCurrentUser() {
      try {
        const res = await api.get("/auth/me");

        if (res.data?.authenticated) {
          this.username = res.data.name; // ✅ 直接顯示名字
          this.memberId = res.data.id;
        } else {
          this.username = "訪客";
        }
      } catch (err) {
        console.error("❌ 取得目前登入者失敗", err);
        this.username = "訪客";
      }
    },

    // 檢查螢幕尺寸並設置側邊欄狀態
    checkScreenSize() {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false; // 大螢幕默認不顯示遮罩
        document.body.style.overflow = ""; // 恢復捲動
      }
    },

    // 切換側邊欄開關
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
      if (this.isSidebarOpen) {
        document.body.style.overflow = "hidden"; // 防止背景捲動
      } else {
        document.body.style.overflow = ""; // 恢復捲動
      }
    },

    // 關閉側邊欄
    closeSidebar() {
      this.isSidebarOpen = false;
      document.body.style.overflow = ""; // 恢復捲動
    },

    // 在手機模式下點擊導航項後自動關閉側邊欄
    closeSidebarOnMobile() {
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    },

    backhome() {
      this.$router.push("/");
    },

    async logout() {
      try {
        // ✅ 1️⃣ 呼叫後端清除 HttpOnly Cookie
        await api.post("/logout");

        // ✅ 2️⃣ 顯示 SweetAlert
        await Swal.fire({
          icon: "success",
          title: "已成功登出",
          text: "您已成功登出系統",
          showConfirmButton: false,
          timer: 1200,
          timerProgressBar: true,
        });

        // ✅ 3️⃣ 導回首頁並刷新
        // 同步 Header 共用登入狀態，避免切換 layout 時導覽文字短暫消失。
        useState("header-is-logged-in", () => false).value = false;
        useState("header-auth-checked", () => false).value = true;
        useState("header-is-admin", () => false).value = false;
        useState("header-user-name", () => "").value = "";
        this.$router.push("/");
      } catch (err) {
        console.error("❌ 登出失敗", err);

        await Swal.fire({
          icon: "error",
          title: "登出失敗",
          text: "請稍後再試",
        });
      }
    },
    goToMessages() {
      this.$router.push("/member/messages");
    },
    goToCart() {
      this.$router.push("/shop/cart");
    },
    goToShop() {
      this.$router.push("/shop");
    },
  },
  watch: {
    $route() {
      // 路由變化時自動關閉側邊欄(手機版)
      if (window.innerWidth <= 768) {
        this.closeSidebar();
      }
    },
  },
};
