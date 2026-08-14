<template>
  <Teleport to="body">
    <Transition name="fade" appear>
      <div v-if="isVisible" class="modal-overlay">
        <div class="modal-wrapper">
          <div class="modal-content">
            <!-- 關閉按鈕 -->
            <button class="modal-close" type="button" :aria-label="$ui('關閉')" @click="closeModal">&times;</button>

            <!-- 標題區域 -->
            <div class="modal-header">
              <h2 class="modal-title">{{ $ui('推薦商品') }}</h2>
            </div>

            <!-- 標籤頁切換 -->
            <div class="product-tabs">
              <button
                v-for="(product, index) in products"
                :key="product.id"
                :class="{ active: activeTab === index }"
                @click="activeTab = index"
                class="tab-button"
              >
                {{ $ui(product.name) }}
              </button>
            </div>

            <!-- 產品內容區域 -->
            <div class="product-detail">
              <div class="product-image-container">
                <img
                  :src="products[activeTab].imageUrl"
                  :alt="$ui(products[activeTab].name)"
                  class="product-image"
                  @click="openLightbox(products[activeTab].imageUrl)"
                />
              </div>

              <div class="product-info">
                <span class="product-recommend-label">{{ $ui('推薦醫療設備') }}</span>
                <h3 class="product-name">{{ $ui(products[activeTab].name) }}</h3>
                <p class="product-description">
                  {{ $ui(products[activeTab].description) }}
                </p>

                <h4 class="features-title">{{ $ui('主要特點：') }}</h4>
                <ul class="features-list">
                  <li
                    v-for="(feature, i) in products[activeTab].features"
                    :key="i"
                    class="feature-item"
                  >
                    <span class="feature-icon">✓</span>
                    <span class="feature-text">{{ $ui(feature) }}</span>
                  </li>
                </ul>

                <div class="product-actions">
                  <button class="btn-secondary" @click="contactSupport">{{ $ui('聯絡客服') }}</button>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </Transition>

    <!-- 圖片全螢幕檢視：直接掛在 body，避免被推薦商品 Modal 層級限制 -->
    <Transition name="fade">
      <div
        v-if="lightboxVisible"
        class="lightbox"
        @wheel.prevent="handleZoom"
      >
        <button class="lightbox-close" type="button" :aria-label="$ui('關閉圖片')" @click="closeLightbox">&times;</button>
        <div
          class="lightbox-zoom-container"
          @mousedown="startDragging"
          @mousemove="onDragging"
          @mouseup="stopDragging"
          @mouseleave="stopDragging"
        >
          <img
            :src="lightboxImage"
            class="lightbox-image"
            :style="zoomStyle"
            draggable="false"
            @mousedown="startDragging"
            @mousemove="onDragging"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import board798Image from "@/assets/image/Board798.webp";
import board799Image from "@/assets/image/Board799.webp";
export default {
  name: "RecommendedProductsModal",
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      zoomLevel: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      activeTab: 0,
      lightboxVisible: false,
      lightboxImage: "",
      products: [
        {
          id: 1,
          name: "PGS-798 德國電刀",
          imageUrl: board798Image,
          description: "多功能整合設計，搭配高安全性與操作效率。",
          features: [
            "電壓全球通用。",
            "安全警示與保護。",
            "多功能應用設計。",
            "高效率操作介面。",
            "智能電壓調整系統。",
            "音效與安全提醒設計。",
          ],
        },
        {
          id: 2,
          name: "PGS-799 德國氬氣刀",
          imageUrl: board799Image,
          description: "高效能氬氣系統，支援精準手術操作。",
          features: [
            "應用領域廣泛。",
            "高解析觸控螢幕。",
            "自動切換氣瓶機制。",
            "異常保護與警示功能。",
            "非接觸式氬氣止血設計。",
          ],
        },
      ],
    };
  },
  computed: {
    zoomStyle() {
      return {
        transform: `scale(${this.zoomLevel}) translate(${this.translateX}px, ${this.translateY}px)`,
        transition: this.isDragging ? "none" : "transform 0.2s",
        cursor: this.isDragging ? "grabbing" : "grab",
      };
    },
  },
  emits: ["close", "contact", "learn-more"],
  beforeUnmount() {
    if (typeof document !== "undefined") document.body.style.overflow = "";
  },
  methods: {
    handleZoom(event) {
      const delta = Math.sign(event.deltaY);
      if (delta > 0) {
        this.zoomLevel = Math.max(1, this.zoomLevel - 0.1);
      } else {
        this.zoomLevel = Math.min(5, this.zoomLevel + 0.1);
      }
    },
    startDragging(event) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
    },
    onDragging(event) {
      if (!this.isDragging) return;
      const dx = event.clientX - this.startX;
      const dy = event.clientY - this.startY;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.translateX += dx / this.zoomLevel;
      this.translateY += dy / this.zoomLevel;
    },
    stopDragging() {
      this.isDragging = false;
    },
    closeLightbox() {
      this.lightboxVisible = false;
      this.lightboxImage = "";
      this.zoomLevel = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    openLightbox(imageUrl) {
      this.lightboxImage = imageUrl;
      this.lightboxVisible = true;
    },

    closeModal() {
      if (this.lightboxVisible) this.closeLightbox();
      this.$emit("close");
    },
    contactSupport() {
      this.$emit("contact");
      this.closeModal();
    },
    learnMore() {
      this.$emit("learn-more", this.products[this.activeTab]);
      this.closeModal();
    },
  },
};
</script>

