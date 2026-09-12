<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { currentUser } from '../services/auth'
import { getRatingSummary, getReviews, saveReview, validateReview } from '../services/reviews'

const reviews = ref([])
const loadError = ref('')
const submitError = ref('')
const successMessage = ref('')
const submitted = ref(false)
const formElement = ref(null)
const form = reactive({ rating: 0, comment: '' })
const summary = computed(() => getRatingSummary(reviews.value))
const ownReview = computed(() =>
  reviews.value.find((review) => review.userId === currentUser.value?.id),
)
const errors = computed(() => (submitted.value ? validateReview(form) : {}))

function fillForm() {
  form.rating = ownReview.value?.rating ?? 0
  form.comment = ownReview.value?.comment ?? ''
  submitted.value = false
  submitError.value = ''
  successMessage.value = ''
}

function loadReviews() {
  try {
    reviews.value = getReviews()
    loadError.value = ''
    fillForm()
  } catch (error) {
    loadError.value = error.message || 'Unable to load reviews. Please try again.'
  }
}

async function handleSubmit() {
  submitted.value = true
  submitError.value = ''
  successMessage.value = ''
  if (Object.keys(errors.value).length) {
    await nextTick()
    formElement.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  try {
    saveReview({ ...form })
    loadReviews()
    if (!loadError.value) successMessage.value = 'Your review has been saved.'
  } catch (error) {
    submitError.value = error.message || 'Unable to save your review. Please try again.'
  }
}

watch(() => currentUser.value?.id, fillForm)
loadReviews()
</script>

<template>
  <main class="reviews-page" aria-labelledby="reviews-title">
    <div class="reviews-content">
      <section class="reviews-card rating-summary">
        <h1 id="reviews-title">Community Rating</h1>
        <template v-if="!loadError">
          <div class="summary-stars" aria-hidden="true">
            <span>☆☆☆☆☆</span>
            <span class="summary-stars-fill" :style="{ width: `${(summary.average / 5) * 100}%` }"
              >★★★★★</span
            >
          </div>
          <div aria-live="polite" aria-atomic="true">
            <p class="rating-score">
              {{ summary.count ? `${summary.average.toFixed(1)} / 5` : 'No ratings yet' }}
            </p>
            <p>Based on {{ summary.count }} {{ summary.count === 1 ? 'review' : 'reviews' }}</p>
          </div>
        </template>
        <div v-else>
          <p class="reviews-error" role="alert">{{ loadError }}</p>
          <button class="reviews-button" type="button" @click="loadReviews">Try again</button>
        </div>
      </section>

      <template v-if="!loadError">
        <section class="reviews-card" aria-labelledby="your-review-title">
          <h2 id="your-review-title">Your review</h2>
          <p v-if="submitError" class="reviews-error" role="alert">{{ submitError }}</p>
          <p v-if="successMessage" class="reviews-success" role="status">{{ successMessage }}</p>
          <template v-if="currentUser">
            <p class="reviews-hint">
              One review per account. Submitting again updates your review.
            </p>
            <form
              ref="formElement"
              novalidate
              @submit.prevent="handleSubmit"
              @input="successMessage = ''"
            >
              <fieldset class="rating-field">
                <legend>Your rating:</legend>
                <div class="rating-options">
                  <label v-for="score in 5" :key="score" class="rating-option">
                    <input
                      v-model="form.rating"
                      class="reviews-sr-only"
                      type="radio"
                      name="rating"
                      :value="score"
                      required
                      :aria-invalid="Boolean(errors.rating)"
                      :aria-describedby="errors.rating ? 'rating-error' : undefined"
                    />
                    <span class="rating-star" aria-hidden="true">{{
                      score <= form.rating ? '★' : '☆'
                    }}</span>
                    <span class="reviews-sr-only"
                      >{{ score }} {{ score === 1 ? 'star' : 'stars' }}</span
                    >
                  </label>
                </div>
                <p v-if="errors.rating" id="rating-error" class="reviews-error">
                  {{ errors.rating }}
                </p>
              </fieldset>

              <label class="comment-label" for="review-comment">Comment (optional):</label>
              <textarea
                id="review-comment"
                v-model="form.comment"
                name="comment"
                rows="4"
                maxlength="1000"
                :aria-invalid="Boolean(errors.comment)"
                :aria-describedby="errors.comment ? 'comment-hint comment-error' : 'comment-hint'"
              ></textarea>
              <p id="comment-hint" class="reviews-hint">Up to 1000 characters.</p>
              <p v-if="errors.comment" id="comment-error" class="reviews-error">
                {{ errors.comment }}
              </p>
              <button class="reviews-button" type="submit">
                {{ ownReview ? 'Update Review' : 'Submit Review' }}
              </button>
            </form>
          </template>
          <p v-else class="guest-message">
            <RouterLink :to="{ name: 'login' }">Log in</RouterLink> to submit a review.
          </p>
        </section>

        <section class="reviews-card" aria-labelledby="community-reviews-title">
          <h2 id="community-reviews-title">Community reviews</h2>
          <p v-if="!reviews.length" class="reviews-hint">
            No reviews yet. Be the first to share your experience.
          </p>
          <ul v-else class="review-list">
            <li v-for="review in reviews" :key="review.id" class="review-item">
              <h3>{{ review.userName }}</h3>
              <p class="review-stars" role="img" :aria-label="`${review.rating} out of 5 stars`">
                {{ '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating) }}
              </p>
              <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
              <time class="review-date" :datetime="review.createdAt">
                {{ new Date(review.createdAt).toLocaleDateString('en-AU') }}
              </time>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </main>
</template>

<style scoped>
.reviews-page {
  min-height: calc(100vh - 6rem);
  padding: clamp(2rem, 6vw, 4rem) 1rem;
  background: #f3f7f3;
}

.reviews-content {
  max-width: 52rem;
  margin: 0 auto;
}

.reviews-card {
  padding: clamp(1.25rem, 4vw, 2rem);
  border: 1px solid #cbd8ce;
  border-radius: 1rem;
  background: #ffffff;
}

.reviews-card + .reviews-card {
  margin-top: 1.5rem;
}

h1,
h2,
h3 {
  color: #173d24;
  overflow-wrap: anywhere;
}

h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.2;
}

h2 {
  margin-bottom: 0.75rem;
  font-size: 1.35rem;
}

h3 {
  font-size: 1.1rem;
}

.rating-summary {
  text-align: center;
}

.summary-stars {
  position: relative;
  display: inline-block;
  margin-top: 1rem;
  color: #946000;
  font-size: 2rem;
  white-space: nowrap;
}

.summary-stars-fill {
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;
}

.rating-score {
  font-size: 1.75rem;
  font-weight: 700;
}

.reviews-hint,
.review-date {
  color: #4d5d52;
  font-size: 0.9rem;
}

.rating-field {
  min-width: 0;
  margin: 1.25rem 0;
  padding: 0;
  border: 0;
}

legend,
.comment-label {
  font-weight: 600;
}

.rating-options {
  display: flex;
  gap: 0.25rem;
}

.rating-option {
  cursor: pointer;
}

.rating-star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  min-height: 2.75rem;
  color: #946000;
  font-size: 2rem;
}

.rating-option input:focus-visible + .rating-star,
textarea:focus-visible,
.reviews-button:focus-visible,
a:focus-visible {
  outline: 3px solid #2f6b3b;
  outline-offset: 3px;
}

.comment-label {
  display: block;
  margin-bottom: 0.5rem;
}

textarea {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #879b8c;
  border-radius: 0.5rem;
  color: inherit;
  resize: vertical;
}

.reviews-button {
  min-height: 3rem;
  margin-top: 1rem;
  padding: 0.6rem 1.25rem;
  border: 2px solid #2f6b3b;
  border-radius: 0.5rem;
  background: #2f6b3b;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

.reviews-button:hover {
  background: #205c2d;
}

.guest-message a {
  color: #2f6b3b;
  font-weight: 600;
}

.reviews-error {
  color: #b42318;
}

.reviews-success {
  margin-bottom: 0.75rem;
  color: #205c2d;
}

.review-list {
  padding: 0;
  list-style: none;
}

.review-item {
  padding: 1rem 0;
}

.review-item + .review-item {
  border-top: 1px solid #cbd8ce;
}

.review-stars {
  color: #946000;
  font-size: 1.4rem;
}

.review-comment {
  margin: 0.5rem 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.reviews-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
