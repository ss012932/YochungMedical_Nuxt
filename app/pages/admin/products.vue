<template>
  <div class="products-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">商品管理</h2>
        <div class="page-stats">
          <span class="stats-item"
            ><i class="fas fa-box"></i> 共 {{ totalProducts }} 件商品</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-check-circle"></i>
            {{ availableProducts }} 件可售</span
          >
          <span class="stats-divider">|</span>
          <span class="stats-item"
            ><i class="fas fa-exclamation-triangle"></i>
            {{ lowStockProducts }} 件庫存低</span
          >
        </div>
      </div>
      <div class="header-actions">
        <!-- 新增編輯類別按鈕 -->
        <button class="category-btn" @click="openCategoryModal">
          <i class="fas fa-tags"></i> 編輯類別
        </button>
        <button class="action-btn secondary" @click="exportProductsCSV">
          <i class="fas fa-file-export"></i> 匯出
        </button>
        <button class="action-btn primary" @click="openProductModal()">
          <i class="fas fa-plus"></i> 新增商品
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜尋商品名稱、編號或類別..."
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="filter-options">
        <div class="filter-select">
          <select v-model="categoryFilter">
            <option value="">所有類別</option>
            <option v-for="(name, id) in categoriesMap" :key="id" :value="id">
              {{ name }}
            </option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="statusFilter">
            <option value="">所有狀態</option>
            <option value="active">上架中</option>
            <option value="inactive">已下架</option>
            <option value="lowStock">庫存不足</option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="sortOption">
            <option value="idAsc">商品編號 (升序)</option>
            <option value="idDesc">商品編號 (降序)</option>
            <option value="nameAsc">名稱 (A-Z)</option>
            <option value="nameDesc">名稱 (Z-A)</option>
            <option value="priceAsc">價格 (低到高)</option>
            <option value="priceDesc">價格 (高到低)</option>
            <option value="stockAsc">庫存 (低到高)</option>
            <option value="stockDesc">庫存 (高到低)</option>
            <option value="newest">最新上架</option>
          </select>
        </div>

        <button class="filter-btn" @click="resetFilters">
          <i class="fas fa-redo-alt"></i> 重置
        </button>
      </div>
    </div>

    <div class="products-content">
      <div class="products-grid" v-if="paginatedProducts.length > 0">
        <div
          class="product-card"
          v-for="product in paginatedProducts"
          :key="product.id"
        >
          <div class="product-status" :class="getStatusClass(product)">
            <span
              v-if="
                product.stock <= product.lowStockThreshold && product.stock > 0
              "
              >庫存低</span
            >
            <span v-else-if="product.stock === 0">無庫存</span>
            <span v-else-if="!product.isActive">已下架</span>
            <span v-else>上架中</span>
          </div>

          <div class="product-image">
            <img :src="product.image" :alt="product.name" />
          </div>

          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-id">商品編號: {{ product.id }}</p>
            <div class="product-category">{{ product.category }}</div>

            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">售價</span>
                <span class="detail-value price"
                  >NT$ {{ formatNumber(product.price) }}</span
                >
              </div>
              <div class="detail-item">
                <span class="detail-label">庫存</span>
                <span
                  class="detail-value"
                  :class="{
                    'stock-warning': product.stock <= product.lowStockThreshold,
                  }"
                >
                  {{ product.stock }} {{ product.unit }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">上架日期</span>
                <span class="detail-value">{{
                  formatDate(product.createdAt)
                }}</span>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <button
              class="action-icon-btn view-btn"
              title="查看詳情"
              @click="viewProductDetail(product)"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button
              class="action-icon-btn edit-btn"
              title="編輯商品"
              @click="openProductModal(product)"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="action-icon-btn"
              :class="{ 'active-btn': product.isActive }"
              title="上架/下架"
              @click="toggleProductStatus(product)"
            >
              <i
                :class="
                  product.isActive ? 'fas fa-toggle-on' : 'fas fa-toggle-off'
                "
              ></i>
            </button>
            <button
              class="action-icon-btn delete-btn"
              title="刪除商品"
              @click="deleteProduct(product)"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-icon">
          <i class="fas fa-box-open"></i>
        </div>
        <h3 class="empty-title">無符合條件的商品</h3>
        <p class="empty-description">請嘗試調整過濾條件或新增商品</p>
        <button class="primary-btn">
          <i class="fas fa-plus"></i> 新增商品
        </button>
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

      <!-- 新增商品模態窗 -->
      <div class="modal-overlay" v-if="showProductModal">
        <div class="modal-container product-modal">
          <div class="modal-header">
            <h3 class="modal-title">
              {{ isEditing ? "編輯商品" : "新增商品" }}
            </h3>
            <button class="modal-close" @click="closeProductModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveProduct" class="product-form">
              <div class="form-section">
                <h4 class="section-title">基本資料</h4>

                <div class="form-group">
                  <label for="product-name"
                    >商品名稱 <span class="required">*</span></label
                  >
                  <input
                    type="text"
                    id="product-name"
                    v-model="productForm.name"
                    required
                    class="form-control"
                    placeholder="請輸入商品名稱"
                  />
                </div>

                <div class="form-group">
                  <label for="product-category"
                    >商品類別 <span class="required">*</span></label
                  >
                  <select
                    id="product-category"
                    v-model="productForm.categoryId"
                    required
                    class="form-control"
                  >
                    <option value="">請選擇類別</option>
                    <option
                      v-for="(name, id) in categoriesMap"
                      :key="id"
                      :value="id"
                    >
                      {{ name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">商品規格</h4>

                <div class="form-row">
                  <div class="form-group">
                    <label for="product-price"
                      >售價 <span class="required">*</span></label
                    >
                    <div class="input-prefix">
                      <span class="prefix">NT$</span>
                      <input
                        type="number"
                        id="product-price"
                        v-model="productForm.price"
                        required
                        min="0"
                        step="1"
                        class="form-control"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="product-stock"
                      >庫存數量 <span class="required">*</span></label
                    >
                    <input
                      type="number"
                      id="product-stock"
                      v-model="productForm.stock"
                      required
                      min="0"
                      step="1"
                      class="form-control"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">商品圖片</h4>

                <div class="image-upload-container">
                  <div
                    class="image-preview"
                    v-if="productForm.image || previewImage"
                  >
                    <img
                      :src="previewImage || productForm.image"
                      alt="商品圖片預覽"
                    />
                    <button
                      type="button"
                      class="remove-image-btn"
                      @click="removeImage"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>

                  <div
                    class="image-upload"
                    v-if="!previewImage && !productForm.image"
                  >
                    <label for="product-image" class="upload-label">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <span>點擊或拖曳上傳圖片</span>
                    </label>
                    <input
                      type="file"
                      id="product-image"
                      @change="handleImageUpload"
                      accept="image/*"
                      class="file-input"
                    />
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">商品描述</h4>

                <div class="form-group">
                  <label for="product-description">商品描述</label>
                  <textarea
                    id="product-description"
                    v-model="productForm.description"
                    rows="4"
                    class="form-control"
                    placeholder="請輸入商品描述"
                  ></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn-secondary"
                  @click="closeProductModal"
                >
                  取消
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fas fa-save"></i>
                  {{ isEditing ? "儲存變更" : "新增商品" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 商品詳情模態窗 -->
      <div class="modal-overlay" v-if="showProductDetailModal && detailProduct">
        <div class="modal-container product-detail-modal">
          <div class="modal-header">
            <h3 class="modal-title">商品詳情</h3>
            <button class="modal-close" @click="closeProductDetailModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="product-detail-header">
              <div class="product-detail-image">
                <img :src="detailProduct.image" :alt="detailProduct.name" />
              </div>

              <div class="product-detail-info">
                <h2 class="detail-product-name">{{ detailProduct.name }}</h2>
                <p class="detail-product-id">
                  商品編號: {{ detailProduct.id }}
                </p>

                <div class="detail-tag-container">
                  <span class="detail-category-tag">{{
                    detailProduct.category
                  }}</span>
                  <span
                    class="detail-status-tag"
                    :class="getStatusClass(detailProduct)"
                  >
                    <span
                      v-if="
                        detailProduct.stock <=
                          detailProduct.lowStockThreshold &&
                        detailProduct.stock > 0
                      "
                      >庫存低</span
                    >
                    <span v-else-if="detailProduct.stock === 0">無庫存</span>
                    <span v-else-if="!detailProduct.isActive">已下架</span>
                    <span v-else>上架中</span>
                  </span>
                </div>

                <div class="detail-price">
                  <span class="detail-price-label">售價</span>
                  <span class="detail-price-value"
                    >NT$ {{ formatNumber(detailProduct.price) }}</span
                  >
                </div>
              </div>
            </div>

            <div class="product-detail-section">
              <h4 class="detail-section-title">庫存信息</h4>
              <div class="detail-info-grid">
                <div class="detail-info-item">
                  <span class="detail-info-label">庫存數量</span>
                  <span
                    class="detail-info-value"
                    :class="{
                      'stock-warning':
                        detailProduct.stock <= detailProduct.lowStockThreshold,
                    }"
                  >
                    {{ detailProduct.stock }} {{ detailProduct.unit }}
                  </span>
                </div>

                <div class="detail-info-item">
                  <span class="detail-info-label">安全庫存</span>
                  <span class="detail-info-value"
                    >{{ detailProduct.lowStockThreshold }}
                    {{ detailProduct.unit }}</span
                  >
                </div>

                <div class="detail-info-item">
                  <span class="detail-info-label">上架日期</span>
                  <span class="detail-info-value">{{
                    formatDate(detailProduct.createdAt)
                  }}</span>
                </div>
              </div>
            </div>

            <div
              class="product-detail-section"
              v-if="detailProduct.description"
            >
              <h4 class="detail-section-title">商品描述</h4>
              <div class="detail-description">
                {{ detailProduct.description }}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="detail-actions">
              <button class="btn-secondary" @click="closeProductDetailModal">
                關閉
              </button>
              <button
                class="btn-primary"
                @click="editFromDetails(detailProduct)"
              >
                <i class="fas fa-edit"></i> 編輯商品
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 類別管理模態窗 -->
      <div class="modal-overlay" v-if="showCategoryModal">
        <div class="modal-container category-modal">
          <div class="modal-header">
            <h3 class="modal-title">管理商品類別</h3>
            <button class="modal-close" @click="closeCategoryModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="category-form">
              <div class="form-group">
                <label for="category-name">{{
                  editingCategoryId ? "編輯類別" : "新增類別"
                }}</label>
                <div class="input-group">
                  <input
                    type="text"
                    id="category-name"
                    v-model="categoryForm.name"
                    placeholder="輸入類別名稱"
                    class="form-control"
                  />
                  <button
                    class="form-btn"
                    @click="saveCategory"
                    :disabled="!categoryForm.name.trim()"
                  >
                    {{ editingCategoryId ? "更新" : "新增" }}
                  </button>
                </div>
                <p class="form-error" v-if="categoryError">
                  {{ categoryError }}
                </p>
              </div>
            </div>

            <div
              class="category-list"
              v-if="Object.keys(categoriesMap).length > 0"
            >
              <div class="category-list-header">
                <span>現有類別</span>
              </div>
              <div
                class="category-item"
                v-for="(name, id) in categoriesMap"
                :key="id"
              >
                <div class="category-name">
                  {{ name }}
                  <span class="category-count" v-if="getCategoryCount(id)">
                    ({{ getCategoryCount(id) }} 項商品)
                  </span>
                </div>
                <div class="category-actions">
                  <button
                    class="action-btn-small edit"
                    title="編輯類別"
                    @click="editCategory(id, name)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="action-btn-small delete"
                    title="刪除類別"
                    @click="deleteCategory(id, name)"
                    :disabled="getCategoryCount(id) > 0"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="empty-category-list" v-else>
              <i class="fas fa-tags"></i>
              <p>尚無類別，請在上方新增</p>
            </div>

            <p class="info-text">
              提示：只能刪除未被任何商品使用的類別。如要刪除已使用的類別，請先修改相關商品的類別。
            </p>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="closeCategoryModal">
              關閉
            </button>
          </div>
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
      categoryFilter: "",
      statusFilter: "",
      sortOption: "idDesc",
      currentPage: 1,
      itemsPerPage: 10,
      products: [], // 改成後端抓取
      categoriesMap: {}, // 類別對照表
      showProductDetailModal: false,
      detailProduct: null,
      imageFile: null, // 添加這行來存儲文件對象

      // 新增商品模態窗相關
      showProductModal: false,
      isEditing: false,
      previewImage: null,
      productForm: {
        name: "",
        categoryId: "",
        price: 0,
        stock: 0,
        image: "",
        description: "",
        isActive: true,
      },
      originalProduct: null, // 用於存儲編輯前的商品資料，方便取消編輯
      // 類別管理相關
      showCategoryModal: false,
      editingCategoryId: null,
      categoryForm: {
        name: "",
      },
      categoryError: "",
    };
  },
  watch: {
    categoryFilter() {
      this.currentPage = 1; // 切換分類時重置到第一頁
    },
    statusFilter() {
      this.currentPage = 1; // 切換狀態時重置到第一頁
    },
    searchQuery() {
      this.currentPage = 1; // 搜尋時重置到第一頁
    },
    sortOption() {
      this.currentPage = 1; // 排序改變時也回到第一頁，避免停在不存在的頁碼。
    },
  },
  mounted() {
    this.initData(); // 改為統一的初始方法
  },
  computed: {
    categories() {
      return Object.values(this.categoriesMap);
    },
    filteredProducts() {
      return this.products
        .filter((p) => {
          // 關鍵字搜尋
          const keyword = this.searchQuery.toLowerCase();
          const matchKeyword =
            p.name.toLowerCase().includes(keyword) ||
            String(p.id).includes(keyword) ||
            p.category.toLowerCase().includes(keyword);

          // 分類篩選
          const matchCategory =
            !this.categoryFilter || p.categoryId == this.categoryFilter;

          // 狀態篩選
          let matchStatus = true;
          if (this.statusFilter === "active") matchStatus = p.isActive;
          else if (this.statusFilter === "inactive") matchStatus = !p.isActive;
          else if (this.statusFilter === "lowStock")
            matchStatus =
              p.stock <= p.lowStockThreshold && p.stock > 0 && p.isActive;

          return matchKeyword && matchCategory && matchStatus;
        })
        .sort(this.sortByOption); // 排序
    },
    totalProducts() {
      return this.products.length;
    },
    availableProducts() {
      // ✅ 只計算有上架的商品
      return this.products.filter((p) => p.isActive).length;
    },
    lowStockProducts() {
      // ✅ 庫存低 + 有上架才列入
      return this.products.filter(
        (p) => p.isActive && p.stock <= p.lowStockThreshold && p.stock > 0
      ).length;
    },
    // 功能：總筆數直接沿用已完成搜尋、分類、狀態與排序的 filteredProducts，
    // 避免分頁計算和畫面實際資料使用兩套條件。
    totalFilteredProducts() {
      return this.filteredProducts.length;
    },

    // 功能：只取目前頁面的商品，商品管理不再把全部資料塞進內層捲動區。
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.totalFilteredProducts / this.itemsPerPage);
    },
    displayedPages() {
      // 原有的 displayedPages 方法保持不變
      const displayedPages = [];
      if (this.totalPages <= 7) {
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
    async initData() {
      await this.fetchCategories(); // 先拿到類別
      await this.fetchProducts(); // 拿到產品後才能對應類別名稱
    },
    async fetchCategories() {
      try {
        const res = await api.get("/categories");
        this.categoriesMap = res.data.reduce((map, c) => {
          map[c.Id] = c.Name;
          return map;
        }, {});
      } catch (err) {
        console.error("類別載入失敗", err);
      }
    },
    async fetchProducts() {
      try {
        const res = await api.get("/products");

        this.products = res.data.map((p) => ({
          id: p.Id, // 對應後端欄位 Id
          name: p.Name, // 商品名稱
          categoryId: p.CategoryId, // 加上
          category: this.categoriesMap[p.CategoryId] || "未知分類", // 保留顯示中文
          price: p.Price,
          stock: p.Stock,
          image: p.ImageUrl || "/images/default-product.webp",
          createdAt: p.CreatedDate,
          isActive: p.IsActive,
          lowStockThreshold: 10, // 自訂安全庫存
          description: p.Description || "", // <- 確保前端永遠有這欄位
          meter: p.Meter, // <- 確保前端永遠有這欄位
        }));
      } catch (err) {
        console.error("載入商品失敗", err);
      }
    },

    formatNumber(num) {
      if (typeof num !== "number") return "0"; // 如果不是數字回傳 0
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); // 千分位
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    getStatusClass(product) {
      if (product.stock === 0) return "out-of-stock";
      if (product.stock <= product.lowStockThreshold) return "low-stock";
      if (!product.isActive) return "inactive";
      return "active";
    },
    async toggleProductStatus(product) {
      try {
        const { isConfirmed } = await Swal.fire({
          icon: "question",
          title: product.isActive ? "確定要下架此商品？" : "確定要上架此商品？",
          text: `商品名稱：「${product.name}」`,
          showCancelButton: true,
          confirmButtonText: "確認",
          cancelButtonText: "取消",
        });

        if (!isConfirmed) return;

        // ✅ 整包送出完整資料，僅改變 isActive
        const updateData = {
          Id: product.id,
          Name: product.name,
          CategoryId: product.categoryId,
          Price: product.price,
          Stock: product.stock, // ✅ 不動
          ImageUrl: product.image,
          Description: product.description,
          CreatedDate: product.createdAt, // 🔁 有用 DateTime 的欄位一定要傳
          IsActive: !product.isActive, // ✅ 僅這個反轉
          Meter: product.meter,
        };

        await api.put(`/products/${product.id}`, updateData);

        // ✅ 更新本地狀態
        product.isActive = !product.isActive;

        Swal.fire({
          icon: "success",
          title: product.isActive ? "商品已上架" : "商品已下架",
          text: `商品「${product.name}」狀態已更新`,
          confirmButtonText: "確定",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("更新商品狀態失敗:", error);

        Swal.fire({
          icon: "error",
          title: "更新失敗",
          text: error.response?.data?.Message || "無法更新商品狀態",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },
    resetFilters() {
      this.searchQuery = "";
      this.categoryFilter = "";
      this.statusFilter = "";
      this.sortOption = "nameAsc";
      this.currentPage = 1;
    },
    goToPage(page) {
      if (page < 1 || page > this.totalPages || page === this.currentPage) return;

      this.currentPage = page;

      // 功能：商品管理右側本身是獨立捲動區，切換分頁後直接回到右側內容最上方。
      this.$nextTick(() => {
        const adminContent = document.querySelector('.products-admin-layout .admin-content');

        if (adminContent) {
          adminContent.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      });
    },
    // 新增的方法
    openProductModal(product = null) {
      this.isEditing = !!product;

      if (product) {
        // 編輯模式：使用深拷貝避免直接修改原始資料
        this.originalProduct = { ...product };
        this.productForm = {
          name: product.name,
          categoryId: product.categoryId,
          price: product.price,
          stock: product.stock,
          image: product.image,
          description: product.description || "",
          isActive: product.isActive,
        };
      } else {
        // 新增模式：重置表單
        this.resetProductForm();
      }

      this.showProductModal = true;
    },

    closeProductModal() {
      if (this.hasFormChanges()) {
        Swal.fire({
          icon: "warning",
          title: "未儲存變更",
          text: "資料尚未儲存，確定要關閉嗎？",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "確定",
          cancelButtonText: "取消",
        }).then((result) => {
          if (result.isConfirmed) {
            this.showProductModal = false;
            this.resetProductForm();
          }
        });
      } else {
        this.showProductModal = false;
        this.resetProductForm();
      }
    },

    resetProductForm() {
      this.productForm = {
        name: "",
        categoryId: "",
        price: 0,
        stock: 0,
        image: "",
        description: "",
        isActive: true,
      };
      this.previewImage = null;
      this.originalProduct = null;
      this.imageFile = null; // 添加這行
    },

    hasFormChanges() {
      if (!this.isEditing)
        return this.productForm.name || this.productForm.categoryId;

      // 檢查編輯模式下是否有資料變更
      return Object.keys(this.productForm).some((key) => {
        return this.productForm[key] !== this.originalProduct[key];
      });
    },

    // 修改圖片上傳處理方法
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // 檢查檔案類型
      if (!file.type.match("image.*")) {
        Swal.fire({
          icon: "warning",
          title: "上傳錯誤",
          text: "請上傳圖片檔案",
          confirmButtonText: "確定",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // 檢查檔案大小（限制在 5MB 以內）
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "檔案過大",
          text: "檔案大小不能超過 5MB",
          confirmButtonText: "確定",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // 先顯示本地預覽
      this.previewImage = URL.createObjectURL(file);

      // 存儲文件，以便之後上傳
      this.imageFile = file;
    },

    removeImage() {
      this.previewImage = null;
      this.productForm.image = "";

      // 重置檔案輸入
      const fileInput = document.getElementById("product-image");
      if (fileInput) fileInput.value = "";
    },

    // 修改儲存商品方法
    async saveProduct() {
      try {
        // 如果有新上傳的圖片，先上傳到 Azure Blob Storage
        let imageUrl = this.productForm.image;
        if (this.imageFile) {
          const uploadResult = await this.uploadImageWithSas(this.imageFile);
          imageUrl = uploadResult.imageUrl;
        }

        if (this.isEditing) {
          try {
            // 更精確的資料轉換
            const updateData = {
              Id: this.originalProduct.id, // 重要！加入商品 ID
              Name: this.productForm.name,
              CategoryId: Number(this.productForm.categoryId), // 確保是數字
              Price: Number(this.productForm.price), // 確保是數字
              Stock: Number(this.productForm.stock), // 確保是數字
              ImageUrl: imageUrl || null,
              Description: this.productForm.description || null,
              Meter: Boolean(this.productForm.stock > 0),
            };

            await api.put(`/products/${this.originalProduct.id}`, updateData);

            // 更新本地資料
            const index = this.products.findIndex(
              (p) => p.id === this.originalProduct.id
            );
            if (index !== -1) {
              this.products[index] = {
                ...this.products[index],
                name: updateData.Name,
                categoryId: updateData.CategoryId,
                category:
                  this.categoriesMap[updateData.CategoryId] || "未知分類",
                price: updateData.Price,
                stock: updateData.Stock,
                image: imageUrl || this.products[index].image,
                description: updateData.Description,
              };

              Swal.fire({
                icon: "success",
                title: "商品已更新",
                text: "商品資料已成功更新",
                confirmButtonText: "確定",
                confirmButtonColor: "#3085d6",
              });
            }
          } catch (error) {
            console.error("更新商品失敗:", error);
            console.error("詳細錯誤:", error.response); // 輸出更多錯誤資訊

            // 更詳細的錯誤訊息
            const errorMsg =
              error.response?.data?.Message ||
              error.response?.data ||
              error.message ||
              "未知錯誤";

            Swal.fire({
              icon: "error",
              title: "更新商品失敗",
              text: errorMsg,
              confirmButtonText: "確定",
              confirmButtonColor: "#d33",
            });
            return;
          }
        } else {
          // 新增商品的邏輯
          try {
            const createData = {
              Name: this.productForm.name,
              CategoryId: Number(this.productForm.categoryId),
              Price: Number(this.productForm.price),
              Stock: Number(this.productForm.stock),
              ImageUrl: imageUrl || null,
              Description: this.productForm.description || null,
              Meter: Boolean(this.productForm.stock > 0),
            };

            console.log("新增資料:", createData); // 除錯用，檢查傳送的資料

            const response = await api.post("/products", createData);
            // 成功新增後重新獲取所有產品

            const newProduct = {
              id: response.data.Id.toString(),
              name: createData.Name,
              categoryId: createData.CategoryId,
              category: this.categoriesMap[createData.CategoryId] || "未知分類",
              price: createData.Price,
              stock: createData.Stock,
              image: imageUrl || "/images/default-product.webp",
              description: createData.Description,
              createdAt: new Date().toISOString(),
              isActive: createData.Stock > 0,
              lowStockThreshold: 10,
            };

            this.products.push(newProduct);
            Swal.fire({
              icon: "success",
              title: "商品已新增",
              text: "新商品已成功建立",
              confirmButtonText: "確定",
              confirmButtonColor: "#3085d6",
            }).then(() => {
              // 成功後重新整理頁面
              window.location.reload();
            });
          } catch (error) {
            console.error("新增商品失敗:", error);

            // 更詳細的錯誤訊息
            const errorMsg =
              error.response?.data?.Message ||
              error.response?.data ||
              error.message ||
              "未知錯誤";

            // 使用 Sweetalert2 顯示錯誤
            Swal.fire({
              icon: "error",
              title: "新增失敗",
              text: errorMsg,
              confirmButtonText: "確定",
              confirmButtonColor: "#d33",
            });
            return;
          }
        }

        // 關閉模態窗並重置表單
        this.showProductModal = false;
        this.resetProductForm();
        this.imageFile = null;
      } catch (error) {
        console.error("儲存商品失敗:", error);
        // 使用 Sweetalert2 顯示最終錯誤
        Swal.fire({
          icon: "error",
          title: "儲存失敗",
          text: "請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },

    // 查看商品詳情
    viewProductDetail(product) {
      this.detailProduct = { ...product };
      this.showProductDetailModal = true;
    },

    closeProductDetailModal() {
      this.showProductDetailModal = false;
      this.detailProduct = null;
    },

    // 類別管理相關方法
    openCategoryModal() {
      this.showCategoryModal = true;
      this.editingCategoryId = null;
      this.categoryForm.name = "";
      this.categoryError = "";
    },

    closeCategoryModal() {
      this.showCategoryModal = false;
      this.editingCategoryId = null;
      this.categoryForm.name = "";
      this.categoryError = "";
    },

    editCategory(id, name) {
      this.editingCategoryId = Number(id);
      this.categoryForm.name = name;
      this.categoryError = "";
    },

    async saveCategory() {
      try {
        this.categoryError = "";
        const categoryName = this.categoryForm.name.trim();
        console.log("➡️ 輸入的分類名稱：", categoryName);

        if (!categoryName) {
          this.categoryError = "請輸入類別名稱";
          console.warn("⚠️ 未輸入分類名稱");
          return;
        }

        const existingCategories = Object.values(this.categoriesMap);
        const isExisting = existingCategories.some(
          (name) =>
            name.toLowerCase() === categoryName.toLowerCase() &&
            (!this.editingCategoryId ||
              name !== this.categoriesMap[this.editingCategoryId])
        );

        console.log("✅ 檢查是否重複名稱：", isExisting);
        if (isExisting) {
          this.categoryError = "此類別名稱已存在";
          console.warn("⚠️ 類別名稱重複");
          return;
        }

        console.log("🛠️ 編輯中的類別 ID：", this.editingCategoryId);

        if (this.editingCategoryId) {
          // ✅ 編輯類別（更新）
          const id = Number(this.editingCategoryId);
          console.log("📡 發送 PUT 請求到 /categories/" + id);

          await api.put(`/categories/${id}`, {
            Id: id,
            Name: categoryName,
          });

          console.log("✅ 類別更新成功");

          this.categoriesMap = {
            ...this.categoriesMap,
            [this.editingCategoryId]: categoryName,
          };

          this.products.forEach((p) => {
            if (p.categoryId === this.editingCategoryId) {
              p.category = categoryName;
            }
          });

          Swal.fire({
            icon: "success",
            title: "類別已更新",
            text: `類別「${categoryName}」已成功更新`,
            confirmButtonText: "確定",
            confirmButtonColor: "#3085d6",
          });

          this.closeCategoryModal();
        } else {
          // 🆕 建立新類別
          console.log("📡 發送 POST 請求建立分類", categoryName);

          const response = await api.post("/categories", {
            name: categoryName,
          });

          const newId = response.data.newId;
          console.log("✅ 新分類建立成功，newId =", newId);

          this.categoriesMap = {
            ...this.categoriesMap,
            [newId]: categoryName,
          };

          Swal.fire({
            icon: "success",
            title: "類別新增成功",
            text: `類別「${categoryName}」已建立`,
            confirmButtonText: "確定",
            confirmButtonColor: "#3085d6",
          });

          this.editingCategoryId = null; // 👈 加上這行
          this.closeCategoryModal();
          this.fetchCategories(); // 重新獲取類別列表
        }
      } catch (error) {
        console.error("❌ 新增或更新分類失敗:", error);

        const msg =
          error.response?.data?.Message ||
          error.response?.data ||
          error.message ||
          "操作失敗，請稍後再試";

        Swal.fire({
          icon: "error",
          title: "操作失敗",
          text: msg,
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },

    async deleteCategory(id, name) {
      const numericId = Number(id); // 👈 強制轉數字
      if (isNaN(numericId)) {
        console.warn("❌ 類別 ID 無效，無法刪除");
        return;
      }

      const count = this.getCategoryCount(numericId);
      if (count > 0) {
        Swal.fire({
          icon: "warning",
          title: "無法刪除",
          text: `無法刪除類別「${name}」，因為有 ${count} 項商品正在使用此類別`,
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const confirm = await Swal.fire({
        icon: "warning",
        title: "確定要刪除嗎？",
        text: `此操作無法復原，將永久刪除「${name}」`,
        showCancelButton: true,
        confirmButtonText: "確定刪除",
        cancelButtonText: "取消",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
      });

      if (!confirm.isConfirmed) return;

      try {
        console.log("📡 發送 DELETE 請求到 /categories/" + numericId);
        await api.delete(`/categories/${numericId}`);

        // 成功刪除，從 map 移除
        const newMap = { ...this.categoriesMap };
        delete newMap[numericId];
        this.categoriesMap = newMap;

        Swal.fire({
          icon: "success",
          title: "已刪除",
          text: `類別「${name}」已刪除`,
          confirmButtonText: "確定",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("❌ 刪除類別失敗:", error);
        Swal.fire({
          icon: "error",
          title: "刪除失敗",
          text: error.response?.data?.Message || "刪除失敗，請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },
    getCategoryCount(categoryId) {
      // 計算使用此類別的商品數量
      return this.products.filter(
        (product) => product.categoryId === categoryId
      ).length;
    },
    /**
     * 匯出商品到 CSV 文件
     */
    exportProductsCSV() {
      try {
        // 1. 確定要匯出的商品列表（使用當前過濾條件）
        let productsToExport = [...this.products];

        // 應用過濾條件（如果有的話）
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          productsToExport = productsToExport.filter(
            (product) =>
              product.name.toLowerCase().includes(query) ||
              product.id.toLowerCase().includes(query) ||
              product.category.toLowerCase().includes(query)
          );
        }

        if (this.categoryFilter) {
          productsToExport = productsToExport.filter(
            (product) => product.categoryId == this.categoryFilter
          );
        }

        if (this.statusFilter) {
          switch (this.statusFilter) {
            case "active":
              productsToExport = productsToExport.filter(
                (product) => product.isActive
              );
              break;
            case "inactive":
              productsToExport = productsToExport.filter(
                (product) => !product.isActive
              );
              break;
            case "lowStock":
              productsToExport = productsToExport.filter(
                (product) => product.stock <= product.lowStockThreshold
              );
              break;
          }
        }

        // 2. 準備 CSV 內容
        // CSV 表頭
        const headers = [
          "商品編號",
          "商品名稱",
          "類別",
          "售價",
          "庫存數量",
          "單位",
          "安全庫存",
          "狀態",
          "上架日期",
        ];

        // 將商品數據轉換為 CSV 行
        const rows = productsToExport.map((product) => [
          product.id,
          product.name,
          product.category,
          product.price,
          product.stock,
          product.unit || "件",
          product.lowStockThreshold,
          this.getProductStatusText(product),
          this.formatDate(product.createdAt),
        ]);

        // 添加表頭行
        rows.unshift(headers);

        // 將每一行轉換為 CSV 格式
        const csvContent = rows
          .map((row) =>
            row
              .map((cell) => {
                // 處理包含逗號、引號或換行符的單元格
                if (cell === null || cell === undefined) {
                  return "";
                }

                const cellText = String(cell);
                if (
                  cellText.includes(",") ||
                  cellText.includes('"') ||
                  cellText.includes("\n")
                ) {
                  // 需要用引號包裹，並且將引號轉義
                  return `"${cellText.replace(/"/g, '""')}"`;
                }
                return cellText;
              })
              .join(",")
          )
          .join("\n");

        // 3. 將 CSV 內容轉換為 Blob 和 URL
        // 添加 BOM 標記，確保 Excel 能正確識別 UTF-8 編碼的中文內容
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);

        // 4. 創建下載連結並自動點擊
        const downloadLink = document.createElement("a");
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, "-")
          .substring(0, 19);
        downloadLink.href = url;
        downloadLink.download = `商品列表_${timestamp}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // 5. 清理
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (error) {
        console.error("匯出 CSV 失敗:", error);
        Swal.fire({
          icon: "error",
          title: "匯出失敗",
          text: "匯出失敗，請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },

    async deleteProduct(product) {
      const confirm = await Swal.fire({
        icon: "warning", // 顯示警告圖示
        title: "確定要刪除商品？",
        text: `將永久刪除「${product.name}」`,
        showCancelButton: true, // 顯示取消按鈕
        confirmButtonText: "確定刪除",
        cancelButtonText: "取消",
        confirmButtonColor: "#d33", // 確定按鈕紅色
        cancelButtonColor: "#aaa", // 取消按鈕灰色
      });

      if (!confirm.isConfirmed) return; // 如果使用者按取消就不執行

      try {
        await api.delete(`/products/${product.id}`); // 呼叫後端刪除 API

        // ✅ 關閉商品詳情 modal，避免刪除後畫面錯誤
        this.showProductDetailModal = false;
        this.detailProduct = null;

        // ✅ 從本地 products 陣列移除該商品
        this.products = this.products.filter((p) => p.id !== product.id);

        Swal.fire({
          icon: "success",
          title: "刪除成功",
          text: `「${product.name}」已成功刪除`,
          confirmButtonText: "確定",
          confirmButtonColor: "#3085d6",
        });
      } catch (error) {
        console.error("刪除失敗", error);
        Swal.fire({
          icon: "error",
          title: "刪除失敗",
          text: error.response?.data?.Message || "請稍後再試",
          confirmButtonText: "確定",
          confirmButtonColor: "#d33",
        });
      }
    },
    /**
     * 獲取商品狀態的文字描述
     */
    getProductStatusText(product) {
      if (product.stock === 0) return "無庫存";
      if (product.stock <= product.lowStockThreshold) return "庫存低";
      if (!product.isActive) return "已下架";
      return "上架中";
    },
    /**
     * 從詳情頁編輯商品
     * @param {Object} product - 要編輯的商品
     */
    editFromDetails(product) {
      // 先關閉詳情模態框
      this.closeProductDetailModal();

      // 使用 setTimeout 確保詳情模態框完全關閉後再打開編輯模態框
      // 這樣可以避免視覺上的衝突和潛在的滾動問題
      setTimeout(() => {
        // 打開編輯模態框
        this.openProductModal(product);
      }, 100);
    },

    // 添加上傳方法
    async uploadImageWithSas(file) {
      try {
        // 1. 獲取 SAS URL
        const { data: sasData } = await api.get("/GetUploadSasUrl", {
          params: { filename: file.name },
        });

        // 2. 使用 fetch API 直接上傳圖片到 Blob Storage
        const response = await fetch(sasData.sasUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error(
            `上傳失敗: ${response.status} ${response.statusText}`
          );
        }

        // 返回圖片的公共 URL 和 blob 名稱
        return {
          imageUrl: sasData.blobUri,
          blobName: sasData.blobName,
        };
      } catch (error) {
        console.error("上傳圖片失敗:", error);
        throw error;
      }
    },
  },
};
</script>

<script setup>
// 此頁直接承載原會員/管理功能，不再引用 legacy 元件。
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
</script>

<style scoped>
.products-page {
  width: 100%;
  min-height: 0;
  height: auto;
  display: block;
  overflow: visible;
  padding: 0;
  box-sizing: border-box;
}
  
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

/* ============================================================
   商品內容區域
   功能：使用一般頁面流 + 頁碼分頁，不建立第二個垂直捲軸。
============================================================ */
.products-content {
  width: 100%;
  overflow: visible;
  padding: 0;
  min-height: 0;
}
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  /* 功能：不同螢幕寬度自動調整商品卡欄數，桌機寬畫面維持 5 張一排。 */
  @media (max-width: 1500px) {
    .products-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  @media (max-width: 1200px) {
    .products-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .products-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .products-grid {
      grid-template-columns: 1fr;
    }
  }
  
  .product-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  }
  
  /* 商品卡片右上角狀態標籤：提高圖片上的辨識度 */
  .product-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.75);
    box-shadow: 0 3px 10px rgba(15, 23, 42, 0.22);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 2;
  }
  
  /* 上架中：綠色 */
  .product-status.active {
    background: #2f855a;
  }
  
  /* 庫存低：橘色 */
  .product-status.low-stock {
    background: #dd6b20;
  }
  
  /* 無庫存：紅色 */
  .product-status.out-of-stock {
    background: #c53030;
  }
  
  /* 已下架：深灰色 */
  .product-status.inactive {
    background: #4a5568;
  }
  
  .product-image {
    width: 100%;
    height: 150px;
    overflow: hidden;
    background: #f7fafc;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .product-info {
    padding: 16px;
  }
  
  .product-name {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 4px 0;
    line-height: 1.4;
  }
  
  .product-id {
    font-size: 12px;
    color: #718096;
    margin: 0 0 8px 0;
  }
  
  .product-category {
    display: inline-block;
    padding: 4px 10px;
    background: #ebf4ff;
    color: #2c5282;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 16px;
  }
  
  .product-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px 16px;
    margin-bottom: 4px;
  }
  
  .detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-label {
    font-size: 12px;
    color: #718096;
    margin-bottom: 2px;
  }
  
  .detail-value {
    font-size: 14px;
    color: #2d3748;
    font-weight: 500;
  }
  
  .detail-value.price {
    color: #2c5282;
    font-weight: 600;
  }
  
  .detail-value.stock-warning {
    color: #dd6b20;
  }
  
  .product-actions {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid #f0f0f0;
  }
  
  .action-icon-btn {
    border: none;
    background: none;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #718096;
    transition: all 0.2s;
  }
  
  .action-icon-btn:hover {
    background: #f7fafc;
  }
  
  .action-icon-btn.view-btn:hover {
    color: #2c5282;
  }
  
  .action-icon-btn.edit-btn:hover {
    color: #3182ce;
  }
  
  .action-icon-btn.active-btn {
    color: #38a169;
  }
  
  .action-icon-btn.delete-btn:hover {
    color: #e53e3e;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 32px 0 8px;
    gap: 8px;
    flex-wrap: wrap;
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

  /* 模態窗 */
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
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-modal {
  width: 90%;
  max-width: 800px;
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
  max-height: calc(90vh - 120px);
}

/* 表單 */
.product-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 24px;
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.required {
  color: #e53e3e;
  margin-left: 4px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-control:disabled {
  background-color: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.form-note {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #a0aec0;
}

.input-prefix {
  position: relative;
}

.input-prefix .prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #4a5568;
  font-size: 14px;
}

.input-prefix .form-control {
  padding-left: 42px;
}

/* 圖片上傳 */
.image-upload-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  margin-bottom: 8px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-image-btn:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.image-upload {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #718096;
}

.upload-label i {
  font-size: 36px;
  margin-bottom: 8px;
}

.file-input {
  display: none;
}

/* 切換開關 */
.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  margin-right: 12px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #38a169;
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px #38a169;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-label {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.toggle-desc {
  font-size: 12px;
  color: #718096;
}

/* 表單操作按鈕 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #2c5282;
}

.btn-secondary {
  background-color: #edf2f7;
  color: #4a5568;
  border: none;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.btn-primary i, .btn-secondary i {
  margin-right: 8px;
}

/* ============================================================
   商品新增 / 編輯 Modal 橫向管理版面
   功能：只調整視覺排版，不更動 v-model、事件、驗證、API 與圖片上傳邏輯。
   桌機將基本資料、商品規格、商品圖片、商品描述橫向排列，讓管理員快速掃描。
============================================================ */
.product-modal {
  width: min(96vw, 1220px);
  max-width: 1220px;
  max-height: 88dvh;
}

.product-modal .modal-header {
  flex: 0 0 auto;
  padding: 16px 22px;
}

.product-modal .modal-body {
  max-height: calc(88dvh - 66px);
  padding: 20px 22px 18px;
  overflow-y: auto;
}

.product-modal .product-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 18px;
  align-items: stretch;
}

/* 功能：每個資訊區塊改成卡片，桌機兩欄並排。 */
.product-modal .form-section {
  min-width: 0;
  margin: 0;
  padding: 16px;
  background: #fbfcfe;
  border: 1px solid #e4eaf0;
  border-radius: 10px;
}

.product-modal .form-section:last-child {
  padding-bottom: 16px;
  border-bottom: 1px solid #e4eaf0;
}

.product-modal .section-title {
  margin: 0 0 14px;
  padding-bottom: 9px;
  border-bottom: 1px solid #e7edf3;
  font-size: 15px;
}

/* 功能：基本資料的商品名稱與類別同一列顯示。 */
.product-modal .form-section:nth-of-type(1) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.product-modal .form-section:nth-of-type(1) .section-title {
  grid-column: 1 / -1;
}

.product-modal .form-section:nth-of-type(1) .form-group {
  margin: 0;
}

/* 功能：售價與庫存維持同一橫列，壓縮不必要的上下留白。 */
.product-modal .form-section:nth-of-type(2) .form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

.product-modal .form-group {
  margin-bottom: 0;
}

.product-modal .form-group label {
  margin-bottom: 6px;
  font-size: 13px;
}

.product-modal .form-control {
  min-height: 42px;
  padding: 9px 11px;
}

/* 功能：圖片預覽固定成管理用尺寸，避免原圖把整個編輯框往下撐。 */
.product-modal .image-upload-container {
  height: 210px;
  min-height: 210px;
  aspect-ratio: auto;
  margin: 0;
  background: #fff;
}

.product-modal .image-preview img {
  object-fit: contain;
  background: #fff;
}

/* 功能：描述區直接與圖片區並排，textarea 使用固定高度方便快速閱讀。 */
.product-modal textarea.form-control {
  height: 210px;
  min-height: 210px;
  resize: vertical;
  line-height: 1.6;
}

.product-modal .form-actions {
  grid-column: 1 / -1;
  margin-top: 0;
  padding-top: 2px;
}

/* 平板以下回到單欄，避免橫向欄位過度擁擠。 */
@media (max-width: 900px) {
  .product-modal {
    width: min(94vw, 760px);
  }

  .product-modal .product-form {
    grid-template-columns: 1fr;
  }

  .product-modal .form-section:nth-of-type(1),
  .product-modal .form-section:nth-of-type(2) .form-row {
    grid-template-columns: 1fr;
  }

  .product-modal .form-actions {
    grid-column: auto;
  }
}

/* 改進商品詳情模態窗樣式 */
.product-detail-modal {
  max-width: 800px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f7fafc;
  color: #4a5568;
}

.modal-body {
  padding: 24px;
}

.product-detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.product-detail-image {
  width: 240px;
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background-color: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 240px;
}

.detail-product-name {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.detail-product-id {
  font-size: 14px;
  color: #718096;
  margin: 0 0 16px 0;
}

.detail-tag-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.detail-category-tag {
  padding: 4px 12px;
  background-color: #ebf8ff;
  color: #3182ce;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.detail-status-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.detail-status-tag.active {
  background-color: #f0fff4;
  color: #38a169;
}

.detail-status-tag.low-stock {
  background-color: #fffaf0;
  color: #dd6b20;
}

.detail-status-tag.out-of-stock {
  background-color: #fff5f5;
  color: #e53e3e;
}

.detail-status-tag.inactive {
  background-color: #edf2f7;
  color: #718096;
}

.detail-price {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.detail-price-label {
  font-size: 16px;
  color: #718096;
  margin-right: 8px;
}

.detail-price-value {
  font-size: 28px;
  font-weight: 700;
  color: #e53e3e;
}

.product-detail-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.product-detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 16px 0;
  padding-left: 10px;
  border-left: 3px solid #3182ce;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background-color: #f7fafc;
  padding: 16px;
  border-radius: 8px;
}

.detail-info-item {
  display: flex;
  flex-direction: column;
}

.detail-info-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 4px;
}

.detail-info-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.detail-info-value.stock-warning {
  color: #dd6b20;
}

.detail-description {
  padding: 16px;
  background-color: #f7fafc;
  border-radius: 8px;
  color: #4a5568;
  line-height: 1.6;
  white-space: pre-line;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f7fafc;
  border-radius: 0 0 8px 8px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}


/* 編輯類別按鈕樣式 */
.category-btn {
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #ebf8ff;
  color: #3182ce;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn i {
  margin-right: 8px;
}

.category-btn:hover {
  background-color: #bee3f8;
  border-color: #90cdf4;
}

/* 類別管理模態窗樣式 */
.category-modal {
  max-width: 500px;
}

.category-form {
  margin-bottom: 24px;
}

.category-list {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-list-header {
  background-color: #f7fafc;
  padding: 12px 16px;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-name {
  font-size: 14px;
  color: #2d3748;
}

.category-count {
  font-size: 12px;
  color: #718096;
  margin-left: 8px;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.action-btn-small {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-small.edit:hover {
  background-color: #ebf8ff;
  color: #3182ce;
  border-color: #90cdf4;
}

.action-btn-small.delete:hover {
  background-color: #fff5f5;
  color: #e53e3e;
  border-color: #feb2b2;
}

.input-group {
  display: flex;
  gap: 8px;
}

.input-group .form-control {
  flex: 1;
}

.input-group .form-btn {
  padding: 10px 16px;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.input-group .form-btn:hover {
  background-color: #2c5282;
}

.empty-category-list {
  padding: 24px;
  text-align: center;
  color: #a0aec0;
}

.empty-category-list i {
  font-size: 32px;
  margin-bottom: 8px;
}

/* 提示資訊 */
.info-text {
  font-size: 13px;
  color: #718096;
  margin: 8px 0 0;
  padding-left: 12px;
  border-left: 3px solid #cbd5e0;
}

/* 表單驗證錯誤提示 */
.form-error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}
</style>
