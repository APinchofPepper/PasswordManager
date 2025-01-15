<script setup lang="ts">
import { RouterView } from 'vue-router'
import PasswordManager from './components/PasswordManager.vue'
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-center mb-6">
      Secure Password Manager
    </h1>
    <PasswordManager />
    <RouterView />
  </div>
</template>