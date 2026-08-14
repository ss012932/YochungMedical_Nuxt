import Swal from 'sweetalert2'

// ============================================================
// 全站登入狀態監測
// 功能：HttpOnly Cookie 無法由前端直接讀取到期時間，因此透過 /auth/me
//      定期確認後端登入狀態。這樣使用者即使停留在同一頁，登入過期後
//      也能主動提示並導回登入頁，不必等到下一次點會員中心才發現。
// ============================================================
export default defineNuxtPlugin(() => {
  const router = useRouter()
  const route = useRoute()

  const isLoggedIn = useState<boolean>('header-is-logged-in', () => false)
  const authChecked = useState<boolean>('header-auth-checked', () => false)
  const isAdmin = useState<boolean>('header-is-admin', () => false)
  const userName = useState<string>('header-user-name', () => '')
  const headerAuthUi = useCookie<{ loggedIn: boolean; isAdmin: boolean } | null>('yochung-header-auth-ui', {
    default: () => null,
    sameSite: 'lax',
  })

  const AUTH_CHECK_INTERVAL = 60_000
  const AUTH_ME_URL = 'https://yochung-api.christylove.com.tw/api/auth/me'

  let intervalId: ReturnType<typeof setInterval> | null = null
  let isChecking = false
  let isHandlingExpiredSession = false

  // 只有已知登入者，或正在會員 / 管理頁時才需要持續驗證。
  function shouldCheckAuth() {
    return (
      isLoggedIn.value ||
      headerAuthUi.value?.loggedIn === true ||
      route.path.startsWith('/member') ||
      route.path.startsWith('/admin')
    )
  }

  function clearAuthState() {
    isLoggedIn.value = false
    authChecked.value = true
    isAdmin.value = false
    userName.value = ''
    headerAuthUi.value = { loggedIn: false, isAdmin: false }
  }

  async function handleExpiredSession() {
    if (isHandlingExpiredSession) return
    isHandlingExpiredSession = true

    clearAuthState()

    // 已經在登入頁就不重複跳提示。
    if (route.path !== '/login') {
      await Swal.fire({
        icon: 'warning',
        title: '登入逾時',
        text: '您的登入憑證已過期，請重新登入。',
        confirmButtonText: '確定',
        allowOutsideClick: false,
      })
      await router.push('/login')
    }

    isHandlingExpiredSession = false
  }

  async function verifySession() {
    if (!shouldCheckAuth() || isChecking || isHandlingExpiredSession) return

    isChecking = true
    try {
      const response = await fetch(AUTH_ME_URL, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })

      // 401 / 403 代表登入憑證已失效。
      if (response.status === 401 || response.status === 403) {
        await handleExpiredSession()
        return
      }

      // 網路正常但伺服器暫時 5xx 時不要誤判成登出。
      if (!response.ok) return

      const data = await response.json().catch(() => null)

      if (!data?.authenticated) {
        await handleExpiredSession()
        return
      }

      // 驗證成功時同步全站共用登入狀態。
      isLoggedIn.value = true
      authChecked.value = true
      isAdmin.value = !!data.isAdmin
      userName.value = data.name || userName.value
      headerAuthUi.value = { loggedIn: true, isAdmin: isAdmin.value }
    } catch (error) {
      // 斷網、DNS、暫時性 CORS 等連線錯誤不應直接把使用者登出。
      console.warn('登入狀態檢查暫時失敗，保留目前登入狀態：', error)
    } finally {
      isChecking = false
    }
  }

  function handleWindowFocus() {
    void verifySession()
  }

  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      void verifySession()
    }
  }

  // 每分鐘檢查一次；回到瀏覽器分頁時另外立即檢查。
  intervalId = setInterval(() => {
    void verifySession()
  }, AUTH_CHECK_INTERVAL)

  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Plugin 啟動後先檢查一次（只會對已登入或私有頁面生效）。
  void verifySession()

  // HMR / App 卸載時清理事件，避免開發模式重複掛監聽器。
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      if (intervalId) clearInterval(intervalId)
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  }
})
