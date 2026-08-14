export type CurrencyCode = 'TWD' | 'CNY' | 'USD' | 'JPY' | 'KRW' | 'VND' | 'THB'

let ratesRequest: Promise<boolean> | null = null

export const currencyOptions: Array<{ code: CurrencyCode; symbol: string; label: string }> = [
  { code: 'TWD', symbol: 'NT$', label: 'TWD' },
  { code: 'CNY', symbol: 'CN¥', label: 'CNY' },
  { code: 'USD', symbol: 'US$', label: 'USD' },
  { code: 'JPY', symbol: '¥', label: 'JPY' },
  { code: 'KRW', symbol: '₩', label: 'KRW' },
  { code: 'VND', symbol: '₫', label: 'VND' },
  { code: 'THB', symbol: '฿', label: 'THB' },
]

export function useCurrency() {
  const selectedCurrency = useCookie<CurrencyCode>('yochung-currency', {
    default: () => 'TWD',
    sameSite: 'lax',
  })
  const rates = useState<Record<string, number>>('currency-rates', () => ({ TWD: 1 }))
  const ratesLoaded = useState<boolean>('currency-rates-loaded', () => false)
  const ratesLoading = useState<boolean>('currency-rates-loading', () => false)

  const currentCurrency = computed(() =>
    currencyOptions.find((item) => item.code === selectedCurrency.value) ?? currencyOptions[0],
  )

  async function loadRates(force = false): Promise<boolean> {
    if (!force && ratesLoaded.value) return true
    if (!force && ratesRequest) return await ratesRequest

    ratesLoading.value = true
    ratesRequest = (async () => {
      try {
        let result: { rates: Record<string, number> } | null = null

        try {
          // 優先走本站 Nuxt Server API，可統一快取匯率。
          result = await $fetch<{ rates: Record<string, number> }>('/api/exchange-rates')
        } catch (localApiError) {
          // 開發伺服器若尚未重新載入新增的 server route，改用公開端點直接取得。
          console.warn('本站匯率 API 無法使用，改用公開匯率端點', localApiError)
          const external = await $fetch<any>('https://open.er-api.com/v6/latest/TWD')
          if (external?.result === 'success' && external?.rates) {
            result = { rates: external.rates }
          }
        }

        if (!result?.rates) throw new Error('沒有取得有效匯率資料')

        rates.value = { TWD: 1, ...(result.rates || {}) }

        const hasAllRequiredRates = currencyOptions
          .filter((item) => item.code !== 'TWD')
          .every((item) => Number(rates.value[item.code] || 0) > 0)

        ratesLoaded.value = hasAllRequiredRates
        return hasAllRequiredRates
      } catch (error) {
        console.error('載入匯率失敗', error)
        ratesLoaded.value = false
        return false
      } finally {
        ratesLoading.value = false
        ratesRequest = null
      }
    })()

    return await ratesRequest
  }

  async function setCurrency(code: CurrencyCode): Promise<boolean> {
    if (code === 'TWD') {
      selectedCurrency.value = code
      return true
    }

    // 區域：先取得有效匯率後才切換幣別，避免畫面先出現「¥ --」。
    const ready = Number(rates.value[code] || 0) > 0 || await loadRates()
    if (!ready || Number(rates.value[code] || 0) <= 0) return false

    selectedCurrency.value = code
    return true
  }

  function convertFromTwd(amount: number | string | null | undefined) {
    const numeric = Number(amount || 0)
    if (selectedCurrency.value === 'TWD') return numeric
    const rate = Number(rates.value[selectedCurrency.value] || 0)
    if (!rate) return null
    return numeric * rate
  }

  function formatCurrency(amount: number | string | null | undefined) {
    const converted = convertFromTwd(amount)
    const currency = currentCurrency.value
    // 匯率尚在載入時先安全顯示台幣原價，不讓價格消失。
    if (converted === null) {
      const original = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(amount || 0))
      return `NT$ ${original}`
    }

    const noDecimalCurrencies: CurrencyCode[] = ['TWD', 'JPY', 'KRW', 'VND']
    const digits = noDecimalCurrencies.includes(selectedCurrency.value) ? 0 : 2
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(converted)

    return `${currency.symbol} ${formatted}`
  }

  // 區域：使用者重新整理後若先前已選外幣，自動補載匯率。
  if (import.meta.client && selectedCurrency.value !== 'TWD' && !ratesLoaded.value) {
    void loadRates()
  }

  return {
    currencyOptions,
    selectedCurrency,
    currentCurrency,
    rates,
    ratesLoaded,
    ratesLoading,
    loadRates,
    setCurrency,
    convertFromTwd,
    formatCurrency,
  }
}
