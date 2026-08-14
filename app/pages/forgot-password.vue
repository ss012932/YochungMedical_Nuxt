<template>
  <AuthShell mobile-raised :title="$ui('忘記密碼')" description="請輸入您的電子郵件，我們將發送重設密碼的連結給您。">
    <form class="auth-form" @submit.prevent="handleForgotPassword">
      <div class="form-group">
        <label for="email">{{ $ui('電子郵件') }}</label>
        <div class="input-wrapper">
          <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg></span>
          <input id="email" v-model="form.email" type="email" :placeholder="$ui('請輸入您的電子郵件')" required />
        </div>
        <span v-if="errors.email" class="error">{{ $ui(errors.email) }}</span>
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

      <button type="submit" class="btn-primary" :disabled="isSubmitting">{{ $ui(isSubmitting ? '處理中...' : '發送重設連結') }}</button>

      <div class="auth-links">
        <p class="auth-link">{{ $ui('記起密碼了？') }}<NuxtLink to="/login" class="link">{{ $ui('返回登入') }}</NuxtLink></p>
        <p class="auth-link">{{ $ui('還沒有帳號？') }}<NuxtLink to="/register" class="link">{{ $ui('立即註冊') }}</NuxtLink></p>
      </div>
    </form>
  </AuthShell>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useApi } from '~/composables/utils/api'

definePageMeta({ layout: 'auth', middleware: 'guest-only' })
useSeoMeta({ title: '忘記密碼' })
const api = useApi()
const form = reactive({ email: '', captcha: '' })
const errors = reactive({ email: '', captcha: '' })
const captchaCode = ref('')
const captchaChars = ref<Array<{ id:number; char:string; style:Record<string,string> }>>([])
const captchaLineStyle = ref<Record<string, string>>({})
const captchaLineStyle2 = ref<Record<string, string>>({})
const captchaBgStyle = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const resetLinkSent = ref(false)

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
    top: `19px`,
    transform: `rotate(${Math.floor(Math.random() * 31) - 15}deg)`,
    opacity: `0.69`,
  }
  captchaLineStyle2.value = {
    bottom: `16px`,
    transform: `rotate(${Math.floor(Math.random() * 31) - 15}deg)`,
    opacity: `0.64`,
  }
  const a1 = Math.floor(Math.random() * 31) - 15
  const a2 = Math.floor(Math.random() * 31) - 15
  captchaBgStyle.value = {
    backgroundImage: `linear-gradient(${a1}deg, transparent 0 43%, rgba(143,52,133,.2) 44% 46%, transparent 47% 100%), linear-gradient(${a2}deg, transparent 0 56%, rgba(111,40,105,.18) 57% 59%, transparent 60% 100%)`,
  }
}
function refreshCaptcha() { generateCaptcha(); form.captcha = ''; errors.captcha = '' }
function validateEmail(email:string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }

// 注意：此驗證流程刻意照搬舊站 forgot.js，不自行修改既有判斷邏輯。
function validateForm() {
  errors.email = ''; errors.captcha = ''
  let isValid = true
  if (!form.email) { errors.email = '請輸入電子郵件'; isValid = false }
  else if (!validateEmail(form.email)) { errors.email = '請輸入有效的電子郵件格式'; isValid = false }

  if (!form.email) { errors.email = '請輸入電子郵件'; isValid = false }
  else if (!validateEmail(form.email)) { errors.email = '請輸入有效的電子郵件格式'; isValid = false }

  if (!isValid) { refreshCaptcha(); form.captcha = '' }
  return isValid
}

async function handleForgotPassword() {
  if (!validateForm()) return
  isSubmitting.value = true
  // 功能：顯示處理中的 SweetAlert2 Loading 視窗。
  // Swal.fire() 回傳的是 Promise，不是 Alert 實例，因此更新/關閉要使用 Swal.update() / Swal.close()。
  Swal.fire({ title:'處理中...', html:'正在驗證並發送重設密碼信件', allowOutsideClick:false, showConfirmButton:false, backdrop:true, didOpen:()=>Swal.showLoading() })

  try {
    const allMembersRes:any = await api.get('/members/all')
    const matched = allMembersRes.data.find((m:any) => m.Email?.toLowerCase() === form.email.trim().toLowerCase())
    if (!matched) {
      Swal.close()
      await Swal.fire({ icon:'warning', title:'查無此帳號', text:'此電子郵件尚未註冊，請確認輸入是否正確。', confirmButtonText:'確定' })
      refreshCaptcha(); form.captcha=''; isSubmitting.value=false; return
    }

    // 功能：沿用同一個 Loading 視窗，更新提示文字。
    Swal.update({ html:'已驗證成功，正在發送重設密碼信件...' })
    const response:any = await api.post('/reset-password/request?', { email: form.email })
    Swal.close()

    if (response.status === 200 || response.data.success) {
      resetLinkSent.value = true
      await Swal.fire({ icon:'success', title:'已發送重設密碼連結', text:'請至您的信箱查看重設密碼信件。', showConfirmButton:false, timer:2000, timerProgressBar:true })
      form.email=''; form.captcha=''; refreshCaptcha()
    } else {
      await Swal.fire({ icon:'error', title:'發送失敗', text:response.data.message || '無法寄送，請稍後再試。', confirmButtonText:'確定' })
    }
  } catch (error:any) {
    console.error('❌ 重設密碼發送失敗：', error.response || error)
    // 功能：發生錯誤時先關閉 Loading，再顯示錯誤訊息。
    Swal.close()
    await Swal.fire({ icon:'error', title:'系統錯誤', text:error?.response?.data?.message || '伺服器錯誤，請稍後再試或聯繫客服。', confirmButtonText:'確定' })
    refreshCaptcha()
  } finally {
    isSubmitting.value = false
  }
}

onMounted(generateCaptcha)
</script>

<style scoped src="@/assets/css/auth-pages.css"></style>
