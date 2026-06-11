<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-subtitle">数据源状态、AI配置和系统信息</p>
    </div>

    <div class="main-content">
      <!-- 数据源状态 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">📊 数据源状态</h2>
          <span class="status-badge success">运行正常</span>
        </div>

        <div class="data-sources">
          <div class="data-source-item">
            <div class="source-icon">📚</div>
            <div class="source-info">
              <div class="source-name">知识库</div>
              <div class="source-detail">{{ dataStatus.knowledge?.loaded_count || 0 }} 条知识</div>
            </div>
            <div class="source-status" :class="dataStatus.knowledge?.exists ? 'online' : 'offline'">
              {{ dataStatus.knowledge?.exists ? '在线' : '离线' }}
            </div>
          </div>

          <div class="data-source-item">
            <div class="source-icon">📈</div>
            <div class="source-info">
              <div class="source-name">指标元数据</div>
              <div class="source-detail">{{ dataStatus.metrics?.loaded_count || 0 }} 个指标</div>
            </div>
            <div class="source-status" :class="dataStatus.metrics?.exists ? 'online' : 'offline'">
              {{ dataStatus.metrics?.exists ? '在线' : '离线' }}
            </div>
          </div>

          <div class="data-source-item">
            <div class="source-icon">🏷️</div>
            <div class="source-info">
              <div class="source-name">公共标签</div>
              <div class="source-detail">{{ dataStatus.public_tags?.loaded_count || 0 }} 个标签</div>
            </div>
            <div class="source-status" :class="dataStatus.public_tags?.exists ? 'online' : 'offline'">
              {{ dataStatus.public_tags?.exists ? '在线' : '离线' }}
            </div>
          </div>
        </div>
      </div>

      <!-- AI配置 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">🤖 AI 配置</h2>
        </div>

        <div class="config-list">
          <div class="config-item">
            <div class="config-label">LLM 提供商</div>
            <div class="config-value">DeepSeek</div>
          </div>
          <div class="config-item">
            <div class="config-label">模型</div>
            <div class="config-value">deepseek-chat</div>
          </div>
          <div class="config-item">
            <div class="config-label">API 状态</div>
            <div class="config-value">
              <span class="status-dot online"></span>
              已配置
            </div>
          </div>
          <div class="config-item">
            <div class="config-label">触发条件</div>
            <div class="config-value">置信度 &lt; 50%</div>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="section-card">
        <div class="section-header">
          <h2 class="section-title">ℹ️ 系统信息</h2>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">版本</div>
            <div class="info-value">v0.1.0</div>
          </div>
          <div class="info-item">
            <div class="info-label">构建日期</div>
            <div class="info-value">2026-06-10</div>
          </div>
          <div class="info-item">
            <div class="info-label">后端地址</div>
            <div class="info-value">http://127.0.0.1:8012</div>
          </div>
          <div class="info-item">
            <div class="info-label">数据目录</div>
            <div class="info-value">{{ dataStatus.data_dir || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- 开发工具（仅开发模式） -->
      <div v-if="isDev" class="section-card dev-only">
        <div class="section-header">
          <h2 class="section-title">🔧 开发工具</h2>
          <span class="dev-badge">DEV</span>
        </div>

        <div class="dev-actions">
          <button @click="refreshData" class="action-btn">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" stroke-width="2"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
            </svg>
            刷新数据
          </button>
          <button @click="clearCache" class="action-btn">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2"/>
            </svg>
            清空缓存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const dataStatus = ref<any>({})
const isDev = import.meta.env.DEV

const refreshData = async () => {
  try {
    dataStatus.value = await api.getDataSourceStatus()
  } catch (error) {
    console.error('获取数据源状态失败:', error)
  }
}

const clearCache = () => {
  localStorage.clear()
  sessionStorage.clear()
  alert('缓存已清空')
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.settings {
  min-height: 100%;
  padding: var(--space-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-2xl);
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-size: 15px;
  color: var(--color-text-tertiary);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.section-card {
  padding: var(--space-2xl);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.section-card.dev-only {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
}

.status-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.dev-badge {
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.data-sources {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.data-source-item {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
}

.source-icon {
  font-size: 32px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.source-detail {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.source-status {
  padding: 6px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
}

.source-status.online {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.source-status.offline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border-primary);
}

.config-item:last-child {
  border-bottom: none;
}

.config-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.config-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #22c55e;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.info-item {
  padding: var(--space-md);
}

.info-label {
  font-size: 13px;
  color: var(--color-text-tertiary);
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.dev-actions {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 12px 20px;
  background: var(--color-accent-primary);
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: var(--color-accent-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}
</style>
