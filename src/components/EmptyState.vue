<template>
  <div class="empty-state">
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h3>👋 输入问题，开始查询</h3>
    <p>描述您遇到的运维问题，AI 将为您提供专业的解决方案</p>

    <div class="example-questions">
      <p class="example-title">💡 示例问题：</p>
      <button
        v-for="example in examples"
        :key="example"
        @click="$emit('selectExample', example)"
        class="example-btn"
      >
        {{ example }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const examples = [
  'IF1接收时延异常怎么处理',
  'CPU利用率持续升高如何排查',
  '数据库连接数过高怎么办'
]

defineEmits<{
  selectExample: [question: string]
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-3xl);
  background: var(--color-surface-primary);
  border: 1px dashed var(--color-border-secondary);
  border-radius: var(--radius-xl);
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 50%;
  color: var(--color-ai);
}

.empty-icon svg {
  width: 32px;
  height: 32px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin: 0;
}

.example-questions {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
  max-width: 500px;
}

.example-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: left;
}

.example-btn {
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-base);
}

.example-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}
</style>
