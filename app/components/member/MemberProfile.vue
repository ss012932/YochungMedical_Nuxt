<template>
  <div class="profile-page">
    <div class="page-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'profile' }"
        @click="activeTab = 'profile'"
      >
        <MemberIcon name="user" />{{ $ui('個人資料') }}</button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'activity' }"
        @click="activeTab = 'activity'"
      >
        <MemberIcon name="history" />{{ $ui('登入記錄') }}</button>
    </div>

    <!-- 個人資料頁 -->
    <div class="tab-content" v-if="activeTab === 'profile'">
        <!-- 表單卡片 -->
        <div class="profile-cards-grid">
          <!-- 基本資料卡片 -->
          <div class="profile-card">
            <div class="card-header">
              <MemberIcon name="user-circle" />
              <h3 class="card-title">{{ $ui('基本資料') }}</h3>
            </div>
            <form class="profile-form" @submit.prevent="saveProfile">
              <div class="form-group">
                <label for="user-name">{{ $ui('姓名') }}<span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="user-name"
                  v-model="profileData.name"
                  required
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="user-account">{{ $ui('帳號') }}</label>
                <input
                  type="text"
                  id="user-account"
                  v-model="profileData.account"
                  disabled
                  class="form-control disabled"
                />
                <small class="form-note">{{ $ui('帳號創建後不可修改') }}</small>
              </div>

              <div class="form-group">
                <label for="user-email">{{ $ui('電子郵件') }}</label>
                <input
                  type="email"
                  id="user-email"
                  v-model="profileData.email"
                  disabled
                  class="form-control disabled"
                />
                <small class="form-note">{{ $ui('若需修改電子郵件,請聯繫客服') }}</small>
              </div>

              <div class="form-group">
                <label for="user-phone">{{ $ui('電話號碼') }}<span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="user-phone"
                  v-model="profileData.phone"
                  required
                  class="form-control"
                  :placeholder="$ui('請輸入電話號碼')"
                />
              </div>

              <div class="form-group">
                <label for="user-address">{{ $ui('地址') }}<span class="required">*</span>
                </label>
                <input
                  type="text"
                  id="user-address"
                  v-model="profileData.address"
                  required
                  class="form-control"
                  :placeholder="$ui('請輸入完整地址')"
                />
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetForm">
                  <MemberIcon name="undo" />{{ $ui('重置變更') }}</button>
                <button type="submit" class="btn-primary">
                  <MemberIcon name="save" />{{ $ui('儲存資料') }}</button>
              </div>
            </form>
          </div>

          <!-- 密碼重設卡片 -->
          <div class="profile-card password-card">
            <div class="card-header">
              <MemberIcon name="lock" />
              <h3 class="card-title">{{ $ui('密碼管理') }}</h3>
            </div>
            <div class="password-reset-content">
              <div class="password-icon">
                <MemberIcon name="key" />
              </div>
              <p class="password-desc">{{ $ui('點擊下方按鈕,我們會將重設密碼連結寄送至您的電子郵件。') }}</p>
              <button
                type="button"
                class="btn-primary-1"
                @click="sendResetPasswordEmail"
              >
                <MemberIcon name="envelope" />{{ $ui('寄送密碼重設信') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 登入記錄頁 -->
    <div class="tab-content" v-if="activeTab === 'activity'">
      <div class="activity-content">
        <div class="content-header">
          <h3 class="content-title">{{ $ui('登入記錄') }}</h3>
          <p class="content-desc">{{ $ui('查看您的帳戶近期登入活動') }}<br />{{ $ui('如有可疑活動請立即修改密碼並聯繫客服') }}</p>
        </div>

        <div class="filter-bar">
          <div class="filter-group">
            <label for="period-select">
              <MemberIcon name="calendar" />{{ $ui('時間範圍') }}</label>
            <select
              id="period-select"
              v-model="activityFilter.period"
              class="form-control"
            >
              <option value="0">{{ $ui('今天') }}</option>
              <option value="7">{{ $ui('最近 7 天') }}</option>
              <option value="30">{{ $ui('最近 30 天') }}</option>
              <option value="90">{{ $ui('最近 3 個月') }}</option>
              <option value="180">{{ $ui('最近 6 個月') }}</option>
              <option value="365">{{ $ui('最近一年') }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="status-select">
              <MemberIcon name="filter" />{{ $ui('狀態') }}</label>
            <select
              id="status-select"
              v-model="activityFilter.status"
              class="form-control"
            >
              <option value="all">{{ $ui('全部') }}</option>
              <option value="success">{{ $ui('成功') }}</option>
              <option value="failed">{{ $ui('失敗') }}</option>
            </select>
          </div>

          <div class="security-notice">
          <div class="notice-icon">
            <MemberIcon name="shield" />
          </div>
          <div class="notice-content">
            <h4>{{ $ui('安全提醒') }}</h4>
            <p>{{ $ui('如果您發現有任何可疑的登入活動,建議立即:') }}</p>
            <ol>
              <li>{{ $ui('⚠️ 更改您的密碼') }}</li>
              <li>{{ $ui('⚠️ 檢查您的個人資料是否有被變更') }}</li>
              <li>{{ $ui('⚠️ 聯繫客服中心報告可疑活動') }}</li>
            </ol>
          </div>
        </div>
        </div>

        <div class="activity-list" v-if="filteredActivities.length > 0">
          <div
            class="activity-item"
            v-for="activity in filteredActivities"
            :key="activity.id"
          >
            <div
              class="activity-icon"
              :class="{
                success: activity.status === 'success',
                failed: activity.status === 'failed',
              }"
            >
              <MemberIcon :name="activity.status === 'success' ? 'check' : 'times'" />
            </div>
            <div class="activity-details">
              <div class="activity-main">
                <div class="activity-status">
                  {{ $ui(activity.status === "success" ? "登入成功" : "登入失敗") }}
                </div>
                <div class="activity-device">
                  <MemberIcon :name="getDeviceIcon(activity.os)" />
                  {{ $ui('{browser} 於 {device}').replace('{browser}', activity.browser).replace('{device}', activity.device) }}
                </div>
              </div>
              <div class="activity-meta">
                <div class="activity-time">
                  <MemberIcon name="clock" />
                  {{ formatDateTime(activity.timestamp) }}
                </div>
                <div class="activity-location">
                  <MemberIcon name="map-pin" />
                  {{ $ui(activity.location) }}
                </div>
                <div class="activity-ip">
                  <MemberIcon name="network" />
                  IP: {{ activity.ip }}
                </div>
              </div>
            </div>
            <div class="activity-current" v-if="activity.isCurrent">
              <span class="current-badge">{{ $ui('目前使用中') }}</span>
            </div>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">
            <MemberIcon name="history" />
          </div>
          <p>{{ $ui('目前沒有符合條件的登入記錄') }}</p>
        </div>

        <div class="pagination" v-if="totalPages > 1">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <MemberIcon name="chevron-left" />
          </button>

          <button
            class="page-btn"
            v-for="page in displayedPages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <MemberIcon name="chevron-right" />
          </button>
        </div>

        
      </div>
    </div>

    <!-- 成功通知 -->
    <div
      class="notification"
      v-if="notification.show"
      :class="notification.type"
    >
      <div class="notification-icon">
        <MemberIcon :name="notification.type === 'success' ? 'check-circle' : 'alert-circle'" />
      </div>
      <div class="notification-message">{{ $ui(notification.message) }}</div>
      <button class="notification-close" @click="hideNotification">
        <MemberIcon name="times" />
      </button>
    </div>
</template>

<script>
import api from "@/assets/js/api"; // axios 模組
import MemberIcon from "@/components/member/MemberIcon.vue";
import Swal from "sweetalert2"; // 引入 SweetAlert2

export default {
  components: { MemberIcon },
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
      // 區域：登入記錄裝置圖示改用本地 SVG，避免 Font Awesome 字型未載入。
      return "monitor";
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
</script>
<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.profile-page {
  position: relative;
  width: 100%;
}

/* 標籤頁樣式 */
.page-tabs {
  display: flex;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
  border-bottom: 1px solid #e2e8f0;
  gap: clamp(0.5rem, 1vw, 1rem);
  width: 100%;
  padding-top: 0.3rem;
}

.tab-btn {
  padding: clamp(0.625rem, 1vw, 0.75rem) clamp(1rem, 1.5vw, 1.25rem);
  background: none;
  border: none;
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #943f7e;
}

.tab-btn.active {
  color: #943f7e;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #943f7e;
}

.tab-btn i {
  margin-right: clamp(0.375rem, 0.75vw, 0.5rem);
}

.tab-content {
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

/* 個人資料頁樣式 */
.profile-content {
  padding: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  margin-bottom: -2rem;
}

.profile-header-card {
  display: flex;
  align-items: center;
  padding: clamp(1.25rem, 2.5vw, 2rem);
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  margin-bottom: clamp(1.25rem, 2.5vw, 2rem);
  gap: clamp(1rem, 2vw, 1.5rem);
}

.avatar-container {
  width: clamp(4rem, 8vw, 6rem);
  height: clamp(4rem, 8vw, 6rem);
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  color: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: 600;
}

.user-info-header {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  font-weight: 600;
  color: rgb(0, 0, 0);
  margin: 0 0 clamp(0.25rem, 0.5vw, 0.375rem) 0;
}

.user-account {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: rgba(0, 0, 0, 0.8);
  margin: 0;
}

.profile-cards-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(clamp(280px, 40vw, 450px), 1fr)
  );
  gap: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
}

.profile-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.5rem, 1vw, 0.75rem);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: clamp(1rem, 2vw, 1.5rem);
}

