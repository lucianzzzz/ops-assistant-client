<script setup lang="ts">
export interface ReasoningStep {
  iteration: number
  thought: string
  thought_type: string
  action: string
  action_type: string
  observation: string
}

defineProps<{
  steps: ReasoningStep[]
}>()
</script>
