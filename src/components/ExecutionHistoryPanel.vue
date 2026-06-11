<template>
  <div class="history-panel">
    <div class="panel-header">
      <div>
        <h3>执行历史</h3>
        <p>GET /api/v1/agent/executions</p>
      </div>
      <button type="button" class="secondary-btn" @click="loadHistory" :disabled="loading">
        {{ loading ? '刷新中...' : '刷新' }}
      </button>
    </div>

    <div v-if="error" class="inline-error">{{ error }}</div>

    <div v-if="executions.length" class="execution-list">
      <button
        v-for="item in executions"
        :key="item.execution_id"
        type="button"
        class="execution-item"
        :class="[`status-${item.status}`, { active: selected?.execution_id === item.execution_id }]"
        @click="selectExecution(item.execution_id)"
      >
        <div class="execution-row">
          <span class="status-dot"></span>
          <strong>{{ statusLabel(item.status) }}</strong>
          <span>{{ formatTime(item.start_time) }}</span>
        </div>
        <div class="execution-meta">
          <span>{{ item.action_id }}</span>
          <span>{{ item.duration?.toFixed(2) || '0.00' }}s</span>
        </div>
      </button>
    </div>

    <p v-else class="empty-text">暂无执行历史。</p>

    <div v-if="selected" class="execution-detail">
      <h4>执行详情</h4>
      <div class="detail-grid">
        <span>Execution ID</span><strong>{{ selected.execution_id }}</strong>
        <span>Action ID</span><strong>{{ selected.action_id }}</strong>
        <span>Exit Code</span><strong>{{ selected.exit_code ?? '-' }}</strong>
        <span>耗时</span><strong>{{ selected.duration?.toFixed(2) || '0.00' }}s</strong>
      </div>
      <pre v-if="selected.stdout">{{ selected.stdout }}</pre>
      <pre v-if="selected.stderr" class="error-output">{{ selected.stderr }}</pre>
      <pre v-if="selected.error" class="error-output">{{ selected.error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, type ExecutionResult } from '@/services/api'

const executions = ref<ExecutionResult[]>([])
const selected = ref<ExecutionResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const loadHistory = async () => {
  loading.value = true
  error.value = null

  try {
    executions.value = await api.getExecutionHistory(20)
    if (!selected.value && executions.value.length > 0) {
      selected.value = executions.value[0] || null
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '读取执行历史失败'
  } finally {
    loading.value = false
  }
}

const selectExecution = async (executionId: string) => {
  error.value = null

  try {
    const result = await api.getExecutionResult(executionId)
    selected.value = result || null
  } catch (err) {
    error.value = err instanceof Error ? err.message : '读取执行详情失败'
  }
}

const statusLabel = (status: ExecutionResult['status']) => ({
  pending: '等待中',
  running: '执行中',
  success: '成功',
  failed: '失败',
  timeout: '超时',
  cancelled: '取消'
})[status]

const formatTime = (value: string) => new Date(value).toLocaleString('zh-CN', {
  hour12: false,
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
})

onMounted(loadHistory)

defineExpose({ loadHistory })
</script>

<style scoped>
.history-panel {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
  align-items: flex-start;
  padding-bottom: var(--space-lg);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.panel-header h3 {
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
  font-size: 18px;
}

.panel-header p,
.empty-text {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.secondary-btn {
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text-primary);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.secondary-btn:hover:not(:disabled) {
  border-color: var(--color-accent-primary);
  transform: translateY(-1px);
}

.execution-list {
  display: grid;
  gap: var(--space-sm);
}

.execution-item {
  width: 100%;
  padding: var(--space-md);
  text-align: left;
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-base);
}

.execution-item:hover,
.execution-item.active {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-sm);
}

.execution-row,
.execution-meta {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  align-items: center;
}

.execution-row strong {
  color: var(--color-text-primary);
  font-size: 13px;
}

.execution-row span:last-child,
.execution-meta {
  color: var(--color-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}

.execution-meta {
  margin-top: var(--space-xs);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-text-muted);
}

.status-success .status-dot { background: var(--color-success); }
.status-failed .status-dot,
.status-timeout .status-dot { background: var(--color-error); }
.status-running .status-dot { background: var(--color-accent-primary); }

.execution-detail {
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-primary);
}

.execution-detail h4 {
  margin: 0 0 var(--space-md);
  color: var(--color-text-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-md);
  font-size: 12px;
}

.detail-grid span {
  color: var(--color-text-tertiary);
}

.detail-grid strong {
  color: var(--color-text-secondary);
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
}

pre {
  max-height: 220px;
  overflow: auto;
  padding: var(--space-md);
  color: var(--color-text-secondary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.error-output {
  color: var(--color-error);
}

.inline-error {
  margin-bottom: var(--space-md);
  padding: var(--space-md);
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  font-size: 13px;
}
</style>
