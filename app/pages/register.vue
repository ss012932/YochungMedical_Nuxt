<template>
  <AuthShell mobile-scrollable :title="$ui('建立會員帳號')" description="填寫基本資料，完成註冊後即可登入使用會員服務。" wide>
    <form class="auth-form" @submit.prevent="handleRegister">
      <div class="form-row">
        <div class="form-group">
          <label for="username">{{ $ui('帳號') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><input id="username" v-model="form.username" type="text" :placeholder="$ui('請輸入您的帳號')" required /></div>
          <span v-if="errors.username" class="error">{{ $ui(errors.username) }}</span>
        </div>
        <div class="form-group">
          <label for="fullName">{{ $ui('全名') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><input id="fullName" v-model="form.fullName" type="text" :placeholder="$ui('請輸入您的全名')" required /></div>
          <span v-if="errors.fullName" class="error">{{ $ui(errors.fullName) }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="phone">{{ $ui('電話號碼') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z"/></svg></span><input id="phone" v-model="form.phone" type="tel" :placeholder="$ui('請輸入您的手機號碼')" required /></div>
          <span v-if="errors.phone" class="error">{{ $ui(errors.phone) }}</span>
        </div>
        <div class="form-group">
          <label for="email">{{ $ui('電子郵件') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span><input id="email" v-model="form.email" type="email" :placeholder="$ui('請輸入您的電子郵件')" required /></div>
          <span v-if="errors.email" class="error">{{ $ui(errors.email) }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="address">{{ $ui('地址') }}</label>
        <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span><input id="address" v-model="form.address" type="text" :placeholder="$ui('請輸入完整地址 (含縣市)')" required /></div>
        <span v-if="errors.address" class="error">{{ $ui(errors.address) }}</span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="password">{{ $ui('密碼') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span><input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="$ui('請輸入您的密碼')" required /><button type="button" class="toggle-password" @click="togglePassword"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></div>
          <span v-if="errors.password" class="error">{{ $ui(errors.password) }}</span>
        </div>
        <div class="form-group">
          <label for="confirm-password">{{ $ui('確認密碼') }}</label>
          <div class="input-wrapper"><span class="input-icon"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span><input id="confirm-password" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" :placeholder="$ui('請再次輸入您的密碼')" required /><button type="button" class="toggle-password" @click="toggleConfirmPassword"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button></div>
          <span v-if="errors.confirmPassword" class="error">{{ $ui(errors.confirmPassword) }}</span>
        </div>
      </div>

      <button type="submit" class="btn-primary">{{ $ui('註冊') }}</button>
      <p class="auth-link">{{ $ui('已有帳號？') }}<NuxtLink to="/login" class="link">{{ $ui('立即登入') }}</NuxtLink></p>
      <div v-if="errors.server" class="error server-error">{{ $ui(errors.server) }}</div>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'

definePageMeta({ layout: 'auth', middleware: 'guest-only' })
useSeoMeta({ title: '會員註冊' })
const api = useApi()
const router = useRouter()
const form = reactive({ username: '', fullName: '', email: '', address: '', phone: '', password: '', confirmPassword: '' })
const errors = reactive({ username: '', fullName: '', email: '', address: '', phone: '', password: '', confirmPassword: '', server: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
function togglePassword() { showPassword.value = !showPassword.value }
function toggleConfirmPassword() { showConfirmPassword.value = !showConfirmPassword.value }

function validateForm() {
  errors.username=''; errors.fullName=''; errors.email=''; errors.address=''; errors.phone=''; errors.password=''; errors.confirmPassword=''; errors.server=''
  let isValid = true
  if (!form.username) { errors.username='請輸入帳號'; isValid=false } else if (form.username.length < 3) { errors.username='帳號長度至少為 3 個字符'; isValid=false }
  if (!form.fullName) { errors.fullName='請輸入全名'; isValid=false } else if (form.fullName.length > 10) { errors.fullName='全名長度不能超過 10 個字符'; isValid=false }
  const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) { errors.email='請輸入電子郵件'; isValid=false } else if (!emailRegex.test(form.email)) { errors.email='請輸入有效的電子郵件地址'; isValid=false } else if (form.email.length > 30) { errors.email='電子郵件長度不能超過 30 個字符'; isValid=false }
  if (!form.phone) { errors.phone='請輸入聯絡電話'; isValid=false }
  if (!form.password) { errors.password='請輸入密碼'; isValid=false } else if (form.password.length < 6) { errors.password='密碼長度至少為 6 個字符'; isValid=false }
  if (!form.confirmPassword) { errors.confirmPassword='請再次輸入密碼'; isValid=false } else if (form.password !== form.confirmPassword) { errors.confirmPassword='兩次輸入的密碼不一致'; isValid=false }
  if (!form.address) { errors.address='請輸入完整地址（含縣市）'; isValid=false } else if (form.address.length < 6) { errors.address='地址長度太短，請輸入正確地址'; isValid=false }
  return isValid
}

async function handleRegister() {
  if (!validateForm()) return
  try {
    const response: any = await api.post('/register?', { username: form.username, password: form.password, email: form.email, fullName: form.fullName, address: form.address, phone: form.phone })
    if (response.data.success) {
      await Swal.fire({ icon:'success', title:'註冊成功', text: response.data.message || '註冊成功！請登入。', confirmButtonText:'確定' })
      await router.push('/login')
    } else {
      Swal.fire({ icon:'error', title:'註冊失敗', text: response.data.message || '註冊失敗，請檢查您的資料', confirmButtonText:'確定' })
    }
  } catch (error:any) {
    console.error('註冊錯誤:', error)
    Swal.fire({ icon:'error', title:'錯誤', text: error.response?.data?.message || '伺服器錯誤，請稍後再試', confirmButtonText:'確定' })
  }
}
</script>

<style scoped src="@/assets/css/auth-pages.css"></style>
