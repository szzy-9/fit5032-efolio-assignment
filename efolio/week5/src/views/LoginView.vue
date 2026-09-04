<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref(null)

const login = () => {
  if (username.value === 'student' && password.value === 'password123') {
    localStorage.setItem('isAuthenticated', 'true')
    router.push({ name: 'About' })
  } else {
    error.value = 'Incorrect username or password.'
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h1>Login</h1>

        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="username" class="form-label">Username:</label>
            <input
              id="username"
              v-model="username"
              type="text"
              name="username"
              class="form-control"
            >
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input
              id="password"
              v-model="password"
              type="password"
              name="password"
              class="form-control"
            >
          </div>

          <div v-if="error" class="text-danger mb-3">{{ error }}</div>

          <button type="submit" class="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>
