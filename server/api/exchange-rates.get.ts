type ExchangePayload = {
  base: 'TWD'
  rates: Record<string, number>
  updatedAt: string | null
  nextUpdateAt: string | null
}

const SUPPORTED = ['TWD', 'CNY', 'USD', 'JPY', 'KRW', 'VND', 'THB'] as const
const CACHE_TTL = 12 * 60 * 60 * 1000

let cache: { expiresAt: number; payload: ExchangePayload } | null = null

export default defineEventHandler(async () => {
  // 區域：伺服器端快取匯率，避免每個客戶頁面都直接呼叫外部服務。
  if (cache && Date.now() < cache.expiresAt) {
    return cache.payload
  }

  const response = await $fetch<any>('https://open.er-api.com/v6/latest/TWD')

  if (response?.result !== 'success' || !response?.rates) {
    throw createError({ statusCode: 502, statusMessage: 'Exchange rate service unavailable' })
  }

  const rates = Object.fromEntries(
    SUPPORTED.map((code) => [code, code === 'TWD' ? 1 : Number(response.rates[code] || 0)]),
  )

  const payload: ExchangePayload = {
    base: 'TWD',
    rates,
    updatedAt: response.time_last_update_utc ?? null,
    nextUpdateAt: response.time_next_update_utc ?? null,
  }

  cache = { expiresAt: Date.now() + CACHE_TTL, payload }
  return payload
})
