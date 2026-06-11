<template>
  <div class="knowledge-base">
    <div class="page-header">
      <h1 class="page-title">知识库管理</h1>
      <p class="page-subtitle">浏览和管理运维知识库 · 共 {{ totalCount }} 条知识</p>
    </div>

    <div class="main-content">
      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索知识库..."
            @input="handleSearch"
          />
        </div>

        <select v-model="selectedProvince" class="filter-select">
          <option value="">全部省份</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>

        <select v-model="selectedSort" class="filter-select">
          <option value="">全部分类</option>
          <option v-for="s in sorts" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalCount }}</div>
            <div class="stat-label">知识条目</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🗂️</div>
          <div class="stat-info">
            <div class="stat-value">{{ sorts.length }}</div>
            <div class="stat-label">问题分类</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📍</div>
          <div class="stat-info">
            <div class="stat-value">{{ provinces.length }}</div>
            <div class="stat-label">覆盖省份</div>
          </div>
        </div>
      </div>

      <!-- 知识列表 -->
      <div class="knowledge-list">
        <div
          v-for="item in filteredKnowledge"
          :key="item.id"
          class="knowledge-item"
        >
          <div class="item-header">
            <span class="item-id">#{{ item.id }}</span>
            <h3 class="item-question">{{ item.question }}</h3>
            <div class="item-tags">
              <span v-if="item.province" class="tag province">{{ item.province }}</span>
              <span v-if="item.sort" class="tag sort">{{ item.sort }}</span>
            </div>
          </div>
          <div class="item-body">
            <div v-if="item.reason" class="item-section">
              <strong>原因：</strong>
              <span>{{ item.reason }}</span>
            </div>
            <div v-if="item.method" class="item-section">
              <strong>方法：</strong>
              <span>{{ item.method }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'

const searchQuery = ref('')
const selectedProvince = ref('')
const selectedSort = ref('')
const knowledgeBase = ref<any[]>([])

const totalCount = computed(() => knowledgeBase.value.length)

const provinces = computed(() => {
  const set = new Set(knowledgeBase.value.map(k => k.province).filter(Boolean))
  return Array.from(set).sort()
})

const sorts = computed(() => {
  const set = new Set(knowledgeBase.value.map(k => k.sort).filter(Boolean))
  return Array.from(set).sort()
})

const filteredKnowledge = computed(() => {
  return knowledgeBase.value.filter(item => {
    const matchSearch = !searchQuery.value ||
      item.question?.includes(searchQuery.value) ||
      item.reason?.includes(searchQuery.value) ||
      item.method?.includes(searchQuery.value)

    const matchProvince = !selectedProvince.value || item.province === selectedProvince.value
    const matchSort = !selectedSort.value || item.sort === selectedSort.value

    return matchSearch && matchProvince && matchSort
  })
})

const handleSearch = () => {
  // 搜索已通过computed实现
}

onMounted(async () => {
  try {
    knowledgeBase.value = await api.getKnowledgeBase()
  } catch (error) {
    console.error('加载知识库失败:', error)
  }
})
</script>

<style scoped>
.knowledge-base {
  min-height: 100%;
  padding: var(--space-2xl);
  max-width: 1400px;
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

.filter-bar {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 209, 178, 0.1);
}

.filter-select {
  padding: 12px 16px;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  font-size: 36px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-accent-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.knowledge-item {
  padding: var(--space-xl);
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  transition: all 0.3s;
}

.knowledge-item:hover {
  border-color: var(--color-accent-primary);
  box-shadow: var(--shadow-md);
}

.item-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.item-id {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
}

.item-question {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.item-tags {
  display: flex;
  gap: var(--space-sm);
}

.tag {
  padding: 4px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}

.tag.province {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tag.sort {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.item-section {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.item-section strong {
  color: var(--color-text-primary);
  margin-right: var(--space-sm);
}
</style>