.card-header {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  padding: clamp(1rem, 1.5vw, 1.25rem);
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-header i {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #943f7e;
}

.card-title {
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.profile-form {
  padding: clamp(1rem, 1.5vw, 1.5rem);
}

.form-group {
  margin-bottom: clamp(1rem, 1.5vw, 1.25rem);
}

.form-group label {
  display: block;
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  font-weight: 500;
  color: #4a5568;
}

.required {
  color: #e53e3e;
}

.form-control {
  width: 100%;
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(0.625rem, 1.25vw, 0.75rem);
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.875rem, 1.25vw, 1rem);
  color: #2d3748;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #943f7e;
  box-shadow: 0 0 0 3px rgba(148, 63, 126, 0.1);
}

.form-control.disabled {
  background-color: #f7fafc;
  color: #718096;
  cursor: not-allowed;
}

.form-note {
  display: block;
  margin-top: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  color: #a0aec0;
}

.form-actions {
  display: flex;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  margin-top: clamp(1.25rem, 2vw, 1.5rem);
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(0.75rem, 1.5vw, 1rem);
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.8rem, 1.05vw, 0.875rem 14px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  flex: 1;
  min-width: clamp(100px, 15vw, 120px);
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.btn-primary-1 {
  background-color: #943f7e;
  color: white;
  padding: clamp(0.5rem, 1vw, 0.625rem) clamp(0.75rem, 1.5vw, 1rem);
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.8rem, 1.05vw, 0.875rem 14px);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  min-width: clamp(100px, 15vw, 120px);
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
}

.btn-primary {
  background-color: #943f7e;
  color: white;
}

.btn-primary:hover {
  background-color: #753263;
}

.btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

/* 密碼卡片 */
.password-card {
  display: flex;
  flex-direction: column;
}

.password-reset-content {
  padding: clamp(1.5rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  gap: clamp(1rem, 2vw, 1.25rem);
}

.password-icon {
  width: clamp(3.5rem, 7vw, 5rem);
  height: clamp(3.5rem, 7vw, 5rem);
  border-radius: 50%;
  background: linear-gradient(135deg, #943f7e, #753263);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.password-desc {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #718096;
  margin: 0;
  max-width: 90%;
}

/* 登入記錄頁 */
.activity-content {
  padding: clamp(1rem, 2vw, 1.5rem);
  width: 100%;
  margin-bottom: -2rem;
}

.content-header {
  margin-bottom: clamp(1.25rem, 2vw, 1.5rem);
}

.content-title {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  font-weight: 600;
  color: #2d3748;
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
}

.content-desc {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #718096;
  margin: 0;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-bottom: clamp(1.25rem, 2vw, 1.5rem);
  padding: clamp(0.75rem, 1.5vw, 1rem);
  background-color: #f7fafc;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  min-width: 0;
}

.filter-group label {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #4a5568;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
  min-width: fit-content;
}

.filter-group .form-control {
  flex: 1;
  min-width: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-bottom: clamp(1.25rem, 2vw, 1.5rem);
}

.activity-item {
  display: flex;
  padding: clamp(0.875rem, 1.5vw, 1rem);
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  transition: all 0.2s;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  align-items: flex-start;
}

.activity-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: clamp(2rem, 3.5vw, 2.5rem);
  height: clamp(2rem, 3.5vw, 2.5rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.success {
  background-color: #38a169;
}

.activity-icon.failed {
  background-color: #e53e3e;
}

.activity-details {
  flex: 1;
  min-width: 0;
}

.activity-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: clamp(0.375rem, 0.75vw, 0.5rem);
  gap: clamp(0.5rem, 1vw, 0.75rem);
  flex-wrap: wrap;
}

.activity-status {
  font-weight: 600;
  color: #2d3748;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
}

.activity-device {
  color: #4a5568;
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
}

.activity-device i {
  margin-right: clamp(0.25rem, 0.5vw, 0.375rem);
}

.activity-meta {
  display: flex;
  font-size: clamp(0.7rem, 0.95vw, 0.8125rem);
  color: #718096;
  gap: clamp(0.75rem, 1.5vw, 1.25rem);
  flex-wrap: wrap;
}

.activity-time,
.activity-location,
.activity-ip {
  display: flex;
  align-items: center;
  gap: clamp(0.25rem, 0.5vw, 0.375rem);
}

.activity-current {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.current-badge {
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem);
  background-color: #ebf8ff;
  color: #3182ce;
  border-radius: clamp(0.25rem, 0.5vw, 0.375rem);
  font-size: clamp(0.625rem, 0.875vw, 0.75rem);
  font-weight: 500;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(2rem, 4vw, 2.5rem) 0;
  color: #a0aec0;
}

.empty-icon {
  font-size: clamp(2rem, 3.5vw, 2.5rem);
  margin-bottom: clamp(0.75rem, 1.5vw, 1rem);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  margin-top: clamp(1.25rem, 2vw, 1.5rem);
  margin-bottom: clamp(1.5rem, 2.5vw, 2rem);
  flex-wrap: wrap;
}

.page-btn {
  width: clamp(2.25rem, 9vw, 2.75rem);
  height: clamp(2.25rem, 9vw, 2.75rem);
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: white;
  color: #943f7e;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-btn.active {
  background: #943f7e;
  color: white;
  border-color: #943f7e;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.security-notice {
  grid-column: 1 / -1;
  display: flex;
  background-color: #fff5f5;
  padding: clamp(0.875rem, 1.5vw, 1rem);
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  border-left: 3px solid #e53e3e;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  margin-top: clamp(0.5rem, 1vw, 0.75rem);
  width: auto;
}

.notice-icon {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: #e53e3e;
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-content h4 {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 clamp(0.375rem, 0.75vw, 0.5rem) 0;
}

.notice-content p {
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #4a5568;
  margin: 0 0 clamp(0.375rem, 0.75vw, 0.5rem) 0;
}

.notice-content ol {
  margin: 0;
  padding-left: clamp(1rem, 1.5vw, 1.25rem);
}

.notice-content li {
  font-size: clamp(0.875rem, 1.25vw, 1.125rem);
  color: #4a5568;
  margin-bottom: clamp(0.25rem, 0.5vw, 0.375rem);
}

/* 通知樣式 */
.notification {
  position: fixed;
  bottom: clamp(1rem, 2vw, 1.5rem);
  right: clamp(1rem, 2vw, 1.5rem);
  display: flex;
  align-items: center;
  padding: clamp(0.625rem, 1vw, 0.75rem) clamp(0.875rem, 1.5vw, 1rem);
  background: white;
  border-radius: clamp(0.375rem, 0.75vw, 0.5rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: clamp(280px, 40vw, 400px);
  animation: fadeIn 0.3s ease-out;
  z-index: 1000;
  gap: clamp(0.625rem, 1vw, 0.75rem);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification.success {
  border-left: 4px solid #38a169;
}

.notification.error {
  border-left: 4px solid #e53e3e;
}

.notification-icon {
  font-size: clamp(1rem, 1.5vw, 1.125rem);
  flex-shrink: 0;
}

.notification.success .notification-icon {
  color: #38a169;
}

.notification.error .notification-icon {
  color: #e53e3e;
}

.notification-message {
  flex: 1;
  font-size: clamp(0.75rem, 1vw, 0.875rem);
  color: #2d3748;
  min-width: 0;
}

.notification-close {
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.notification-close:hover {
  color: #718096;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .profile-cards-grid {
    grid-template-columns: 1fr;
    margin-top: 0.75rem;
  }

  .profile-header-card {
    flex-direction: column;
    text-align: center;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .activity-item {
    flex-direction: column;
  }

  .activity-current {
    align-self: center;
  }

  .notification {
    left: clamp(1rem, 2vw, 1.5rem);
    right: clamp(1rem, 2vw, 1.5rem);
    max-width: none;
  }
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: row; /* ⭐ 改回橫向 */
    gap: 0.75rem; /* 按鈕間距 */
  }

  .btn-primary,
  .btn-secondary {
    width: 50%; /* 一人一半 */
    min-width: 0; /* 防止撐破 */
  }
}

@media (min-width: 1024px) {
  .tab-btn {
    font-size: clamp(0.875rem, 1vw, 1rem); /* 字體變小 */
    padding: clamp(0.5rem, 0.75vw, 0.625rem) clamp(0.75rem, 1vw, 1rem); /* 上下左右都縮 */
  }
}


/* ===== 個人資料頁 SVG Icon 對齊 ===== */
.profile-page .tab-btn .member-icon-svg {
  margin-right: clamp(0.375rem, 0.75vw, 0.5rem);
  font-size: 1em;
}
.profile-page .card-header .member-icon-svg,
.profile-page .content-header .member-icon-svg {
  color: #943f7e;
}
.profile-page .activity-icon .member-icon-svg {
  width: 1.15rem;
  height: 1.15rem;
}
.profile-page .activity-device .member-icon-svg,
.profile-page .activity-time .member-icon-svg,
.profile-page .activity-location .member-icon-svg,
.profile-page .activity-ip .member-icon-svg {
  margin-right: 0.35rem;
}
.profile-page .page-btn .member-icon-svg {
  width: 1rem;
  height: 1rem;
}
.profile-page button .member-icon-svg {
  margin-right: 0.4rem;
}
.profile-page .notification-icon .member-icon-svg {
  width: 1.2rem;
  height: 1.2rem;
}
</style>
