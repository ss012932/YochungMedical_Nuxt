import Swal from 'sweetalert2'
import { uiDictionaries, type SupportedUiLocale } from '../i18n/ui-dictionaries'

/**
 * 前台 SweetAlert2 全域翻譯攔截器。
 * 功能：讓既有 Swal.fire() 的 title / text / confirm / cancel 自動套用目前 UI 語言，
 * 避免每個頁面都要重複手動包 useUiText()。
 */
export default defineNuxtPlugin(() => {
  const patchedKey = '__yochungUiI18nPatched'
  const swalAny = Swal as any
  if (swalAny[patchedKey]) return

  const uiLocale = useState<SupportedUiLocale>('ui-locale', () => 'zh-TW')
  const originalFire = Swal.fire.bind(Swal) as (...args: any[]) => Promise<any>

  const translate = (value: unknown) => {
    if (typeof value !== 'string') return value
    const locale = uiDictionaries[uiLocale.value] ? uiLocale.value : 'zh-TW'
    return uiDictionaries[locale][value] ?? value
  }

  const translateOptions = (options: Record<string, any>) => {
    const translated = { ...options }
    for (const key of ['title', 'text', 'confirmButtonText', 'cancelButtonText', 'denyButtonText', 'footer']) {
      if (typeof translated[key] === 'string') translated[key] = translate(translated[key])
    }
    return translated
  }

  swalAny.fire = (...args: any[]) => {
    if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      return originalFire(translateOptions(args[0]))
    }

    const translatedArgs = [...args]
    if (typeof translatedArgs[0] === 'string') translatedArgs[0] = translate(translatedArgs[0])
    if (typeof translatedArgs[1] === 'string') translatedArgs[1] = translate(translatedArgs[1])
    return originalFire(...translatedArgs)
  }

  swalAny[patchedKey] = true
})
