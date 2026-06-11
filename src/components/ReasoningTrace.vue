<template>
  <div class="reasoning-trace">
    <div class="trace-header">
      <Brain :size="18" />
      <h4>AI 推理过程</h4>
      <button @click="toggleExpand" class="toggle-btn">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div v-if="expanded" class="trace-steps">
      <div
        v-for="step in steps"
        :key="step.iteration"
        class="step-card"
      >
        <div class="step-header">
          <span class="step-number">步骤 {{ step.iteration }}</span>
          <span class="step-badge" :class="step.thought_type">
            {{ thoughtTypeLabel(step.thought_type) }}
          </span>
        </div>

        <div class="step-content">
          <div class="thought">
            <MessageSquare :size="16" class="icon" />
            <span class="label">思考：</span>
            <p>{{ step.thought }}</p>
          </div>

          <div v-if="step.action" class="action">
            <Zap :size="16" class="icon" />
            <span class="label">动作：</span>
            <p>{{ step.action }}</p>
          </div>

          <div v-if="step.observation" class="observation">
            <Eye :size="16" class="icon" />
            <span class="label">观察：</span>
            <p>{{ step.observation }}</p>
          </div>
        </div>

        <div v-if="step.iteration < steps.length" class="arrow">↓</div>
      </div>

      <!-- 最终结论 -->
      <div v-if="conclusion" class="final-conclusion">
        <div class="conclusion-header">
          <CheckCircle :size="16" />
          <strong>最终分析结论</strong>
        </div>
        <div class="conclusion-content" v-html="conclusion"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Brain, CheckCircle, MessageSquare, Zap, Eye } from 'lucide-vue-next'

interface ReasoningStep {
  iteration: number
  thought: string
  thought_type: string
  action: string
  action_type: string
  observation: string
}

defineProps<{
  steps: ReasoningStep[]
  conclusion?: string
}>()

const expanded = ref(false)

const toggleExpand = () => {
  expanded.value = !expanded.value
}

const thoughtTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'analyze': '分析',
    'plan': '规划',
    'decide': '决策',
    'reflect': '反思'
  }
  return labels[type] || type
}
</script>

<style scoped>
.reasoning-trace {
  margin-top: var(--space-xl);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  background: var(--color-surface-primary);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.trace-header {
  display: flex;
  align-items: center;
  padding: var(--space-lg) var(--space-xl);
  background: rgba(0, 209, 178, 0.05);
  border-bottom: 1px solid var(--color-border-primary);
}

.trace-header .icon {
  font-size: 24px;
  margin-right: var(--space-md);
}

.trace-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-accent-primary);
}

.toggle-btn {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid rgba(0, 209, 178, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-accent-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all var(--transition-base);
}

.toggle-btn:hover {
  background: rgba(0, 209, 178, 0.1);
  border-color: var(--color-accent-primary);
  transform: translateY(-1px);
}

.trace-steps {
  padding: var(--space-xl);
}

.step-card {
  position: relative;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-accent-primary);
  border: 1px solid var(--color-border-primary);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.step-number {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-accent-primary);
}

.step-badge {
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}

.step-badge.analyze {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.step-badge.plan {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
  border: 1px solid rgba(155, 89, 182, 0.3);
}

.step-badge.decide {
  background: rgba(230, 126, 34, 0.1);
  color: #e67e22;
  border: 1px solid rgba(230, 126, 34, 0.3);
}

.step-badge.reflect {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.step-content > div {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.step-content > div:last-child {
  margin-bottom: 0;
}

.step-content .icon {
  font-size: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.step-content .label {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 50px;
  flex-shrink: 0;
}

.step-content p {
  flex: 1;
  margin: 0;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.6;
}

.arrow {
  text-align: center;
  color: var(--color-accent-primary);
  font-size: 20px;
  margin: var(--space-md) 0;
}

/* 最终结论样式 - 与步骤卡片统一 */
.final-conclusion {
  position: relative;
  margin-bottom: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  border-left: 3px solid var(--color-ai);
  border: 1px solid var(--color-border-primary);
}

.conclusion-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-ai);
}

.conclusion-header svg {
  flex-shrink: 0;
}

.conclusion-header strong {
  color: var(--color-ai);
  font-size: 13px;
}

.conclusion-content {
  line-height: 1.8;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.conclusion-content :deep(p) {
  margin: var(--space-md) 0;
}

.conclusion-content :deep(strong) {
  color: var(--color-text-primary);
  font-weight: 600;
}

.final-result {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: rgba(0, 209, 178, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-accent-primary);
}

.final-result .icon {
  font-size: 24px;
}

.final-result strong {
  color: var(--color-accent-primary);
  font-size: 15px;
}
</style>