<style scoped>
/* Base styles */
.lightbox-zoom-container {
  display:flex;
  width:100%;
  height:100%;
  max-width:none;
  max-height:none;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  cursor:grab;
}

.lightbox-image {
  user-select: none;
}

.lightbox-close {
  position: absolute;
  top: clamp(1rem, 2.5vw, 1.25rem);
  right: clamp(1rem, 2.5vw, 1.25rem);
  font-size: clamp(1.5rem, 3.5vw, 1.75rem);
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 2100;
  padding: clamp(0.375rem, 1vw, 0.5rem);
  transition: background-color 0.3s;
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  cursor: zoom-out;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  transform: scale(1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: clamp(0.625rem, 2vw, 1.25rem);
}

.modal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.modal-content {
  background: white;
  border-radius: clamp(0.5rem, 1.5vw, 0.75rem);
  width: 95%;
  max-width: 68.75rem;
  box-shadow: 0 clamp(0.1875rem, 1vw, 0.3125rem) clamp(0.9375rem, 2.5vw, 1.25rem) rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: clamp(0.625rem, 1.5vw, 0.625rem);
  right: clamp(0.625rem, 1.5vw, 0.625rem);
  background: none;
  border: none;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  color: #fff;
  cursor: pointer;
  z-index: 10;
  width: clamp(1.75rem, 4vw, 2rem);
  height: clamp(1.75rem, 4vw, 2rem);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
}

.modal-close:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-header {
  background-color: #e07b39;
  color: rgb(3, 3, 3);
  text-align: center;
  padding: clamp(0.75rem, 2vw, 0.9375rem) clamp(1rem, 2.5vw, 1.25rem);
}

.modal-title {
  font-size: clamp(1.125rem, 4vw, 1.5rem);
  font-weight: 700;
  margin: 0;
  color: white;
}

/* Tabs */
.product-tabs {
  display: flex;
  border-bottom: 0.0625rem solid #e0e0e0;
  background-color: #f8f8f8;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.product-tabs::-webkit-scrollbar {
  height: clamp(0.1875rem, 0.5vw, 0.25rem);
}

.product-tabs::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: clamp(0.1875rem, 0.5vw, 0.25rem);
}

.tab-button {
  padding: clamp(0.625rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  padding-bottom: clamp(0.625rem, 1.5vw, 0.625rem);
  border: none;
  background: none;
  font-size: clamp(0.9rem, 1.5vh, 1rem);
  font-weight: 500;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 0.125rem solid transparent;
  transition: all 0.3s;
  flex-shrink: 0;
}

.tab-button.active {
  color: #e07b39;
  border-bottom-color: #e07b39;
}

.tab-button:hover:not(.active) {
  background-color: #f0f0f0;
}

/* Product Detail */
.product-detail {
  display: flex;
  flex-direction: column;
  padding: clamp(0.75rem, 2vw, 1rem);
  overflow-y: auto;
  align-items: center;
  flex: 1;
}

.product-image-container {
  margin: 0 auto clamp(1rem, 2.5vw, 1.25rem);
  width: 100%;
  text-align: center;
}

.product-image {
  width: 100%;
  height: auto;
  max-height: clamp(15.625rem, 40vw, 18.75rem);
  object-fit: contain;
  border-radius: clamp(0.375rem, 1vw, 0.5rem);
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.03);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: clamp(1rem, 5vw, 1.375rem);
  font-weight: 600;
  color: #e07b39;
  margin: 0 0 clamp(0.625rem, 1.5vw, 0.75rem) 0;
}

