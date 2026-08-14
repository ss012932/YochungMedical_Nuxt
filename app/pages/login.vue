<template>
  <AuthShell mobile-raised :title="$ui('會員登入')" description="登入後即可使用購物車與會員相關服務。">
    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">{{ $ui('帳號') }}</label>
        <div class="input-wrapper">
          <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span>
          <input id="username" v-model="form.username" type="text" :placeholder="$ui('請輸入您的帳號')" required />
        </div>
        <span v-if="errors.username" class="error">{{ $ui(errors.username) }}</span>
      </div>

      <div class="form-group">
        <label for="password">{{ $ui('密碼') }}</label>
        <div class="input-wrapper">
          <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
          <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="$ui('請輸入您的密碼')" required />
          <button type="button" class="toggle-password" :aria-label="$ui('切換密碼顯示')" @click="togglePassword">
            <svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
          </button>
        </div>
        <span v-if="errors.password" class="error">{{ $ui(errors.password) }}</span>
      </div>

      <div class="form-group">
        <label for="captcha">{{ $ui('驗證碼') }}</label>
        <div class="captcha-wrapper">
          <div class="input-wrapper">
            <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z"/></svg></span>
            <input id="captcha" v-model="form.captcha" type="text" :placeholder="$ui('請輸入驗證碼')" required />
          </div>
          <div class="captcha-display" :style="captchaBgStyle">
            <span class="captcha-random-line line-one" :style="captchaLineStyle"></span>
            <span class="captcha-random-line line-two" :style="captchaLineStyle2"></span>
            <span class="captcha-code" :aria-label="$ui('驗證碼')">
              <i v-for="item in captchaChars" :key="item.id" :style="item.style">{{ item.char }}</i>
            </span>
            <button type="button" class="refresh-btn" :aria-label="$ui('更新驗證碼')" @click="refreshCaptcha"><svg viewBox="0 0 24 24"><path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/></svg></button>
          </div>
        </div>
        <span v-if="errors.captcha" class="error">{{ $ui(errors.captcha) }}</span>
      </div>

      <button type="submit" class="btn-primary">{{ $ui('登入') }}</button>

      <div class="auth-links">
        <p class="auth-link">{{ $ui('還沒有帳號？') }}<NuxtLink to="/register" class="link">{{ $ui('立即註冊') }}</NuxtLink></p>
        <p class="auth-link"><NuxtLink to="/forgot-password" class="link">{{ $ui('忘記密碼？') }}</NuxtLink></p>
      </div>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'

definePageMeta({ layout: 'auth', middleware: 'guest-only' })
useSeoMeta({ title: '會員登入' })

const api = useApi()
const router = useRouter()
// 導覽列登入狀態：登入成功後立即同步，避免切頁時文字短暫消失。
const headerIsLoggedIn = useState<boolean>('header-is-logged-in', () => false)
const headerAuthChecked = useState<boolean>('header-auth-checked', () => false)
const headerIsAdmin = useState<boolean>('header-is-admin', () => false)
const headerUserName = useState<string>('header-user-name', () => '')
const form = reactive({ username: '', password: '', captcha: '', rememberMe: false })
const errors = reactive({ username: '', password: '', captcha: '' })
const showPassword = ref(false)
const captchaCode = ref('')
const captchaChars = ref<Array<{ id:number; char:string; style:Record<string,string> }>>([])
const captchaLineStyle = ref<Record<string, string>>({})
const captchaLineStyle2 = ref<Record<string, string>>({})
const captchaBgStyle = ref<Record<string, string>>({})

function togglePassword() { showPassword.value = !showPassword.value }
function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  captchaCode.value = code
  captchaChars.value = code.split('').map((char, index) => ({
    id: Date.now() + index + Math.floor(Math.random() * 1000),
    char,
    style: {
      transform: `translateY(${Math.floor(Math.random() * 7) - 3}px) rotate(${Math.floor(Math.random() * 25) - 12}deg)`,
      letterSpacing: `${Math.floor(Math.random() * 3)}px`,
    },
  }))
  captchaLineStyle.value = {
    top: `21px`,
    transform: `rotate(${Math.floor(Math.random() * 31) - 15}deg)`,
    opacity: `0.81`,
  }
  captchaLineStyle2.value = {
    bottom: `14px`,
    transform: `rotate(${Math.floor(Math.random() * 31) - 15}deg)`,
    opacity: `0.62`,
  }
  const a1 = Math.floor(Math.random() * 31) - 15
  const a2 = Math.floor(Math.random() * 31) - 15
  captchaBgStyle.value = {
    backgroundImage: `linear-gradient(${a1}deg, transparent 0 43%, rgba(143,52,133,.2) 44% 46%, transparent 47% 100%), linear-gradient(${a2}deg, transparent 0 56%, rgba(111,40,105,.18) 57% 59%, transparent 60% 100%)`,
  }
}
function refreshCaptcha() { generateCaptcha(); form.captcha = ''; errors.captcha = '' }

function validateForm() {
  errors.username = ''; errors.password = ''; errors.captcha = ''
  let isValid = true
  if (!form.username) { errors.username = '請輸入帳號'; isValid = false }
  else if (form.username.length < 3) { errors.username = '帳號長度至少為 3 個字元'; isValid = false }
  if (!form.password) { errors.password = '請輸入密碼'; isValid = false }
  if (!form.captcha) { errors.captcha = '請輸入驗證碼'; isValid = false }
  else if (form.captcha.trim().toUpperCase() !== captchaCode.value) { errors.captcha = '驗證碼錯誤'; isValid = false; refreshCaptcha() }
  return isValid
}

function getDeviceId() {
  let id = localStorage.getItem('deviceId')
  if (!id) { id = 'DEV-' + Math.random().toString(36).substring(2, 15); localStorage.setItem('deviceId', id) }
  return id
}

async function getClientIP() {
  try { const res = await fetch('https://api.ipify.org?format=json'); const data = await res.json(); return data.ip || 'unknown' }
  catch { return 'unknown' }
}

async function handleLogin() {
  if (!validateForm()) return
  try {
    await api.post('/login', {
      username: form.username,
      password: form.password,
      ip: await getClientIP(),
      deviceId: getDeviceId(),
      browser: navigator.userAgent,
      os: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
    }, { withCredentials: true })

    // 登入 Cookie 建立後立刻取得目前身份，先更新 Header 共用狀態。
    // 這樣切換 layout 時不需要等待新 Header 再查一次 /auth/me。
    const authRes: any = await api.get('/auth/me')
    headerIsLoggedIn.value = !!authRes.data?.authenticated
    headerAuthChecked.value = true
    headerIsAdmin.value = !!authRes.data?.isAdmin
    headerUserName.value = authRes.data?.name || ''

    await Swal.fire({ icon: 'success', title: '登入成功', text: '歡迎回來', timer: 900, showConfirmButton: false, timerProgressBar: true })
    await router.push('/')
  } catch (error: any) {
    console.error('登入錯誤:', error)
    await Swal.fire({
      icon: 'error', title: '登入失敗',
      text: error.response?.status === 403 ? '此帳號已被鎖定' : error.response?.status === 401 ? '帳號或密碼錯誤' : error.response?.data?.message || '伺服器錯誤，請稍後再試',
      confirmButtonText: '確定',
    })
    refreshCaptcha()
  }
}

onMounted(generateCaptcha)
</script>

<style scoped src="@/assets/css/auth-pages.css"></style>
