const fs = require('fs');
const p = 'app/pages/products.vue';
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('import Swal from "sweetalert2";')) {
  s = s.replace('import { useApi } from "~/composables/utils/api";\r\n', 'import { useApi } from "~/composables/utils/api";\r\nimport Swal from "sweetalert2";\r\n');
}

if (!s.includes('interface CartItem')) {
  s = s.replace('interface ProductItem { id:number; name:string; description:string; price?:number; imageUrl:string; categoryId:number; stock:number; sequence:number; meter:boolean; isActive:boolean }', 'interface ProductItem { id:number; name:string; description:string; price?:number; imageUrl:string; categoryId:number; stock:number; sequence:number; meter:boolean; isActive:boolean }\r\ninterface CartItem { id:number; name:string; price:number; imageUrl:string; quantity:number }');
}

if (!s.includes('const router = useRouter()')) {
  s = s.replace('const api = useApi()\r\nconst route = useRoute()', 'const api = useApi()\r\nconst route = useRoute()\r\nconst router = useRouter()');
}

if (!s.includes('const cartItems = ref<CartItem[]>')) {
  s = s.replace("const selectedProduct = ref<ProductItem|null>(null)", "const selectedProduct = ref<ProductItem|null>(null)\r\nconst cartItems = ref<CartItem[]>([])\r\nconst cartItemCount = ref(0)\r\nconst isCartAnimating = ref(false)");
}

s = s.replace("<div class=\"product-card-footer\"><span class=\"detail-link\">查看詳情 <span>→</span></span><span class=\"stock-badge\" :class=\"{ empty: product.stock === 0 }\">{{ product.stock === 0 ? '無庫存' : '有庫存' }}</span></div>", `<div class="product-card-footer">
                <span class="detail-link">查看詳情 <span>→</span></span>
                <div class="product-card-actions">
                  <span class="stock-badge" :class="{ empty: product.stock === 0 }">{{ product.stock === 0 ? '無庫存' : '有庫存' }}</span>
                  <button
                    type="button"
                    class="quick-cart-btn"
                    :disabled="product.stock === 0"
                    @click.stop="addToCart(product)"
                    aria-label="加入購物車"
                  >＋</button>
                </div>
              </div>`);

s = s.replace("<div class=\"modal-copy\"><span>{{ getCategoryName(selectedProduct.categoryId) }}</span><h2>{{ selectedProduct.name }}</h2><p>{{ selectedProduct.description }}</p><div class=\"modal-meta\"><strong>{{ formatPrice(selectedProduct.price) }}</strong><span>{{ selectedProduct.stock === 0 ? '無庫存' : '有庫存' }}</span></div></div>", `<div class="modal-copy">
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
        </div>`);

if (!s.includes('class="floating-cart-btn"')) {
  s = s.replace('\r\n  </div>\r\n</template>', `\r\n    <button
      type="button"
      class="floating-cart-btn"
      :class="{ 'cart-animation': isCartAnimating }"
      @click="goToCart"
      aria-label="前往購物車"
    >
      <span class="cart-symbol">🛒</span>
      <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
    </button>\r\n  </div>\r\n</template>`);
}

