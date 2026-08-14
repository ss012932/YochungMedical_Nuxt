/**
 * 前台固定 UI 翻譯 composable。
 * 功能：讓 script / SweetAlert2 與 template 使用相同的 $ui 字典。
 */
export function useUiText() {
  const nuxtApp = useNuxtApp()
  return (source: unknown): string => nuxtApp.$ui(source)
}
