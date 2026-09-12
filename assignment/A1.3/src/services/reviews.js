import { refreshSession } from './auth.js'

const REVIEWS_KEY = 'greenlink.reviews'

export class ReviewError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ReviewError'
    this.field = field
  }
}

export function validateReview({ rating, comment = '' }) {
  const errors = {}
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Please select a rating from 1 to 5 stars.'
  }
  if (typeof comment !== 'string' || comment.length > 1000) {
    errors.comment = 'Please keep your comment within 1000 characters.'
  }
  return errors
}

function isStoredReview(review) {
  return (
    review &&
    ['id', 'userId', 'userName', 'createdAt'].every(
      (field) => typeof review[field] === 'string' && review[field].trim(),
    ) &&
    typeof review.comment === 'string' &&
    Number.isFinite(Date.parse(review.createdAt)) &&
    Object.keys(validateReview(review)).length === 0
  )
}

export function getReviews() {
  try {
    const stored = localStorage.getItem(REVIEWS_KEY)
    if (stored === null) return []
    const reviews = JSON.parse(stored)
    if (
      !Array.isArray(reviews) ||
      !reviews.every(isStoredReview) ||
      new Set(reviews.map((review) => review.id)).size !== reviews.length ||
      new Set(reviews.map((review) => review.userId)).size !== reviews.length
    ) {
      throw new Error('Invalid review data')
    }
    return reviews
  } catch {
    // Preserve unreadable data instead of silently replacing the community's reviews.
    throw new ReviewError(
      'Unable to read reviews. Please check your browser storage and try again.',
    )
  }
}

export function getRatingSummary(reviews) {
  const count = reviews.length
  const total = reviews.reduce((sum, review) => sum + review.rating, 0)
  return { average: count ? total / count : 0, count }
}

export function saveReview(details) {
  const user = refreshSession()
  if (!user) throw new ReviewError('Please log in to submit a review.')
  const firstError = Object.entries(validateReview(details))[0]
  if (firstError) throw new ReviewError(firstError[1], firstError[0])

  const reviews = getReviews()
  const index = reviews.findIndex((review) => review.userId === user.id)
  const previous = reviews[index]
  const review = {
    id: previous?.id ?? crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    rating: details.rating,
    comment: (details.comment ?? '').trim(),
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  }
  if (index === -1) reviews.push(review)
  else reviews[index] = review

  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
  } catch {
    throw new ReviewError('Unable to save your review. Please allow browser storage and try again.')
  }
  return review
}
