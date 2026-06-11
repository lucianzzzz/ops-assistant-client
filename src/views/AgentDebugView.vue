<template>
  <div class="agent-debug">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Agent 工作流控制台</h1>
        <p class="page-description">多步计划生成、执行追踪、会话记忆、审计日志和离线评测</p>
      </div>
    </div>

    <div class="workflow-intro">
      <div class="intro-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div>
        <h3>工作流控制台</h3>
        <p>可视化多步诊断计划的生成、执行和追踪。支持会话记忆管理、全链路审计和自动化评测。</p>
      </div>
    </div>

    <!-- 计划生成区域 -->
    <div class="workflow-card">
      <div class="card-header-row">
        <div class="header-left">
          <div class="section-icon primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h3>生成诊断计划</h3>
            <p class="endpoint-badge">POST /api/v1/agent/plans</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="togglePlanForm">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path v-if="showPlanForm" d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path v-else d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>


      <transition name="expand">
        <form v-if="showPlanForm" class="workflow-form" @submit.prevent="handleCreatePlan">
          <div class="form-grid">
            <label class="form-field">
              <span class="field-label">Session ID</span>
              <input v-model="planForm.session_id" type="text" placeholder="demo" />
            </label>
            <label class="form-field span-2">
              <span class="field-label">诊断问题</span>
              <textarea v-model="planForm.question" rows="3" required placeholder="输入运维问题..." />
            </label>
            <label class="form-field">
              <span class="field-label">关键词 (逗号分隔)</span>
              <input v-model="planForm.keywords" type="text" placeholder="IF1接收时延,网络" />
            </label>
            <label class="form-field">
              <span class="field-label">识别指标</span>
              <input v-model="planForm.normalized_metric" type="text" placeholder="IF1接收时延" />
            </label>
            <label class="form-field">
              <span class="field-label">置信度</span>
              <input v-model.number="planForm.confidence" type="number" min="0" max="1" step="0.01" placeholder="0.42" />
            </label>
          </div>
          <button type="submit" class="primary-btn" :disabled="planLoading">
            <svg v-if="!planLoading" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="btn-spinner"></div>
            {{ planLoading ? '生成中...' : '生成计划' }}
          </button>
        </form>
      </transition>

      <div v-if="planError" class="inline-error">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ planError }}
      </div>


      <!-- 计划结果展示 - 时间线风格 -->
      <transition name="slide-down">
        <div v-if="planResult" class="workflow-result">
          <div class="result-header">
            <div class="result-title">
              <div class="status-indicator success">
                <span class="status-pulse"></span>
              </div>
              <div>
                <h4>诊断计划已生成</h4>
                <p class="plan-id">Plan ID: {{ planResult.plan.plan_id }}</p>
              </div>
            </div>
            <div class="result-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ planResult.plan.steps.length }} 步骤
              </span>
            </div>
          </div>

          <div class="plan-context">
            <div class="context-item">
              <span class="context-label">目标</span>
              <span class="context-value">{{ planResult.plan.goal }}</span>
            </div>
            <div class="context-item">
              <span class="context-label">上下文</span>
              <span class="context-value">{{ planResult.plan.context_summary }}</span>
            </div>
          </div>

          <!-- 步骤时间线 -->
          <div class="steps-timeline">
            <div
              v-for="(step, idx) in planResult.plan.steps"
              :key="step.order"
              class="timeline-step"
              :class="{ 'has-approval': step.requires_approval }"
            >
              <div class="step-connector" v-if="idx > 0"></div>
              <div class="step-node">
                <div class="node-circle">{{ step.order }}</div>
              </div>
              <div class="step-content">
                <div class="step-header">
                  <h5 class="step-title">{{ step.title }}</h5>
                  <div class="step-badges">
                    <span class="tool-badge">{{ step.tool_name }}</span>
                    <span v-if="step.requires_approval" class="approval-badge">需确认</span>
                  </div>
                </div>
                <p class="step-rationale">{{ step.rationale }}</p>
              </div>
            </div>
          </div>


          <!-- 推荐动作 -->
          <div v-if="planResult.plan.recommended_actions?.length" class="plan-actions">
            <h5 class="actions-title">推荐动作</h5>
            <div class="actions-grid">
              <div
                v-for="(action, idx) in planResult.plan.recommended_actions"
                :key="idx"
                class="action-item"
              >
                <div class="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>{{ action }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 二列布局：会话记忆 + 审计日志 -->
    <div class="two-column-grid">
      <!-- 会话记忆 -->
      <div class="workflow-card">
        <div class="card-header-row">
          <div class="header-left">
            <div class="section-icon info">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h3>会话记忆</h3>
              <p class="endpoint-badge">GET /api/v1/agent/memory/{'{session_id}'}</p>
            </div>
          </div>
          <button type="button" class="secondary-btn" @click="loadMemory" :disabled="memoryLoading">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 10V4M21 4H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            读取
          </button>
        </div>


        <div v-if="memoryError" class="inline-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ memoryError }}
        </div>

        <div v-if="memoryResult" class="memory-content">
          <div class="memory-meta">
            <div class="meta-row">
              <span class="meta-label">Session ID</span>
              <span class="meta-value">{{ memoryResult.session_id }}</span>
            </div>
            <div class="meta-row" v-if="memoryResult.last_question">
              <span class="meta-label">最近问题</span>
              <span class="meta-value">{{ memoryResult.last_question }}</span>
            </div>
          </div>

          <div v-if="memoryResult.facts.length" class="facts-list">
            <h5 class="facts-title">记忆事实</h5>
            <div
              v-for="(fact, idx) in memoryResult.facts"
              :key="idx"
              class="fact-item"
            >
              <div class="fact-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span>{{ fact }}</span>
            </div>
          </div>
          <p v-else class="empty-text">暂无记忆事实</p>
        </div>
        <p v-else-if="!memoryError" class="empty-text">点击"读取"按钮加载会话记忆</p>
      </div>


      <!-- 审计日志 -->
      <div class="workflow-card">
        <div class="card-header-row">
          <div class="header-left">
            <div class="section-icon warning">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>审计日志</h3>
              <p class="endpoint-badge">GET /api/v1/agent/audit</p>
            </div>
          </div>
          <button type="button" class="secondary-btn" @click="loadAudit" :disabled="auditLoading">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 10V4M21 4H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            刷新
          </button>
        </div>

        <div v-if="auditError" class="inline-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ auditError }}
        </div>

        <div v-if="auditResult.length" class="audit-list">
          <div
            v-for="(event, idx) in auditResult.slice(0, 10)"
            :key="idx"
            class="audit-item"
          >
            <div class="audit-header">
              <span class="audit-event">{{ event.event_type }}</span>
              <span class="audit-time">{{ formatTime(event.created_at) }}</span>
            </div>
            <div class="audit-details">
              <span v-if="event.session_id">Session: {{ event.session_id }}</span>
              <span v-if="event.metadata?.user">User: {{ event.metadata.user }}</span>
            </div>
          </div>
        </div>
        <p v-else-if="!auditError" class="empty-text">暂无审计事件</p>
      </div>
    </div>


    <!-- Agent 评测 -->
    <div class="workflow-card">
      <div class="card-header-row">
        <div class="header-left">
          <div class="section-icon success">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <h3>Agent 评测</h3>
            <p class="endpoint-badge">POST /api/v1/agent/evaluate</p>
          </div>
        </div>
        <button type="button" class="icon-btn" @click="toggleEvaluateForm">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path v-if="showEvaluateForm" d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path v-else d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <transition name="expand">
        <form v-if="showEvaluateForm" class="workflow-form" @submit.prevent="handleEvaluate">
          <label class="form-field span-2">
            <span class="field-label">评测用例 JSON</span>
            <textarea v-model="evaluateCases" rows="10" required />
          </label>
          <button type="submit" class="primary-btn" :disabled="evaluateLoading">
            <svg v-if="!evaluateLoading" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="5 3 19 12 5 21 5 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="btn-spinner"></div>
            {{ evaluateLoading ? '运行中...' : '运行评测' }}
          </button>
        </form>
      </transition>

      <div v-if="evaluateError" class="inline-error">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        {{ evaluateError }}
      </div>


      <transition name="slide-down">
        <div v-if="evaluateResult" class="evaluate-result">
          <div class="result-summary">
            <div class="summary-card">
              <div class="summary-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <div class="summary-value">{{ evaluateResult.total_cases }}</div>
                <div class="summary-label">用例总数</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon accent">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <div class="summary-value">{{ evaluateResult.average_score.toFixed(2) }}</div>
                <div class="summary-label">平均分</div>
              </div>
            </div>
          </div>

          <div class="evaluate-details">
            <h5 class="details-title">评测详情</h5>
            <div class="cases-list">
              <div
                v-for="(result, idx) in evaluateResult.results"
                :key="idx"
                class="case-item"
              >
                <div class="case-header">
                  <span class="case-id">{{ result.case_id }}</span>
                  <span class="case-score" :class="getScoreClass(result.score)">
                    {{ result.score.toFixed(2) }}
                  </span>
                </div>
                <p class="case-question">{{ result.question }}</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import {
  api,
  type AuditEvent,
  type ConversationMemory,
  type CreatePlanResponse,
  type EvaluationReport
} from '@/services/api'

