<template>
  <div class="action-card" :class="[`risk-${action.risk_level}`, { executing: isExecuting }]">
    <div class="action-header">
      <div class="action-icon" :class="`risk-${action.risk_level}`">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path v-if="action.risk_level === 'low'" d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path v-else d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path v-if="action.risk_level !== 'low'" d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="action-info">
        <div class="title-row">
          <h4 class="action-title">{{ action.title }}</h4>
          <span class="approval-badge">{{ action.requires_approval ? '需确认' : '只读动作' }}</span>
        </div>
        <p class="action-description">{{ action.description }}</p>
      </div>
    </div>

    <div class="action-command">
      <span>COMMAND</span>
      <code>{{ action.command }}</code>
    </div>

    <div class="action-footer">
      <div class="action-meta">
        <span class="risk-badge" :class="`risk-${action.risk_level}`">{{ getRiskLabel(action.risk_level) }}</span>
        <span class="duration-badge">~{{ action.estimated_duration }}s</span>
      </div>
      <button @click="openConfirm" :disabled="isExecuting" class="execute-btn" :class="{ executing: isExecuting }">
        <span v-if="!isExecuting">执行动作</span>
        <span v-else class="executing-text"><span class="spinner"></span>执行中...</span>
      </button>
    </div>

    <transition name="slide-down">
      <div v-if="executionResult" class="execution-result" :class="`status-${executionResult.status}`">
        <div class="result-header">
          <div class="result-status">
            <span class="status-dot"></span>
            <span>{{ getStatusLabel(executionResult.status) }}</span>
          </div>
          <span class="result-duration">耗时 {{ executionResult.duration?.toFixed(2) || '0.00' }}s</span>
        </div>

        <div class="result-meta">
          <span>Execution ID: {{ executionResult.execution_id || '-' }}</span>
          <span>Exit Code: {{ executionResult.exit_code ?? '-' }}</span>
        </div>

        <div v-if="executionResult.stdout" class="result-output">
          <div class="output-label">STDOUT</div>
          <pre>{{ executionResult.stdout }}</pre>
        </div>
        <div v-if="executionResult.stderr" class="result-error">
          <div class="output-label">STDERR</div>
          <pre>{{ executionResult.stderr }}</pre>
        </div>
        <div v-if="executionResult.error" class="result-error">
          <div class="output-label">ERROR</div>
          <pre>{{ executionResult.error }}</pre>
        </div>
      </div>
    </transition>

    <ActionConfirmModal
      :open="showConfirm"
      :action="action"
      @confirm="executeConfirmed"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ExecutableAction, ExecutionResult } from '@/services/api'
import { api } from '@/services/api'
import ActionConfirmModal from './ActionConfirmModal.vue'

const props = defineProps<{ action: ExecutableAction }>()
const emit = defineEmits<{ executed: [result: ExecutionResult] }>()

const isExecuting = ref(false)
const showConfirm = ref(false)
const executionResult = ref<ExecutionResult | null>(null)

const getRiskLabel = (level: string) => ({ low: '低风险', medium: '中风险', high: '高风险' })[level as 'low' | 'medium' | 'high'] || level
const getStatusLabel = (status: string) => ({ success: '执行成功', failed: '执行失败', timeout: '执行超时', running: '执行中', pending: '等待中', cancelled: '已取消' })[status as ExecutionResult['status']] || status

const openConfirm = () => {
  showConfirm.value = true
}

const executeConfirmed = async () => {
  showConfirm.value = false
  isExecuting.value = true
  executionResult.value = null

  try {
    const result = await api.executeAction(props.action.id, props.action, true)
    executionResult.value = result
    emit('executed', result)
  } catch (error) {
    executionResult.value = {
      execution_id: '',
      action_id: props.action.id,
      status: 'failed',
      start_time: new Date().toISOString(),
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : '执行失败'
    }
  } finally {
    isExecuting.value = false
  }
}
</script>