.product-description {
  font-size: clamp(0.875rem, 3vw, 0.9375rem);
  color: #555;
  line-height: 1.5;
  margin-bottom: clamp(1rem, 2.5vw, 1.25rem);
}

.features-title {
  font-size: clamp(0.9375rem, 3vw, 1rem);
  font-weight: 600;
  color: #e07b39;
  margin: clamp(0.75rem, 2vw, 0.9375rem) 0 clamp(0.625rem, 1.5vw, 0.75rem) 0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 clamp(1rem, 2.5vw, 1.25rem) 0;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: clamp(0.5rem, 1.5vw, 0.625rem);
}

.feature-icon {
  color: #4caf50;
  margin-right: clamp(0.375rem, 1vw, 0.5rem);
  font-weight: bold;
  flex-shrink: 0;
}

.feature-text {
  font-size: clamp(0.8125rem, 3vw, 0.9375rem);
  color: #333;
  line-height: 1.4;
}

.product-actions {
  display: flex;
  gap: clamp(0.625rem, 1.5vw, 0.75rem);
  margin-top: clamp(1rem, 2.5vw, 1.25rem);
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  background-color: #e07b39;
  color: white;
  border: none;
  padding: clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 4vw, 1.5rem);
  border-radius: clamp(0.3125rem, 1vw, 0.375rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-size: clamp(0.8125rem, 3vw, 0.875rem);
  margin-top: -1rem;
}

.btn-primary {
  background-color: #e07b39;
}

.btn-primary:hover {
  background-color: #1f4521;
}

.btn-secondary:hover {
  background-color: #d06b29;
}