const showPlanForm = ref(true)
const showEvaluateForm = ref(false)
const planLoading = ref(false)
const planError = ref<string | null>(null)
const planResult = ref<CreatePlanResponse | null>(null)
const memoryLoading = ref(false)
const memoryError = ref<string | null>(null)
const memoryResult = ref<ConversationMemory | null>(null)
const auditLoading = ref(false)
const auditError = ref<string | null>(null)
const auditResult = ref<AuditEvent[]>([])
const evaluateLoading = ref(false)
const evaluateError = ref<string | null>(null)
const evaluateResult = ref<EvaluationReport | null>(null)

const planForm = ref({
  session_id: 'demo',
  question: 'IF1接收时延异常怎么处理',
  keywords: 'IF1接收时延,网络',
  normalized_metric: 'IF1接收时延',
  confidence: 0.42
})

const evaluateCases = ref(`[
  {
    "case_id": "metric-delay",
    "question": "IF1接收时延异常怎么处理",
    "expected_keywords": ["IF1接收时延"]
  },
  {
    "case_id": "network",
    "question": "网络不通需要先看什么",
    "expected_keywords": ["网络"]
  }
]`)

const togglePlanForm = () => {
  showPlanForm.value = !showPlanForm.value
}

const toggleEvaluateForm = () => {
  showEvaluateForm.value = !showEvaluateForm.value
}


