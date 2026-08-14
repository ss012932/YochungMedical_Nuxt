import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import Swal from 'sweetalert2'

// ============================================================
// API Client
// 說明：沿用舊 YochungMedical 的 API 根路徑、Cookie 與 401 處理邏輯。
// Nuxt 版只把舊 Vue Router 的取得方式改成 useRoute / useRouter。
// ============================================================
let apiClient: ReturnType<typeof axios.create> | null = null
let isShowing401 = false
let isRedirecting = false

export function useApi() {
  const route = useRoute()
  const router = useRouter()

  if (!apiClient) {
    apiClient = axios.create({
      // 舊站正式環境 API，不修改 endpoint 與資料來源。
      baseURL: 'https://yochung-api.christylove.com.tw/api',
      withCredentials: true,
    })

    // ========================================================
    // Request Interceptor
    // 說明：沿用舊站邏輯，只有 upload 類 API 才指定 multipart/form-data。
    // ========================================================
    apiClient.interceptors.request.use(
      (config) => {
        if (config.url?.includes('/upload')) {
          config.headers['Content-Type'] = 'multipart/form-data'
        }

        return config
      },
      (error) => Promise.reject(error),
    )

    // ========================================================
    // Response Interceptor
    // 說明：401 判斷、略過頁面與 API 清單皆沿用舊站設定。
    // ========================================================
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status
        const currentPath = route.path
        const config = error.config || {}
        const requestUrl = config.url || ''

        const skipAuth401Pages = ['/products', '/', '/video', '/contact']
        const skipAuth401APIs = ['/reset-password', '/cart']

        const shouldSkip401 =
          skipAuth401Pages.includes(currentPath) ||
          skipAuth401APIs.some((api) => requestUrl.includes(api))

        if (currentPath === '/login' || isRedirecting || shouldSkip401) {
          return Promise.reject(error)
        }

        if (status === 401 && !isShowing401 && import.meta.client) {
          isShowing401 = true
          isRedirecting = true

          try {
            await Swal.fire({
              icon: 'warning',
              title: '登入逾時',
              text: '您的登入憑證已過期，請重新登入。',
              confirmButtonText: '確定',
            })

            document.cookie =
              'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

            await router.push('/login')

            setTimeout(() => {
              isShowing401 = false
              isRedirecting = false
            }, 500)
          } catch (redirectError) {
            console.error('跳轉登入頁失敗:', redirectError)
            isShowing401 = false
            isRedirecting = false
          }
        }

        return Promise.reject(error)
      },
    )
  }

  // ============================================================
  // 統一 API 方法
  // 說明：方法簽章維持舊 api.js 的 get / post / put / delete 使用方式。
  // ============================================================
  return {
    get<T = any>(
      endpoint: string,
      params: Record<string, unknown> = {},
      config: AxiosRequestConfig = {},
    ) {
      return apiClient!.get<T>(endpoint, { params, ...config })
    },

    post<T = any>(
      endpoint: string,
      data?: unknown,
      config: AxiosRequestConfig = {},
    ) {
      return apiClient!.post<T>(endpoint, data, config)
    },

    put<T = any>(
      endpoint: string,
      data?: unknown,
      config: AxiosRequestConfig = {},
    ) {
      return apiClient!.put<T>(endpoint, data, config)
    },

    delete<T = any>(
      endpoint: string,
      data: Record<string, unknown> = {},
      config: AxiosRequestConfig = {},
    ) {
      return apiClient!.delete<T>(endpoint, { data, ...config })
    },
  }
}
