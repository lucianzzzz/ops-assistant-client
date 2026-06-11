<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="$emit('cancel')">
        <div class="confirm-modal">
          <div class="modal-header">
            <div class="risk-icon" :class="`risk-${action.risk_level}`">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>确认执行动作</h3>
              <p>请确认命令、风险等级和预计耗时后再执行。</p>
            </div>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">动作名称</span>
              <strong>{{ action.title }}</strong>
            </div>
            <div class="detail-item">
              <span class="detail-label">风险等级</span>
              <span class="risk-badge" :class="`risk-${action.risk_level}`">{{ riskLabel }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预计耗时</span>
              <strong>{{ action.estimated_duration }}s</strong>
            </div>
            <div class="detail-item">
              <span class="detail-label">人工确认</span>
              <strong>{{ action.requires_approval ? '必需' : '非必需' }}</strong>
            </div>
          </div>

          <div class="command-block">
            <span class="detail-label">执行命令</span>
            <code>{{ action.command }}</code>
          </div>

          <div v-if="action.rollback_command" class="command-block rollback">
            <span class="detail-label">回滚命令</span>
            <code>{{ action.rollback_command }}</code>
          </div>

          <div class="modal-actions">
            <button type="button" class="secondary-btn" @click="$emit('cancel')">取消</button>
            <button type="button" class="primary-btn" :class="`risk-${action.risk_level}`" @click="$emit('confirm')">
              确认执行
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExecutableAction } from '@/services/api'

const props = defineProps<{
  open: boolean
  action: ExecutableAction
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()

const riskLabel = computed(() => {
  const labels = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return labels[props.action.risk_level]
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(8px);
}

.confirm-modal {
  width: min(680px, 100%);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xl);
}

.modal-header {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
  padding-bottom: var(--space-lg);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.modal-header h3 {
  margin: 0 0 var(--space-xs);
  color: var(--color-text-primary);
  font-size: 20px;
}

.modal-header p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.risk-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.risk-icon svg {
  width: 24px;
  height: 24px;
}

.risk-icon.risk-low {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.12);
}

.risk-icon.risk-medium {
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.12);
}

.risk-icon.risk-high {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.12);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.detail-item,
.command-block {
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.detail-label {
  display: block;
  margin-bottom: var(--space-xs);
  color: var(--color-text-tertiary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.detail-item strong {
  color: var(--color-text-primary);
  font-size: 14px;
}

.risk-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
}

.risk-badge.risk-low {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.15);
}

.risk-badge.risk-medium {
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.15);
}

.risk-badge.risk-high {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.15);
}

.command-block {
  margin-bottom: var(--space-md);
}

.command-block code {
  display: block;
  color: var(--color-accent-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-all;
}

.command-block.rollback code {
  color: var(--color-warning);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.primary-btn,
.secondary-btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.secondary-btn {
  background: var(--color-surface-secondary);
}

.primary-btn {
  color: white;
  background: var(--color-accent-primary);
  border-color: transparent;
}

.primary-btn.risk-medium {
  background: var(--color-warning);
}

.primary-btn.risk-high {
  background: var(--color-error);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-base);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 680px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