const handleCreatePlan = async () => {
  planLoading.value = true
  planError.value = null
  planResult.value = null

  try {
    planResult.value = await api.createAgentPlan({
      session_id: planForm.value.session_id || 'demo',
      question: planForm.value.question,
      analysis_result: {
        keywords: planForm.value.keywords.split(',').map((item) => item.trim()).filter(Boolean),
        normalized_metric: planForm.value.normalized_metric,
        confidence: Number(planForm.value.confidence || 0)
      }
    })
    memoryResult.value = planResult.value.memory
  } catch (err) {
    planError.value = err instanceof Error ? err.message : '生成计划失败'
  } finally {
    planLoading.value = false
  }
}

const loadMemory = async () => {
  memoryLoading.value = true
  memoryError.value = null

  try {
    memoryResult.value = await api.getAgentMemory(planForm.value.session_id || 'demo')
  } catch (err) {
    memoryError.value = err instanceof Error ? err.message : '读取记忆失败'
  } finally {
    memoryLoading.value = false
  }
}

const loadAudit = async () => {
  auditLoading.value = true
  auditError.value = null

  try {
    auditResult.value = await api.getAgentAudit()
  } catch (err) {
    auditError.value = err instanceof Error ? err.message : '读取审计日志失败'
  } finally {
    auditLoading.value = false
  }
}

const handleEvaluate = async () => {
  evaluateLoading.value = true
  evaluateError.value = null
  evaluateResult.value = null

  try {
    const cases = JSON.parse(evaluateCases.value)
    evaluateResult.value = await api.evaluateAgent(cases)
  } catch (err) {
    evaluateError.value = err instanceof Error ? err.message : '运行评测失败'
  } finally {
    evaluateLoading.value = false
  }
}

const formatTime = (value: string) => {
  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getScoreClass = (score: number) => {
  if (score >= 0.8) return 'high'
  if (score >= 0.6) return 'medium'
  return 'low'
}
</script>


<style scoped>
.agent-debug {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.header-content {
  animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  letter-spacing: -0.02em;
}

.page-description {
  font-size: 15px;
  color: var(--color-text-tertiary);
  margin: 0;
}

/* Workflow Intro */
.workflow-intro {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(59, 130, 246, 0.08));
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.intro-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-glow);
  border-radius: var(--radius-md);
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

.intro-icon svg {
  width: 24px;
  height: 24px;
}

.workflow-intro h3 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.workflow-intro p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 14px;
  line-height: 1.6;
}


/* Workflow Card */
.workflow-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.header-left {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  flex: 1;
}

.section-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.section-icon svg {
  width: 20px;
  height: 20px;
}

.section-icon.primary {
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
}

.section-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.section-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.section-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}


.card-header-row h3 {
  margin: 0 0 var(--space-xs) 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.endpoint-badge {
  display: inline-block;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-muted);
  background: var(--color-surface-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-primary);
}

.icon-btn, .secondary-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  justify-content: center;
}

.icon-btn svg, .secondary-btn svg {
  width: 16px;
  height: 16px;
}

.icon-btn:hover:not(:disabled),
.secondary-btn:hover:not(:disabled) {
  border-color: var(--color-accent-primary);
  background: var(--color-surface-hover);
  transform: translateY(-1px);
}

.icon-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


