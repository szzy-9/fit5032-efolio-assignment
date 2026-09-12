<script setup>
import { ref } from 'vue'
import { getRegisteredUsers } from '../services/auth'

const users = ref([])
const loadError = ref('')

try {
  users.value = getRegisteredUsers()
} catch (error) {
  loadError.value = error.message || 'Unable to load registered users. Please try again.'
}
</script>

<template>
  <main class="admin-page" aria-labelledby="admin-title">
    <section class="admin-card">
      <h1 id="admin-title">Admin Dashboard</h1>
      <p v-if="loadError" class="admin-error" role="alert">{{ loadError }}</p>
      <template v-else>
        <p class="admin-count">Registered Users: {{ users.length }}</p>
        <div class="admin-table-wrapper" role="region" aria-label="Registered users" tabindex="0">
          <table>
            <caption class="admin-sr-only">
              Registered users and their roles
            </caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="3">No registered users yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.admin-page {
  min-height: calc(100vh - 90px);
  padding: 3rem 1rem;
  background: #f4f8f3;
}

.admin-card {
  max-width: 960px;
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2rem);
  border: 1px solid #dce7dc;
  border-radius: 12px;
  background: #ffffff;
}

h1 {
  color: #24532d;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1.2;
}

.admin-count {
  margin: 1rem 0 1.5rem;
  font-weight: 600;
}

.admin-table-wrapper {
  overflow-x: auto;
}

.admin-table-wrapper:focus-visible {
  outline: 2px solid #2f6b3b;
  outline-offset: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th,
td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #dce7dc;
  overflow-wrap: anywhere;
}

th {
  background: #edf4ec;
  color: #24532d;
}

.admin-error {
  margin-top: 1rem;
  color: #b42318;
}

.admin-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
