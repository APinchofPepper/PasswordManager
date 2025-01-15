<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
  document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <button
    @click="toggle"
    class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
    :aria-label="modelValue ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Sun v-if="!modelValue" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </button>
</template>