.modal-footer {
  border-top: 0.0625rem solid #e0e0e0;
  padding: clamp(0.625rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f8f8;
  margin-top: auto;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (min-width: 48rem) {
  .product-detail {
    flex-direction: row;
    gap: clamp(1.25rem, 3vw, 1.5rem);
    align-items: center;
  }

  .product-image-container {
    width: 45%;
    margin: 0;
  }

  .product-info {
    width: 55%;
  }

  .product-actions {
    flex-direction: row;
  }
}

@media (min-width: 64rem) {
  .product-detail {
    gap: clamp(1.5rem, 3vw, 1.875rem);
  }

  .product-image-container {
    width: 50%;
  }

  .product-image {
    max-height: clamp(25rem, 50vw, 31.25rem);
  }

  .product-info {
    width: 50%;
  }

  .modal-content {
    max-height: 85vh;
  }
}

@media (max-height: 43.75rem) {
  .modal-header {
    padding: clamp(0.5rem, 1.5vw, 0.625rem) clamp(0.75rem, 2vw, 0.9375rem);
  }

  .product-detail {
    padding: clamp(0.625rem, 1.5vw, 0.75rem);
  }
}


/* ============================================================
   推薦商品 Modal - 官網展示版
============================================================ */
.modal-overlay{
  padding:clamp(20px,3vw,44px)!important;
  background:rgba(20,32,40,.50)!important;
  backdrop-filter:blur(7px);
}
.modal-wrapper{width:100%;max-width:1160px;margin:auto;}
.modal-content{
  width:100%!important;
  max-width:none!important;
  max-height:88dvh!important;
  overflow:hidden!important;
  background:#fff!important;
  border:1px solid #e6ecec!important;
  border-radius:24px!important;
  box-shadow:0 28px 72px rgba(18,35,43,.24)!important;
}
.modal-header{
  padding:24px 78px 16px 34px!important;
  text-align:left!important;
  background:#fff!important;
  border-bottom:0!important;
}
.modal-title{
  margin:0!important;
  color:#173245!important;
  font-size:26px!important;
  font-weight:800!important;
  letter-spacing:.04em;
}
.modal-title::before,
.modal-title::after{display:none!important;}
.modal-close{
  top:20px!important;
  right:22px!important;
  width:42px!important;
  height:42px!important;
  padding:0!important;
  color:#55707b!important;
  background:#fff!important;
  border:1px solid #dbe5e7!important;
  border-radius:50%!important;
  box-shadow:none!important;
  font-size:25px!important;
}
.modal-close:hover{
  color:#8f3b86!important;
  background:#fbf7fb!important;
  border-color:#d9bdd5!important;
}
.product-tabs{
  display:flex!important;
  gap:22px!important;
  padding:0 34px 14px!important;
  background:#fff!important;
  border-bottom:1px solid #edf1f2!important;
}
.tab-button{
  position:relative;
  min-height:auto!important;
  padding:0 0 11px!important;
  color:#72818a!important;
  background:transparent!important;
  border:0!important;
  border-radius:0!important;
  font-size:13px!important;
  font-weight:700!important;
  box-shadow:none!important;
}
.tab-button::after{
  position:absolute;
  left:0;
  bottom:-1px;
  width:100%;
  height:2px;
  content:'';
  background:#8f3b86;
  transform:scaleX(0);
  transform-origin:left;
  transition:transform .2s ease;
}
.tab-button.active{
  color:#8f3b86!important;
  background:transparent!important;
  border:0!important;
}
.tab-button.active::after{transform:scaleX(1);}
.tab-button:hover:not(.active){color:#8f3b86!important;background:transparent!important;}
.product-detail{
  display:grid!important;
  grid-template-columns:minmax(320px,.88fr) minmax(0,1.12fr)!important;
  gap:54px!important;
  padding:34px!important;
  align-items:center!important;
  overflow-y:auto!important;
  background:#fff!important;
}
.product-image-container{
  display:flex!important;
  width:100%!important;
  min-height:460px!important;
  margin:0!important;
  padding:0!important;
  align-items:center!important;
  justify-content:center!important;
  overflow:hidden!important;
  background:#f8faf9!important;
  border:1px solid #edf1f2!important;
  border-radius:18px!important;
}
.product-image{
  width:auto!important;
  height:auto!important;
  max-width:88%!important;
  max-height:430px!important;
  object-fit:contain!important;
  border-radius:8px!important;
  box-shadow:none!important;
  transition:transform .2s ease!important;
}
.product-image:hover{transform:scale(1.015)!important;}
.product-info{
  display:flex!important;
  width:100%!important;
  min-width:0!important;
  padding:6px 8px 8px 0!important;
  flex-direction:column!important;
  justify-content:center!important;
}
.product-recommend-label{
  display:block!important;
  margin-bottom:9px!important;
  color:#8b2f7e!important;
  font-size:12px!important;
  font-weight:800!important;
  letter-spacing:.08em!important;
}
.product-name{
  margin:0 0 14px!important;
  color:#173245!important;
  font-size:clamp(30px,2.6vw,40px)!important;
  font-weight:800!important;
  line-height:1.2!important;
}
.product-description{
  max-width:620px!important;
  margin:0 0 26px!important;
  color:#6a7b84!important;
  font-size:14.5px!important;
  line-height:1.85!important;
}
.features-title{
  margin:0 0 14px!important;
  color:#173245!important;
  font-size:14px!important;
  font-weight:800!important;
}
.features-list{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:12px 18px!important;
  margin:0!important;
}
.feature-item{
  display:flex!important;
  min-width:0!important;
  margin:0!important;
  align-items:center!important;
}
.feature-icon{
  display:inline-block!important;
  width:auto!important;
  height:auto!important;
  margin-right:8px!important;
  color:#3d9a93!important;
  background:transparent!important;
  border-radius:0!important;
  font-size:15px!important;
  font-weight:800!important;
}
.feature-text{
  color:#455b65!important;
  font-size:13.5px!important;
  line-height:1.5!important;
}
.product-actions{
  display:flex!important;
  margin-top:30px!important;
}
.btn-secondary{
  min-width:142px!important;
  min-height:46px!important;
  padding:0 24px!important;
  color:#fff!important;
  background:#8f3b86!important;
  border:0!important;
  border-radius:10px!important;
  box-shadow:none!important;
  font-size:14px!important;
  font-weight:800!important;
}
.btn-secondary:hover{
  background:#7b2f73!important;
  transform:translateY(-1px)!important;
}
.lightbox{
  position:fixed!important;
  inset:0!important;
  width:100vw!important;
  height:100dvh!important;
  z-index:99999!important;
  background:rgba(14,27,34,.9)!important;
  backdrop-filter:blur(8px);
}
@media(max-width:900px){
  .modal-content{max-height:92dvh!important;border-radius:20px!important;}
  .modal-header{padding:22px 66px 14px 24px!important;}
  .product-tabs{padding:0 24px 12px!important;gap:18px!important;}
  .product-detail{grid-template-columns:1fr!important;gap:24px!important;padding:24px!important;}
  .product-image-container{min-height:320px!important;}
  .product-image{max-height:300px!important;}
  .product-info{padding:0!important;}
}
@media(max-width:560px){
  .modal-overlay{padding:10px!important;}
  .modal-content{border-radius:18px!important;}
  .modal-header{padding:18px 56px 12px 18px!important;}
  .modal-title{font-size:22px!important;}
  .modal-close{top:14px!important;right:14px!important;width:38px!important;height:38px!important;font-size:23px!important;}
  .product-tabs{padding:0 18px 10px!important;gap:16px!important;}
  .tab-button{font-size:12px!important;}
  .product-detail{gap:18px!important;padding:18px!important;}
  .product-image-container{min-height:240px!important;border-radius:14px!important;}
  .product-image{max-height:225px!important;max-width:94%!important;}
  .product-name{font-size:26px!important;}
  .product-description{font-size:13px!important;margin-bottom:20px!important;}
  .features-list{grid-template-columns:1fr!important;gap:9px!important;}
  .feature-text{font-size:13px!important;}
  .btn-secondary{width:100%!important;}
}

/* 桌機推薦商品框與雙層 Header 保留安全距離 */
@media (min-width: 901px) {
  .modal-wrapper {
    transform: translateY(16px);
  }
}

/* 中小尺寸 Modal 層級與可視區修正 */
@media(max-width:900px){
  .modal-overlay{
    z-index:7000!important;
    align-items:flex-start!important;
    padding:18px 14px!important;
    overflow-y:auto!important;
  }
  .modal-wrapper{
    min-height:auto!important;
    align-items:flex-start!important;
  }
  .modal-content{
    width:100%!important;
    max-height:calc(100dvh - 36px)!important;
    margin:0!important;
    overflow:hidden!important;
  }
  .product-detail{
    overflow-y:auto!important;
    overscroll-behavior:contain;
  }
  .modal-close{
    position:absolute!important;
    z-index:20!important;
  }
}
@media(max-width:560px){
  .modal-overlay{
    padding:10px!important;
  }
  .modal-content{
    max-height:calc(100dvh - 20px)!important;
  }
}

/* ============================================================
   首頁推薦商品 Modal 最終遮罩設定
   功能：與商品詳情 Modal 一致，覆蓋 Header、完整 viewport 與原 scrollbar 區域。
============================================================ */
.modal-overlay {
  position: fixed !important;
  z-index: 12000 !important;
  inset: 0 auto 0 0 !important;
  width: 100vw !important;
  min-height: 100dvh !important;
}


/* ============================================================
   推薦商品客服按鈕位置調整
   功能：按鈕放在右側商品資訊底部並靠右，與特色清單保留清楚間距。
============================================================ */
.product-actions {
  width: 100% !important;
  margin-top: 28px !important;
  padding-top: 20px !important;
  justify-content: flex-end !important;
  border-top: 1px solid #edf1f2 !important;
}

.btn-secondary {
  min-width: 160px !important;
  min-height: 46px !important;
  margin-top: 0 !important;
  padding: 0 28px !important;
}

@media (max-width: 900px) {
  .product-actions {
    margin-top: 22px !important;
    padding-top: 18px !important;
  }
}

@media (max-width: 560px) {
  .product-actions {
    justify-content: stretch !important;
  }

  .btn-secondary {
    width: 100% !important;
  }
}


/* ============================================================
   推薦商品右側資訊重新對齊
   功能：讓商品標題、說明、特色與客服按鈕形成同一組內容，不再讓按鈕孤立在右下角。
============================================================ */
@media (min-width: 901px) {
  .product-detail {
    align-items: stretch !important;
  }

  .product-info {
    display: flex !important;
    min-height: 460px !important;
    padding: 28px 34px 28px 0 !important;
    flex-direction: column !important;
    justify-content: center !important;
  }

  .product-recommend-label {
    margin-bottom: 10px !important;
  }

  .product-name {
    margin-bottom: 16px !important;
  }

  .product-description {
    max-width: 560px !important;
    margin-bottom: 24px !important;
  }

  .features-title {
    margin-bottom: 14px !important;
  }

  .features-list {
    max-width: 560px !important;
    gap: 12px 26px !important;
  }

  .product-actions {
    width: auto !important;
    margin-top: 26px !important;
    padding-top: 0 !important;
    justify-content: flex-start !important;
    border-top: 0 !important;
  }

  .btn-secondary {
    min-width: 168px !important;
  }
}

@media (max-width: 900px) {
  .product-info {
    min-height: 0 !important;
  }

  .product-actions {
    margin-top: 22px !important;
    padding-top: 0 !important;
    justify-content: flex-start !important;
    border-top: 0 !important;
  }
}

</style>