<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isAuthenticated = ref(false)

watch(
  () => route.fullPath,
  () => {
    isAuthenticated.value = localStorage.getItem('isAuthenticated') === 'true'
  },
  { immediate: true }
)

const logout = () => {
  localStorage.removeItem('isAuthenticated')
  isAuthenticated.value = false
  router.push({ name: 'Login' })
}
</script>

<template>
  <nav class="navbar navbar-expand navbar-light bg-light">
    <div class="container">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        </li>
        <li v-if="!isAuthenticated" class="nav-item">
          <router-link to="/login" class="nav-link" active-class="active">Login</router-link>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
        <li v-if="isAuthenticated" class="nav-item">
          <button type="button" class="nav-link" @click="logout">Logout</button>
        </li>
      </ul>
    </div>
  </nav>

  <router-view />
</template>
