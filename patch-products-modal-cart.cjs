const fs = require('fs');
const p = 'app/pages/products.vue';
let s = fs.readFileSync(p, 'utf8');

const oldModal = `<div v-if="selectedProduct" class="product-modal" @click.self="selectedProduct = null">
      <div class="product-modal-panel">
        <button class="modal-close" type="button" @click="selectedProduct = null">×</button>
        <div class="modal-image-area"><img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" /></div>
        <div class="modal-copy">
          <span>{{ getCategoryName(selectedProduct.categoryId) }}</span>
          <h2>{{ selectedProduct.name }}</h2>
          <p>{{ selectedProduct.description }}</p>
          <div class="modal-meta">
            <strong>{{ formatPrice(selectedProduct.price) }}</strong>
            <span>{{ selectedProduct.stock === 0 ? '無庫存' : '有庫存' }}</span>
          </div>
          <button
            type="button"
            class="modal-cart-btn"
            :disabled="selectedProduct.stock === 0"
            @click="addToCart(selectedProduct)"
          >
            {{ selectedProduct.stock === 0 ? '目前無庫存' : '加入購物車' }}
          </button>
        </div>
      </div>
    </div>`;

const newModal = `<div v-if="selectedProduct" class="product-modal" @click.self="selectedProduct = null">
      <div class="product-modal-panel product-modal-premium">
        <button class="modal-close modal-close-premium" type="button" @click="selectedProduct = null" aria-label="關閉商品資訊">×</button>

        <div class="modal-image-area modal-image-premium">
          <div class="modal-image-card">
            <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" />
          </div>
        </div>

        <div class="modal-copy modal-copy-premium">
          <div class="modal-heading-block">
            <span class="modal-category-label">{{ getCategoryName(selectedProduct.categoryId) }}</span>
            <h2>{{ selectedProduct.name }}</h2>
            <p>{{ selectedProduct.description }}</p>
          </div>

          <div class="modal-purchase-panel">
            <div class="modal-price-block">
              <span class="modal-price-label">商品價格</span>
              <strong>{{ formatPrice(selectedProduct.price) }}</strong>
            </div>
            <span class="modal-stock-pill" :class="{ empty: selectedProduct.stock === 0 }">
              <span class="modal-stock-dot"></span>
              {{ selectedProduct.stock === 0 ? '目前無庫存' : '有庫存' }}
            </span>
          </div>

          <div class="modal-action-group">
            <button
              type="button"
              class="modal-cart-btn modal-cart-primary"
              :disabled="selectedProduct.stock === 0"
              @click="addToCart(selectedProduct)"
            >
              <span class="modal-cart-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 4h2l2.1 9.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>
              </span>
              {{ selectedProduct.stock === 0 ? '目前無庫存' : '加入購物車' }}
            </button>
            <button type="button" class="modal-cart-secondary" @click="goToCart">查看購物車</button>
          </div>
        </div>
      </div>
    </div>`;

if (!s.includes(oldModal)) {
  console.error('old modal block not found');
  process.exit(1);
}
s = s.replace(oldModal, newModal);

const oldCart = `<span class="cart-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.1 9.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg></span><span class="cart-label">購物車</span>`;
const newCart = `<span class="floating-cart-icon-wrap" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.1 9.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H7"/><circle cx="10" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg></span><span class="floating-cart-copy"><strong>購物車</strong><small>{{ cartItemCount > 0 ? '已選 ' + cartItemCount + ' 件商品' : '查看已選商品' }}</small></span>`;
s = s.replace(oldCart, newCart);

