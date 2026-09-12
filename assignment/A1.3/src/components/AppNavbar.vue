<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { currentUser, isAdmin, logout } from '../services/auth'

const router = useRouter()
const logoutError = ref('')
const firstName = computed(() => currentUser.value?.name.trim().split(/\s+/)[0])
const showAdminDashboard = computed(() => isAdmin())

async function handleLogout() {
  logoutError.value = ''
  try {
    logout()
    await router.push({ name: 'home' })
  } catch (error) {
    logoutError.value = error.message || 'Unable to log out. Please try again.'
  }
}
</script>

<template>
  <nav class="navbar" aria-label="Primary navigation">
    <div class="navbar__inner">
      <RouterLink class="navbar__brand" :to="{ name: 'home', hash: '#home' }"
        >GreenLink Melbourne</RouterLink
      >

      <div class="navbar__links">
        <RouterLink :to="{ name: 'home', hash: '#home' }">Home</RouterLink>
        <RouterLink :to="{ name: 'home', hash: '#opportunities' }">Opportunities</RouterLink>
        <RouterLink :to="{ name: 'home', hash: '#volunteer' }">Volunteer</RouterLink>
        <RouterLink :to="{ name: 'reviews' }">Reviews</RouterLink>
        <RouterLink v-if="showAdminDashboard" :to="{ name: 'admin' }"> Admin Dashboard </RouterLink>
        <template v-if="currentUser">
          <span class="navbar__account">{{ firstName }}</span>
          <button class="navbar__logout" type="button" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }">Login</RouterLink>
          <RouterLink :to="{ name: 'register' }">Register</RouterLink>
        </template>
      </div>
    </div>
    <p v-if="logoutError" class="navbar__error" role="alert">{{ logoutError }}</p>
  </nav>
</template>

<style scoped>
.navbar {
  width: 100%;
  padding: 1rem;
}

.navbar__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.navbar__brand {
  color: inherit;
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar__links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  max-width: 100%;
}

.navbar__links a,
.navbar__logout {
  color: inherit;
  text-decoration: none;
}

.navbar__logout {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.navbar__account {
  color: #2f6b3b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.navbar__links a:focus-visible,
.navbar__logout:focus-visible {
  outline: 2px solid #2f6b3b;
  outline-offset: 4px;
}

.navbar__error {
  max-width: 1200px;
  margin: 0.75rem auto 0;
  color: #b42318;
}

@media (min-width: 768px) {
  .navbar__inner {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
