<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">User Information Form / Credentials</h1>

        <form @submit.prevent="submitForm">
          <div class="row">
            <div class="col-sm-6 mb-3">
              <label for="username" class="form-label">Username:</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                name="username"
                class="form-control"
                @blur="() => validateName(true)"
                @input="() => validateName(false)"
              >
              <div v-if="errors.username" class="text-danger">{{ errors.username }}</div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-6 mb-3">
              <label for="password" class="form-label">Password:</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                name="password"
                class="form-control"
                @blur="() => validatePassword(true)"
                @input="() => validatePassword(false)"
              >
              <div v-if="errors.password" class="text-danger">{{ errors.password }}</div>
            </div>

            <div class="col-sm-6 mb-3">
              <label for="confirmPassword" class="form-label">Confirm password:</label>
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                name="confirmPassword"
                class="form-control"
                @blur="() => validateConfirmPassword(true)"
              >
              <div v-if="errors.confirmPassword" class="text-danger">
                {{ errors.confirmPassword }}
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-sm-6 mb-3">
              <div class="form-check">
                <input
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  type="checkbox"
                  name="isAustralian"
                  class="form-check-input"
                  @change="() => validateResident(true)"
                >
                <label for="isAustralian" class="form-check-label">
                  Australian Resident?
                </label>
              </div>
              <div v-if="errors.resident" class="text-danger">{{ errors.resident }}</div>
            </div>

            <div class="col-sm-6 mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select
                id="gender"
                v-model="formData.gender"
                class="form-select"
                @blur="() => validateGender(true)"
                @change="() => validateGender(false)"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <div v-if="errors.gender" class="text-danger">{{ errors.gender }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label for="reason" class="form-label">Reason For Joining:</label>
            <textarea
              id="reason"
              v-model="formData.reason"
              name="reason"
              class="form-control"
              rows="3"
              @blur="() => validateReason(true)"
              @input="() => validateReason(false)"
            ></textarea>
            <div v-if="errors.reason" class="text-danger">{{ errors.reason }}</div>
          </div>

          <div class="text-center">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">
              Clear
            </button>
          </div>
        </form>

        <div
          v-if="submittedCards.length"
          class="d-flex flex-wrap justify-content-start mt-4"
        >
          <div
            v-for="(card, index) in submittedCards"
            :key="index"
            class="card m-2"
            style="width: 18rem"
          >
            <div class="card-header">Submitted User Information</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item"><strong>Username:</strong> {{ card.username }}</li>
              <li class="list-group-item"><strong>Password:</strong> {{ card.password }}</li>
              <li class="list-group-item">
                <strong>Australian Resident:</strong>
                {{ card.isAustralian ? 'Yes' : 'No' }}
              </li>
              <li class="list-group-item"><strong>Gender:</strong> {{ card.gender }}</li>
              <li class="list-group-item"><strong>Reason:</strong> {{ card.reason }}</li>
            </ul>
          </div>
        </div>

        <DataTable v-if="submittedCards.length" :value="submittedCards" class="mt-4">
          <Column field="username" header="Username" />
          <Column field="password" header="Password" />
          <Column header="Australian Resident">
            <template #body="{ data }">
              {{ data.isAustralian ? 'Yes' : 'No' }}
            </template>
          </Column>
          <Column field="gender" header="Gender" />
          <Column field="reason" header="Reason" />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const formData = ref({
  username: '',
  password: '',
  confirmPassword: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

const submittedCards = ref([])

const errors = ref({
  username: null,
  password: null,
  confirmPassword: null,
  resident: null,
  gender: null,
  reason: null
})

const validateName = (blur) => {
  if (formData.value.username.length < 3) {
    if (blur) {
      errors.value.username = 'Name must be at least 3 characters'
    }
  } else if (!/^[A-Za-z0-9_]+$/.test(formData.value.username)) {
    if (blur) {
      errors.value.username = 'Username can only contain letters, numbers and underscores.'
    }
  } else {
    errors.value.username = null
  }
}

const validatePassword = (blur) => {
  const password = formData.value.password
  let error = null

  if (password.length < 8) {
    error = 'Password must be at least 8 characters'
  } else if (!/[A-Z]/.test(password)) {
    error = 'Password must contain at least one uppercase letter'
  } else if (!/[a-z]/.test(password)) {
    error = 'Password must contain at least one lowercase letter'
  } else if (!/\d/.test(password)) {
    error = 'Password must contain at least one number'
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    error = 'Password must contain at least one special character'
  }

  if (error) {
    if (blur) {
      errors.value.password = error
    }
  } else {
    errors.value.password = null
  }
}

const validateConfirmPassword = (blur) => {
  if (formData.value.password !== formData.value.confirmPassword) {
    if (blur) {
      errors.value.confirmPassword = 'Passwords do not match.'
    }
  } else {
    errors.value.confirmPassword = null
  }
}

const validateResident = (blur) => {
  if (!formData.value.isAustralian) {
    if (blur) {
      errors.value.resident = 'You must be an Australian resident to register.'
    }
  } else {
    errors.value.resident = null
  }
}

const validateGender = (blur) => {
  if (!formData.value.gender) {
    if (blur) {
      errors.value.gender = 'Please select a gender.'
    }
  } else {
    errors.value.gender = null
  }
}

const validateReason = (blur) => {
  const reason = formData.value.reason.trim()

  if (!reason) {
    if (blur) {
      errors.value.reason = 'Please provide a reason for joining.'
    }
  } else if (reason.length < 10) {
    if (blur) {
      errors.value.reason = 'Reason must be at least 10 characters.'
    }
  } else {
    errors.value.reason = null
  }
}

const submitForm = () => {
  validateName(true)
  validatePassword(true)
  validateConfirmPassword(true)
  validateResident(true)
  validateGender(true)
  validateReason(true)

  const isValid = Object.values(errors.value).every((error) => error === null)

  if (isValid) {
    submittedCards.value.push({
      ...formData.value
    })
  }
}

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
    confirmPassword: '',
    isAustralian: false,
    reason: '',
    gender: ''
  }
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #275FDA;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.list-group-item {
  padding: 10px;
}
</style>