const marker = '/* ===== Product Modal Premium + Floating Cart Card ===== */';
if (!s.includes(marker)) {
  const css = `\n\n${marker}\n/* 功能：只重做商品詳細資訊與浮動購物車視覺，不修改購物車 API 與流程。 */\n.products-page .product-modal {\n  padding: clamp(18px, 3vw, 36px) !important;\n  background: rgba(21, 38, 46, .52) !important;\n  backdrop-filter: blur(10px) !important;\n}\n\n.products-page .product-modal-premium {\n  display: grid !important;\n  grid-template-columns: minmax(360px, .92fr) minmax(0, 1.08fr) !important;\n  width: min(100%, 1040px) !important;\n  min-height: 590px !important;\n  overflow: hidden !important;\n  background: #fff !important;\n  border: 1px solid rgba(225, 233, 234, .95) !important;\n  border-radius: 28px !important;\n  box-shadow: 0 32px 80px rgba(20, 46, 56, .22) !important;\n}\n\n.products-page .modal-close-premium {\n  top: 20px !important;\n  right: 20px !important;\n  width: 46px !important;\n  height: 46px !important;\n  color: #304854 !important;\n  background: rgba(255,255,255,.96) !important;\n  border: 1px solid #dce5e6 !important;\n  box-shadow: 0 8px 20px rgba(34, 58, 68, .08) !important;\n  font-size: 27px !important;\n  transition: transform .18s ease, background-color .18s ease !important;\n}\n.products-page .modal-close-premium:hover {\n  background: #f7faf9 !important;\n  transform: rotate(4deg) scale(1.04) !important;\n}\n\n.products-page .modal-image-premium {\n  display: grid !important;\n  min-height: 590px !important;\n  padding: 40px !important;\n  background:\n    radial-gradient(circle at 12% 12%, rgba(139, 52, 127, .08), transparent 30%),\n    radial-gradient(circle at 88% 90%, rgba(54, 145, 147, .08), transparent 32%),\n    #f7faf9 !important;\n  place-items: center !important;\n}\n\n.products-page .modal-image-card {\n  display: grid !important;\n  width: 100% !important;\n  aspect-ratio: 1 / 1 !important;\n  max-width: 430px !important;\n  padding: 28px !important;\n  overflow: hidden !important;\n  background: #fff !important;\n  border: 1px solid #edf1f2 !important;\n  border-radius: 24px !important;\n  box-shadow: 0 18px 40px rgba(29, 58, 66, .09) !important;\n  place-items: center !important;\n}\n\n.products-page .modal-image-card img {\n  display: block !important;\n  width: auto !important;\n  height: auto !important;\n  max-width: 100% !important;\n  max-height: 100% !important;\n  object-fit: contain !important;\n}\n\n.products-page .modal-copy-premium {\n  display: flex !important;\n  min-width: 0 !important;\n  padding: 64px 48px 44px !important;\n  flex-direction: column !important;\n}\n\n.products-page .modal-heading-block {\n  padding-right: 28px !important;\n}\n\n.products-page .modal-category-label {\n  display: inline-flex !important;\n  width: fit-content !important;\n  margin: 0 0 12px !important;\n  color: #6f9468 !important;\n  font-size: 13px !important;\n  font-weight: 800 !important;\n  letter-spacing: .03em !important;\n}\n\n.products-page .modal-copy-premium h2 {\n  margin: 0 0 18px !important;\n  color: #173245 !important;\n  font-size: clamp(30px, 3vw, 42px) !important;\n  font-weight: 800 !important;\n  line-height: 1.25 !important;\n  letter-spacing: -.01em !important;\n}\n\n.products-page .modal-copy-premium p {\n  margin: 0 !important;\n  color: #647781 !important;\n  font-size: 14.5px !important;\n  line-height: 1.95 !important;\n}\n\n.products-page .modal-purchase-panel {\n  display: flex !important;\n  margin-top: auto !important;\n  padding: 24px 0 22px !important;\n  align-items: flex-end !important;\n  justify-content: space-between !important;\n  gap: 20px !important;\n  border-top: 1px solid #e8eeee !important;\n}\n\n.products-page .modal-price-block {\n  display: flex !important;\n  flex-direction: column !important;\n  gap: 7px !important;\n}\n\n.products-page .modal-price-label {\n  color: #85949b !important;\n  font-size: 12px !important;\n  font-weight: 700 !important;\n}\n\n.products-page .modal-price-block strong {\n  color: #8b347f !important;\n  font-size: 34px !important;\n  font-weight: 800 !important;\n  line-height: 1 !important;\n}\n\n.products-page .modal-stock-pill {\n  display: inline-flex !important;\n  min-height: 38px !important;\n  padding: 0 15px !important;\n  align-items: center !important;\n  gap: 8px !important;\n  color: #4d7f59 !important;\n  background: #eef7f0 !important;\n  border-radius: 999px !important;\n  font-size: 13px !important;\n  font-weight: 800 !important;\n}\n\n.products-page .modal-stock-pill.empty {\n  color: #986064 !important;\n  background: #fff1f2 !important;\n}\n\n.products-page .modal-stock-dot {\n  width: 8px !important;\n  height: 8px !important;\n  background: currentColor !important;\n  border-radius: 50% !important;\n}\n\n.products-page .modal-action-group {\n  display: grid !important;\n  grid-template-columns: minmax(0, 1fr) 150px !important;\n  gap: 12px !important;\n}\n\n.products-page .modal-cart-primary {\n  display: inline-flex !important;\n  min-height: 56px !important;\n  margin: 0 !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 10px !important;\n  color: #fff !important;\n  background: linear-gradient(135deg, #963787 0%, #7d296f 100%) !important;\n  border: 0 !important;\n  border-radius: 16px !important;\n  box-shadow: 0 14px 26px rgba(139, 52, 127, .22) !important;\n  font-size: 14px !important;\n  font-weight: 800 !important;\n  transition: transform .18s ease, box-shadow .18s ease !important;\n}\n.products-page .modal-cart-primary:hover:not(:disabled) {\n  transform: translateY(-2px) !important;\n  box-shadow: 0 18px 30px rgba(139, 52, 127, .28) !important;\n}\n.products-page .modal-cart-primary:disabled {\n  background: #b8c2c4 !important;\n  box-shadow: none !important;\n}\n\n.products-page .modal-cart-icon {\n  display: grid !important;\n  width: 22px !important;\n  height: 22px !important;\n  place-items: center !important;\n}\n.products-page .modal-cart-icon svg {\n  width: 22px !important;\n  height: 22px !important;\n  fill: none !important;\n  stroke: currentColor !important;\n  stroke-width: 1.8 !important;\n  stroke-linecap: round !important;\n  stroke-linejoin: round !important;\n}\n\n.products-page .modal-cart-secondary {\n  min-height: 56px !important;\n  cursor: pointer !important;\n  color: #2f5962 !important;\n  background: #fff !important;\n  border: 1px solid #cfdddd !important;\n  border-radius: 16px !important;\n  font-size: 13px !important;\n  font-weight: 800 !important;\n  transition: background-color .18s ease, transform .18s ease !important;\n}\n.products-page .modal-cart-secondary:hover {\n  background: #f6faf9 !important;\n  transform: translateY(-2px) !important;\n}\n\n.products-page .floating-cart-btn {\n  right: 28px !important;\n  bottom: 28px !important;\n  display: flex !important;\n  width: auto !important;\n  min-width: 184px !important;\n  height: 72px !important;\n  padding: 10px 18px 10px 11px !important;\n  align-items: center !important;\n  justify-content: flex-start !important;\n  gap: 12px !important;\n  color: #193540 !important;\n  background: rgba(255,255,255,.97) !important;\n  border: 1px solid #dfe8e9 !important;\n  border-radius: 22px !important;\n  box-shadow: 0 18px 42px rgba(28, 58, 67, .17) !important;\n  backdrop-filter: blur(10px) !important;\n}\n.products-page .floating-cart-btn:hover {\n  background: #fff !important;\n  box-shadow: 0 24px 48px rgba(28, 58, 67, .22) !important;\n  transform: translateY(-4px) !important;\n  filter: none !important;\n}\n\n.products-page .floating-cart-icon-wrap {\n  display: grid !important;\n  width: 50px !important;\n  height: 50px !important;\n  flex: 0 0 auto !important;\n  color: #fff !important;\n  background: linear-gradient(135deg, #3a9a9b 0%, #267b80 100%) !important;\n  border-radius: 16px !important;\n  box-shadow: 0 9px 18px rgba(38, 123, 128, .2) !important;\n  place-items: center !important;\n}\n.products-page .floating-cart-icon-wrap svg {\n  width: 25px !important;\n  height: 25px !important;\n  fill: none !important;\n  stroke: currentColor !important;\n  stroke-width: 1.8 !important;\n  stroke-linecap: round !important;\n  stroke-linejoin: round !important;\n}\n\n.products-page .floating-cart-copy {\n  display: flex !important;\n  min-width: 0 !important;\n  flex-direction: column !important;\n  align-items: flex-start !important;\n  text-align: left !important;\n}\n.products-page .floating-cart-copy strong {\n  color: #193540 !important;\n  font-size: 15px !important;\n  font-weight: 800 !important;\n  line-height: 1.25 !important;\n}\n.products-page .floating-cart-copy small {\n  margin-top: 4px !important;\n  color: #76868e !important;\n  font-size: 11px !important;\n  font-weight: 600 !important;\n  line-height: 1.2 !important;\n}\n.products-page .cart-badge {\n  top: -8px !important;\n  right: -7px !important;\n  min-width: 27px !important;\n  height: 27px !important;\n  background: #8b347f !important;\n  border: 3px solid #fff !important;\n  font-size: 11px !important;\n}\n\n@media (max-width: 900px) {\n  .products-page .product-modal-premium {\n    grid-template-columns: 1fr !important;\n    width: min(100%, 680px) !important;\n    max-height: 92dvh !important;\n    overflow-y: auto !important;\n  }\n  .products-page .modal-image-premium {\n    min-height: 330px !important;\n    padding: 28px 28px 12px !important;\n  }\n  .products-page .modal-image-card {\n    max-width: 360px !important;\n    aspect-ratio: 1.2 / 1 !important;\n  }\n  .products-page .modal-copy-premium {\n    padding: 28px 30px 30px !important;\n  }\n}\n\n@media (max-width: 560px) {\n  .products-page .product-modal {\n    padding: 12px !important;\n  }\n  .products-page .product-modal-premium {\n    border-radius: 22px !important;\n  }\n  .products-page .modal-image-premium {\n    min-height: 260px !important;\n    padding: 20px 20px 10px !important;\n  }\n  .products-page .modal-image-card {\n    max-width: 100% !important;\n    padding: 18px !important;\n    border-radius: 18px !important;\n  }\n  .products-page .modal-copy-premium {\n    padding: 22px 20px 24px !important;\n  }\n  .products-page .modal-copy-premium h2 {\n    font-size: 25px !important;\n  }\n  .products-page .modal-copy-premium p {\n    font-size: 13px !important;\n    line-height: 1.8 !important;\n  }\n  .products-page .modal-purchase-panel {\n    align-items: flex-start !important;\n    flex-direction: column !important;\n  }\n  .products-page .modal-price-block strong {\n    font-size: 28px !important;\n  }\n  .products-page .modal-action-group {\n    grid-template-columns: 1fr !important;\n  }\n  .products-page .floating-cart-btn {\n    right: 14px !important;\n    bottom: 14px !important;\n    min-width: 0 !important;\n    width: 62px !important;\n    height: 62px !important;\n    padding: 6px !important;\n    border-radius: 19px !important;\n  }\n  .products-page .floating-cart-icon-wrap {\n    width: 48px !important;\n    height: 48px !important;\n  }\n  .products-page .floating-cart-copy {\n    display: none !important;\n  }\n}\n`;
  const i = s.lastIndexOf('</style>');
  s = s.slice(0, i) + css + '\n' + s.slice(i);
}

fs.writeFileSync(p, s, 'utf8');
console.log('modal and floating cart redesigned');
