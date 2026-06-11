<template>
  <div class="ask-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">问题描述</label>
        <textarea
          v-model="form.question"
          rows="4"
          placeholder="请描述您遇到的运维问题，例如：CPU利用率持续升高怎么排查..."
          required
          class="form-textarea"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">省份筛选 <span class="optional">（可选）</span></label>
          <input
            v-model="form.province"
            type="text"
            placeholder="留空表示全国通用"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">返回结果数</label>
          <input
            v-model.number="form.top_k"
            type="number"
            min="1"
            max="10"
            class="form-input"
          />
        </div>
      </div>

      <button type="submit" :disabled="loading || !form.question.trim()" class="submit-btn">
        <svg v-if="!loading" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div v-else class="spinner"></div>
        <span>{{ loading ? '查询中...' : '开始查询' }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AskRequest } from '@/services/api'

interface Props {
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: AskRequest]
}>()

const form = ref<AskRequest>({
  question: '',
  province: '',
  top_k: 3
})

const handleSubmit = () => {
  emit('submit', {
    question: form.value.question,
    province: form.value.province || undefined,
    top_k: form.value.top_k
  })
}
</script>

<style scoped>
.ask-form {
  width: 100%;
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.optional {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: 12px;
}

.form-textarea,
.form-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-surface-secondary);
  border: 2px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-textarea::placeholder,
.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-textarea:hover,
.form-input:hover {
  border-color: var(--color-border-secondary);
}

.form-textarea:focus,
.form-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}

.submit-btn {
  width: 100%;
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
}

.submit-btn:disabled {
  background: var(--color-surface-secondary);
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

.submit-btn svg {
  width: 18px;
  height: 18px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
