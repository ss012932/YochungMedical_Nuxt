// ============================================================
// 公開商品目錄 API
// 功能：集中取得商品與分類，並在 Nuxt / Nitro Server 端快取 60 秒。
// 好處：瀏覽器不需要每次直接等待外部正式 API 的完整回應時間。
// ============================================================
interface ApiCategory {
  Id: number;
  Name: string;
  Sequence: number;
}

interface ApiProduct {
  Id: number;
  Name: string;
  Description?: string;
  Price?: number;
  ImageUrl?: string;
  CategoryId: number;
  Stock: number;
  Sequence: number;
  Meter?: boolean;
  IsActive?: boolean;
}

interface CatalogResponse {
  categories: ApiCategory[];
  products: ApiProduct[];
}

const API_BASE_URL = 'https://yochung-api.christylove.com.tw/api'

export default defineCachedEventHandler(
  async (): Promise<CatalogResponse> => {
    // 功能：分類與商品互不相依，平行呼叫可縮短整體等待時間。
    const [categories, products] = await Promise.all([
      $fetch<ApiCategory[]>(`${API_BASE_URL}/categories`),
      $fetch<ApiProduct[]>(`${API_BASE_URL}/products`),
    ])

    return {
      categories,
      products,
    }
  },
  {
    // 功能：商品與庫存仍可能變動，因此只做短時間快取，兼顧速度與資料新鮮度。
    maxAge: 60,
    name: 'public-product-catalog',
  },
)
