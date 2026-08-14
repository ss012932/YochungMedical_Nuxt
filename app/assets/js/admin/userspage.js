import api from "@/assets/js/api.js";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      searchQuery: "",
      roleFilter: "",
      statusFilter: "",
      sortOption: "nameAsc",
      currentPage: 1,
      itemsPerPage: 7,
      showCreateModal: false,
      showPasswordModal: false,
      isEditing: false,
      selectedUser: {},
      showUserModal: false,

      editForm: {
        name: "",
        role: "",
        status: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      },

      createForm: {
        account: "",
        name: "",
        role: "member",
        status: "active",
        password: "",
        passwordConfirm: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      },

      users: [],

      // 新增屬性：追蹤重設密碼的用戶
      resetPasswordStatus: {}, // 用來記錄各用戶重設密碼的狀態 (key: userId, value: { lastSent, status })
    };
  },
  mounted() {
    this.fetchUsers(); // 組件掛載時抓資料
  },
  computed: {
    totalUsers() {
      return this.users.length;
    },
    adminUsers() {
      return this.users.filter((user) => user.role === "admin").length;
    },
    memberUsers() {
      return this.users.filter((user) => user.role === "member").length;
    },
    filteredUsers() {
      let result = [...this.users];

      // 搜尋條件
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.account.toLowerCase().includes(query) ||
            (user.phone &&
              user.phone
                .replace(/[- ]/g, "")
                .includes(query.replace(/[- ]/g, ""))) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
      }

      // 角色過濾
      if (this.roleFilter) {
        result = result.filter((user) => user.role === this.roleFilter);
      }

      // 狀態過濾
      if (this.statusFilter) {
        result = result.filter((user) => user.status === this.statusFilter);
      }

      // 排序
      switch (this.sortOption) {
        case "nameAsc":
          result.sort((a, b) => {
            const nameA = a.name || "";
            const nameB = b.name || "";
            return nameA.localeCompare(nameB);
          });
          break;
        case "nameDesc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "recent":
          result.sort(
            (a, b) => new Date(b.registerDate) - new Date(a.registerDate)
          );
          break;
        case "oldest":
          result.sort(
            (a, b) => new Date(a.registerDate) - new Date(b.registerDate)
          );
          break;
        case "lastLogin":
          result.sort((a, b) => {
            if (!a.lastLogin) return 1;
            if (!b.lastLogin) return -1;
            return new Date(b.lastLogin) - new Date(a.lastLogin);
          });
          break;
      }

      // 分頁
      const startIdx = (this.currentPage - 1) * this.itemsPerPage;
      const endIdx = startIdx + this.itemsPerPage;

      return result.slice(startIdx, endIdx);
    },
    totalFilteredUsers() {
      let result = [...this.users];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.account.toLowerCase().includes(query) ||
            (user.phone &&
              user.phone
                .replace(/[- ]/g, "")
                .includes(query.replace(/[- ]/g, ""))) ||
            (user.email && user.email.toLowerCase().includes(query))
        );
      }

      if (this.roleFilter) {
        result = result.filter((user) => user.role === this.roleFilter);
      }

      if (this.statusFilter) {
        result = result.filter((user) => user.status === this.statusFilter);
      }

      return result.length;
    },
    totalPages() {
      return Math.ceil(this.totalFilteredUsers / this.itemsPerPage);
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
    getResetPasswordTitle(user) {
      if (!user.passwordResetSent) {
        return "尚未寄送重設密碼"; // 如果沒紀錄寄送時間
      }

      const timeAgo = this.getTimeAgo(user.passwordResetSent); // 利用你已有的函數
      return `已寄送 (${timeAgo})`; // 顯示多久前寄送
    },

    async fetchUsers() {
      try {
        const response = await api.get("/members/all"); // 後端 API
        const rawUsers = response.data;

        // ✨ 轉換格式讓前端能正常渲染
        this.users = rawUsers.map((u, index) => ({
          id: index + 1, // 若後端沒回傳 id 就用 index 當唯一值
          account: u.Username,
          name: u.FullName || u.Username,
          email: u.Email,
          phone: u.Phone || "",
          address: u.Address || "",
          role: u.Admin ? "admin" : "member", // 轉成前端可用格式
          status: u.Locked ? "suspended" : "active", // locked 對應狀態
          registerDate: u.CreatedDate,
          lastLogin: null, // 如果你之後有記錄登入時間再補上
          lastLoginIP: null,
          loginCount: 0,
          notes: "",
        }));
      } catch (error) {
        console.error("取得用戶失敗", error);
        this.users = [];
      }
    },
    formatDate(dateString) {
      if (!dateString) return "未記錄";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    formatDateTime(dateString) {
      if (!dateString) return "未記錄";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    getTimeAgo(dateString) {
      if (!dateString) return "";

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffDay > 30) {
        return `${Math.floor(diffDay / 30)} 個月前`;
      } else if (diffDay > 0) {
        return `${diffDay} 天前`;
      } else if (diffHour > 0) {
        return `${diffHour} 小時前`;
      } else if (diffMin > 0) {
        return `${diffMin} 分鐘前`;
      } else {
        return "剛剛";
      }
    },
    getInitials(name) {
      if (!name) return "";
      return name.charAt(0).toUpperCase();
    },
    getStatusClass(status) {
      switch (status) {
        case "active":
          return "active";
        case "inactive":
          return "inactive";
        case "suspended":
          return "suspended";
        default:
          return "";
      }
    },
    getStatusLabel(status) {
      switch (status) {
        case "active":
          return "啟用中";

        case "suspended":
          return "已停權";
        default:
          return status;
      }
    },
    resetPage() {
      this.currentPage = 1;
    },
    clearSearch() {
      this.searchQuery = "";
      this.resetPage();
    },
    resetFilters() {
      this.searchQuery = "";
      this.roleFilter = "";
      this.statusFilter = "";
      this.sortOption = "nameAsc";
      this.currentPage = 1;
    },
    goToPage(page) {
      this.currentPage = page;
    },
    viewUserDetails(user) {
      this.selectedUser = JSON.parse(JSON.stringify(user));
      this.isEditing = false;
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
      this.isEditing = false;
    },
    startEditing() {
      this.editForm = {
        account: this.selectedUser.account, //帳號
        name: this.selectedUser.name,
        role: this.selectedUser.role,
        status: this.selectedUser.status,
        email: this.selectedUser.email,
        phone: this.selectedUser.phone || "",
        address: this.selectedUser.address || "",
        notes: this.selectedUser.notes || "",
      };
      this.isEditing = true;
    },
    cancelEditing() {
      this.isEditing = false;
    },
    async saveUserChanges() {
      // 檢查必要欄位
      if (!this.editForm.name || !this.editForm.email) {
        alert("姓名和電子郵件為必填欄位");
        return;
      }

      try {
        // 組成送給後端的物件格式
        const updatePayload = {
          Username: this.editForm.account, // 主鍵，不能改
          FullName: this.editForm.name,
          Email: this.editForm.email,
          Phone: this.editForm.phone || null,
          Address: this.editForm.address || null,
          Locked: this.editForm.status === "suspended", // status 轉換為 Locked boolean
          Admin: this.editForm.role === "admin", // role 轉換為 Admin boolean
        };

        // 呼叫後端 API
        await api.put("/members/update", updatePayload);

        // 更新前端資料
        const index = this.users.findIndex(
          (u) => u.account === this.editForm.account
        );
        if (index !== -1) {
          this.users[index] = {
            ...this.users[index],
            name: this.editForm.name,
            email: this.editForm.email,
            phone: this.editForm.phone,
            address: this.editForm.address,
            role: this.editForm.role,
            status: this.editForm.status,
          };
        }

        // ✅ 同時更新 selectedUser，避免畫面不一致
        this.selectedUser = {
          ...this.selectedUser,
          name: this.editForm.name,
          email: this.editForm.email,
          phone: this.editForm.phone,
          address: this.editForm.address,
          role: this.editForm.role,
          status: this.editForm.status,
        };
        this.isEditing = false;
        Swal.fire({
          icon: "success",
          title: "更新成功",
          text: "用戶資料已成功更新",
        });
        this.isEditing = false;
      } catch (error) {
        console.error("更新用戶失敗", error);
        Swal.fire({
          icon: "error",
          title: "更新失敗",
          text: "請稍後再試",
        });
      }
    },
    openCreateUserModal() {
      this.createForm = {
        account: "",
        name: "",
        role: "member",
        status: "active",
        password: "",
        passwordConfirm: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      };
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    async createUser() {
      console.log("帳號：", this.createForm.account);
      console.log("密碼：", this.createForm.password);

      if (
        !this.createForm.account ||
        !this.createForm.name ||
        !this.createForm.email ||
        !this.createForm.password
      ) {
        Swal.fire({
          icon: "warning",
          title: "資料不完整",
          text: "請填寫所有必填欄位",
        });
        return;
      }

      if (this.createForm.password !== this.createForm.passwordConfirm) {
        Swal.fire({
          icon: "error",
          title: "密碼不一致",
          text: "兩次輸入的密碼不一致",
        });
        return;
      }

      try {
        const payload = {
          Username: this.createForm.account,
          PasswordHash: this.createForm.password,
          Email: this.createForm.email,
          FullName: this.createForm.name,
          Phone: this.createForm.phone || null,
          Address: this.createForm.address || null,
          Locked: this.createForm.status === "suspended",
          Admin: this.createForm.role === "admin",
        };

        const res = await api.post("/members/create", payload);

        Swal.fire({
          icon: "success",
          title: "創建成功",
          text: res.data.message || "用戶創建成功",
        });

        this.showCreateModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error("創建用戶失敗", error);
        let msg =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          "請稍後再試";
        Swal.fire({
          icon: "error",
          title: "創建失敗",
          text: msg,
        });
      }
    },
    async toggleUserStatus(user) {
      const index = this.users.findIndex((u) => u.id === user.id);
      if (index === -1) return;

      // 切換狀態（前端顯示用）
      const newStatus = user.status === "active" ? "suspended" : "active";

      // 組更新 payload，跟後端一致
      const updatePayload = {
        Username: user.account,
        FullName: user.name,
        Email: user.email,
        Phone: user.phone || null,
        Address: user.address || null,
        Locked: newStatus === "suspended",
        Admin: user.role === "admin",
      };

      try {
        // 呼叫後端 API 更新 Locked 狀態
        await api.put("/members/update", updatePayload);

        // 更新前端狀態
        this.users[index].status = newStatus;

        if (this.showUserModal && this.selectedUser.id === user.id) {
          this.selectedUser.status = newStatus;
        }

        Swal.fire({
          icon: "success",
          title: "狀態更新成功",
          text: `用戶 ${user.name} 已${
            newStatus === "suspended" ? "停權" : "啟用"
          }`,
        });
      } catch (error) {
        console.error("切換狀態失敗", error);
        Swal.fire({
          icon: "error",
          title: "操作失敗",
          text: "切換狀態失敗，請稍後再試",
        });
      }
    },

    async resetPassword(user) {
      if (!user.email) {
        Swal.fire({
          icon: "error",
          title: "無法發送重設密碼郵件",
          text: "該用戶沒有登記電子郵件地址",
          confirmButtonText: "確定",
        });
        return;
      }

      this.resetPasswordStatus[user.id] = {
        ...(this.resetPasswordStatus[user.id] || {}),
        sending: true,
      };

      const result = await Swal.fire({
        icon: "question",
        title: "發送重設密碼郵件",
        html: `
          <div style="text-align: left; margin-bottom: 20px;">
            <p>確定要發送重設密碼郵件給以下用戶？</p>
            <div style="padding: 10px; background: #f8f9fa; border-radius: 4px; margin-top: 10px;">
              <p><strong>用戶:</strong> ${user.name}</p>
              <p><strong>帳號:</strong> ${user.account}</p>
              <p><strong>郵箱:</strong> ${user.email}</p>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "發送郵件",
        cancelButtonText: "取消",
        confirmButtonColor: "#2c5282",
        cancelButtonColor: "#718096",
      });

      if (!result.isConfirmed) {
        this.resetPasswordStatus[user.id] = {
          ...(this.resetPasswordStatus[user.id] || {}),
          sending: false,
        };
        return;
      }

      try {
        Swal.fire({
          title: "處理中...",
          html: "正在發送重設密碼郵件",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const payload = {
          email: user.email, // ⚠️ 只傳 email
        };

        const response = await api.post("/reset-password/request", payload);

        // ✅ 修正：只要回傳 200 且有資料就當成功
        if (response.status === 200 && response.data) {
          Swal.fire({
            icon: "success",
            title: "郵件已發送",
            text: `重設密碼郵件已發送至 ${user.email}`,
            confirmButtonText: "確定",
          });

          const index = this.users.findIndex((u) => u.id === user.id);
          if (index !== -1) {
            this.users[index].passwordResetSent = new Date().toISOString();
          }

          this.resetPasswordStatus[user.id] = {
            lastSent: new Date().toISOString(),
            status: "sent",
            sending: false,
          };
        } else {
          throw new Error(response.data.message || "郵件發送失敗");
        }
      } catch (error) {
        console.error("❌ [resetPassword] error:", error);
        console.error("📨 [resetPassword] API response error:", error.response);

        Swal.fire({
          icon: "error",
          title: "發送失敗",
          text:
            error.response?.data?.message || "無法發送重設密碼郵件，請稍後再試",
          confirmButtonText: "確定",
        });

        this.resetPasswordStatus[user.id] = {
          lastSent: new Date().toISOString(),
          status: "error",
          sending: false,
          errorMessage: error.response?.data?.message || "未知錯誤",
        };
      }
    },

    // 新增驗證 Token 的方法
    async validateResetToken(token) {
      try {
        const response = await api.post("/reset-password/validate-token", {
          token: token,
        });

        return {
          success: response.data && response.data.success,
          message: response.data?.message,
          username: response.data?.username,
          email: response.data?.email,
        };
      } catch (error) {
        console.error("驗證重設密碼 Token 失敗", error);
        return {
          success: false,
          message:
            error.response?.data?.message || "無效或已過期的重設密碼連結",
        };
      }
    },

    // 新增執行重設密碼的方法
    async confirmResetPassword(token, newPassword) {
      try {
        const response = await api.post("/reset-password/confirm", {
          token: token,
          newPassword: newPassword,
        });

        return {
          success: response.data && response.data.success,
          message: response.data?.message,
        };
      } catch (error) {
        console.error("重設密碼失敗", error);
        return {
          success: false,
          message: error.response?.data?.message || "重設密碼失敗，請稍後再試",
        };
      }
    },

    exportUsers() {
      if (this.users.length === 0) {
        Swal.fire({
          icon: "info",
          title: "沒有可匯出的用戶資料",
          confirmButtonText: "確定",
        });
        return;
      }

      const headers = [
        "帳號",
        "姓名",
        "電子郵件",
        "電話",
        "地址",
        "角色",
        "狀態",
        "註冊日期",
      ];
      const rows = this.users.map((user) => [
        user.account,
        user.name,
        user.email || "",
        user.phone || "",
        user.address || "",
        user.role === "admin" ? "管理員" : "會員",
        this.getStatusLabel(user.status),
        this.formatDate(user.registerDate),
      ]);

      // ✨ 加上 UTF-8 BOM
      const bom = "\uFEFF";

      const csvContent = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${(value || "").toString().replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([bom + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute(
        "download",
        `Member_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: "success",
        title: "匯出成功",
        text: "用戶資料已匯出為 CSV 檔案",
        confirmButtonText: "確定",
      });
    },
  },
};
