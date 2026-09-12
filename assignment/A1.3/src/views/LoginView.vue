<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { AuthError, login, validateLogin } from '../services/auth'

const router = useRouter()
const formElement = ref(null)
const form = reactive({ email: '', password: '' })
const submitted = ref(false)
const pending = ref(false)
const loginError = ref('')
const errors = computed(() => (submitted.value ? validateLogin(form) : {}))

async function handleSubmit() {
  if (pending.value) return
  submitted.value = true
  loginError.value = ''
  if (Object.keys(errors.value).length) {
    await nextTick()
    formElement.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  pending.value = true
  try {
    const user = await login({ ...form })
    form.password = ''
    await router.push({ name: user.role === 'admin' ? 'admin' : 'home' })
  } catch (error) {
    loginError.value =
      error instanceof AuthError ? error.message : 'Unable to log in. Please try again.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="auth-page" aria-labelledby="login-title">
    <section class="auth-card">
      <h1 id="login-title" class="auth-title">Welcome back</h1>
      <p class="auth-description">Log in to GreenLink Melbourne.</p>

      <form
        ref="formElement"
        class="auth-form"
        novalidate
        :aria-busy="pending"
        @submit.prevent="handleSubmit"
        @input="loginError = ''"
      >
        <fieldset :disabled="pending">
          <legend class="auth-sr-only">Login details</legend>
          <div class="auth-field">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="username"
              required
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'login-email-error' : undefined"
            />
            <p v-if="errors.email" id="login-email-error" class="auth-error">{{ errors.email }}</p>
          </div>

          <div class="auth-field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              :aria-invalid="Boolean(errors.password)"
              :aria-describedby="errors.password ? 'login-password-error' : undefined"
            />
            <p v-if="errors.password" id="login-password-error" class="auth-error">
              {{ errors.password }}
            </p>
          </div>

          <p v-if="loginError" class="auth-message auth-error" role="alert">{{ loginError }}</p>
          <button class="auth-button" type="submit">
            {{ pending ? 'Logging in...' : 'Log in' }}
          </button>
        </fieldset>
      </form>

      <p class="auth-footer">
        New to GreenLink? <RouterLink :to="{ name: 'register' }">Create an account</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