<style scoped>
.action-card { background: var(--color-surface-primary); border: 1px solid var(--color-border-primary); border-radius: var(--radius-lg); padding: var(--space-lg); transition: all var(--transition-base); }
.action-card:hover { border-color: var(--color-border-secondary); box-shadow: var(--shadow-md); }
.action-card.executing { border-color: var(--color-accent-primary); box-shadow: 0 0 0 2px var(--color-accent-glow); }
.action-card.risk-low { border-left: 3px solid var(--color-success); }
.action-card.risk-medium { border-left: 3px solid var(--color-warning); }
.action-card.risk-high { border-left: 3px solid var(--color-error); }
.action-header { display: flex; gap: var(--space-md); margin-bottom: var(--space-md); }
.action-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); flex-shrink: 0; }
.action-icon.risk-low { background: rgba(16, 185, 129, 0.1); color: var(--color-success); }
.action-icon.risk-medium { background: rgba(245, 158, 11, 0.1); color: var(--color-warning); }
.action-icon.risk-high { background: rgba(239, 68, 68, 0.1); color: var(--color-error); }
.action-icon svg { width: 20px; height: 20px; }
.action-info { flex: 1; min-width: 0; }
.title-row { display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-xs); flex-wrap: wrap; }
.action-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--color-text-primary); }
.action-description { margin: 0; font-size: 13px; color: var(--color-text-tertiary); line-height: 1.5; }
.approval-badge { padding: 2px 8px; border-radius: 999px; color: var(--color-accent-primary); background: var(--color-accent-glow); font-size: 11px; font-weight: 700; }
.action-command { margin-bottom: var(--space-md); padding: var(--space-md); background: var(--color-bg-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--radius-md); overflow-x: auto; }
.action-command span, .output-label { display: block; margin-bottom: var(--space-xs); color: var(--color-text-tertiary); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }
.action-command code { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--color-accent-primary); }
.action-footer { display: flex; justify-content: space-between; align-items: center; gap: var(--space-md); }
.action-meta { display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; }
.risk-badge, .duration-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; }
.risk-badge.risk-low { background: rgba(16, 185, 129, 0.15); color: var(--color-success); }
.risk-badge.risk-medium { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }
.risk-badge.risk-high { background: rgba(239, 68, 68, 0.15); color: var(--color-error); }
.duration-badge { background: var(--color-surface-secondary); color: var(--color-text-tertiary); }
.execute-btn { padding: 8px 18px; background: var(--color-accent-primary); border: none; border-radius: var(--radius-md); color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: all var(--transition-fast); }
.execute-btn:hover:not(:disabled) { background: var(--color-accent-secondary); transform: translateY(-2px); box-shadow: var(--shadow-md); }
.execute-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.executing-text { display: flex; align-items: center; gap: 8px; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3); border-top-color: white; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.execution-result { margin-top: var(--space-lg); padding: var(--space-lg); border-radius: var(--radius-md); border: 1px solid; }
.execution-result.status-success { background: rgba(16,185,129,.05); border-color: var(--color-success); }
.execution-result.status-failed, .execution-result.status-timeout { background: rgba(239,68,68,.05); border-color: var(--color-error); }
.result-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-md); margin-bottom: var(--space-md); }
.result-status { display: flex; align-items: center; gap: var(--space-sm); font-weight: 700; font-size: 14px; color: var(--color-text-primary); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-success .result-status { color: var(--color-success); }
.status-failed .result-status, .status-timeout .result-status { color: var(--color-error); }
.result-duration, .result-meta { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--color-text-tertiary); }
.result-meta { display: flex; gap: var(--space-md); flex-wrap: wrap; margin-bottom: var(--space-md); }
.result-output, .result-error { margin-top: var(--space-md); }
.result-output pre, .result-error pre { margin: 0; padding: var(--space-md); background: var(--color-bg-secondary); border: 1px solid var(--color-border-primary); border-radius: var(--radius-sm); font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.6; color: var(--color-text-secondary); overflow: auto; max-height: 220px; }
.result-error pre { color: var(--color-error); }
.slide-down-enter-active, .slide-down-leave-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
