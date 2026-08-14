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
    totalFilteredProducts() {
      let result = [...this.products];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter((product) => {
          const id = product.id ? product.id.toString().toLowerCase() : "";
          const name = product.name ? product.name.toLowerCase() : "";
          const category = product.category
            ? product.category.toLowerCase()
            : "";

          return (
            id.includes(query) ||
            name.includes(query) ||
            category.includes(query)
          );
        });
      }

      if (this.categoryFilter) {
        result = result.filter(
          (product) => product.categoryId == this.categoryFilter
        );
      }

      if (this.statusFilter) {
        switch (this.statusFilter) {
          case "active":
            result = result.filter((product) => product.isActive);
            break;
          case "inactive":
            result = result.filter((product) => !product.isActive);
            break;
          case "lowStock":
            result = result.filter(
              (product) => product.stock <= product.lowStockThreshold
            );
            break;
        }
      }

      return result.length;
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
      this.currentPage = page;
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
