// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8012'

// 通用请求方法
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API 请求失败: ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`)
  }

  return response.json()
}

// 类型定义
export interface AskRequest {
  question: string
  province?: string
  top_k?: number
}

export interface AIFallbackResult {
  enabled: boolean
  used?: boolean
  confidence_too_low?: boolean
  raw_response?: string
  error?: string
  message?: string
}

export interface ExecutableAction {
  id: string
  type: 'command' | 'script' | 'api' | 'ssh'
  title: string
  description: string
  command: string
  risk_level: 'low' | 'medium' | 'high'
  requires_approval: boolean
  timeout: number
  estimated_duration: number
  rollback_command?: string
  metadata?: Record<string, any>
}

export interface ExecutionResult {
  execution_id: string
  action_id: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout' | 'cancelled'
  start_time: string
  end_time?: string
  duration?: number
  stdout: string
  stderr: string
  exit_code?: number
  error?: string
}

export interface AskResponse {
  question: string
  normalized_metric: string
  keywords: string[]
  confidence: number
  possible_reason: string[]
  suggested_steps: string[]
  next_actions: string[]
  matched_knowledge: any[]
  related_objects: any
  fallback_questions: any[]
  ai_fallback?: AIFallbackResult
  executable_actions?: ExecutableAction[]
}

export interface DataSourceStatus {
  data_dir: string
  knowledge: {
    file_name: string
    file_path: string
    exists: boolean
    loaded_count: number
  }
  metrics: {
    file_name: string
    file_path: string
    exists: boolean
    loaded_count: number
  }
  public_tags: {
    file_name: string
    file_path: string
    exists: boolean
    loaded_count: number
  }
}

export interface HealthResponse {
  status: string
}

export interface PlanStep {
  order: number
  title: string
  rationale: string
  tool_name: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout' | 'cancelled'
  depends_on: number[]
  requires_approval: boolean
}

export interface AgentPlan {
  plan_id: string
  session_id: string
  question: string
  goal: string
  context_summary: string
  steps: PlanStep[]
  recommended_actions: ExecutableAction[]
  created_at: string
}

export interface ConversationMemory {
  session_id: string
  facts: string[]
  last_question: string
  updated_at: string
}

export interface AuditEvent {
  event_id: string
  event_type: string
  summary: string
  session_id?: string
  plan_id?: string
  action_id?: string
  metadata: Record<string, any>
  created_at: string
}

export interface CreatePlanRequest {
  session_id: string
  question: string
  analysis_result: {
    keywords: string[]
    normalized_metric: string
    confidence: number
  }
}

export interface CreatePlanResponse {
  plan: AgentPlan
  memory: ConversationMemory
}

export interface EvaluationCase {
  case_id: string
  question: string
  expected_keywords: string[]
}

export interface EvaluationReport {
  total_cases: number
  average_score: number
  results: Array<{
    case_id: string
    question: string
    score: number
    matched_keywords: string[]
    plan_id: string
  }>
}

// API 方法
export const api = {
  // 健康检查
  health(): Promise<HealthResponse> {
    return request<HealthResponse>('/api/v1/health')
  },

  // 数据源状态
  dataSourceStatus(): Promise<DataSourceStatus> {
    return request<DataSourceStatus>('/api/v1/data-source/status')
  },

  // 问答接口
  ask(data: AskRequest): Promise<AskResponse> {
    return request<AskResponse>('/api/v1/assistant/ask', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 创建 Agent 计划
  createAgentPlan(data: CreatePlanRequest): Promise<CreatePlanResponse> {
    return request<CreatePlanResponse>('/api/v1/agent/plans', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 获取会话记忆
  getAgentMemory(sessionId: string): Promise<ConversationMemory> {
    return request<ConversationMemory>(`/api/v1/agent/memory/${encodeURIComponent(sessionId)}`)
  },

  // 获取审计日志
  getAgentAudit(limit: number = 50): Promise<AuditEvent[]> {
    return request<AuditEvent[]>(`/api/v1/agent/audit?limit=${limit}`)
  },

  // 运行 Agent 评测
  evaluateAgent(cases: EvaluationCase[]): Promise<EvaluationReport> {
    return request<EvaluationReport>('/api/v1/agent/evaluate', {
      method: 'POST',
      body: JSON.stringify({ cases })
    })
  },

  // 执行动作
  executeAction(actionId: string, action: ExecutableAction, userConfirmation: boolean = false): Promise<ExecutionResult> {
    return request<ExecutionResult>(`/api/v1/agent/actions/${actionId}/execute`, {
      method: 'POST',
      body: JSON.stringify({
        action_id: actionId,
        parameters: {
          action: action
        },
        user_confirmation: userConfirmation
      })
    })
  },

  // 获取执行结果
  getExecutionResult(executionId: string): Promise<ExecutionResult> {
    return request<ExecutionResult>(`/api/v1/agent/executions/${executionId}`)
  },

  // 获取执行历史
  getExecutionHistory(limit: number = 20): Promise<ExecutionResult[]> {
    return request<ExecutionResult[]>(`/api/v1/agent/executions?limit=${limit}`)
  },

  // 获取知识库
  getKnowledgeBase(): Promise<any[]> {
    return request<any[]>('/api/v1/seed/knowledge_base')
  },

  // 获取数据源状态（别名）
  getDataSourceStatus(): Promise<DataSourceStatus> {
    return request<DataSourceStatus>('/api/v1/data-source/status')
  }
}
