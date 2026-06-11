<template>
  <div id="app">
    <div class="layout-container">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-title">OpsAssist</span>
            <span class="logo-subtitle">智能运维平台</span>
          </div>
        </div>

        <nav class="nav-menu">
          <router-link to="/" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">智能问答</span>
            <div class="nav-indicator"></div>
          </router-link>

          <router-link to="/knowledge-base" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">知识库</span>
            <div class="nav-indicator"></div>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <router-link to="/settings" class="settings-link">
            <svg class="settings-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="settings-text">设置</span>
          </router-link>

          <div class="system-status">
            <div class="status-dot"></div>
            <span>系统运行正常</span>
          </div>
          <div class="version-info">
            <span class="version">v0.1.0</span>
            <span class="build">Build 2026.06</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 顶部导航栏 -->
        <header class="header">
          <div class="header-left">
            <div class="breadcrumb">
              <span class="breadcrumb-item">运维控制台</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item active">{{ currentPageTitle }}</span>
            </div>
          </div>
          <div class="header-right">
            <button @click="toggleTheme" class="theme-toggle" :title="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'">
              <!-- Sun icon (light mode) -->
              <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <!-- Moon icon (dark mode) -->
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="server-time">
              <svg class="time-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ currentTime }}</span>
            </div>
          </div>
        </header>

        <!-- 内容区域 -->
        <main class="content">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const currentPageTitle = computed(() => String(route.meta.title || '智能问答'))
const currentTime = ref('')
const { theme, toggleTheme, initTheme } = useTheme()

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

let timer: number

onMounted(() => {
  initTheme()
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  /* Color System - Technical Cyan Theme */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #1a2332;
  --color-bg-elevated: #1f2937;

  --color-surface-primary: #1f2937;
  --color-surface-secondary: #2d3748;
  --color-surface-hover: #374151;

  --color-border-primary: #2d3748;
  --color-border-secondary: #374151;
  --color-border-accent: #3b82f6;

  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-text-tertiary: #9ca3af;
  --color-text-muted: #6b7280;

  --color-accent-primary: #06b6d4;
  --color-accent-secondary: #0891b2;
  --color-accent-glow: rgba(6, 182, 212, 0.15);

  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px var(--color-accent-glow);

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Light Theme */
[data-theme="light"] {
  --color-bg-primary: #f9fafb;
  --color-bg-secondary: #ffffff;
  --color-bg-tertiary: #f3f4f6;
  --color-bg-elevated: #ffffff;

  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-hover: #f3f4f6;

  --color-border-primary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  --color-border-accent: #3b82f6;

  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-tertiary: #6b7280;
  --color-text-muted: #9ca3af;

  --color-accent-primary: #0891b2;
  --color-accent-secondary: #0e7490;
  --color-accent-glow: rgba(8, 145, 178, 0.1);

  --color-success: #059669;
  --color-warning: #d97706;
  --color-error: #dc2626;
  --color-info: #2563eb;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px var(--color-accent-glow);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

/* ============ Sidebar ============ */
.sidebar {
  width: 280px;
  min-width: 280px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-primary);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logo {
  height: 80px;
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: var(--shadow-glow);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.logo-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-menu {
  flex: 1;
  padding: var(--space-lg) var(--space-md);
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--space-sm);
}

.nav-item:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-hover);
}

.nav-item.router-link-active {
  color: var(--color-accent-primary);
  background: var(--color-accent-glow);
}

.nav-item.router-link-active .nav-indicator {
  opacity: 1;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
}

.nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--color-accent-primary);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.settings-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  margin: var(--space-md) var(--space-md) 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  cursor: pointer;
}

.settings-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-accent-primary);
}

.settings-link.router-link-active {
  background: var(--color-surface-primary);
  color: var(--color-accent-primary);
  border: 1px solid var(--color-border-primary);
}

.settings-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.settings-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.system-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-md);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.version-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: 'JetBrains Mono', monospace;
}

/* ============ Main Content ============ */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  height: 100%;
  overflow: hidden;
}

.header {
  height: 80px;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-xl);
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
}

.breadcrumb-item {
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.breadcrumb-item.active {
  color: var(--color-text-primary);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--color-text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.theme-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-base);
  padding: 0;
}

.theme-toggle:hover {
  background: var(--color-surface-hover);
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  transform: rotate(180deg);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
  transition: transform var(--transition-base);
}

.server-time {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent-primary);
  font-family: 'JetBrains Mono', monospace;
}

.time-icon {
  width: 14px;
  height: 14px;
}

/* ============ Content Area ============ */
.content {
  flex: 1;
  padding: var(--space-xl);
  overflow-y: auto;
  height: 100%;
}

/* Custom Scrollbar */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: var(--color-bg-primary);
}

.content::-webkit-scrollbar-thumb {
  background: var(--color-border-secondary);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--color-surface-hover);
}

/* ============ Transitions ============ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
