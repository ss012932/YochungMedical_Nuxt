<template>
  <div class="users-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">用戶管理</h2>
        <div class="page-stats">
          <span class="stats-item"
            ><i class="fas fa-users"></i> 共 {{ totalUsers }} 位用戶</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-user-shield"></i> {{ adminUsers }} 位管理員</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-user"></i> {{ memberUsers }} 位會員</span
          >
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary" @click="exportUsers">
          <i class="fas fa-file-export"></i> 匯出用戶
        </button>
        <button class="action-btn primary" @click="openCreateUserModal">
          <i class="fas fa-user-plus"></i> 新增用戶
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜尋用戶名稱、帳號或聯絡電話..."
          class="search-input"
          @input="resetPage"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="filter-options">
        <div class="filter-select">
          <select v-model="roleFilter" @change="resetPage">
            <option value="">所有角色</option>
            <option value="admin">管理員</option>
            <option value="member">會員</option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="statusFilter" @change="resetPage">
            <option value="">所有狀態</option>
            <option value="active">啟用中</option>
            <option value="suspended">已停權</option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="sortOption" @change="resetPage">
            <option value="nameAsc">姓名 (A-Z)</option>
            <option value="nameDesc">姓名 (Z-A)</option>
            <option value="recent">最近註冊</option>
            <option value="oldest">最早註冊</option>
            <option value="lastLogin">最近登入</option>
          </select>
        </div>

        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-redo-alt"></i> 重置
        </button>
      </div>
    </div>

    <div class="users-table-container">
      <table class="users-table" v-if="filteredUsers.length > 0">
        <thead>
          <tr>
            <th class="th-avatar"></th>
            <th class="th-name">用戶資訊</th>
            <th class="th-contact">Email</th>
            <th class="th-address">地址</th>
            <th class="th-role">角色</th>
            <th class="th-status">狀態</th>
            <th class="th-registered">註冊日期</th>
            <th class="th-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="td-avatar">
              <div
                class="user-avatar"
                :class="[
                  user.role === 'admin' ? 'admin-avatar' : 'member-avatar',
                ]"
              >
                <span v-if="!user.avatar">{{ getInitials(user.name) }}</span>
                <img v-else :src="user.avatar" :alt="user.name" />
              </div>
            </td>
            <td class="td-name">
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-account">{{ user.account }}</span>
              </div>
            </td>
            <td class="td-contact">
              <div class="contact-info">
                <div class="contact-item" v-if="user.email">
                  <i class="fas fa-envelope"></i>
                  <span>{{ user.email }}</span>
                </div>
                <div class="contact-item" v-if="user.phone">
                  <i class="fas fa-phone"></i>
                  <span>{{ user.phone }}</span>
                </div>
              </div>
            </td>

            <!-- 地址 -->
            <td class="td-address">
              <div v-if="user.address">
                <span>{{ user.address }}</span>
              </div>
              <span v-else>未提供</span>
            </td>
            <td class="td-role">
              <span
                class="role-badge"
                :class="user.role === 'admin' ? 'admin-role' : 'member-role'"
              >
                {{ user.role === "admin" ? "管理員" : "會員" }}
              </span>
            </td>
            <td class="td-status">
              <span class="status-badge" :class="getStatusClass(user.status)">
                {{ getStatusLabel(user.status) }}
              </span>
            </td>
            <td class="td-registered">
              <div class="date-info">
                <span class="date-value">{{
                  formatDate(user.registerDate)
                }}</span>
              </div>
            </td>
            <td class="td-actions">
              <div class="action-buttons">
                <button
                  class="action-btn view-btn"
                  title="查看詳情"
                  @click="viewUserDetails(user)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="action-btn edit-btn"
                  title="編輯用戶"
                  @click="
                    () => {
                      viewUserDetails(user);
                      startEditing();
                    }
                  "
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="action-btn"
                  :class="
                    user.status === 'active' ? 'suspend-btn' : 'activate-btn'
                  "
                  :title="user.status === 'active' ? '停用帳號' : '啟用帳號'"
                  @click="toggleUserStatus(user)"
                >
                  <i
                    :class="
                      user.status === 'active'
                        ? 'fas fa-ban'
                        : 'fas fa-check-circle'
                    "
                  ></i>
                </button>
                <button
                  class="action-btn reset-btn"
                  :class="{ sending: resetPasswordStatus[user.id]?.sending }"
                  :title="getResetPasswordTitle(user)"
                  @click="resetPassword(user)"
                  :disabled="resetPasswordStatus[user.id]?.sending"
                >
                  <i
                    :class="
                      resetPasswordStatus[user.id]?.sending
                        ? 'fas fa-spinner fa-spin'
                        : 'fas fa-key'
                    "
                  ></i>
                  <span
                    v-if="
                      resetPasswordStatus[user.id]?.status === 'sent' ||
                      user.passwordResetSent
                    "
                    class="reset-status-indicator success"
                  ></span>
                  <span
                    v-if="resetPasswordStatus[user.id]?.status === 'error'"
                    class="reset-status-indicator error"
                  ></span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="empty-state" v-else>
        <div class="empty-icon">
          <i class="fas fa-users"></i>
        </div>
        <h3 class="empty-title">無符合條件的用戶</h3>
        <p class="empty-description">請嘗試調整過濾條件或新增用戶</p>
        <button class="primary-btn" @click="openCreateUserModal">
          <i class="fas fa-user-plus"></i> 新增用戶
        </button>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <template v-for="pageNum in displayedPages" :key="pageNum">
        <span v-if="pageNum === '...'" class="page-ellipsis">...</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: pageNum === currentPage }"
          @click="goToPage(pageNum)"
        >
          {{ pageNum }}
        </button>
      </template>

      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 用戶詳情彈窗 -->
    <div class="modal-overlay" v-if="showUserModal">
      <div class="modal-container user-details-modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEditing ? "編輯用戶" : "用戶詳情" }}</h3>
          <button class="modal-close" @click="closeUserModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="user-details-header">
            <div
              class="user-avatar-large"
              :class="[
                selectedUser.role === 'admin'
                  ? 'admin-avatar'
                  : 'member-avatar',
              ]"
            >
              <span v-if="!selectedUser.avatar">{{
                getInitials(selectedUser.name)
              }}</span>
              <img v-else :src="selectedUser.avatar" :alt="selectedUser.name" />
            </div>
            <div class="user-header-info">
              <h4 class="user-header-name">{{ selectedUser.name }}</h4>
              <div class="user-header-meta">
                <span
                  class="role-badge"
                  :class="
                    selectedUser.role === 'admin' ? 'admin-role' : 'member-role'
                  "
                >
                  {{ selectedUser.role === "admin" ? "管理員" : "會員" }}
                </span>
                <span
                  class="status-badge"
                  :class="getStatusClass(selectedUser.status)"
                >
                  {{ getStatusLabel(selectedUser.status) }}
                </span>
              </div>
              <div class="user-header-id">
                <span>用戶ID: {{ selectedUser.id }}</span>
              </div>
            </div>
          </div>

          <div class="user-details-content" v-if="!isEditing">
            <div class="details-section">
              <h5 class="section-title">
                <i class="fas fa-user"></i> 基本資料
              </h5>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">帳號</span>
                  <span class="detail-value">{{ selectedUser.account }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">姓名</span>
                  <span class="detail-value">{{ selectedUser.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">地址</span>
                  <span class="detail-value">{{
                    selectedUser.address || "未提供"
                  }}</span>
                  <!-- 顯示地址 -->
                </div>
                <div class="detail-item">
                  <span class="detail-label">角色</span>
                  <span class="detail-value">{{
                    selectedUser.role === "admin" ? "管理員" : "會員"
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">狀態</span>
                  <span class="detail-value">{{
                    getStatusLabel(selectedUser.status)
                  }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h5 class="section-title">
                <i class="fas fa-address-card"></i> 聯絡資訊
              </h5>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">電子郵件</span>
                  <span class="detail-value">{{
                    selectedUser.email || "未提供"
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">電話</span>
                  <span class="detail-value">{{
                    selectedUser.phone || "未提供"
                  }}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h5 class="section-title">
                <i class="fas fa-history"></i> 帳號活動
              </h5>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">註冊日期</span>
                  <span class="detail-value">{{
                    formatDate(selectedUser.registerDate)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">註冊IP</span>
                  <span class="detail-value">{{
                    selectedUser.registerIP || "未記錄"
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最近登入</span>
                  <span class="detail-value">{{
                    formatDateTime(selectedUser.lastLogin)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">登入IP</span>
                  <span class="detail-value">{{
                    selectedUser.lastLoginIP || "未記錄"
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">登入次數</span>
                  <span class="detail-value"
                    >{{ selectedUser.loginCount || 0 }} 次</span
                  >
                </div>
                <div class="detail-item">
                  <span class="detail-label">上次密碼更新</span>
                  <span class="detail-value">{{
                    selectedUser.lastPasswordChange
                      ? formatDate(selectedUser.lastPasswordChange)
                      : "未更新過"
                  }}</span>
                </div>
              </div>
            </div>

            <div class="details-section" v-if="selectedUser.notes">
              <h5 class="section-title">
                <i class="fas fa-sticky-note"></i> 管理備註
              </h5>
              <div class="notes-container">
                {{ selectedUser.notes }}
              </div>
            </div>
          </div>

          <!-- 編輯表單 -->
          <div class="user-edit-form" v-if="isEditing">
            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-user"></i> 基本資料
              </h5>
              <div class="form-grid">
                <div class="form-group">
                  <label for="user-account">帳號</label>
                  <input
                    type="text"
                    id="user-account"
                    v-model="editForm.account"
                    disabled
                  />
                </div>
                <div class="form-group">
                  <label for="user-name"
                    >姓名 <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    id="user-name"
                    v-model="editForm.name"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="user-address">地址</label>
                  <input
                    type="text"
                    id="user-address"
                    v-model="editForm.address"
                  />
                  <!-- 編輯地址 -->
                </div>
                <div class="form-group">
                  <label for="user-role"
                    >角色 <span class="required">*</span></label
                  >
                  <select id="user-role" v-model="editForm.role" required>
                    <option value="admin">管理員</option>
                    <option value="member">會員</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="user-status"
                    >狀態 <span class="required">*</span></label
                  >
                  <select id="user-status" v-model="editForm.status" required>
                    <option value="active">啟用中</option>
                    <option value="suspended">已停權</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">
                <i class="fas fa-address-card"></i> 聯絡資訊
              </h5>
              <div class="form-grid">
                <div class="form-group">
                  <label for="user-email"
                    >電子郵件 <span class="required">*</span></label
                  >
                  <input
                    type="email"
                    id="user-email"
                    v-model="editForm.email"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="user-phone">電話</label>
                  <input type="tel" id="user-phone" v-model="editForm.phone" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <template v-if="!isEditing">
            <button
              class="btn-danger"
              @click="toggleUserStatus(selectedUser)"
              v-if="selectedUser.status === 'active'"
            >
              <i class="fas fa-ban"></i> 停用帳號
            </button>
            <button
              class="btn-success"
              @click="toggleUserStatus(selectedUser)"
              v-else
            >
              <i class="fas fa-check-circle"></i> 啟用帳號
            </button>
            <button class="btn-warning" @click="resetPassword(selectedUser)">
              <i class="fas fa-key"></i> 重設密碼
            </button>
            <button class="btn-primary" @click="startEditing">
              <i class="fas fa-edit"></i> 編輯用戶
            </button>
          </template>
          <template v-else>
            <button class="btn-secondary" @click="cancelEditing">
              <i class="fas fa-times"></i> 取消
            </button>
            <button class="btn-primary" @click="saveUserChanges">
              <i class="fas fa-save"></i> 儲存變更
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- 新增用戶彈窗 -->
    <div class="modal-overlay" v-if="showCreateModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">新增用戶</h3>
          <button class="modal-close" @click="closeCreateModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-section">
            <h5 class="section-title"><i class="fas fa-user"></i> 基本資料</h5>
            <div class="form-grid">
              <div class="form-group">
                <label for="new-account"
                  >帳號 <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="new-account"
                  v-model="createForm.account"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new-name"
                  >姓名 <span class="required">*</span></label
                >
                <input
                  type="text"
                  id="new-name"
                  v-model="createForm.name"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new-address">地址</label>
                <input
                  type="text"
                  id="new-address"
                  v-model="createForm.address"
                />
                <!-- 新增用戶地址 -->
              </div>
              <div class="form-group">
                <label for="new-role"
                  >角色 <span class="required">*</span></label
                >
                <select id="new-role" v-model="createForm.role" required>
                  <option value="admin">管理員</option>
                  <option value="member">會員</option>
                </select>
              </div>
              <div class="form-group">
                <label for="new-status">狀態</label>
                <select id="new-status" v-model="createForm.status">
                  <option value="active">啟用中</option>
                  <option value="inactive">未啟用</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h5 class="section-title"><i class="fas fa-lock"></i> 登入密碼</h5>
            <div class="form-grid">
              <div class="form-group">
                <label for="new-password"
                  >密碼 <span class="required">*</span></label
                >
                <input
                  type="password"
                  id="new-password"
                  v-model="createForm.password"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new-password-confirm"
                  >確認密碼 <span class="required">*</span></label
                >
                <input
                  type="password"
                  id="new-password-confirm"
                  v-model="createForm.passwordConfirm"
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h5 class="section-title">
              <i class="fas fa-address-card"></i> 聯絡資訊
            </h5>
            <div class="form-grid">
              <div class="form-group">
                <label for="new-email"
                  >電子郵件 <span class="required">*</span></label
                >
                <input
                  type="email"
                  id="new-email"
                  v-model="createForm.email"
                  required
                />
              </div>
              <div class="form-group">
                <label for="new-phone">電話</label>
                <input type="tel" id="new-phone" v-model="createForm.phone" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeCreateModal">
            <i class="fas fa-times"></i> 取消
          </button>
          <button class="btn-primary" @click="createUser">
            <i class="fas fa-user-plus"></i> 新增用戶
          </button>
        </div>
      </div>
    </div>

    <!-- 重設密碼彈窗 -->
    <div class="modal-overlay" v-if="showPasswordModal">
      <div class="modal-container password-modal">
        <div class="modal-header">
          <h3 class="modal-title">重設密碼</h3>
          <button class="modal-close" @click="closePasswordModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="password-reset-info">
            <div class="user-info-row">
              <span class="info-label">用戶:</span>
              <span class="info-value">{{ passwordResetUser.name }}</span>
            </div>
            <div class="user-info-row">
              <span class="info-label">帳號:</span>
              <span class="info-value">{{ passwordResetUser.account }}</span>
            </div>
          </div>

          <div class="password-form">
            <div class="form-group">
              <label for="new-password"
                >新密碼 <span class="required">*</span></label
              >
              <input
                type="password"
                id="reset-password"
                v-model="passwordForm.newPassword"
                required
              />
            </div>
            <div class="form-group">
              <label for="confirm-password"
                >確認密碼 <span class="required">*</span></label
              >
              <input
                type="password"
                id="reset-password-confirm"
                v-model="passwordForm.confirmPassword"
                required
              />
            </div>
            <div class="form-group">
              <label for="reset-note">備註</label>
              <textarea
                id="reset-note"
                v-model="passwordForm.note"
                rows="3"
                placeholder="輸入重設密碼的原因..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closePasswordModal">
            <i class="fas fa-times"></i> 取消
          </button>
          <button class="btn-primary" @click="confirmResetPassword">
            <i class="fas fa-key"></i> 重設密碼
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      itemsPerPage: 8,
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
</script>

<script setup>
// 此頁直接承載原會員/管理功能，不再引用 legacy 元件。
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
</script>

<style scoped>
/* 用戶管理頁面樣式 */
.users-page {
    width: 100%;
  }
  
  /* 頁面標題區域 */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .header-left {
    display: flex;
    flex-direction: column;
  }
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
  }
  
  .page-stats {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #718096;
  }
  
  .stats-item {
    display: flex;
    align-items: center;
  }
  
  .stats-item i {
    margin-right: 6px;
  }
  
  .stats-divider {
    margin: 0 12px;
    color: #e2e8f0;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .action-btn {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .action-btn i {
    margin-right: 8px;
  }
  
  .action-btn.reset-btn.sending {
    background: #f1f5f9;
    cursor: not-allowed;
  }
  
  /* 可以在表格中顯示最近發送時間 */
  .reset-timestamp {
    font-size: 11px;
    color: #94a3b8;
    display: block;
    margin-top: 2px;
  }

  .action-btn.primary {
    background: #2c5282;
    color: white;
  }
  
  .action-btn.primary:hover {
    background: #2b6cb0;
  }
  
  .action-btn.secondary {
    background: #edf2f7;
    color: #4a5568;
  }
  
  .action-btn.secondary:hover {
    background: #e2e8f0;
  }
  
  /* 過濾器區域 */
  .filter-bar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .search-box {
    flex: 1;
    min-width: 280px;
    position: relative;
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
  }
  
  .search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #4a5568;
    transition: all 0.2s;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
  
  .clear-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #a0aec0;
    cursor: pointer;
    padding: 4px;
  }
  
  .filter-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .filter-select select {
    padding: 10px 32px 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: white;
    font-size: 14px;
    color: #4a5568;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-select select:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
  
  .filter-btn {
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background-color: white;
    font-size: 14px;
    color: #4a5568;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .filter-btn i {
    margin-right: 8px;
  }
  
  .filter-btn:hover {
    background-color: #f7fafc;
  }
  
  /* 用戶表格 */
  .users-table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    margin-bottom: 24px;
  }
  
  .users-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .users-table th, 
  .users-table td {
    padding: 16px;
    text-align: left;
  }
  
  .users-table th {
    background-color: #f7fafc;
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
    white-space: nowrap;
  }
  
  .users-table td {
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
    color: #2d3748;
    vertical-align: middle;
  }
  
  .users-table tr:last-child td {
    border-bottom: none;
  }
  
  .th-avatar {
    width: 60px;
  }
  
  .td-avatar {
    width: 60px;
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 16px;
    overflow: hidden;
  }
  
  .admin-avatar {
    background: linear-gradient(135deg, #4c51bf, #6b46c1);
  }
  
  .member-avatar {
    background: linear-gradient(135deg, #2c5282, #3182ce);
  }
  
  .user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .td-name {
    min-width: 150px;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .user-name {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 4px;
  }
  
  .user-account {
    font-size: 12px;
    color: #718096;
  }
  
  .td-contact {
    min-width: 200px;
  }
  
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    font-size: 13px;
  }
  
  .contact-item i {
    color: #718096;
    width: 16px;
    margin-right: 8px;
  }
  
  .role-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .admin-role {
    background: rgba(76, 81, 191, 0.1);
    color: #4c51bf;
  }
  
  .member-role {
    background: rgba(44, 82, 130, 0.1);
    color: #2c5282;
  }
  
  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .status-badge.active {
    background: rgba(56, 161, 105, 0.1);
    color: #38a169;
  }
  
  .status-badge.inactive {
    background: rgba(160, 174, 192, 0.1);
    color: #718096;
  }
  
  .status-badge.suspended {
    background: rgba(229, 62, 62, 0.1);
    color: #e53e3e;
  }
  
  .date-info {
    display: flex;
    flex-direction: column;
  }
  
  .date-value {
    color: #2d3748;
  }
  
  .activity-info {
    display: flex;
    flex-direction: column;
  }
  
  .activity-value {
    color: #2d3748;
    margin-bottom: 4px;
  }
  
  .activity-label {
    font-size: 12px;
    color: #718096;
  }
  
  .td-actions {
    width: 150px;
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
  }
  
  .action-buttons .action-btn {
    padding: 8px;
    border-radius: 6px;
    font-size: 14px;
    background: #f7fafc;
    color: #718096;
  }
  
  .action-buttons .view-btn:hover {
    background: #ebf8ff;
    color: #3182ce;
  }
  
  .action-buttons .edit-btn:hover {
    background: #e6fffa;
    color: #38b2ac;
  }
  
  .action-buttons .suspend-btn:hover {
    background: #fff5f5;
    color: #e53e3e;
  }
  
  .action-buttons .activate-btn:hover {
    background: #f0fff4;
    color: #38a169;
  }
  
  .action-buttons .reset-btn:hover {
    background: #fffaf0;
    color: #dd6b20;
  }
  
  /* 空狀態 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }
  
  .empty-icon {
    font-size: 48px;
    color: #a0aec0;
    margin-bottom: 16px;
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 8px 0;
  }
  
  .empty-description {
    font-size: 14px;
    color: #718096;
    margin: 0 0 24px 0;
  }
  
  .primary-btn {
    padding: 10px 20px;
    background: #2c5282;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .primary-btn i {
    margin-right: 8px;
  }
  
  .primary-btn:hover {
    background: #2b6cb0;
  }
  
  /* 分頁 */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 32px;
    gap: 8px;
  }
  
  .page-btn {
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    color: #4a5568;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .page-btn:hover:not(:disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
  }
  
  .page-btn.active {
    background: #2c5282;
    color: white;
    border-color: #2c5282;
  }
  
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .page-ellipsis {
    min-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #a0aec0;
  }
  
  /* 彈窗樣式 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-container {
    background-color: white;
    width: 90%;
    max-width: 700px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }
  
  .password-modal {
    max-width: 500px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    color: #a0aec0;
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .modal-close:hover {
    color: #4a5568;
  }
  
  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  
  .user-details-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .user-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: white;
    font-size: 28px;
    margin-right: 20px;
    overflow: hidden;
  }
  
  .user-header-info {
    flex: 1;
  }
  
  .user-header-name {
    font-size: 20px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
  }
  
  .user-header-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .user-header-id {
    font-size: 13px;
    color: #718096;
  }
  
  .details-section, .form-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .details-section:last-child, .form-section:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
  }
  
  .section-title i {
    margin-right: 8px;
    color: #2c5282;
  }
  
  .details-grid, .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .detail-item, .form-group {
    display: flex;
    flex-direction: column;
  }
  
  .detail-item.full-width, .form-group.full-width {
    grid-column: span 2;
  }
  
  .detail-label {
    font-size: 12px;
    color: #718096;
    margin-bottom: 4px;
  }
  
  .detail-value {
    font-size: 14px;
    color: #2d3748;
    font-weight: 500;
  }
  
  .notes-container {
    background: #f7fafc;
    border-radius: 8px;
    padding: 16px;
    color: #4a5568;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .form-group label {
    font-size: 14px;
    color: #4a5568;
    margin-bottom: 8px;
  }
  
  .required {
    color: #e53e3e;
  }
  
  .form-group input, 
  .form-group select, 
  .form-group textarea {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    color: #2d3748;
    background-color: white;
    transition: all 0.2s;
  }
  
  .form-group input:focus, 
  .form-group select:focus, 
  .form-group textarea:focus {
    outline: none;
    border-color: #2c5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }
  
  .form-group input:disabled {
    background-color: #f7fafc;
    color: #718096;
    cursor: not-allowed;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .password-reset-info {
    background: #f7fafc;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .user-info-row {
    display: flex;
    margin-bottom: 8px;
  }
  
  .user-info-row:last-child {
    margin-bottom: 0;
  }
  
  .info-label {
    width: 60px;
    font-size: 14px;
    color: #718096;
  }
  
  .info-value {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
  }
  
  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  .btn-primary, .btn-secondary, .btn-danger, .btn-success, .btn-warning {
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-primary i, .btn-secondary i, .btn-danger i, .btn-success i, .btn-warning i {
    margin-right: 8px;
  }
  
  .btn-primary {
    background: #2c5282;
    color: white;
  }
  
  .btn-primary:hover {
    background: #2b6cb0;
  }
  
  .btn-secondary {
    background: #edf2f7;
    color: #4a5568;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }
  
  .btn-danger {
    background: #fff5f5;
    color: #e53e3e;
  }
  
  .btn-danger:hover {
    background: #fed7d7;
  }
  
  .btn-success {
    background: #f0fff4;
    color: #38a169;
  }
  
  .btn-success:hover {
    background: #c6f6d5;
  }
  
  .btn-warning {
    background: #fffaf0;
    color: #dd6b20;
  }
  
  .btn-warning:hover {
    background: #feebc8;
  }
  
  /* 響應式樣式 */
  @media screen and (max-width: 992px) {
    .details-grid, .form-grid {
      grid-template-columns: 1fr;
    }
    
    .detail-item.full-width, .form-group.full-width {
      grid-column: auto;
    }
    
    .user-details-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .user-avatar-large {
      margin-bottom: 16px;
      margin-right: 0;
    }
  }
  
  @media screen and (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
    
    .filter-bar {
      flex-direction: column;
    }
    
    .search-box {
      width: 100%;
    }
    
    .filter-options {
      width: 100%;
      justify-content: space-between;
    }
    
    .filter-select {
      flex: 1;
      min-width: 120px;
    }
    
    .filter-select select {
      width: 100%;
    }
    
    .users-table {
      display: block;
      overflow-x: auto;
    }
    
    .modal-container {
      width: 95%;
    }
  }
  
  @media screen and (max-width: 480px) {
    .page-stats {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    
    .stats-divider {
      display: none;
    }
    
    .action-buttons {
      flex-wrap: wrap;
    }
    
    .action-buttons .action-btn {
      flex: 1;
    }
  }
</style>
