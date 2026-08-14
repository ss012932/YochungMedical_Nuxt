import { useApi } from '~/composables/utils/api'

export default defineNuxtRouteMiddleware(async () => {
  // 只在瀏覽器端檢查 HttpOnly Cookie 登入狀態，避免 SSR 無法取得瀏覽器 Cookie 時誤導頁。
  if (import.meta.server) return

  try {
    const api = useApi()
    const res: any = await api.get('/auth/me')

    if (!res.data?.authenticated) return

    // 已登入使用者不應再進登入／註冊／忘記密碼頁。
    return navigateTo(res.data?.isAdmin ? '/admin' : '/member', { replace: true })
  } catch {
    // /auth/me 失敗視為訪客，仍允許進入驗證頁面。
    return
  }
})
