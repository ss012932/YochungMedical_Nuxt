// ============================================================
// 首頁公開 SEO 資料 API
// 功能：在 Nuxt / Nitro Server 端取得首頁熱門商品與商品分類。
// 說明：首頁透過 useAsyncData 在 SSR 階段呼叫此 API，讓搜尋引擎收到的 HTML
//       直接包含熱門商品與分類文字，而不是等瀏覽器 onMounted 後才載入。
// ============================================================
interface ApiCategory {
  Id: number
  Name: string
  Sequence: number
  CreatedDate?: string
  UpdatedDate?: string
}

interface ApiTopProduct {
  Id: number
  Name: string
  ImageUrl: string
  Description: string
  Category: string
}

interface HomeResponse {
  categories: ApiCategory[]
  topProducts: ApiTopProduct[]
  errors: {
    categories: boolean
    topProducts: boolean
  }
}

const API_BASE_URL = 'https://yochung-api.christylove.com.tw/api'

export default defineCachedEventHandler(
  async (): Promise<HomeResponse> => {
    // 功能：兩支公開 API 平行執行，縮短 SSR 等待時間。
    // 使用 allSettled 可避免其中一支 API 暫時失敗時，整個首頁都拿不到另一份資料。
    const [categoriesResult, topProductsResult] = await Promise.allSettled([
      $fetch<ApiCategory[]>(`${API_BASE_URL}/categories`),
      $fetch<ApiTopProduct[]>(`${API_BASE_URL}/products/top`),
    ])

    return {
      categories:
        categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
      topProducts:
        topProductsResult.status === 'fulfilled' ? topProductsResult.value : [],
      errors: {
        categories: categoriesResult.status === 'rejected',
        topProducts: topProductsResult.status === 'rejected',
      },
    }
  },
  {
    // 功能：首頁商品與分類會變動，短時間快取可兼顧 SSR 效能與資料新鮮度。
    maxAge: 60,
    name: 'public-home-seo-data',
  },
)
