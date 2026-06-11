<template>
  <div class="data-source-card">
    <div class="card-header">
      <div class="header-left">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="currentColor" stroke-width="2"/>
          <path d="M2 9H22" stroke="currentColor" stroke-width="2"/>
          <path d="M8 3V9" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3 class="card-title">数据源状态</h3>
      </div>
      <div class="header-right">
        <button @click="loadStatus" class="refresh-btn" :disabled="loading">
          <svg :class="['refresh-icon', { spinning: loading }]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 10V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 4H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="card-body">
      <div v-if="loading" class="loading-state">
        <div class="spinner-container">
          <div class="spinner"></div>
        </div>
        <p>正在加载数据源状态...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="status" class="status-grid">
        <div class="status-item" v-for="source in statusItems" :key="source.key">
          <div class="status-header">
            <div class="status-icon" :class="source.exists ? 'success' : 'error'">
              <!-- Knowledge Icon -->
              <svg v-if="source.key === 'knowledge'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- Metrics Icon -->
              <svg v-else-if="source.key === 'metrics'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- Tags Icon -->
              <svg v-else-if="source.key === 'tags'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="7" cy="7" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div class="status-info">
              <h4 class="status-label">{{ source.label }}</h4>
              <p class="status-path">{{ source.fileName }}</p>
            </div>
          </div>

          <div class="status-metrics">
            <div class="metric">
              <span class="metric-label">状态</span>
              <span :class="['status-badge', source.exists ? 'success' : 'error']">
                <span class="badge-dot"></span>
                {{ source.exists ? '正常' : '异常' }}
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">已加载</span>
              <span class="metric-value">{{ source.loadedCount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="status-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: source.exists ? '100%' : '0%' }"
                :class="source.exists ? 'success' : 'error'"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api, type DataSourceStatus } from '@/services/api'

const loading = ref(true)
const error = ref<string | null>(null)
const status = ref<DataSourceStatus | null>(null)

type StatusItem = {
  key: 'knowledge' | 'metrics' | 'tags'
  label: string
  exists: boolean
  loadedCount: number
  fileName: string
}

const statusItems = computed<StatusItem[]>(() => {
  if (!status.value) return []

  return [
    {
      key: 'knowledge',
      label: '知识库',
      exists: status.value.knowledge.exists,
      loadedCount: status.value.knowledge.loaded_count,
      fileName: status.value.knowledge.file_name
    },
    {
      key: 'metrics',
      label: '指标库',
      exists: status.value.metrics.exists,
      loadedCount: status.value.metrics.loaded_count,
      fileName: status.value.metrics.file_name
    },
    {
      key: 'tags',
      label: '标签库',
      exists: status.value.public_tags.exists,
      loadedCount: status.value.public_tags.loaded_count,
      fileName: status.value.public_tags.file_name
    }
  ]
})

const loadStatus = async () => {
  loading.value = true
  error.value = null

  try {
    status.value = await api.dataSourceStatus()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style scoped>
.data-source-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-lg);
  transition: all var(--transition-base);
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
}

.data-source-card:hover {
  border-color: var(--color-border-secondary);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-surface-secondary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon {
  width: 20px;
  height: 20px;
  color: var(--color-accent-primary);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  gap: var(--space-sm);
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.refresh-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.refresh-icon {
  width: 16px;
  height: 16px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-body {
  padding: var(--space-xl);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
  color: var(--color-text-tertiary);
}

.spinner-container {
  margin-bottom: var(--space-lg);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-icon {
  width: 40px;
  height: 40px;
  color: var(--color-error);
  margin-bottom: var(--space-md);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.status-item {
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  transition: all var(--transition-base);
}

.status-item:hover {
  border-color: var(--color-border-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.status-header {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-base);
}

.status-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.status-icon svg {
  width: 22px;
  height: 22px;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs) 0;
}

.status-path {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: 'JetBrains Mono', monospace;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-metrics {
  display: flex;
  gap: var(--space-xl);
  margin-bottom: var(--space-md);
}

.metric {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.metric-label {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.status-badge.error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-progress {
  margin-top: var(--space-md);
}

.progress-bar {
  height: 4px;
  background: var(--color-border-primary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-fill.success {
  background: linear-gradient(90deg, var(--color-success), var(--color-accent-primary));
}

.progress-fill.error {
  background: var(--color-error);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
