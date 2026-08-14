<template>
  <div class="cart-page">
    <section ref="cartSection" class="cart-section">
      <div class="cart-container">
        <header class="cart-heading">
          <div>
            <h1>{{ $ui('購物車') }}</h1>
            <p>{{ $ui('確認商品與數量後，即可前往結帳。') }}</p>
          </div>
          <div v-if="!loading && productItemCount > 0" class="cart-heading-meta">
            <span class="meta-number">{{ productItemCount }}</span>
            <span class="meta-label">{{ $ui('件商品') }}</span>
          </div>
        </header>

        <div v-if="loading" class="state-card">{{ $ui('正在載入購物車...') }}</div>

        <div v-else-if="productItemCount === 0" class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>{{ $ui('您的購物車是空的') }}</h2>
          <p>{{ $ui('快去選購需要的醫療用品吧！') }}</p>
          <NuxtLink to="/products" class="primary-btn">{{ $ui('瀏覽商品') }}</NuxtLink>
        </div>

        <div v-else class="cart-layout">
          <div class="cart-list-panel">
            <div class="cart-items">
              <article
                v-for="item in paginatedCartItems"
                :key="item.id"
                class="cart-item"
                :class="{ shipping: item.id === 50 }"
              >
                <div class="product-main">
                  <div class="image-box">
                    <img :src="item.imageUrl" :alt="item.name" />
                  </div>

                  <div class="product-copy">
                    <span class="category-tag">{{ $ui(item.id === 50 ? '配送服務' : '商品') }}</span>
                    <h2>{{ $ui(item.name) }}</h2>
                    <div class="product-meta-row">
                      <span>{{ $ui('單價 NT$ {price}').replace('NT$ {price}', formatCurrency(item.price)) }}</span>
                      <span v-if="item.id !== 50">{{ $ui('庫存 {stock}').replace('{stock}', String(item.stock)) }}</span>
                    </div>
                  </div>
                </div>

                <div class="item-side">
                  <div class="quantity-group">
                    <span class="side-label">{{ $ui('數量') }}</span>
                    <div class="quantity-control">
                      <button
                        type="button"
                        :disabled="item.quantity <= 1 || item.id === 50"
                        @click="decreaseQuantity(item)"
                      >−</button>
                      <span>{{ item.quantity }}</span>
                      <button
                        type="button"
                        :disabled="item.quantity >= item.stock || item.stock === 0 || item.id === 50"
                        @click="increaseQuantity(item)"
                      >＋</button>
                    </div>
                  </div>

                  <div class="subtotal-group">
                    <span class="side-label">{{ $ui('小計') }}</span>
                    <strong>{{ formatCurrency(item.price * item.quantity) }}</strong>
                  </div>

                  <button
                    v-if="item.id !== 50"
                    type="button"
                    class="remove-btn"
                    :aria-label="$ui('移除商品')"
                    @click="removeItem(item)"
                  >×</button>
                </div>
              </article>
            </div>

            <div v-if="cartItems.length > pageSize" class="pagination-row">
              <button type="button" :disabled="currentPage === 1" @click="prevPage">‹</button>
              <button
                v-for="page in displayedPages"
                :key="page"
                type="button"
                :class="{ active: currentPage === page }"
                @click="changePage(page)"
              >{{ page }}</button>
              <button type="button" :disabled="currentPage === totalPages" @click="nextPage">›</button>
            </div>
          </div>

          <aside class="summary-card">
            <div class="summary-head">
              <h2>{{ $ui('訂單摘要') }}</h2>
            </div>

            <div class="summary-lines">
              <div>
                <span>{{ $ui('商品總計') }}</span>
                <strong>{{ formatCurrency(totalAmount) }}</strong>
              </div>
              <div>
                <span>{{ $ui('配送') }}</span>
                <span class="shipping-text">{{ $ui(productAmount >= 2000 ? '滿 NT$ 2,000 免運' : '未滿 NT$ 2,000 加收運費').replace('NT$ 2,000', formatCurrency(2000)) }}</span>
              </div>
            </div>

            <div class="summary-total">
              <span>{{ $ui('應付金額') }}</span>
              <strong>{{ formatCurrency(totalAmount) }}</strong>
            </div>

            <button type="button" class="checkout-btn" @click="checkoutEntry">{{ $ui('前往結帳') }}<span>→</span>
            </button>

            <NuxtLink to="/products" class="continue-link">{{ $ui('繼續購物') }}</NuxtLink>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'
