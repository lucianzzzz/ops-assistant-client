<template>
  <div class="keywords-cloud">
    <div class="cloud-header">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="7" r="1" fill="currentColor"/>
      </svg>
      <h4>关键词分析</h4>
    </div>
    <div class="cloud-body">
      <div
        v-for="(keyword, idx) in keywords"
        :key="idx"
        class="keyword-tag"
        :style="getKeywordStyle(idx)"
      >
        {{ keyword }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  keywords: string[]
}

defineProps<Props>()

const getKeywordStyle = (index: number) => {
  const sizes = ['14px', '16px', '18px', '16px', '14px']
  const size = sizes[index % sizes.length]

  const colors = [
    'var(--color-accent-primary)',
    'var(--color-info)',
    'var(--color-success)',
    'var(--color-warning)',
    '#a78bfa'
  ]
  const color = colors[index % colors.length]

  return {
    fontSize: size,
    borderColor: color,
    color: color,
  }
}
</script>

<style scoped>
.keywords-cloud {
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
}

.cloud-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.cloud-header svg {
  width: 16px;
  height: 16px;
  color: var(--color-accent-primary);
}

.cloud-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.cloud-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.keyword-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: transparent;
  border: 1.5px solid;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all var(--transition-fast);
  cursor: default;
  animation: fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.keyword-tag:nth-child(1) { animation-delay: 0.05s; }
.keyword-tag:nth-child(2) { animation-delay: 0.1s; }
.keyword-tag:nth-child(3) { animation-delay: 0.15s; }
.keyword-tag:nth-child(4) { animation-delay: 0.2s; }
.keyword-tag:nth-child(5) { animation-delay: 0.25s; }

.keyword-tag:hover {
  transform: scale(1.05);
  background: var(--color-surface-hover);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
