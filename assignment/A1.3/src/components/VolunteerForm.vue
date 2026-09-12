<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  fullName: '',
  email: '',
  suburb: '',
  postcode: '',
  preferredActivity: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  suburb: '',
  postcode: '',
  preferredActivity: '',
})

const submissionSuccess = ref(false)

function validateForm() {
  errors.fullName = ''
  errors.email = ''
  errors.suburb = ''
  errors.postcode = ''
  errors.preferredActivity = ''

  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (form.fullName.trim().length > 80) {
    errors.fullName = 'Full name must be 80 characters or fewer.'
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (form.email.trim().length > 254) {
    errors.email = 'Email must be 254 characters or fewer.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (form.suburb.trim().length > 80) {
    errors.suburb = 'Suburb must be 80 characters or fewer.'
  }

  if (!/^\d{4}$/.test(form.postcode.trim())) {
    errors.postcode = 'Please enter a valid 4-digit postcode.'
  }

  if (!form.preferredActivity) {
    errors.preferredActivity = 'Please select an activity.'
  }

  return Object.values(errors).every((error) => !error)
}

function handleSubmit() {
  submissionSuccess.value = false

  if (validateForm()) {
    form.fullName = form.fullName.trim()
    form.email = form.email.trim().toLowerCase()
    form.suburb = form.suburb.trim()
    form.postcode = form.postcode.trim()
    submissionSuccess.value = true
  }
}
</script>

<template>
  <section id="volunteer" class="volunteer" aria-labelledby="volunteer-title">
    <div class="volunteer__inner">
      <h2 id="volunteer-title" class="volunteer__title">Get Involved</h2>

      <form class="volunteer-form" novalidate @submit.prevent="handleSubmit">
        <div class="volunteer-form__field">
          <label for="full-name">Full Name</label>
          <input
            id="full-name"
            v-model="form.fullName"
            name="fullName"
            type="text"
            maxlength="80"
            autocomplete="name"
            :aria-invalid="Boolean(errors.fullName)"
            :aria-describedby="errors.fullName ? 'full-name-error' : undefined"
          />
          <p v-if="errors.fullName" id="full-name-error" class="volunteer-form__error">
            {{ errors.fullName }}
          </p>
        </div>

        <div class="volunteer-form__field">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            maxlength="254"
            autocomplete="email"
            :aria-invalid="Boolean(errors.email)"
            :aria-describedby="errors.email ? 'email-error' : undefined"
          />
          <p v-if="errors.email" id="email-error" class="volunteer-form__error">
            {{ errors.email }}
          </p>
        </div>

        <div class="volunteer-form__field">
          <label for="suburb">Suburb</label>
          <input
            id="suburb"
            v-model="form.suburb"
            name="suburb"
            type="text"
            maxlength="80"
            autocomplete="address-level2"
            :aria-invalid="Boolean(errors.suburb)"
            :aria-describedby="errors.suburb ? 'suburb-error' : undefined"
          />
          <p v-if="errors.suburb" id="suburb-error" class="volunteer-form__error">
            {{ errors.suburb }}
          </p>
        </div>

        <div class="volunteer-form__field">
          <label for="postcode">Postcode</label>
          <input
            id="postcode"
            v-model="form.postcode"
            name="postcode"
            type="text"
            inputmode="numeric"
            maxlength="4"
            autocomplete="postal-code"
            :aria-invalid="Boolean(errors.postcode)"
            :aria-describedby="errors.postcode ? 'postcode-error' : undefined"
          />
          <p v-if="errors.postcode" id="postcode-error" class="volunteer-form__error">
            {{ errors.postcode }}
          </p>
        </div>

        <div class="volunteer-form__field">
          <label for="preferred-activity">Preferred Activity</label>
          <select
            id="preferred-activity"
            v-model="form.preferredActivity"
            name="preferredActivity"
            :aria-invalid="Boolean(errors.preferredActivity)"
            :aria-describedby="errors.preferredActivity ? 'preferred-activity-error' : undefined"
          >
            <option value="" disabled>Select an activity</option>
            <option value="tree-planting">Tree Planting</option>
            <option value="biodiversity">Biodiversity</option>
            <option value="urban-greening">Urban Greening</option>
          </select>
          <p
            v-if="errors.preferredActivity"
            id="preferred-activity-error"
            class="volunteer-form__error"
          >
            {{ errors.preferredActivity }}
          </p>
        </div>

        <button class="volunteer-form__submit" type="submit">Submit Interest</button>

        <p v-if="submissionSuccess" class="volunteer-form__success" role="status">
          ✓ Thanks for your interest. Your form has been submitted successfully.
        </p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.volunteer {
  width: 100%;
  padding: 4rem 1rem;
}

.volunteer__inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.volunteer__title {
  margin-bottom: 2rem;
  color: #173d24;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
}

.volunteer-form {
  width: 100%;
  max-width: 40rem;
}

.volunteer-form__field {
  margin-bottom: 1.25rem;
}

.volunteer-form__field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #173d24;
  font-weight: 600;
}

.volunteer-form__field input,
.volunteer-form__field select {
  display: block;
  width: 100%;
  min-height: 3rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid #879b8c;
  border-radius: 0.5rem;
  background: #ffffff;
  font: inherit;
}

.volunteer-form__field input[aria-invalid='true'],
.volunteer-form__field select[aria-invalid='true'] {
  border-color: #b42318;
}

.volunteer-form__error {
  margin-top: 0.5rem;
  color: #b42318;
  font-size: 0.875rem;
  font-weight: 600;
}

.volunteer-form__submit {
  width: 100%;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #2f6b3b;
  border-radius: 0.5rem;
  color: #ffffff;
  background: #2f6b3b;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.volunteer-form__success {
  margin-top: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid #65a572;
  border-radius: 0.5rem;
  color: #205c2d;
  background: #edf7ef;
  font-weight: 600;
}

@media (min-width: 576px) {
  .volunteer {
    padding-inline: 1.5rem;
  }

  .volunteer-form__submit {
    width: auto;
  }
}

@media (min-width: 992px) {
  .volunteer {
    padding-inline: 2rem;
  }
}
</style>
