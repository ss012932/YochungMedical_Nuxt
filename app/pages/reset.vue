<template>
  <AuthShell :title="$ui('重設密碼')" description="請設定您的新密碼。">
    <div v-if="resetSuccess" class="success-message">
      <span class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg></span>{{ $ui('密碼已成功重設！您現在可以使用新密碼登入。') }}<div class="back-button-container"><button class="back-button" type="button" @click="goToLogin">{{ $ui('前往登入') }}</button></div>
    </div>

    <form v-else class="auth-form" @submit.prevent="handleResetPassword">
      <div class="form-group">
        <input v-model="form.email" type="email" class="form-control disabled" readonly disabled />
      </div>

      <div class="form-group">
        <label for="password">{{ $ui('新密碼') }}</label>
        <div class="input-wrapper">
          <span class="input-icon"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
          <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :placeholder="$ui('請輸入新密碼')" required />
          <button type="button" class="toggle-password" @click="togglePassword"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button>
        </div>
        <span v-if="errors.password" class="error">{{ $ui(errors.password) }}</span>
        <div class="strength-row">
          <div class="strength-track"><div class="strength-fill" :class="strengthClass" :style="{ width: `${strengthPercentage}%` }"></div></div>
          <span class="strength-text">{{ $ui(strengthText) }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">{{ $ui('確認密碼') }}</label>
        <div class="input-wrapper">
          <span class="input-icon"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></span>
          <input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" :placeholder="$ui('請再次輸入新密碼')" required />
          <button type="button" class="toggle-password" @click="toggleConfirmPassword"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></button>
        </div>
        <span v-if="errors.confirmPassword" class="error">{{ $ui(errors.confirmPassword) }}</span>
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ $ui(isSubmitting ? '處理中...' : '重設密碼') }}
      </button>
      <p class="auth-link"><NuxtLink to="/login" class="link">{{ $ui('返回登入') }}</NuxtLink></p>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'

definePageMeta({ layout: 'reset' })
useSeoMeta({ title: '重設密碼' })
const api = useApi()
const router = useRouter()
const route = useRoute()
const form = reactive({ email: '', password: '', confirmPassword: '' })
const errors = reactive({ password: '', confirmPassword: '' })
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const resetSuccess = ref(false)
const token = ref('')

const hasMinLength = computed(() => form.password.length >= 8)
const strengthScore = computed(() => hasMinLength.value ? 100 : 0)
const strengthText = computed(() => form.password.length === 0 ? '無' : strengthScore.value < 100 ? '弱' : '強')
const strengthClass = computed(() => form.password.length === 0 ? 'strength-none' : strengthScore.value < 100 ? 'strength-weak' : 'strength-strong')
const strengthPercentage = computed(() => strengthScore.value)
const canSubmit = computed(() => form.password.length >= 8 && form.password === form.confirmPassword)
void canSubmit

function togglePassword() { showPassword.value = !showPassword.value }
function toggleConfirmPassword() { showConfirmPassword.value = !showConfirmPassword.value }

function validateForm() {
  if (!form.password || form.password.length < 8) {
    Swal.fire({ icon:'warning', title:'密碼太短', text:'請輸入至少 8 個字元的密碼', confirmButtonText:'確定' })
    return false
  }
  if (form.password !== form.confirmPassword) {
    Swal.fire({ icon:'warning', title:'密碼不一致', text:'請確認兩次輸入的密碼相同', confirmButtonText:'確定' })
    return false
  }
  return true
}

async function handleResetPassword() {
  if (!validateForm()) return
  isSubmitting.value = true
  try {
    const payload = { Email: form.email.trim(), Token: String(route.query.token || '').trim(), NewPassword: form.password }
    console.log('📤 傳送 payload：', JSON.stringify(payload))
    const response:any = await api.post('/reset-password/confirm', payload, { headers: { 'Content-Type': 'application/json' } })
    console.log('✅ 回應狀態：', response.status)
    console.log('✅ 回應資料：', response.data)
    if (response.status === 200) {
      resetSuccess.value = true
      await Swal.fire({ icon:'success', title:'密碼重設成功', text:'您現在可以使用新密碼登入系統', confirmButtonText:'確定' })
    } else {
      Swal.fire({ icon:'error', title:'重設失敗', text:response.data?.message || '後端回傳非成功狀態', confirmButtonText:'確定' })
    }
  } catch (error:any) {
    console.error('❌ 狀態碼：', error.response?.status)
    console.error('❌ 錯誤訊息：', error.response?.data)
    const errorMessage = error.response?.data || (error.response?.status === 401 ? '重設密碼連結已過期或無效' : '伺服器錯誤，請稍後再試')
    Swal.fire({ icon:'error', title:'錯誤', text:errorMessage, confirmButtonText:'確定' })
  } finally {
    isSubmitting.value = false
  }
}

function goToLogin() { router.push('/login') }

onMounted(async () => {
  window.scrollTo(0, 0)
  const scrollTargets = [document.documentElement, document.body, document.querySelector('#app'), document.querySelector('.app'), document.querySelector('.main'), document.querySelector('.content')]
  scrollTargets.forEach((el:any) => { if (el && el.scrollTop !== undefined) el.scrollTop = 0 })

  token.value = String(route.query.token || '').trim()
  form.email = String(route.query.email || '').trim()
  if (!token.value || !form.email) {
    await Swal.fire({ icon:'error', title:'無效的請求', text:'重設密碼連結無效或已過期，請重新申請', confirmButtonText:'確定' })
    await router.push('/forgot-password')
  }
})
</script>

<style scoped src="@/assets/css/auth-pages.css"></style>