/* Form */
.workflow-form {
  margin-bottom: var(--space-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-field.span-2 {
  grid-column: span 2;
}

.field-label {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workflow-form input,
.workflow-form textarea {
  width: 100%;
  padding: var(--space-md);
  color: var(--color-text-primary);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font: inherit;
  resize: vertical;
  transition: all var(--transition-base);
}

.workflow-form input:focus,
.workflow-form textarea:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}


.primary-btn svg {
  width: 18px;
  height: 18px;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.inline-error {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.inline-error svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.empty-text {
  margin: 0;
  padding: var(--space-lg);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
}


/* Workflow Result */
.workflow-result {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-primary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.result-title {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.status-indicator {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  position: relative;
}

.status-indicator.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  position: relative;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.result-title h4 {
  margin: 0 0 var(--space-xs) 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.plan-id {
  margin: 0;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-muted);
}


.result-meta {
  display: flex;
  gap: var(--space-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.meta-item svg {
  width: 16px;
  height: 16px;
}

/* Plan Context */
.plan-context {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.context-item {
  display: flex;
  gap: var(--space-md);
  font-size: 14px;
}

.context-label {
  min-width: 80px;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.context-value {
  flex: 1;
  color: var(--color-text-primary);
  line-height: 1.6;
}

/* Steps Timeline */
.steps-timeline {
  position: relative;
  padding-left: var(--space-lg);
}

.timeline-step {
  position: relative;
  display: flex;
  gap: var(--space-lg);
  padding-bottom: var(--space-xl);
}


.timeline-step:last-child {
  padding-bottom: 0;
}

.step-connector {
  position: absolute;
  left: 0;
  top: -20px;
  width: 2px;
  height: calc(100% - 20px);
  background: var(--color-border-primary);
}

.step-node {
  position: relative;
  flex-shrink: 0;
}

.node-circle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 0 0 4px var(--color-surface-primary), 0 0 0 6px var(--color-border-primary);
  z-index: 1;
}

.step-content {
  flex: 1;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.timeline-step:hover .step-content {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.step-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}


.step-badges {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.tool-badge, .approval-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

.tool-badge {
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
}

.approval-badge {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.step-rationale {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Plan Actions */
.plan-actions {
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-primary);
}

.actions-title {
  margin: 0 0 var(--space-md) 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.actions-grid {
  display: grid;
  gap: var(--space-sm);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}


.action-item:hover {
  border-color: var(--color-accent-primary);
  background: var(--color-surface-secondary);
}

.action-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-glow);
  border-radius: var(--radius-sm);
  color: var(--color-accent-primary);
  flex-shrink: 0;
}

.action-icon svg {
  width: 14px;
  height: 14px;
}

/* Two Column Grid */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

/* Memory Content */
.memory-content, .audit-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.memory-meta {
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  font-size: 13px;
}

.meta-row:not(:last-child) {
  border-bottom: 1px solid var(--color-border-primary);
}

.meta-label {
  color: var(--color-text-tertiary);
  font-weight: 600;
}

.meta-value {
  color: var(--color-text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}


/* Facts List */
.facts-list {
  margin-top: var(--space-md);
}

.facts-title {
  margin: 0 0 var(--space-md) 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.fact-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

.fact-icon svg {
  width: 16px;
  height: 16px;
}

/* Audit List */
.audit-item {
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.audit-item:hover {
  border-color: var(--color-border-secondary);
  background: var(--color-surface-hover);
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}

.audit-event {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}


.audit-time {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-muted);
}

.audit-details {
  display: flex;
  gap: var(--space-md);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-tertiary);
}

/* Evaluate Result */
.evaluate-result {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-primary);
}

.result-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.summary-card {
  display: flex;
  gap: var(--space-md);
  align-items: center;
  padding: var(--space-lg);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.summary-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.summary-icon.accent {
  background: var(--color-accent-glow);
  color: var(--color-accent-primary);
}

.summary-icon svg {
  width: 24px;
  height: 24px;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-primary);
  line-height: 1;
}


.summary-value {
  font-size: 32px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-primary);
  line-height: 1;
}

.summary-label {
  font-size: 13px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Evaluate Details */
.evaluate-details {
  margin-top: var(--space-xl);
}

.details-title {
  margin: 0 0 var(--space-md) 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.cases-list {
  display: grid;
  gap: var(--space-md);
}

.case-item {
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.case-item:hover {
  border-color: var(--color-border-secondary);
  transform: translateX(2px);
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}

.case-id {
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-primary);
}


.case-score {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.case-score.high {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.case-score.medium {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.case-score.low {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.case-question {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Animations */
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

.expand-enter-active {
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-leave-active {
  animation: expandOut 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}

@keyframes expandOut {
  from {
    opacity: 1;
    max-height: 1000px;
  }
  to {
    opacity: 0;
    max-height: 0;
  }
}


.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 960px) {
  .two-column-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field.span-2 {
    grid-column: span 1;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  .card-header-row {
    flex-direction: column;
    align-items: stretch;
  }

  .workflow-intro {
    flex-direction: column;
  }
}
</style>