if (!s.includes('async function addToCart')) {
  s = s.replace('function openProduct(product:ProductItem){ selectedProduct.value=product }', `function openProduct(product:ProductItem){ selectedProduct.value=product }

function updateCartItemCountFromServer(totalQuantity:number){
  cartItemCount.value = totalQuantity || 0
}

function updateCartItemCount(){
  cartItemCount.value = cartItems.value.reduce((sum,item)=>sum+item.quantity,0)
}

function saveCartToLocalStorage(){
  if(!import.meta.client) return
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
}

function loadCartFromLocalStorage(){
  if(!import.meta.client) return
  const savedCart = localStorage.getItem('cart')
  if(!savedCart) return
  try{
    cartItems.value = JSON.parse(savedCart)
    updateCartItemCount()
  }catch(error){
    console.error('購物車數據解析錯誤', error)
    cartItems.value = []
    cartItemCount.value = 0
  }
}

function addToLocalCart(product:ProductItem){
  const existing = cartItems.value.find(item=>item.id===product.id)
  if(existing){
    existing.quantity += 1
  }else{
    cartItems.value.push({
      id: product.id,
      name: product.name,
      price: product.price ?? 0,
      imageUrl: product.imageUrl,
      quantity: 1,
    })
  }
  updateCartItemCount()
  saveCartToLocalStorage()
}

function showSuccessToast(message:string){
  Swal.fire({ toast:true, position:'bottom-end', icon:'success', title:message, showConfirmButton:false, timer:3000, timerProgressBar:true })
}

function showErrorToast(message:string){
  Swal.fire({ toast:true, position:'bottom-end', icon:'error', title:message, showConfirmButton:false, timer:3000, timerProgressBar:true })
}

function playCartAnimation(){
  isCartAnimating.value = true
  setTimeout(()=>{ isCartAnimating.value = false }, 500)
}

async function addToCart(product:ProductItem){
  if(product.stock===0) return
  try{
    const authRes = await api.get<{authenticated:boolean}>('/auth/me')
    if(!authRes.data.authenticated){
      addToLocalCart(product)
      await Swal.fire({
        title:'請先登入',
        text:'登入後才能同步購物車',
        icon:'warning',
        confirmButtonText:'前往登入',
      }).then((result)=>{
        if(result.isConfirmed) router.push('/login')
      })
      return
    }

    await api.post('/cart/add', { itemId:product.id, quantity:1 })
    const cartRes = await api.get<{TotalQuantity:number}>('/cart')
    updateCartItemCountFromServer(cartRes.data.TotalQuantity)
    showSuccessToast(product.name + ' 已加入購物車')
    playCartAnimation()
    selectedProduct.value = null
  }catch(error){
    console.error('加入購物車失敗', error)
    showErrorToast('加入購物車失敗，請稍後再試')
  }
}

async function syncLocalCartToServer(){
  try{
    const authRes = await api.get<{authenticated:boolean}>('/auth/me')
    if(!authRes.data.authenticated) return
    const localCart = cartItems.value
    if(!localCart.length){
      const cartRes = await api.get<{TotalQuantity:number}>('/cart')
      updateCartItemCountFromServer(cartRes.data.TotalQuantity)
      return
    }
    for(const item of localCart){
      await api.post('/cart/add', { itemId:item.id, quantity:item.quantity })
    }
    cartItems.value = []
    cartItemCount.value = 0
    if(import.meta.client) localStorage.removeItem('cart')
    const cartRes = await api.get<{TotalQuantity:number}>('/cart')
    updateCartItemCountFromServer(cartRes.data.TotalQuantity)
    showSuccessToast('購物車已同步')
  }catch(error){
    console.error('同步失敗', error)
    showErrorToast('同步購物車失敗')
  }
}

function goToCart(){
  router.push('/cart')
}`);
}

s = s.replace('onMounted(loadData)', `onMounted(async()=>{
  loadCartFromLocalStorage()
  await loadData()
  try{
    const authRes = await api.get<{authenticated:boolean}>('/auth/me')
    if(authRes.data.authenticated) await syncLocalCartToServer()
  }catch(error){
    console.error('確認登入狀態失敗', error)
  }
})`);

if (!s.includes('/* ===== Product Cart Controls ===== */')) {
  const css = `

/* ===== Product Cart Controls ===== */
.products-page .product-card-actions{display:flex;align-items:center;gap:9px}
.products-page .quick-cart-btn{display:grid;width:30px;height:30px;padding:0;cursor:pointer;color:#fff;background:#6d9765;border:0;border-radius:50%;font-size:18px;line-height:1;place-items:center;transition:.18s ease}
.products-page .quick-cart-btn:hover:not(:disabled){transform:translateY(-1px);background:#5f8958}
.products-page .quick-cart-btn:disabled{cursor:not-allowed;opacity:.35}
.products-page .modal-cart-btn{width:100%;min-height:46px;margin-top:24px;cursor:pointer;color:#fff;background:#8b347f;border:0;border-radius:999px;font-size:13px;font-weight:800}
.products-page .modal-cart-btn:disabled{cursor:not-allowed;background:#b8c0c3}
.products-page .floating-cart-btn{position:fixed;z-index:1200;right:26px;bottom:26px;display:grid;width:58px;height:58px;padding:0;cursor:pointer;color:#fff;background:#173f53;border:0;border-radius:50%;box-shadow:0 14px 30px rgba(23,63,83,.22);place-items:center}
.products-page .cart-symbol{font-size:22px;line-height:1}
.products-page .cart-badge{position:absolute;top:-3px;right:-3px;display:grid;min-width:21px;height:21px;padding:0 5px;color:#fff;background:#8b347f;border:2px solid #fff;border-radius:999px;font-size:10px;font-weight:800;place-items:center}
.products-page .cart-animation{animation:products-cart-bounce .5s ease}
@keyframes products-cart-bounce{0%,100%{transform:scale(1)}45%{transform:scale(1.16)}70%{transform:scale(.96)}}
@media(max-width:560px){.products-page .floating-cart-btn{right:16px;bottom:16px;width:52px;height:52px}}
`;
  const i = s.lastIndexOf('</style>');
  s = s.slice(0, i) + css + '\n' + s.slice(i);
}

fs.writeFileSync(p, s, 'utf8');
console.log('cart logic migrated');