definePageMeta({ middleware: 'member-auth' })
type CartItem={id:number;name:string;price:number;quantity:number;stock:number;imageUrl:string}
const api=useApi();const { formatCurrency }=useCurrency();const router=useRouter();const ui=useUiText();const cartSection=ref<HTMLElement|null>(null);const cartItems=ref<CartItem[]>([]);const totalAmount=ref(0);const currentPage=ref(1);const pageSize=5;const loading=ref(true)
const totalPages=computed(()=>Math.ceil(cartItems.value.length/pageSize));const paginatedCartItems=computed(()=>cartItems.value.slice((currentPage.value-1)*pageSize,currentPage.value*pageSize));const displayedPages=computed(()=>{const pages:number[]=[];const max=5;if(totalPages.value<=max){for(let i=1;i<=totalPages.value;i++)pages.push(i)}else{let start=Math.max(1,currentPage.value-2);let end=start+max-1;if(end>totalPages.value){end=totalPages.value;start=Math.max(1,end-max+1)}for(let i=start;i<=end;i++)pages.push(i)}return pages});const productAmount=computed(()=>cartItems.value.filter(i=>i.id!==50).reduce((sum,i)=>sum+i.price*i.quantity,0))
// 購物車件數只計算實際商品數量，運費 ItemId 50 不計入。
const productItemCount=computed(()=>cartItems.value.filter(i=>i.id!==50).reduce((sum,i)=>sum+i.quantity,0))
function mapCart(cart:any){cartItems.value=(cart.CartDetails||[]).map((item:any)=>({id:item.ItemId,name:item.Name,price:item.UnitPrice,quantity:item.Quantity,stock:item.Stock??999,imageUrl:item.ImageUrl||'https://via.placeholder.com/300x200?text=無圖片'}));totalAmount.value=cart.FinalAmount}
async function checkLoginAndLoadCart(){try{const authRes:any=await api.get('/auth/me');if(!authRes.data.authenticated){await Swal.fire(ui('未登入'),ui('請先登入才能查看購物車'),'warning');await router.push('/login');return}await loadCart()}catch{await Swal.fire(ui('錯誤'),ui('請重新登入'),'error');await router.push('/login')}finally{loading.value=false}}
async function loadCart(){try{const res:any=await api.get('/cart');mapCart(res.data);await calculateShipping()}catch(err:any){if(err.response?.status===401){await Swal.fire(ui('登入逾時'),ui('請重新登入'),'warning');await router.push('/login')}else await Swal.fire(ui('錯誤'),ui('載入購物車失敗'),'error')}}
function changePage(page:number){currentPage.value=page;window.scrollTo({top:(cartSection.value?.offsetTop||0)-20,behavior:'smooth'})}function prevPage(){if(currentPage.value>1)changePage(currentPage.value-1)}function nextPage(){if(currentPage.value<totalPages.value)changePage(currentPage.value+1)}
async function decreaseQuantity(item:CartItem){if(item.quantity>1){item.quantity--;await updateQuantity(item)}}async function increaseQuantity(item:CartItem){if(item.quantity<item.stock){item.quantity++;await updateQuantity(item)}else await Swal.fire(ui('庫存不足'),`${ui('僅剩')} ${item.stock} ${ui('件')}`,'warning')}
async function updateQuantity(item:CartItem){try{const res:any=await api.put('/cart/update',{itemId:item.id,quantity:item.quantity});totalAmount.value=res.data.totalAmount;await calculateShipping();await Swal.fire({toast:true,position:'bottom-end',icon:'success',title:ui('數量已更新'),showConfirmButton:false,timer:1500})}catch{await Swal.fire(ui('錯誤'),ui('更新數量失敗'),'error')}}
async function removeItem(item:CartItem){const confirm=await Swal.fire({icon:'warning',title:ui('確認移除'),text:`${ui('確定移除')} ${ui(item.name)} ${ui('嗎？')}`,showCancelButton:true,confirmButtonText:ui('確定'),cancelButtonText:ui('取消'),confirmButtonColor:'#8f3b86'});if(!confirm.isConfirmed)return;try{const res:any=await api.delete('/cart/item',{itemId:item.id});cartItems.value=cartItems.value.filter(i=>i.id!==item.id);totalAmount.value=res.data.totalAmount;if(currentPage.value>totalPages.value)currentPage.value=Math.max(1,totalPages.value);await calculateShipping();await Swal.fire(ui('已移除'),ui('商品已從購物車移除'),'success')}catch{await Swal.fire(ui('錯誤'),ui('移除失敗'),'error')}}
async function calculateShipping(){const shippingItemId=50;try{const amount=cartItems.value.filter(i=>i.id!==shippingItemId).reduce((sum,i)=>sum+i.price*i.quantity,0);const hasShipping=cartItems.value.some(i=>i.id===shippingItemId);if(amount<2000&&!hasShipping)await api.post('/cart/add',{itemId:shippingItemId,quantity:1});if(amount>=2000&&hasShipping)await api.delete('/cart/item',{itemId:shippingItemId});const res:any=await api.get('/cart');mapCart(res.data)}catch(err){console.error('運費計算失敗',err)}}
function checkoutEntry(){const outOfStock=cartItems.value.some(i=>i.stock===0);if(outOfStock){Swal.fire(ui('無法結帳'),ui('購物車有庫存不足商品'),'error');return}Swal.fire({title:ui('請選擇付款方式'),html:`<button id="pay-credit" class="swal2-confirm swal2-styled" style="margin:5px;">${ui('信用卡')}</button><button id="pay-atm" class="swal2-confirm swal2-styled" style="margin:5px;">${ui('ATM 轉帳')}</button><button id="pay-cvs" class="swal2-confirm swal2-styled" style="margin:5px;">${ui('超商繳費')}</button>`,showConfirmButton:false,didOpen:()=>{const credit=document.getElementById('pay-credit');const atm=document.getElementById('pay-atm');const cvs=document.getElementById('pay-cvs');if(credit)credit.onclick=()=>{Swal.close();checkout('credit')};if(atm)atm.onclick=()=>{Swal.close();checkout('atm')};if(cvs)cvs.onclick=()=>{Swal.close();checkout('cvs')}}})}
async function checkout(method:string){Swal.fire({title:ui('前往付款頁面中'),html:`<div style="margin-top:10px;"><p style="margin-top:12px;">${ui('請勿關閉視窗，正在連線至金流平台')}</p></div>`,allowOutsideClick:false,allowEscapeKey:false,showConfirmButton:false,didOpen:()=>Swal.showLoading()});try{const res:any=await api.post('/order/create',{PaymentMethod:method});const {MerchantTradeNo:merchantTradeNo,OrderId}=res.data;if(!merchantTradeNo){console.error('沒有收到 MerchantTradeNo, 完整資料:',res.data);await Swal.fire(ui('結帳失敗'),ui('訂單號碼產生失敗'),'error');return}console.log('訂單建立成功:',{OrderId,merchantTradeNo});const response:any=await api.post('/payment/start',{merchantTradeNo},{headers:{'Content-Type':'application/json'},responseType:'text'});const html=response.data;if(!html||typeof html!=='string'||html.trim()===''){await Swal.fire(ui('結帳失敗'),ui('金流頁面載入失敗'),'error');return}document.open();document.write(html);document.close()}catch(err){console.error('結帳錯誤:',err);await Swal.fire(ui('結帳失敗'),ui('請稍後再試'),'error')}}
onMounted(checkLoginAndLoadCart)
</script>
<style scoped>
.cart-page{min-height:100vh;background:#fff;color:#173245}.cart-section{padding:42px 0 84px}.cart-container{width:min(100% - 48px,1320px);margin:0 auto}.cart-heading{display:flex;margin-bottom:28px;align-items:flex-end;justify-content:space-between;gap:24px}.eyebrow{display:block;margin-bottom:8px;color:#3d9294;font-size:11px;font-weight:800;letter-spacing:.15em}.cart-heading h1{margin:0;font-size:clamp(34px,4vw,46px);line-height:1.1;font-weight:800}.cart-heading p{margin:10px 0 0;color:#73838b;font-size:14px}.cart-heading-meta{display:flex;align-items:baseline;gap:6px;color:#8f3b86}.meta-number{font-size:30px;font-weight:800}.meta-label{font-size:13px;font-weight:700}.state-card,.empty-cart{padding:72px 32px;text-align:center;background:#fafcfb;border:1px solid #e2eaeb;border-radius:18px}.empty-icon{font-size:40px}.empty-cart h2{margin:16px 0 8px}.empty-cart p{margin:0;color:#77878f}.primary-btn{display:inline-flex;margin-top:20px;padding:13px 24px;color:#fff;background:#8f3b86;border-radius:12px;text-decoration:none;font-weight:800}.cart-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}.cart-list-panel{overflow:hidden;background:#fff;border-top:1px solid #dfe7e8;border-bottom:1px solid #dfe7e8}.cart-item{display:flex;padding:24px 0;align-items:center;justify-content:space-between;gap:28px;border-bottom:1px solid #edf1f2}.cart-item:last-child{border-bottom:0}.cart-item.shipping{background:linear-gradient(90deg,rgba(61,146,148,.035),rgba(143,59,134,.025));padding-left:16px;padding-right:16px;border-radius:12px}.product-main{display:flex;min-width:0;flex:1;align-items:center;gap:18px}.image-box{display:grid;width:118px;height:96px;flex:0 0 auto;overflow:hidden;background:#f5f7f7;border-radius:12px;place-items:center}.image-box img{width:100%;height:100%;object-fit:contain}.product-copy{min-width:0}.category-tag{color:#7a9a62;font-size:11px;font-weight:800}.product-copy h2{margin:6px 0 9px;font-size:17px;line-height:1.45}.product-meta-row{display:flex;flex-wrap:wrap;gap:14px;color:#84939a;font-size:12px}.item-side{display:grid;grid-template-columns:118px 140px 34px;gap:22px;align-items:center}.quantity-group,.subtotal-group{display:grid;gap:7px}.side-label{color:#9aa7ac;font-size:10px;font-weight:700;letter-spacing:.08em}.quantity-control{display:grid;grid-template-columns:34px 42px 34px;overflow:hidden;border:1px solid #d9e3e4;border-radius:10px}.quantity-control button{height:36px;color:#8f3b86;background:#fff;border:0;cursor:pointer;font-size:18px}.quantity-control button:disabled{color:#c0c9cc;cursor:not-allowed}.quantity-control span{display:grid;background:#f8faf9;font-size:13px;font-weight:800;place-items:center}.subtotal-group strong{font-size:15px}.remove-btn{display:grid;width:34px;height:34px;color:#a66a74;background:#fff;border:1px solid #eadcdf;border-radius:50%;cursor:pointer;font-size:20px;place-items:center}.pagination-row{display:flex;padding-top:20px;justify-content:center;gap:7px}.pagination-row button{width:34px;height:34px;background:#fff;border:1px solid #dde6e7;border-radius:8px}.pagination-row button.active{color:#fff;background:#8f3b86;border-color:#8f3b86}.summary-card{position:sticky;top:104px;padding:26px;background:#fbfcfc;border:1px solid #dfe7e8;border-radius:18px}.summary-head h2{margin:0;font-size:22px}.summary-lines{display:grid;margin-top:24px;gap:16px}.summary-lines>div{display:flex;justify-content:space-between;gap:20px;color:#6d7e86;font-size:13px}.shipping-text{text-align:right;font-size:11px}.summary-total{display:flex;margin-top:24px;padding-top:22px;align-items:flex-end;justify-content:space-between;border-top:1px solid #dfe7e8}.summary-total span{font-size:14px;font-weight:800}.summary-total strong{color:#8f3b86;font-size:24px}.checkout-btn{display:flex;width:100%;min-height:50px;margin-top:22px;padding:0 20px;align-items:center;justify-content:center;gap:10px;color:#fff;background:#8f3b86;border:0;border-radius:11px;font-weight:800;cursor:pointer}.continue-link{display:block;margin-top:15px;color:#637882;text-align:center;text-decoration:none;font-size:13px}.item-side.shipping-side{grid-template-columns:140px;justify-content:end}@media(max-width:980px){.cart-layout{grid-template-columns:1fr}.summary-card{position:static}.item-side{grid-template-columns:118px 140px 34px}.item-side.shipping-side{grid-template-columns:140px}}@media(max-width:720px){.item-side.shipping-side{display:flex;padding-left:0;justify-content:flex-end}.cart-container{width:min(100% - 24px,1320px)}.cart-section{padding:28px 0 56px}.cart-heading{margin-bottom:20px;align-items:flex-start}.cart-heading-meta{display:none}.cart-item{display:block;padding:20px 0}.product-main{align-items:flex-start}.image-box{width:96px;height:82px}.product-copy h2{padding-right:42px;font-size:16px}.item-side{position:relative;display:grid;margin-top:18px;padding-left:114px;grid-template-columns:1fr 1fr 34px;gap:14px}.quantity-group,.subtotal-group{gap:5px}.remove-btn{align-self:end}.summary-card{padding:22px}.summary-total strong{font-size:22px}}@media(max-width:520px){.cart-heading h1{font-size:32px}.cart-heading p{font-size:13px}.product-main{gap:14px}.image-box{width:84px;height:74px}.item-side{padding-left:98px;grid-template-columns:1fr 1fr}.remove-btn{position:absolute;top:-91px;right:0}.quantity-control{grid-template-columns:30px 38px 30px}.subtotal-group strong{font-size:14px}.summary-lines>div{font-size:12px}}
</style>