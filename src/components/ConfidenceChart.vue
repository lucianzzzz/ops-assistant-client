<template>
  <div class="confidence-chart">
    <div class="chart-header">
      <h4>查询分析</h4>
      <span class="chart-subtitle">置信度与匹配度分布</span>
    </div>

    <div class="chart-body">
      <!-- 置信度进度环 -->
      <div class="confidence-ring">
        <svg viewBox="0 0 120 120" class="ring-svg">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="var(--color-border-primary)"
            stroke-width="10"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            :stroke="confidenceColor"
            stroke-width="10"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 60 60)"
            class="ring-progress"
          />
        </svg>
        <div class="ring-label">
          <div class="ring-value">{{ Math.round(confidence * 100) }}%</div>
          <div class="ring-text">置信度</div>
        </div>
      </div>

      <!-- 匹配度条形图 -->
      <div class="matches-chart">
        <div class="matches-header">
          <span>知识匹配</span>
          <span class="matches-count">{{ matches.length }} 条</span>
        </div>
        <div class="matches-bars">
          <div
            v-for="(match, idx) in matches.slice(0, 5)"
            :key="idx"
            class="match-bar-wrapper"
          >
            <div class="match-label">
              <span class="match-index">#{{ idx + 1 }}</span>
              <span class="match-score">{{ Math.round(match.score * 100) }}%</span>
            </div>
            <div class="match-bar-track">
              <div
                class="match-bar-fill"
                :style="{
                  width: `${match.score * 100}%`,
                  background: getMatchColor(match.score)
                }"
              >
                <div class="match-bar-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Match {
  score: number
  question?: string
}

interface Props {
  confidence: number
  matches: Match[]
}

const props = defineProps<Props>()

const circumference = 2 * Math.PI * 50

const dashOffset = computed(() => {
  return circumference * (1 - props.confidence)
})

const confidenceColor = computed(() => {
  if (props.confidence >= 0.8) return 'var(--color-success)'
  if (props.confidence >= 0.6) return 'var(--color-warning)'
  return 'var(--color-error)'
})

const getMatchColor = (score: number) => {
  if (score >= 0.8) {
    return 'linear-gradient(90deg, var(--color-success), var(--color-accent-primary))'
  }
  if (score >= 0.6) {
    return 'linear-gradient(90deg, var(--color-warning), #f59e0b)'
  }
  return 'linear-gradient(90deg, var(--color-error), #dc2626)'
}
</script>

<style scoped>
.confidence-chart {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.chart-header {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-primary);
}

.chart-header h4 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-subtitle {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.chart-body {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-xl);
  align-items: center;
}

/* Confidence Ring */
.confidence-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.ring-svg {
  width: 100%;
  height: 100%;
}

.ring-progress {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.ring-text {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Matches Chart */
.matches-chart {
  flex: 1;
}

.matches-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.matches-count {
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-accent-primary);
  background: var(--color-accent-glow);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.matches-bars {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.match-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.match-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.match-index {
  color: var(--color-text-tertiary);
  font-weight: 600;
}

.match-score {
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.match-bar-track {
  height: 8px;
  background: var(--color-border-primary);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.match-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.match-bar-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chart-body {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
}
</style>
