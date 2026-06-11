import { ref, watch, onMounted } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'ops-assistant-theme'

// 全局主题状态
const currentTheme = ref<Theme>('dark')

export function useTheme() {
  // 初始化主题
  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    currentTheme.value = stored || (systemPrefersDark ? 'dark' : 'light')
    applyTheme(currentTheme.value)
  }

  // 应用主题
  const applyTheme = (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  }

  // 切换主题
  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, currentTheme.value)
    applyTheme(currentTheme.value)
  }

  // 设置指定主题
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
  }

  // 监听系统主题变化
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  })

  return {
    theme: currentTheme,
    isDark: () => currentTheme.value === 'dark',
    toggleTheme,
    setTheme,
    initTheme
  }
}
