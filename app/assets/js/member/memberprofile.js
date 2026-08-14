import api from "@/assets/js/api"; // axios 模組
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  data() {
    return {
      activeTab: "profile", // 頁籤控制
      previewImage: null, // 頭像預覽
      initialProfileData: {}, // 原始個資資料備份
      profileData: {
        account: "",
        email: "",
        name: "",
        address: "",
        phone: "",
        avatar: null,
      },
      notification: {
        show: false,
        type: "success",
        message: "",
        timer: null,
      },
      // 密碼修改資料
      passwordData: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      passwordRequirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
      // 登入活動記錄
      activityFilter: {
        period: "30",
        status: "all",
      },
      currentPage: 1,
      itemsPerPage: 5,
      loginActivities: [], // 登入資料將從 API 接收或手動加入
    };
  },

  mounted() {
    this.loadProfileFromToken(); // 載入個人資料
    this.loadLoginActivities();
  },

  computed: {
    // 密碼強度指標
    passwordStrength() {
      const requirementCount = Object.values(this.passwordRequirements).filter(
        Boolean
      ).length;
      switch (requirementCount) {
        case 0:
        case 1:
          return { percentage: 20, class: "weak", text: "弱" };
        case 2:
        case 3:
          return { percentage: 50, class: "medium", text: "中" };
        case 4:
          return { percentage: 80, class: "strong", text: "強" };
        case 5:
          return { percentage: 100, class: "very-strong", text: "非常強" };
        default:
          return { percentage: 0, class: "", text: "" };
      }
    },
    // 密碼是否一致
    passwordsMatch() {
      return (
        this.passwordData.newPassword &&
        this.passwordData.confirmPassword &&
        this.passwordData.newPassword === this.passwordData.confirmPassword
      );
    },
    // 密碼驗證是否通過
    passwordValidationPassed() {
      const r = this.passwordRequirements;
      return (
        r.length &&
        r.uppercase &&
        r.lowercase &&
        r.number &&
        r.special &&
        this.passwordsMatch &&
        this.passwordData.currentPassword
      );
    },
    // 篩選後登入紀錄（含時間/狀態）
    filteredActivities() {
      const { period, status } = this.activityFilter;
      const cutoffDate = new Date(); // 目前時間

      // ⭐ 關鍵：判斷是否為「今天」
      if (parseInt(period) === 0) {
        // 區域：今天 → 從今天 00:00 開始
        cutoffDate.setHours(0, 0, 0, 0);
      } else {
        // 區域：最近 N 天
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
      }

      return (
        this.loginActivities
          // 區域：時間過濾
          .filter((a) => new Date(a.timestamp) >= cutoffDate)

          // 區域：狀態過濾（all / Success / Failed）
          .filter((a) => status === "all" || a.status === status)

          // 區域：分頁處理
          .slice(
            (this.currentPage - 1) * this.itemsPerPage,
            this.currentPage * this.itemsPerPage
          )
      );
    },
    // 分頁計算
    totalPages() {
      const { period, status } = this.activityFilter;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));

      const count = this.loginActivities
        .filter((a) => new Date(a.timestamp) >= cutoffDate)
        .filter((a) => status === "all" || a.status === status).length;

      return Math.ceil(count / this.itemsPerPage);
    },
    // 分頁顯示頁數
    displayedPages() {
      const pages = [];
      const max = this.totalPages;
      const curr = this.currentPage;

      const start = Math.max(1, curr - 1);
      const end = Math.min(max, curr + 1);

      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    },
  },

  created() {
    this.initialProfileData = JSON.parse(JSON.stringify(this.profileData)); // 儲存原始資料
  },

  methods: {
    async sendResetPasswordEmail() {
      try {
        const payload = {
          email: this.profileData.email, // 用登入者的 email
        };
        console.log("📨 發送密碼重設 email：", payload);

        const res = await api.post("/reset-password/request?", payload);

        if (res.status === 200) {
          this.showNotification("success", "已成功寄出密碼重設信件！");
        } else {
          this.showNotification("error", "寄送失敗，請稍後再試");
        }
      } catch (err) {
        console.error("❌ 發送密碼重設信失敗", err.response || err);
        this.showNotification("error", "伺服器錯誤，請聯繫管理員");
      }
    },

    // 解析 token 並載入會員資料
    async loadProfileFromToken() {
      try {
        const res = await api.get("/members/me");

        const member = res.data;

        // 🔧 關鍵：同時支援 PascalCase / camelCase
        this.profileData.account = member.username ?? member.Username ?? "";

        this.profileData.email = member.email ?? member.Email ?? "";

        this.profileData.name = member.fullName ?? member.FullName ?? "";

        this.profileData.phone = member.phone ?? member.Phone ?? "";

        this.profileData.address = member.address ?? member.Address ?? "";

        this.profileData.avatar = null;
      } catch (err) {
        console.error("❌ 載入會員資料失敗", err);
        await Swal.fire({
          icon: "error",
          title: "載入失敗",
          text: "無法取得會員資料，請重新登入",
          confirmButtonText: "確定",
        });
      }
    },
    getInitials(name) {
      return name ? name.charAt(0).toUpperCase() : "";
    },

    onAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.previewImage = URL.createObjectURL(file);
      }
    },

    // 區域：載入登入紀錄
    // 區域：載入登入紀錄
    async loadLoginActivities() {
      try {
        const res = await api.get("/login-history/me");

        this.loginActivities = res.data.map((item) => ({
          id: item.Id, // 列 key
          timestamp: item.LoginTime, // 時間
          ip: item.IP, // IP
          browser: item.BrowserInfo ?? "", // 瀏覽器
          os: item.OSInfo ?? "", // ⭐ 作業系統（關鍵）
          status: item.Status?.toLowerCase() ?? "", // 狀態
          errorMessage: item.ErrorMessage,
        }));
      } catch (err) {
        console.error("❌ 載入登入紀錄失敗", err);
      }
    },
    async saveProfile() {
      try {
        // 區域：姓名長度驗證
        const cleanName = this.profileData.name?.replace(/[\r\n]/g, "").trim();
        if (!cleanName || cleanName.length > 5) {
          await Swal.fire({
            icon: "warning",
            title: "姓名格式錯誤",
            text: "姓名必填，且不可超過 5 個字元",
            confirmButtonText: "確定",
          });
          return;
        }

        // ⭐ 正確 payload（只送允許修改的欄位）
        const payload = {
          fullName: cleanName,
          phone: this.profileData.phone || "",
          address: this.profileData.address || "",
        };

        console.log("🚀 更新會員資料 payload：", payload);

        await api.put("/members/update", payload);

        await Swal.fire({
          icon: "success",
          title: "更新成功",
          text: "個人資料已成功更新",
          confirmButtonText: "確定",
        });

        // 重新載入最新資料
        await this.loadProfileFromToken();
      } catch (err) {
        console.error("❌ 更新會員資料失敗", err);

        await Swal.fire({
          icon: "error",
          title: "更新失敗",
          text: err?.response?.data?.message || "系統錯誤，請稍後再試",
          confirmButtonText: "確定",
        });
      }
    },
    resetForm() {
      this.profileData.name = this.initialProfileData.name; // ✅ 只還原姓名欄位
      this.previewImage = null;
    },

    checkPasswordStrength() {
      const pwd = this.passwordData.newPassword;
      this.passwordRequirements.length = pwd.length >= 8;
      this.passwordRequirements.uppercase = /[A-Z]/.test(pwd);
      this.passwordRequirements.lowercase = /[a-z]/.test(pwd);
      this.passwordRequirements.number = /[0-9]/.test(pwd);
      this.passwordRequirements.special =
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);
    },
    formatDateTime(dateStr) {
      const date = new Date(dateStr);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${h}:${min}`;
    },

    getDeviceIcon(device) {
      if (!device || typeof device !== "string") {
        return "fas fa-desktop"; // 預設圖示
      }

      switch (device.toLowerCase()) {
        case "windows":
        case "win32":
          return "fab fa-windows";
        case "mac os":
        case "macos":
        case "ios":
          return "fab fa-apple";
        case "android":
          return "fab fa-android";
        case "linux":
          return "fab fa-linux";
        default:
          return "fas fa-desktop";
      }
    },

    showNotification(type, message) {
      if (this.notification.timer) clearTimeout(this.notification.timer);
      this.notification = {
        type,
        message,
        show: true,
        timer: setTimeout(() => this.hideNotification(), 5000),
      };
    },

    hideNotification() {
      this.notification.show = false;
      this.notification.timer = null;
    },
  },

  watch: {
    activeTab(newTab) {
      if (newTab === "password") this.resetPasswordForm();
      else if (newTab === "activity") this.currentPage = 1;
    },
    "activityFilter.period"() {
      this.currentPage = 1;
    },
    "activityFilter.status"() {
      this.currentPage = 1;
    },
  },
};
