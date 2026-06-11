<template>
  <div class="result-card">
    <div class="card-header">
      <div class="header-left">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3 class="card-title">查询结果</h3>
      </div>
      <div class="header-right">
        <!-- AI 增强标识 -->
        <div v-if="result.ai_fallback?.used" class="ai-badge" :class="{ error: result.ai_fallback?.error }">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ result.ai_fallback?.error ? 'AI 查询失败' : 'AI 增强' }}</span>
        </div>

        <!-- 导出按钮 -->
        <button @click="exportResult" class="export-btn" title="导出结果">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div :class="['confidence-badge', getConfidenceClass(result.confidence)]">
          <span class="confidence-label">置信度</span>
          <span class="confidence-value">{{ (result.confidence * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>

    <div class="card-body">
      <!-- 可视化图表 -->
      <ConfidenceChart
        :confidence="result.confidence"
        :matches="result.matched_knowledge"
      />

      <!-- 问题摘要 -->
      <div class="summary-section">
        <div class="summary-item">
          <div class="summary-label">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            问题
          </div>
          <div class="summary-value">{{ result.question }}</div>
        </div>

        <div class="summary-item" v-if="result.normalized_metric">
          <div class="summary-label">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            识别指标
          </div>
          <div class="summary-value">
            <span class="metric-tag">{{ result.normalized_metric }}</span>
          </div>
        </div>

        <div class="summary-item" v-if="result.keywords && result.keywords.length">
          <div class="summary-label">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
            关键词
          </div>
          <div class="summary-value">
            <KeywordsCloud :keywords="result.keywords" />
          </div>
        </div>
      </div>

      <!-- 可能原因 -->
      <div v-if="result.possible_reason && result.possible_reason.length" class="content-section">
        <div class="section-header">
          <div class="section-icon error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h4 class="section-title">可能原因</h4>
          <span class="section-count">{{ result.possible_reason.length }}</span>
        </div>
        <ul class="content-list">
          <li v-for="(reason, idx) in result.possible_reason" :key="idx" class="list-item">
            <span class="item-index">{{ idx + 1 }}</span>
            <span class="item-text">{{ reason }}</span>
          </li>
        </ul>
      </div>

      <!-- 建议步骤 -->
      <div v-if="result.suggested_steps && result.suggested_steps.length" class="content-section">
        <div class="section-header">
          <div class="section-icon info">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4 class="section-title">建议步骤</h4>
          <span class="section-count">{{ result.suggested_steps.length }}</span>
        </div>
        <ol class="content-list ordered">
          <li v-for="(step, idx) in result.suggested_steps" :key="idx" class="list-item">
            <span class="item-index">{{ idx + 1 }}</span>
            <span class="item-text">{{ step }}</span>
          </li>
        </ol>
      </div>

      <!-- 后续动作 -->
      <div v-if="result.next_actions && result.next_actions.length" class="content-section">
        <div class="section-header">
          <div class="section-icon success">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4 class="section-title">后续动作</h4>
          <span class="section-count">{{ result.next_actions.length }}</span>
        </div>
        <ul class="content-list">
          <li v-for="(action, idx) in result.next_actions" :key="idx" class="list-item">
            <span class="item-index">{{ idx + 1 }}</span>
            <span class="item-text">{{ action }}</span>
          </li>
        </ul>
      </div>

      <!-- 可执行动作 -->
      <div v-if="result.executable_actions && result.executable_actions.length" class="content-section">
        <div class="section-header">
          <div class="section-icon accent">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4 class="section-title">可执行动作</h4>
          <span class="section-count">{{ result.executable_actions.length }}</span>
        </div>
        <div class="actions-grid">
          <ActionCard
            v-for="action in displayedActions"
            :key="action.id"
            :action="action"
            @executed="handleActionExecuted"
          />
        </div>

        <button
          v-if="hasMoreActions && !showAllActions"
          @click="showAllActions = true"
          class="show-more-btn"
        >
          显示更多 ({{ result.executable_actions.length - 5 }} 个)
        </button>
      </div>

      <!-- AI 智能分析（合并推理过程和详细分析） -->
      <div v-if="result.ai_fallback?.used && (result.reasoning_steps?.length || result.ai_fallback?.raw_response)" class="content-section ai-section">
        <div class="section-header">
          <div class="section-icon ai">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4 class="section-title">🧠 AI 智能分析</h4>
          <div class="ai-source-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>DeepSeek AI</span>
          </div>
        </div>

        <!-- 推理过程（包含最终结论） -->
        <div class="ai-response-box">
          <ReasoningTrace
            v-if="result.reasoning_steps && result.reasoning_steps.length"
            :steps="result.reasoning_steps"
            :conclusion="result.ai_fallback?.raw_response ? formatAIResponse(result.ai_fallback.raw_response) : undefined"
          />
          <!-- 如果没有推理步骤，只显示结论 -->
          <div v-else-if="result.ai_fallback?.raw_response" class="ai-response-content" v-html="formatAIResponse(result.ai_fallback.raw_response)"></div>
        </div>
      </div>

      <!-- 匹配的知识条目 -->
      <div v-if="result.matched_knowledge && result.matched_knowledge.length" class="content-section">
        <div class="section-header">
          <div class="section-icon accent">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4 class="section-title">匹配的知识条目</h4>
          <span class="section-count">{{ result.matched_knowledge.length }}</span>
        </div>

        <div class="knowledge-grid">
          <div
            v-for="(item, idx) in result.matched_knowledge"
            :key="idx"
            class="knowledge-card"
          >
            <div class="knowledge-header">
              <span class="knowledge-badge">#{{ idx + 1 }}</span>
              <span class="knowledge-title">{{ item.question }}</span>
              <span v-if="item.province" class="province-tag">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ item.province }}
              </span>
            </div>
            <div class="knowledge-content">
              <div class="knowledge-field">
                <strong>原因：</strong>
                <span>{{ item.reason }}</span>
              </div>
              <div class="knowledge-field">
                <strong>方法：</strong>
                <span>{{ item.method }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AskResponse, ExecutionResult } from '@/services/api'
import ConfidenceChart from './ConfidenceChart.vue'
import KeywordsCloud from './KeywordsCloud.vue'
import ActionCard from './ActionCard.vue'
import ReasoningTrace from './ReasoningTrace.vue'

interface Props {
  result: AskResponse
}

const props = defineProps<Props>()

const getConfidenceClass = (confidence: number) => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

const handleActionExecuted = (result: ExecutionResult) => {
  console.log('Action executed:', result)
  // 可以添加通知或其他处理
}

const formatAIResponse = (response: string) => {
  // 简单的 Markdown 样式格式化
  return response
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 粗体
    .replace(/^### (.*$)/gim, '<h4 class="ai-h4">$1</h4>')  // 三级标题
    .replace(/^## (.*$)/gim, '<h3 class="ai-h3">$1</h3>')   // 二级标题
    .replace(/^# (.*$)/gim, '<h2 class="ai-h2">$1</h2>')    // 一级标题
    .replace(/^\* (.*$)/gim, '<li>$1</li>')  // 列表项
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')  // 数字列表
    .replace(/`([^`]+)`/g, '<code>$1</code>')  // 行内代码
    .replace(/\n\n/g, '</p><p>')  // 段落
    .replace(/\n/g, '<br>')  // 换行
}

const exportResult = () => {
  const exportData = {
    查询时间: new Date().toLocaleString('zh-CN'),
    问题: props.result.question,
    识别指标: props.result.normalized_metric || '无',
    置信度: `${(props.result.confidence * 100).toFixed(1)}%`,
    关键词: props.result.keywords.join(', '),
    可能原因: props.result.possible_reason,
    建议步骤: props.result.suggested_steps,
    后续动作: props.result.next_actions,
    匹配知识数: props.result.matched_knowledge.length,
    AI增强: props.result.ai_fallback?.used ? '是' : '否'
  }

  // 生成 Markdown 格式
  let markdown = `# 运维问题查询结果\n\n`
  markdown += `**查询时间**: ${exportData.查询时间}\n\n`
  markdown += `**问题**: ${exportData.问题}\n\n`
  markdown += `**识别指标**: ${exportData.识别指标}\n\n`
  markdown += `**置信度**: ${exportData.置信度}\n\n`

  if (exportData.关键词) {
    markdown += `**关键词**: ${exportData.关键词}\n\n`
  }

  if (props.result.possible_reason.length > 0) {
    markdown += `## 可能原因\n\n`
    props.result.possible_reason.forEach((reason, idx) => {
      markdown += `${idx + 1}. ${reason}\n`
    })
    markdown += `\n`
  }

  if (props.result.suggested_steps.length > 0) {
    markdown += `## 建议步骤\n\n`
    props.result.suggested_steps.forEach((step, idx) => {
      markdown += `${idx + 1}. ${step}\n`
    })
    markdown += `\n`
  }

  if (props.result.next_actions.length > 0) {
    markdown += `## 后续动作\n\n`
    props.result.next_actions.forEach((action, idx) => {
      markdown += `${idx + 1}. ${action}\n`
    })
    markdown += `\n`
  }

  if (props.result.matched_knowledge.length > 0) {
    markdown += `## 匹配的知识条目 (${props.result.matched_knowledge.length})\n\n`
    props.result.matched_knowledge.forEach((item: any, idx: number) => {
      markdown += `### ${idx + 1}. ${item.question}\n\n`
      if (item.province) {
        markdown += `**省份**: ${item.province}\n\n`
      }
      markdown += `**原因**: ${item.reason}\n\n`
      markdown += `**方法**: ${item.method}\n\n`
      markdown += `**匹配度**: ${(item.score * 100).toFixed(1)}%\n\n`
      markdown += `---\n\n`
    })
  }

  if (props.result.ai_fallback?.used) {
    markdown += `## AI 增强查询\n\n`
    markdown += `本次查询使用了 AI 增强功能\n\n`
    if (props.result.ai_fallback.raw_response) {
      markdown += `### AI 原始响应\n\n${props.result.ai_fallback.raw_response}\n\n`
    }
  }

  markdown += `---\n\n*由 OpsAssist 智能运维助手生成*\n`

  // 下载文件
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `运维查询结果_${new Date().getTime()}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.result-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: slideUpFade 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  color: var(--color-success);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  gap: var(--space-md);
}

.ai-badge {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
}

.ai-badge.error {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--color-error);
}

.ai-badge svg {
  width: 14px;
  height: 14px;
}

.export-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.export-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  transform: translateY(-2px);
}

.export-btn svg {
  width: 18px;
  height: 18px;
}

.confidence-badge {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: 600;
}

.confidence-badge.high {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.confidence-badge.medium {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.confidence-badge.low {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.confidence-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.confidence-value {
  font-size: 16px;
  font-family: 'JetBrains Mono', monospace;
}

.card-body {
  padding: var(--space-xl);
}

/* Summary Section */
.summary-section {
  display: grid;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.summary-item {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 100px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-label svg {
  width: 16px;
  height: 16px;
}

.summary-value {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

.metric-tag {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  color: white;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.keyword-tag {
  display: inline-block;
  padding: 4px 10px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* Content Sections */
.content-section {
  margin-bottom: var(--space-xl);
}

.content-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon svg {
  width: 18px;
  height: 18px;
}

.section-icon.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.section-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.section-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.section-icon.accent {
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
}

.section-title {
  flex: 1;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-secondary);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}

.content-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.list-item {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.list-item:hover {
  border-color: var(--color-border-secondary);
  background: var(--color-surface-hover);
}

.item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
}

.item-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* Knowledge Grid */
.knowledge-grid {
  display: grid;
  gap: var(--space-lg);
}

.knowledge-card {
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-left: 3px solid var(--color-accent-primary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  transition: all var(--transition-base);
}

.knowledge-card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.show-more-btn {
  margin-top: var(--space-md);
  padding: var(--space-md) var(--space-xl);
  background: transparent;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  width: 100%;
}

.show-more-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  background: rgba(0, 209, 178, 0.05);
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

.knowledge-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.knowledge-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  color: white;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: var(--shadow-glow);
}

.knowledge-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.province-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

.province-tag svg {
  width: 12px;
  height: 12px;
}

.knowledge-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.knowledge-field {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

.knowledge-field strong {
  color: var(--color-text-primary);
  font-weight: 600;
  margin-right: var(--space-sm);
}
</style>
