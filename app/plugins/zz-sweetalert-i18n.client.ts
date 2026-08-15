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

  // 功能：SweetAlert2 開啟時同步鎖住真正的頁面捲動根節點。
  // SweetAlert2 預設主要控制 body，但本站 html 有 scrollbar-gutter，
  // 因此再加全域 class，確保桌機與手機都不能捲動背景頁面。
  const lockPageForSwal = () => {
    document.documentElement.classList.add('swal2-global-open')
    document.body.classList.add('swal2-global-open')
  }

  // 功能：記錄目前仍在作用中的 Swal.fire() 數量。
  // 不再用 DOM 是否存在 .swal2-container 判斷，因為 SweetAlert2 關閉動畫期間容器可能暫時還留在 DOM，
  // 會造成 swal2-global-open 沒被移除，導致頁面永久無法捲動。
  let activeSwalCount = 0

  const unlockPageAfterSwal = () => {
    activeSwalCount = Math.max(0, activeSwalCount - 1)
    if (activeSwalCount > 0) return

    document.documentElement.classList.remove('swal2-global-open')
    document.body.classList.remove('swal2-global-open')
  }

  swalAny.fire = (...args: any[]) => {
    activeSwalCount += 1
    lockPageForSwal()

    let result: Promise<any>

    if (args.length === 1 && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      result = originalFire(translateOptions(args[0]))
    } else {
      const translatedArgs = [...args]
      if (typeof translatedArgs[0] === 'string') translatedArgs[0] = translate(translatedArgs[0])
      if (typeof translatedArgs[1] === 'string') translatedArgs[1] = translate(translatedArgs[1])
      result = originalFire(...translatedArgs)
    }

    void result.finally(unlockPageAfterSwal)
    return result
  }

  swalAny[patchedKey] = true
})
