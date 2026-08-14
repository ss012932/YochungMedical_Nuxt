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
