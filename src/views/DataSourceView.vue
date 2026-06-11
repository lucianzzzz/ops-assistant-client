<template>
  <div class="data-source-page">
    <div class="source-grid">
      <!-- 知识库 -->
      <div class="source-card">
        <div class="source-header" @click="toggleKnowledge">
          <div class="source-title">
            <svg class="source-icon success" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div>
              <h3>知识库</h3>
              <p>{{ status?.knowledge?.loaded_count || 0 }} 条</p>
            </div>
          </div>
          <svg class="expand-icon" :class="{ expanded: showKnowledge }" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <transition name="expand">
          <div v-if="showKnowledge" class="source-details">
            <div class="knowledge-list">
              <div v-for="(item, idx) in knowledgeItems" :key="idx" class="knowledge-item">
                <div class="knowledge-header">
                  <span class="knowledge-id">ID: {{ item.id }}</span>
                  <span class="knowledge-tag">{{ item.sort }}</span>
                  <span class="knowledge-tag" v-if="item.province">{{ item.province }}</span>
                </div>
                <h4>{{ item.question }}</h4>
                <p class="knowledge-desc"><strong>原因：</strong>{{ item.reason }}</p>
                <p class="knowledge-desc"><strong>方法：</strong>{{ item.method }}</p>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 指标元数据 -->
      <div class="source-card">
        <div class="source-header" @click="toggleMetrics">
          <div class="source-title">
            <svg class="source-icon success" viewBox="0 0 24 24" fill="none">
              <path d="M3 3v18h18" stroke="currentColor" stroke-width="2"/>
              <path d="M18 9l-5 5-4-4-3 3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div>
              <h3>指标元数据</h3>
              <p>{{ status?.metrics?.loaded_count || 0 }} 条</p>
            </div>
          </div>
          <svg class="expand-icon" :class="{ expanded: showMetrics }" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <transition name="expand">
          <div v-if="showMetrics" class="source-details">
            <div class="metrics-list">
              <div v-for="(item, idx) in metricsItems" :key="idx" class="metric-item">
                <div class="metric-main">
                  <span class="metric-name">{{ item.name }}</span>
                  <span class="metric-unit">{{ item.unit }}</span>
                </div>
                <div class="metric-code">{{ item.metric }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- 标签库 -->
      <div class="source-card">
        <div class="source-header" @click="toggleTags">
          <div class="source-title">
            <svg class="source-icon success" viewBox="0 0 24 24" fill="none">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="2"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
            <div>
              <h3>标签库</h3>
              <p>{{ status?.public_tags?.loaded_count || 0 }} 条</p>
            </div>
          </div>
          <svg class="expand-icon" :class="{ expanded: showTags }" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <transition name="expand">
          <div v-if="showTags" class="source-details">
            <div class="tags-cloud">
              <span v-for="(item, idx) in tagsItems" :key="idx" class="tag-item" :title="item.desc">
                {{ item.name }}
              </span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const showKnowledge = ref(false)
const showMetrics = ref(false)
const showTags = ref(false)
const status = ref<any>(null)
const knowledgeItems = ref<any[]>([])
const metricsItems = ref<any[]>([])
const tagsItems = ref<any[]>([])

const toggleKnowledge = async () => {
  showKnowledge.value = !showKnowledge.value
  if (showKnowledge.value && knowledgeItems.value.length === 0) {
    await loadKnowledgeDetails()
  }
}

const toggleMetrics = async () => {
  showMetrics.value = !showMetrics.value
  if (showMetrics.value && metricsItems.value.length === 0) {
    await loadMetricsDetails()
  }
}

const toggleTags = async () => {
  showTags.value = !showTags.value
  if (showTags.value && tagsItems.value.length === 0) {
    await loadTagsDetails()
  }
}

const loadStatus = async () => {
  try {
    status.value = await api.dataSourceStatus()
  } catch (err) {
    console.error(err)
  }
}

const loadKnowledgeDetails = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8012/api/v1/seed/knowledge_base')
    const data = await response.json()
    knowledgeItems.value = data.slice(0, 20)
  } catch (err) {
    console.error(err)
  }
}

const loadMetricsDetails = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8012/api/v1/seed/metrics_meta')
    const data = await response.json()
    metricsItems.value = data.slice(0, 20)
  } catch (err) {
    console.error(err)
  }
}

const loadTagsDetails = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8012/api/v1/seed/public_tags')
    const data = await response.json()
    tagsItems.value = data.slice(0, 50)
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadStatus()
})
</script>

<style scoped>
.data-source-page {
  padding: var(--space-2xl);
  max-width: 1400px;
  margin: 0 auto;
}

.source-grid {
  display: grid;
  gap: var(--space-xl);
}

.source-card {
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.source-header:hover {
  background: var(--color-surface-hover);
}

.source-title {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.source-icon {
  width: 40px;
  height: 40px;
  padding: 8px;
  border-radius: var(--radius-md);
  background: rgba(6, 182, 212, 0.1);
}

.source-icon.success {
  stroke: var(--color-accent-primary);
}

.source-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.source-title p {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.expand-icon {
  width: 24px;
  height: 24px;
  stroke: var(--color-text-tertiary);
  transition: transform var(--transition-base);
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.source-details {
  border-top: 1px solid var(--color-border-primary);
  padding: var(--space-xl);
  background: var(--color-surface-secondary);
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.knowledge-item {
  padding: var(--space-lg);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
}

.knowledge-header {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.knowledge-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-muted);
}

.knowledge-tag {
  padding: 2px 8px;
  background: var(--color-surface-hover);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--color-accent-primary);
}

.knowledge-item h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
}

.knowledge-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.metrics-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.metric-item:hover {
  border-color: var(--color-accent-primary);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

.metric-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.metric-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.metric-unit {
  padding: 2px 8px;
  background: rgba(6, 182, 212, 0.1);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-accent-primary);
}

.metric-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.tag-item {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tag-item:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.expand-enter-active, .expand-leave-active {
  transition: all var(--transition-base);
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to, .expand-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
