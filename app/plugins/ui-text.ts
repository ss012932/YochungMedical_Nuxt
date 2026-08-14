import { uiDictionaries, type SupportedUiLocale } from '../i18n/ui-dictionaries'

/**
 * 固定 UI 翻譯 helper。
 *
 * 重要：不要直接 import i18n/locales/*.json。
 * @nuxtjs/i18n 會把那些 locale message 編譯成 AST，直接拿來 render 會顯示 type/start/end 等物件內容。
 * 這裡使用純 TypeScript 字串字典，確保所有回傳值都是 string。
 */
export default defineNuxtPlugin(() => {
  const localeCookie = useCookie<string>('yochung_locale', {
    default: () => 'zh-TW',
  })

  const cookieLocale = localeCookie.value as SupportedUiLocale
  const initialLocale: SupportedUiLocale = uiDictionaries[cookieLocale] ? cookieLocale : 'zh-TW'

  const uiLocale = useState<SupportedUiLocale>('ui-locale', () => initialLocale)

  if (uiDictionaries[initialLocale] && uiLocale.value !== initialLocale) {
    uiLocale.value = initialLocale
  }

  // API 商品名稱有時只有空白格式不同，例如「/ 10*10」與「/10*10」。
  // 這裡只用於查字典，不會修改原始 API 資料。
  const normalizeLookupKey = (value: string) =>
    value
      .replace(/\s+/g, ' ')
      .replace(/\s*\/\s*/g, '/')
      .replace(/\s*\*\s*/g, '*')
      .replace(/\s*\(\s*/g, ' (')
      .replace(/\s*\)\s*/g, ')')
      .trim()

  const normalizedDictionaries = Object.fromEntries(
    Object.entries(uiDictionaries).map(([locale, dictionary]) => [
      locale,
      new Map(Object.entries(dictionary).map(([key, value]) => [normalizeLookupKey(key), value])),
    ]),
  ) as Record<SupportedUiLocale, Map<string, string>>

  const ui = (source: unknown): string => {
    if (source === null || source === undefined) return ''

    const text = String(source)
    const locale: SupportedUiLocale = uiDictionaries[uiLocale.value]
      ? uiLocale.value
      : 'zh-TW'

    const translated =
      uiDictionaries[locale][text] ??
      normalizedDictionaries[locale].get(normalizeLookupKey(text))

    return typeof translated === 'string' ? translated : text
  }

  return {
    provide: { ui },
  }
})
