<template>
  <div class="member-layout member-customer-portal">
    <!-- 會員中心導覽列：只調整版型，不更動既有會員邏輯 -->
    <header class="member-site-header">
      <div class="member-nav-shell">
        <button class="member-brand" type="button" @click="backhome" :aria-label="$ui('回首頁')">
          <img class="member-brand-logo" src="@/assets/image/logo.webp" alt="YoChung Medical" />
          <span class="member-brand-copy">
            <strong>{{ $ui('會員中心') }}</strong>
            <small>{{ username || $ui('會員') }}</small>
          </span>
        </button>

        <nav class="member-main-nav" :aria-label="$ui('會員中心')">
          <NuxtLink to="/member" class="member-nav-link">
            <i class="fas fa-home"></i>
            <span>{{ $ui('商品推薦') }}</span>
          </NuxtLink>
          <NuxtLink to="/member/orders" class="member-nav-link">
            <i class="fas fa-shopping-bag"></i>
            <span>{{ $ui('我的訂單') }}</span>
          </NuxtLink>
          <NuxtLink to="/member/profile" class="member-nav-link">
            <i class="fas fa-user"></i>
            <span>{{ $ui('個人資料') }}</span>
          </NuxtLink>
        </nav>

        <div class="member-nav-actions">
          <button class="member-nav-action home" type="button" @click="backhome">
            <i class="fas fa-arrow-left"></i>
            <span>{{ $ui('回首頁') }}</span>
          </button>
          <button class="member-nav-action logout" type="button" @click="logout">
            <i class="fas fa-sign-out-alt"></i>
            <span>{{ $ui('登出') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 目前頁面資訊列 -->
    <section class="member-page-banner">
      <div class="member-page-banner-inner">
        <div class="member-page-heading">
          <span class="member-page-kicker">{{ $ui('會員中心') }}</span>
          <h1>{{ $ui(currentPageTitle) }}</h1>
        </div>
        <div class="member-account-chip">
          <span class="member-account-avatar">{{ username.charAt(0) }}</span>
          <span class="member-account-text">
            <strong>{{ username }}</strong>
            <small>{{ $ui('會員') }}</small>
          </span>
        </div>
      </div>
    </section>

    <main class="member-content">
      <div class="member-content-shell">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
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
</script>

<style scoped>
/* 基礎重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.member-layout {
  display: flex;
  min-height: 100vh;
  background-color: #fafafa;
  color: #333;
  font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  width: 100%;
  overflow-x: hidden;
}

.member-sidebar {
  width: clamp(200px, 20vw, 260px);
  background: #ffffff;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  overflow-y: auto;
  z-index: 10;
  flex-shrink: 0;
}

.sidebar-header {
  padding: clamp(1rem, 2vw, 1.5rem) clamp(0.875rem, 1.5vw, 1.25rem);
  border-bottom: 1px solid #f0f0f0;
}

.system-title {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #943F7E;
  margin: 0;
  font-weight: 600;
}

.user-profile {
  padding: clamp(0.875rem, 1.5vw, 1.25rem);
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.avatar {
  width: clamp(2rem, 3vw, 2.5rem);
  height: clamp(2rem, 3vw, 2.5rem);
  background: #943F7E;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  margin-right: clamp(0.5rem, 1vw, 0.75rem);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  margin: 0;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  color: #718096;
  margin: 0;
  font-size: clamp(0.625rem, 0.875vw, 0.75rem);
}

.sidebar-nav {
  flex: 1;
  padding: clamp(0.75rem, 1.25vw, 1rem) 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: clamp(0.625rem, 1vw, 0.75rem) clamp(0.875rem, 1.5vw, 1.25rem);
  color: #4a5568;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
  font-size: clamp(0.95rem, 1.25vw, 1.15rem);
}

.nav-link:hover,
.router-link-exact-active {
  background-color: #c163a81e;
  color: #943F7E;
}







.section-title::after {
  content: "";
  position: absolute;
  bottom: 8px;
  margin-left: 50.8%;
  left: 0;
  width: 65px;
  height: 3px;
  background-color: #943F7E;
  border-radius: 2px;
}

.icon {
  margin-right: clamp(0.5rem, 1vw, 0.75rem);
  width: clamp(1.25rem, 1.75vw, 1.5rem);
  text-align: center;
  flex-shrink: 0;
}

.badge {
  position: absolute;
  right: clamp(0.875rem, 1.5vw, 1.25rem);
  background-color: #e53e3e;
  color: white;
  font-size: clamp(0.5rem, 0.75vw, 0.625rem);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.sidebar-footer {
  padding: clamp(0.875rem, 1.5vw, 1.25rem);
  border-top: 1px solid #f0f0f0;
}

.logout-btn {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.625rem);
  font-size: clamp(0.75rem, 1vw, 0.9375rem);
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #e41e1e;
  color: #ffffff;
}

.logout-btn i {
  margin-right: clamp(0.375rem, 0.75vw, 0.5rem);
}

.back-btn {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.625rem);
  font-size: clamp(0.75rem, 1vw, 0.9375rem);
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.back-btn:hover {
  background-color: #2870ec;
  color: #ffffff;
}

.back-btn i {
  margin-right: clamp(0.375rem, 0.75vw, 0.5rem);
}

.member-content {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  overflow-y: auto;
  max-height: 100vh;
  width: 100%;
  min-width: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

.page-title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  align-items: center;
}

.notifications-btn,
.cart-btn {
  width: clamp(2rem, 3vw, 2.5rem);
  height: clamp(2rem, 3vw, 2.5rem);
  border-radius: 50%;
  background: white;
  border: 1px solid #e2e8f0;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notifications-btn:hover {
  background: #ebf4ff;
  color: #3182ce;
}

.cart-btn:hover {
  background: #ebf4ff;
  color: #3182ce;
}

.notification-badge,
.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e53e3e;
  color: white;
  font-size: clamp(0.5rem, 0.75vw, 0.625rem);
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.back-to-shop-btn {
  padding: clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.75rem, 1.25vw, 1rem);
  background-color: #3182ce;
  border: none;
  border-radius: 6px;
  color: white;
  display: flex;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  cursor: pointer;
  transition: all 0.2s;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  font-weight: 500;
}

.back-to-shop-btn:hover {
  background-color: #2c5282;
}

.content-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: clamp(0.75rem, 2vw, 1.5rem);
  min-height: calc(100vh - 150px);
}

/* 底部導航欄 (手機版) */
.bottom-nav {
  display: none;
}

/* 平板與手機版 RWD */
@media (max-width: 768px) {
  .member-layout {
    flex-direction: column;
    padding-bottom: clamp(3.5rem, 12vw, 4.5rem);
  }

  .member-sidebar {
    display: none;
  }

  .member-content {
    padding: clamp(0.5rem, 2vw, 1rem);
    max-height: none;
    padding-bottom: clamp(4rem, 12vw, 5rem);
  }

  .content-wrapper {
    padding: clamp(0.75rem, 3vw, 1rem);
    min-height: auto;
  }

  /* 底部導航欄顯示 */
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    padding: clamp(0.375rem, 1.5vw, 0.5rem) 0;
    justify-content: space-around;
    align-items: center;
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: #4a5568;
    transition: all 0.3s;
    padding: clamp(0.25rem, 1vw, 0.375rem);
    border: none;
    background: none;
    cursor: pointer;
    flex: 1;
    min-width: 0;
  }

  .bottom-nav-item i {
    font-size: clamp(1.25rem, 5vw, 1.6rem);
    margin-bottom: clamp(0.125rem, 0.5vw, 0.25rem);
  }

  .bottom-nav-item span {
    font-size: clamp(0.95rem, 1.25vw, 1.125rem);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .bottom-nav-item:hover,
  .bottom-nav-active {
    color: #943F7E;
  }

  .bottom-nav-active {
    position: relative;
  }
}
</style>

<style>
/* 會員中心 Nuxt 相容排版修正：只調尺寸與版面，不修改功能 */
.member-layout{font-size:14px!important;background:#f7f8fa!important;}
.member-layout .member-sidebar{width:220px!important;min-width:220px!important;}
.member-layout .sidebar-header{padding:18px 16px!important;}
.member-layout .system-title{font-size:17px!important;line-height:1.4!important;}
.member-layout .user-profile{padding:16px!important;}
.member-layout .avatar{width:38px!important;height:38px!important;font-size:15px!important;margin-right:10px!important;}
.member-layout .user-name{font-size:14px!important;}
.member-layout .user-role{font-size:12px!important;}
.member-layout .sidebar-nav{padding:12px 0!important;}
.member-layout .sidebar-nav .nav-link{padding:12px 18px!important;font-size:14px!important;line-height:1.45!important;}
.member-layout .sidebar-nav .nav-link::after{height:2px!important;width:46px!important;margin-left:auto!important;margin-top:0!important;}
.member-layout .sidebar-footer{padding:14px 16px!important;}
.member-layout .back-btn,.member-layout .logout-btn{min-height:38px!important;padding:8px 12px!important;font-size:13px!important;}
.member-layout .member-content{padding:20px!important;max-height:100vh!important;}
.member-layout .content-wrapper{padding:20px!important;}

/* Dashboard */
.member-layout .member-dashboard{font-size:14px!important;}
.member-layout .stats-grid{gap:16px!important;}
.member-layout .stat-card{min-height:150px!important;padding:18px!important;border-radius:10px!important;}
.member-layout .stat-icon{width:46px!important;height:46px!important;font-size:20px!important;}
.member-layout .stat-title{font-size:13px!important;}
.member-layout .stat-value{font-size:25px!important;line-height:1.15!important;}
.member-layout .view-more-btn{font-size:13px!important;padding:9px 10px!important;}
.member-layout .dashboard-sections{gap:16px!important;}
.member-layout .section{border-radius:10px!important;}
.member-layout .section-header{padding:16px 18px!important;}
.member-layout .section-title{font-size:15px!important;}
.member-layout .recent-orders,.member-layout .recommendations{min-height:360px!important;}
.member-layout .product-grid{gap:14px!important;padding:14px!important;}
.member-layout .product-card{font-size:13px!important;}
.member-layout .product-image{height:180px!important;object-fit:contain!important;}
.member-layout .product-details{padding:12px!important;}
.member-layout .product-name{font-size:13px!important;}
.member-layout .product-price{font-size:15px!important;}
.member-layout .go-to-product,.member-layout .shop-now-btn{font-size:13px!important;padding:9px 14px!important;}

/* Orders */
.member-layout .orders-page .page-title{font-size:22px!important;}
.member-layout .orders-page .page-subtitle{font-size:13px!important;}
.member-layout .filter-section{padding:18px!important;border-radius:10px!important;}
.member-layout .search-input,.member-layout .filter-section .form-control{min-height:40px!important;font-size:13px!important;}
.member-layout .filter-item label{font-size:13px!important;}
.member-layout .orders-list{font-size:13px!important;}
.member-layout .order-card{border-radius:10px!important;}
.member-layout .order-header,.member-layout .order-body,.member-layout .order-footer{padding:16px 18px!important;}
.member-layout .order-number,.member-layout .order-total{font-size:14px!important;}
.member-layout .order-card .product-name{font-size:13px!important;}
.member-layout .order-actions .btn{font-size:13px!important;padding:8px 12px!important;}
.member-layout .empty-title{font-size:16px!important;}
.member-layout .empty-description{font-size:13px!important;}

/* Profile */
.member-layout .profile-page{font-size:14px!important;}
.member-layout .page-tabs{margin-bottom:18px!important;}
.member-layout .tab-btn{padding:9px 16px!important;font-size:14px!important;}
.member-layout .profile-content,.member-layout .activity-content{padding:16px!important;margin-bottom:0!important;}
.member-layout .profile-cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;}
.member-layout .profile-card{border-radius:10px!important;}
.member-layout .card-header{padding:14px 16px!important;}
.member-layout .card-title{font-size:14px!important;}
.member-layout .profile-form{padding:16px!important;}
.member-layout .form-group{margin-bottom:14px!important;}
.member-layout .form-group label{font-size:13px!important;margin-bottom:6px!important;}
.member-layout .form-control{min-height:40px!important;padding:9px 12px!important;font-size:13px!important;}
.member-layout .form-note{font-size:11px!important;}
.member-layout .btn-primary,.member-layout .btn-secondary,.member-layout .btn-primary-1{min-height:40px!important;font-size:13px!important;padding:9px 14px!important;}
.member-layout .password-reset-content{padding:28px 20px!important;gap:14px!important;}
.member-layout .password-icon{width:58px!important;height:58px!important;}
.member-layout .password-desc{font-size:12px!important;}

@media(max-width:1100px){
 .member-layout .member-sidebar{width:200px!important;min-width:200px!important;}
 .member-layout .profile-cards-grid{grid-template-columns:1fr!important;}
 .member-layout .product-image{height:150px!important;}
}
@media(max-width:768px){
 .member-layout .member-content{padding:14px!important;max-height:none!important;}
 .member-layout .stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
 .member-layout .stat-card{min-height:130px!important;}
 .member-layout .bottom-nav-item span{font-size:11px!important;}
 .member-layout .bottom-nav-item i{font-size:18px!important;}
}
@media(max-width:520px){
 .member-layout .stats-grid{grid-template-columns:1fr!important;}
 .member-layout .member-content{padding:10px!important;}
}

/* 我的訂單頁使用滿版內容區，不保留會員主內容外框留白 */
.member-content.is-orders-page {
  padding: 0 !important;
  max-height: none !important;
  overflow-y: auto !important;
  background: #f5f7f8 !important;
}

@media (max-width: 768px) {
  .member-content.is-orders-page {
    padding: 0 !important;
  }
}

/* MEMBER PORTAL SINGLE-PAGE VISUAL 2026 */
.member-layout {
  display: block !important;
  min-height: 100dvh !important;
  width: 100% !important;
  overflow-x: hidden !important;
  background: #f7f9f9 !important;
  color: #183147 !important;
}

.member-sidebar,
.bottom-nav {
  display: none !important;
}

.member-portal-header {
  width: 100% !important;
  background: #fff !important;
  border-bottom: 1px solid #e2e8e9 !important;
}

.member-portal-inner {
  width: min(1440px, calc(100% - 64px)) !important;
  min-height: 128px !important;
  margin: 0 auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 28px !important;
  padding: 24px 0 18px !important;
}

.member-identity {
  min-width: 0 !important;
  display: flex !important;
  align-items: center !important;
  gap: 18px !important;
}

.member-avatar {
  width: 58px !important;
  height: 58px !important;
  flex: 0 0 58px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 18px !important;
  color: #fff !important;
  background: linear-gradient(145deg, #8d317f, #ad4c9d) !important;
  box-shadow: 0 10px 24px rgba(143, 59, 134, .16) !important;
  font-size: 22px !important;
  font-weight: 800 !important;
}

.member-welcome { min-width: 0 !important; }
.member-eyebrow {
  display: block !important;
  margin-bottom: 5px !important;
  color: #31909a !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  letter-spacing: .12em !important;
}
.member-welcome h1 {
  margin: 0 0 6px !important;
  color: #183147 !important;
  font-size: clamp(22px, 2vw, 30px) !important;
  font-weight: 850 !important;
  line-height: 1.25 !important;
}
.member-welcome p {
  margin: 0 !important;
  color: #7b8b94 !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
}

.member-header-actions {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}
.member-action-btn {
  min-height: 40px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 0 15px !important;
  border: 1px solid #dbe4e6 !important;
  border-radius: 10px !important;
  color: #536873 !important;
  background: #fff !important;
  cursor: pointer !important;
  font-size: 12px !important;
  font-weight: 750 !important;
  transition: .2s ease !important;
}
.member-action-btn:hover {
  color: #8f3b86 !important;
  border-color: #d7b7d2 !important;
  background: #fcf8fb !important;
}
.member-action-btn.logout:hover {
  color: #b83d50 !important;
  border-color: #e9c9cf !important;
  background: #fff8f9 !important;
}

.member-tabs {
  width: min(1440px, calc(100% - 64px)) !important;
  margin: 0 auto !important;
  display: flex !important;
  align-items: flex-end !important;
  gap: 36px !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
}
.member-tabs::-webkit-scrollbar { display: none !important; }
.member-tab {
  min-height: 50px !important;
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex: 0 0 auto !important;
  color: #6e7f88 !important;
  text-decoration: none !important;
  font-size: 14px !important;
  font-weight: 750 !important;
  transition: .2s ease !important;
}
.member-tab i { font-size: 13px !important; }
.member-tab:hover { color: #8f3b86 !important; }
.member-tab.router-link-exact-active {
  color: #8f3b86 !important;
  background: transparent !important;
}
.member-tab.router-link-exact-active::after {
  content: '' !important;
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: 3px !important;
  border-radius: 3px 3px 0 0 !important;
  background: #9a3d8d !important;
}

.member-content {
  width: 100% !important;
  max-height: none !important;
  min-height: calc(100dvh - 179px) !important;
  overflow: visible !important;
  padding: 0 !important;
  background: #f7f9f9 !important;
}
.member-content-shell {
  width: min(1440px, calc(100% - 64px)) !important;
  margin: 0 auto !important;
  padding: 28px 0 48px !important;
}

/* 取消先前僅訂單頁使用的後台式滿版特殊外框，三頁回到相同會員中心容器 */
.member-content.is-orders-page {
  padding: 0 !important;
  max-height: none !important;
  overflow: visible !important;
  background: #f7f9f9 !important;
}

/* 商品推薦：保留原 DOM 與資料，只降低後台感 */
.member-content-shell .member-dashboard {
  width: 100% !important;
}
.member-content-shell .stats-grid {
  gap: 14px !important;
  margin-bottom: 22px !important;
}
.member-content-shell .stat-card,
.member-content-shell .section,
.member-content-shell .profile-card {
  border: 1px solid #e1e8e9 !important;
  border-radius: 14px !important;
  box-shadow: 0 5px 18px rgba(27, 50, 64, .04) !important;
}
.member-content-shell .dashboard-sections { gap: 18px !important; }

/* 我的訂單：維持剛完成的內容排版，但置於統一會員容器中 */
.member-content-shell .orders-page {
  border: 1px solid #e1e8e9 !important;
  border-radius: 16px !important;
  overflow: hidden !important;
  background: #fff !important;
  box-shadow: 0 6px 20px rgba(27, 50, 64, .045) !important;
}
.member-content-shell .orders-page .orders-list,
.member-content-shell .orders-page > .empty-state,
.member-content-shell .orders-page .pagination {
  background: #f8fafa !important;
}

/* 個人資料：保留表單與功能，只統一視覺 */
.member-content-shell .profile-page { width: 100% !important; }
.member-content-shell .page-tabs {
  background: #fff !important;
  border: 1px solid #e1e8e9 !important;
  border-radius: 12px !important;
  padding: 0 14px !important;
  margin-bottom: 18px !important;
}
.member-content-shell .profile-content,
.member-content-shell .activity-content {
  background: transparent !important;
  padding: 0 !important;
}

@media (max-width: 900px) {
  .member-portal-inner,
  .member-tabs,
  .member-content-shell {
    width: calc(100% - 32px) !important;
  }
  .member-portal-inner {
    min-height: 112px !important;
    padding: 18px 0 14px !important;
  }
  .member-avatar {
    width: 50px !important;
    height: 50px !important;
    flex-basis: 50px !important;
    border-radius: 15px !important;
    font-size: 18px !important;
  }
  .member-tabs { gap: 26px !important; }
}

@media (max-width: 640px) {
  .member-portal-inner,
  .member-tabs,
  .member-content-shell {
    width: calc(100% - 24px) !important;
  }
  .member-portal-inner {
    align-items: flex-start !important;
    gap: 16px !important;
  }
  .member-avatar {
    width: 44px !important;
    height: 44px !important;
    flex-basis: 44px !important;
    border-radius: 13px !important;
    font-size: 16px !important;
  }
  .member-welcome h1 { font-size: 20px !important; }
  .member-welcome p { font-size: 11px !important; }
  .member-header-actions {
    margin-left: auto !important;
    gap: 6px !important;
  }
  .member-action-btn {
    width: 38px !important;
    min-width: 38px !important;
    height: 38px !important;
    min-height: 38px !important;
    padding: 0 !important;
    border-radius: 10px !important;
  }
  .member-action-btn span { display: none !important; }
  .member-tabs { gap: 24px !important; }
  .member-tab {
    min-height: 46px !important;
    font-size: 13px !important;
  }
  .member-content-shell { padding: 18px 0 32px !important; }
}

/* MEMBER CUSTOMER NAV REDESIGN 2026 */
.member-customer-portal {
  display: block !important;
  min-height: 100dvh !important;
  width: 100% !important;
  background: #f7f9f9 !important;
  color: #173149 !important;
}

.member-site-header {
  position: sticky !important;
  top: 0 !important;
  z-index: 80 !important;
  width: 100% !important;
  background: rgba(255,255,255,.98) !important;
  border-bottom: 1px solid #e3e9ea !important;
  box-shadow: 0 4px 18px rgba(25,48,63,.035) !important;
  backdrop-filter: blur(12px) !important;
}

.member-nav-shell {
  width: min(1480px, calc(100% - 56px)) !important;
  min-height: 78px !important;
  margin: 0 auto !important;
  display: grid !important;
  grid-template-columns: minmax(250px, 1fr) auto minmax(220px, 1fr) !important;
  align-items: center !important;
  gap: 28px !important;
}

.member-brand {
  min-width: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-self: start !important;
  gap: 12px !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  color: inherit !important;
  cursor: pointer !important;
  text-align: left !important;
}
.member-brand-logo {
  width: 46px !important;
  height: 46px !important;
  object-fit: contain !important;
  flex: 0 0 auto !important;
}
.member-brand-copy {
  min-width: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 2px !important;
}
.member-brand-copy strong {
  color: #183147 !important;
  font-size: 18px !important;
  font-weight: 850 !important;
  line-height: 1.25 !important;
  white-space: nowrap !important;
}
.member-brand-copy small {
  max-width: 190px !important;
  overflow: hidden !important;
  color: #788b95 !important;
  font-size: 11px !important;
  font-weight: 650 !important;
  line-height: 1.35 !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.member-main-nav {
  display: flex !important;
  align-items: stretch !important;
  justify-content: center !important;
  gap: 8px !important;
  align-self: stretch !important;
}
.member-nav-link {
  position: relative !important;
  min-width: 112px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 0 14px !important;
  color: #536a76 !important;
  background: transparent !important;
  text-decoration: none !important;
  font-size: 13px !important;
  font-weight: 760 !important;
  transition: color .2s ease, background .2s ease !important;
}
.member-nav-link i {
  color: #8fa0a8 !important;
  font-size: 12px !important;
  transition: color .2s ease !important;
}
.member-nav-link:hover {
  color: #8f3b86 !important;
  background: #fcf8fb !important;
}
.member-nav-link.router-link-exact-active {
  color: #8f3b86 !important;
  background: transparent !important;
}
.member-nav-link.router-link-exact-active i { color: #8f3b86 !important; }
.member-nav-link.router-link-exact-active::after {
  content: '' !important;
  position: absolute !important;
  left: 18px !important;
  right: 18px !important;
  bottom: 0 !important;
  height: 3px !important;
  border-radius: 3px 3px 0 0 !important;
  background: #9a3d8d !important;
}

.member-nav-actions {
  display: flex !important;
  align-items: center !important;
  justify-self: end !important;
  gap: 8px !important;
}
.member-nav-action {
  min-height: 38px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 7px !important;
  padding: 0 13px !important;
  border: 1px solid #dde5e7 !important;
  border-radius: 10px !important;
  background: #fff !important;
  color: #607580 !important;
  cursor: pointer !important;
  font-size: 11px !important;
  font-weight: 760 !important;
  transition: .2s ease !important;
}
.member-nav-action.home:hover {
  border-color: #bad9dc !important;
  background: #f5fbfb !important;
  color: #27828b !important;
}
.member-nav-action.logout:hover {
  border-color: #e6c4dc !important;
  background: #fdf8fc !important;
  color: #943f7e !important;
}

.member-page-banner {
  width: 100% !important;
  background: linear-gradient(180deg,#fff 0%,#fbfcfc 100%) !important;
  border-bottom: 1px solid #e7ecee !important;
}
.member-page-banner-inner {
  width: min(1440px, calc(100% - 64px)) !important;
  min-height: 112px !important;
  margin: 0 auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 24px !important;
  padding: 20px 0 !important;
}
.member-page-kicker {
  display: block !important;
  margin-bottom: 5px !important;
  color: #31909a !important;
  font-size: 10px !important;
  font-weight: 850 !important;
  letter-spacing: .16em !important;
}
.member-page-heading h1 {
  margin: 0 !important;
  color: #173149 !important;
  font-size: clamp(23px, 2vw, 31px) !important;
  font-weight: 850 !important;
  line-height: 1.2 !important;
}
.member-account-chip {
  min-width: 180px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  gap: 10px !important;
}
.member-account-avatar {
  width: 38px !important;
  height: 38px !important;
  display: grid !important;
  place-items: center !important;
  border-radius: 50% !important;
  background: #f5eaf3 !important;
  color: #943f7e !important;
  font-size: 14px !important;
  font-weight: 850 !important;
}
.member-account-text {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
}
.member-account-text strong {
  max-width: 160px !important;
  overflow: hidden !important;
  color: #294354 !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
.member-account-text small {
  color: #93a0a7 !important;
  font-size: 10px !important;
}

.member-content {
  width: 100% !important;
  max-height: none !important;
  min-height: calc(100dvh - 190px) !important;
  overflow: visible !important;
  padding: 0 !important;
  background: #f7f9f9 !important;
}
.member-content-shell {
  width: min(1440px, calc(100% - 64px)) !important;
  margin: 0 auto !important;
  padding: 28px 0 48px !important;
}

/* 舊會員入口版型不再顯示 */
.member-portal-header,
.member-tabs,
.member-sidebar,
.bottom-nav { display: none !important; }

@media (max-width: 1120px) {
  .member-nav-shell {
    width: calc(100% - 36px) !important;
    grid-template-columns: minmax(210px, .9fr) auto auto !important;
    gap: 14px !important;
  }
  .member-main-nav { gap: 2px !important; }
  .member-nav-link {
    min-width: 96px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
  }
  .member-nav-action span { display: none !important; }
  .member-nav-action {
    width: 38px !important;
    min-width: 38px !important;
    padding: 0 !important;
  }
}

@media (max-width: 760px) {
  .member-site-header { position: relative !important; }
  .member-nav-shell {
    width: 100% !important;
    min-height: 0 !important;
    grid-template-columns: 1fr auto !important;
    gap: 0 !important;
  }
  .member-brand {
    min-height: 64px !important;
    padding: 8px 14px !important;
  }
  .member-brand-logo { width: 38px !important; height: 38px !important; }
  .member-brand-copy strong { font-size: 15px !important; }
  .member-brand-copy small { max-width: 135px !important; font-size: 9px !important; }
  .member-nav-actions {
    padding-right: 12px !important;
    gap: 6px !important;
  }
  .member-nav-action {
    width: 36px !important;
    min-width: 36px !important;
    height: 36px !important;
    min-height: 36px !important;
    border-radius: 9px !important;
  }
  .member-main-nav {
    grid-column: 1 / -1 !important;
    width: 100% !important;
    min-height: 48px !important;
    justify-content: flex-start !important;
    overflow-x: auto !important;
    border-top: 1px solid #eef2f3 !important;
    scrollbar-width: none !important;
  }
  .member-main-nav::-webkit-scrollbar { display: none !important; }
  .member-nav-link {
    min-width: max-content !important;
    min-height: 48px !important;
    padding: 0 20px !important;
    flex: 0 0 auto !important;
  }
  .member-page-banner-inner,
  .member-content-shell { width: calc(100% - 28px) !important; }
  .member-page-banner-inner {
    min-height: 88px !important;
    padding: 15px 0 !important;
  }
  .member-page-heading h1 { font-size: 22px !important; }
  .member-account-chip { min-width: 0 !important; }
  .member-account-text { display: none !important; }
  .member-content-shell { padding: 18px 0 34px !important; }
}

@media (max-width: 420px) {
  .member-brand-copy small { display: none !important; }
  .member-account-chip { display: none !important; }
  .member-page-banner-inner { justify-content: flex-start !important; }
}
</style>
