<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { AuthError, registerUser, validateRegistration } from '../services/auth'

const formElement = ref(null)
const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })
const submitted = ref(false)
const pending = ref(false)
const success = ref(false)
const registrationError = ref('')
const duplicateEmailError = ref('')
const errors = computed(() => ({
  ...(submitted.value ? validateRegistration(form) : {}),
  ...(duplicateEmailError.value ? { email: duplicateEmailError.value } : {}),
}))

watch(
  () => form.email,
  () => {
    duplicateEmailError.value = ''
  },
)

async function focusInvalidField() {
  await nextTick()
  formElement.value?.querySelector('[aria-invalid="true"]')?.focus()
}

async function handleSubmit() {
  if (pending.value) return
  submitted.value = true
  registrationError.value = ''
  duplicateEmailError.value = ''
  if (Object.keys(errors.value).length) {
    await focusInvalidField()
    return
  }
  pending.value = true
  try {
    await registerUser({ ...form })
    form.password = ''
    form.confirmPassword = ''
    submitted.value = false
    success.value = true
  } catch (error) {
    if (error instanceof AuthError && error.field === 'email') {
      duplicateEmailError.value = error.message
    } else {
      registrationError.value =
        error instanceof AuthError ? error.message : 'Unable to register. Please try again.'
    }
  } finally {
    pending.value = false
  }
  if (duplicateEmailError.value) await focusInvalidField()
}
</script>

<template>
  <main class="auth-page" aria-labelledby="register-title">
    <section class="auth-card">
      <h1 id="register-title" class="auth-title">Join GreenLink</h1>
      <p class="auth-description">Create your GreenLink Melbourne account.</p>

      <div v-if="success" class="auth-success" role="status">
        <p>Your account has been created successfully. You can now log in.</p>
        <RouterLink class="auth-button" :to="{ name: 'login' }">Continue to login</RouterLink>
      </div>

      <form
        v-else
        ref="formElement"
        class="auth-form"
        novalidate
        :aria-busy="pending"
        @submit.prevent="handleSubmit"
        @input="registrationError = ''"
      >
        <fieldset :disabled="pending">
          <legend class="auth-sr-only">Registration details</legend>
          <div class="auth-field">
            <label for="register-name">Full Name</label>
            <input
              id="register-name"
              v-model="form.name"
              name="name"
              type="text"
              maxlength="80"
              autocomplete="name"
              required
              :aria-invalid="Boolean(errors.name)"
              :aria-describedby="errors.name ? 'register-name-error' : undefined"
            />
            <p v-if="errors.name" id="register-name-error" class="auth-error">{{ errors.name }}</p>
          </div>

          <div class="auth-field">
            <label for="register-email">Email</label>
            <input
              id="register-email"
              v-model="form.email"
              name="email"
              type="email"
              maxlength="254"
              autocomplete="username"
              required
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'register-email-error' : undefined"
            />
            <p v-if="errors.email" id="register-email-error" class="auth-error">
              {{ errors.email }}
            </p>
          </div>

          <div class="auth-field">
            <label for="register-password">Password</label>
            <input
              id="register-password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              :aria-invalid="Boolean(errors.password)"
              :aria-describedby="
                errors.password
                  ? 'register-password-hint register-password-error'
                  : 'register-password-hint'
              "
            />
            <p id="register-password-hint" class="auth-hint">
              Use at least 8 characters, including an uppercase letter, a lowercase letter and a
              number.
            </p>
            <p v-if="errors.password" id="register-password-error" class="auth-error">
              {{ errors.password }}
            </p>
          </div>

          <div class="auth-field">
            <label for="register-confirm-password">Confirm Password</label>
            <input
              id="register-confirm-password"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              :aria-invalid="Boolean(errors.confirmPassword)"
              :aria-describedby="
                errors.confirmPassword ? 'register-confirm-password-error' : undefined
              "
            />
            <p
              v-if="errors.confirmPassword"
              id="register-confirm-password-error"
              class="auth-error"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <p v-if="registrationError" class="auth-message auth-error" role="alert">
            {{ registrationError }}
          </p>
          <button class="auth-button" type="submit">
            {{ pending ? 'Creating account...' : 'Register' }}
          </button>
        </fieldset>
      </form>

      <p v-if="!success" class="auth-footer">
        Already registered? <RouterLink :to="{ name: 'login' }">Log in</RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped src="../assets/auth.css"></style>
