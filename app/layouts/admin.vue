<template>
  <div
    class="admin-layout"
    :class="{ 'products-admin-layout': $route.path === '/admin/products' }"
  >
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2 class="system-title">後台管理</h2>
      </div>
      <div class="user-profile">
        <div class="avatar">{{ fullName ? fullName.charAt(0) : "?" }}</div>

        <div class="user-info">
          <p class="user-name">{{ fullName }}</p>
          <p class="user-role">管理員</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li>
            <NuxtLink
              to="/admin"
              class="nav-link"
              
             
            >
              <i class="icon fas fa-chart-line"></i>
              <span>儀表板</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/products" class="nav-link">
              <i class="icon fas fa-pills"></i>
              <span>商品管理</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/orders" class="nav-link">
              <i class="icon fas fa-clipboard-list"></i>
              <span>訂單管理</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/admin/users" class="nav-link">
              <i class="icon fas fa-users"></i>
              <span>用戶管理</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <button class="back-btn" @click="backhome">
          <i class="fas fa-home"></i>
          <span>回主頁</span>
        </button>
        <button class="logout-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i>
          <span>登出</span>
        </button>
      </div>
    </aside>

    <main class="admin-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script>
import { useState } from "#app";
import api from "@/assets/js/api.js";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      username: "",
      fullName: "",
      currentPageTitle: "儀表板",
    };
  },
  mounted() {
    this.fetchCurrentAdmin();
  },
  methods: {
    // 登出
    async logout() {
      try {
        await api.post("/logout");

        await Swal.fire({
          icon: "success",
          title: "已登出",
          timer: 1000,
          showConfirmButton: false,
        });

        // 同步 Header 共用登入狀態，避免切換 layout 時導覽文字短暫消失。
        useState("header-is-logged-in", () => false).value = false;
        useState("header-auth-checked", () => false).value = true;
        useState("header-is-admin", () => false).value = false;
        useState("header-user-name", () => "").value = "";
        this.$router.push("/");
      } catch (err) {
        console.error("登出失敗", err);
      }
    },

    backhome() {
      this.$router.push("/");
    },

    async fetchCurrentAdmin() {
      try {
        const res = await api.get("/auth/me");

        if (!res.data?.authenticated) {
          throw new Error("未登入");
        }

        // ✅ JWT 裡的 name
        this.fullName = res.data.name || "管理員";
      } catch (err) {
        console.error("❌ 取得管理員資訊失敗", err);

        await Swal.fire({
          icon: "error",
          title: "登入已失效",
          text: "請重新登入",
        });

        this.$router.push("/login");
      }
    },
  },
  watch: {
    $route(to) {
      // 根據路由更新頁面標題
      const routeMap = {
        "/admin": "儀表板",
        "/admin/products": "商品管理",
        "/admin/orders": "訂單管理",
        "/admin/users": "用戶管理",
      };
      this.currentPageTitle = routeMap[to.path] || "醫療管理系統";
    },
  },
};
</script>

<style scoped>
.admin-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f5f7fa;
    color: #333;
    font-family: "Noto Sans TC", "Microsoft JhengHei", sans-serif;
  }
  
  .admin-sidebar {
    width: 260px;
    background: #fff;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    top: 0;
    bottom: 0;  /* 從頂部到底部 */
    left: 0;
    overflow-y: auto;
    z-index: 10;
  }

  
  
  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .system-title {
    font-size: 20px;
    color: #2c5282;
    margin: 0;
    font-weight: 600;
  }
  
  .user-profile {
    padding: 20px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
    background: #2c5282;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    margin-right: 12px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-name {
    font-weight: 600;
    margin: 0;
    font-size: 14px;
  }
  
  .user-role {
    color: #718096;
    margin: 0;
    font-size: 12px;
  }
  
  .sidebar-nav {
    flex: 1;
    padding: 16px 0;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #4a5568;
    text-decoration: none;
    transition: all 0.3s;
    font-weight: 500;
  }
  
  .nav-link:hover, .router-link-active {
    background-color: #ebf4ff;
    color: #2c5282;
    border-left: 3px solid #2c5282;
  }
  
  .icon {
    margin-right: 12px;
    width: 24px;
    text-align: center;
  }
  
  .sidebar-footer {
    padding: 20px;
    border-top: 1px solid #f0f0f0;
  }
  
  .logout-btn {
    width: 100%;
    padding: 10px;
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
    background-color: #fed7d7;
    color: #c53030;
  }
  
  .logout-btn i {
    margin-right: 8px;
  }

  .back-btn {
    width: 100%;
    padding: 10px;
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
    background-color: #c8d3e6;
    color: #000000;
  }
  
  .back-btn i {
    margin-right: 8px;
  }
  
  .admin-content {
    flex: 1;
    min-width: 0;
    padding: 24px;
    background: #f5f7fa;
    box-sizing: border-box;
  }
  
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .notifications-btn, .settings-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    border: 1px solid #e2e8f0;
    color: #4a5568;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .notifications-btn:hover, .settings-btn:hover {
    background: #ebf4ff;
    color: #2c5282;
  }
  
  /*
    功能：Layout 只提供後台頁面的統一留白，不再額外包一張大白色卡片。
    真正需要白底、圓角、陰影的區域由各頁自己的表格/卡片控制。
  */
  .content-wrapper {
    width: 100%;
    min-width: 0;
    min-height: calc(100vh - 48px);
    padding: 0;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    box-sizing: border-box;
  }

  /*
    功能：orders/products 原本自己又加了一層外距；
    由 admin layout 統一提供 24px 後，移除重複 padding，讓四個後台頁面對齊。
  */
  .content-wrapper :deep(.orders-page),
  .content-wrapper :deep(.products-page) {
    padding: 0 !important;
  }

  /* 功能：所有後台頁面的根節點都填滿可用內容寬度，不額外形成置中的容器。 */
  .content-wrapper :deep(.dashboard),
  .content-wrapper :deep(.orders-page),
  .content-wrapper :deep(.products-page),
  .content-wrapper :deep(.users-page) {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    box-sizing: border-box;
  }
  
  /* ============================================================
     商品管理頁捲動規則
     功能：商品管理時鎖住整個後台 Layout，只讓右側內容區上下捲動。
     左側 Sidebar 保持在視窗內，不會跟著商品列表上下移動。
  ============================================================ */
  .admin-layout.products-admin-layout {
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
  }

  .products-admin-layout .admin-sidebar {
    height: 100vh;
    flex: 0 0 260px;
    overflow: hidden;
  }

  .products-admin-layout .admin-content {
    height: 100vh;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scrollbar-gutter: stable;
  }

  .products-admin-layout .content-wrapper {
    min-height: auto;
  }

  @media screen and (max-width: 768px) {
    .admin-content {
      padding: 16px;
    }

    .content-wrapper {
      min-height: calc(100vh - 32px);
    }

    .admin-sidebar {
      width: 80px;
      overflow-x: hidden;
    }

    /* 功能：小螢幕若側欄內容超過視窗，保留側欄自身的可操作性。 */
    .products-admin-layout .admin-sidebar {
      flex-basis: 80px;
      overflow-y: auto;
    }
    
    .admin-sidebar:hover {
      width: 260px;
    }
    
    .system-title, .user-info, .nav-link span, .logout-btn span {
      transition: opacity 0.3s;
      opacity: 0;
    }
    
    .admin-sidebar:hover .system-title,
    .admin-sidebar:hover .user-info,
    .admin-sidebar:hover .nav-link span,
    .admin-sidebar:hover .logout-btn span {
      opacity: 1;
    }
  }
</style>
