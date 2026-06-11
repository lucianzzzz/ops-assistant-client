<template>
  <div class="home">
    <div class="page-header">
      <h1 class="page-title">智能运维问答</h1>
      <p class="page-subtitle">基于 ReAct 推理和语义检索的 AI Agent 系统</p>
    </div>

    <div class="main-content">
      <!-- 输入卡片 -->
      <div class="query-card">
        <AskForm @submit="handleAsk" :loading="loading" />
      </div>

      <!-- 加载状态 -->
      <transition name="fade">
        <div v-if="loading" class="loading-card">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ loadingMessage }}</p>
        </div>
      </transition>

      <!-- 结果展示 -->
      <transition name="fade">
        <ResultCard v-if="result" :result="result" @action-executed="handleActionExecuted" />
      </transition>

      <!-- 错误提示 -->
      <transition name="fade">
        <div v-if="error" class="error-card">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <div>
            <strong>查询失败</strong>
            <p>{{ error }}</p>
          </div>
        </div>
      </transition>
    </div>

    <!-- 执行历史（底部展开） -->
    <transition name="slide-up">
      <div v-if="showHistory" class="history-section">
        <div class="history-header">
          <h3>执行历史</h3>
          <button @click="showHistory = false" class="close-btn">×</button>
        </div>
        <ExecutionHistoryPanel ref="historyPanelRef" />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AskForm from '@/components/AskForm.vue'
import ResultCard from '@/components/ResultCard.vue'
import ExecutionHistoryPanel from '@/components/ExecutionHistoryPanel.vue'
import { api, type AskRequest, type AskResponse, type ExecutionResult } from '@/services/api'

const loading = ref(false)
const error = ref<string | null>(null)
const result = ref<AskResponse | null>(null)
const queryStartTime = ref<number>(0)
const showHistory = ref(false)
const historyPanelRef = ref<InstanceType<typeof ExecutionHistoryPanel> | null>(null)

const loadingMessage = computed(() => {
  if (!loading.value) return ''
  const elapsed = Date.now() - queryStartTime.value
  if (elapsed < 2000) return '正在搜索本地知识库...'
  if (elapsed < 5000) return '正在分析指标关联...'
  return '知识库匹配度较低，正在使用 AI 增强查询...'
})

const handleAsk = async (data: AskRequest) => {
  loading.value = true
  error.value = null
  result.value = null
  queryStartTime.value = Date.now()

  try {
    result.value = await api.ask(data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '未知错误'
  } finally {
    loading.value = false
  }
}

const handleActionExecuted = (executionResult: ExecutionResult) => {
  showHistory.value = true
  setTimeout(() => {
    historyPanelRef.value?.loadHistory()
  }, 300)
}
</script>

<style scoped>
.home {
  min-height: 100%;
  overflow-y: auto;
  padding: var(--space-2xl);
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: calc(var(--space-2xl) * 3);
}

.page-header {
  margin-bottom: var(--space-2xl);
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 15px;
  color: var(--color-text-tertiary);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.query-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-base);
}

.query-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-2xl);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.error-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: var(--radius-lg);
  color: var(--color-error);
}

.error-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.history-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50vh;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-primary);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 100;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-primary);
}

.history-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--color-text-tertiary);
  font-size: 24px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform var(--transition-base);
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
}
</style>
