<script setup>
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'

defineProps({
  initializationError: { type: String, default: '' },
})
</script>

<template>
  <AppNavbar />
  <p v-if="initializationError" class="app-error" role="alert">{{ initializationError }}</p>

  <RouterView />
</template>

<style scoped>
.app-error {
  margin: 1rem;
  color: #b42318;
}
</style>
