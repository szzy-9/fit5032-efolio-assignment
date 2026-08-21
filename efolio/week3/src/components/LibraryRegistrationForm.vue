<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <h1 class="text-center">User Information Form / Credentials</h1>

        <form @submit.prevent="submitForm">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="username" class="form-label">Username:</label>
              <input
                id="username"
                v-model="formData.username"
                type="text"
                name="username"
                class="form-control"
              >
            </div>

            <div class="col-md-6 mb-3">
              <label for="password" class="form-label">Password:</label>
              <input
                id="password"
                v-model="formData.password"
                type="password"
                name="password"
                class="form-control"
              >
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="form-check">
                <input
                  id="isAustralian"
                  v-model="formData.isAustralian"
                  type="checkbox"
                  name="isAustralian"
                  class="form-check-input"
                >
                <label for="isAustralian" class="form-check-label">
                  Australian Resident?
                </label>
              </div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="gender" class="form-label">Gender</label>
              <select id="gender" v-model="formData.gender" class="form-select">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
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
            ></textarea>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
  isAustralian: false,
  reason: '',
  gender: ''
})

const submittedCards = ref([])

const submitForm = () => {
  submittedCards.value.push({
    ...formData.value
  })
}

const clearForm = () => {
  formData.value = {
    username: '',
    password: '',
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
