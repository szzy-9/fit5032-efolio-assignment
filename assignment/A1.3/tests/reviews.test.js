import assert from 'node:assert/strict'
import { beforeEach, test } from 'node:test'

function createStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
  }
}

Object.defineProperty(globalThis, 'localStorage', { value: createStorage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: createStorage(), configurable: true })

const auth = await import('../src/services/auth.js')
// Import inside each test so missing review functionality produces individual failures.
const loadReviews = () => import('../src/services/reviews.js')
const reviewsKey = 'greenlink.reviews'
const may = {
  name: 'May',
  email: 'may@example.com',
  password: 'GreenLink1',
  confirmPassword: 'GreenLink1',
  role: 'user',
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  auth.logout()
})

test('guests can read an empty review list with a finite zero aggregate', async () => {
  const reviews = await loadReviews()
  assert.deepEqual(reviews.getReviews(), [])
  assert.deepEqual(reviews.getRatingSummary([]), { average: 0, count: 0 })
  assert.equal(localStorage.getItem(reviewsKey), null)
})

test('guests cannot submit even when a user identity is supplied', async () => {
  const reviews = await loadReviews()
  assert.throws(
    () => reviews.saveReview({ rating: 5, comment: 'Great', userId: 'forged', userName: 'Admin' }),
    { name: 'ReviewError' },
  )
  assert.equal(localStorage.getItem(reviewsKey), null)
})

test('a user review stores the required fields with identity from the authenticated account', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  const user = await auth.login(may)
  const saved = reviews.saveReview({
    rating: 5,
    comment: '  Very useful.  ',
    userId: 'another-user',
    userName: 'Admin',
    id: 'forged-id',
    createdAt: '2000-01-01T00:00:00.000Z',
  })
  assert.deepEqual(Object.keys(saved).sort(), [
    'comment',
    'createdAt',
    'id',
    'rating',
    'userId',
    'userName',
  ])
  assert.equal(saved.userId, user.id)
  assert.equal(saved.userName, 'May')
  assert.equal(saved.rating, 5)
  assert.equal(saved.comment, 'Very useful.')
  assert.notEqual(saved.id, 'forged-id')
  assert.notEqual(saved.createdAt, '2000-01-01T00:00:00.000Z')
  assert.ok(Number.isFinite(Date.parse(saved.createdAt)))
  assert.deepEqual(JSON.parse(localStorage.getItem(reviewsKey)), [saved])
  auth.logout()
  assert.deepEqual(reviews.getReviews(), [saved])
  const reloaded = await import('../src/services/reviews.js?reload')
  assert.deepEqual(reloaded.getReviews(), [saved])
})

test('user and admin ratings aggregate to 4.5 and updating a review keeps the count at two', async () => {
  const reviews = await loadReviews()
  const admin = await auth.registerUser({
    ...may,
    name: 'Test Admin',
    email: 'test-admin@example.com',
    role: 'admin',
    adminCode: 'GREENLINK-ADMIN-2026',
  })
  assert.equal(admin.role, 'admin')
  await auth.registerUser(may)
  assert.equal((await auth.login(may)).role, 'user')
  const first = reviews.saveReview({ rating: 5, comment: 'Very useful.' })
  await auth.login({ email: 'test-admin@example.com', password: may.password })
  const adminReview = reviews.saveReview({ rating: 4, comment: 'Clear information.' })
  assert.deepEqual(reviews.getRatingSummary(reviews.getReviews()), { average: 4.5, count: 2 })

  await auth.login(may)
  const updated = reviews.saveReview({ rating: 1, comment: 'Updated feedback.' })
  assert.equal(updated.id, first.id)
  assert.equal(updated.createdAt, first.createdAt)
  const stored = reviews.getReviews()
  assert.equal(stored.length, 2)
  assert.equal(stored.find((review) => review.userId === first.userId).comment, 'Updated feedback.')
  assert.deepEqual(
    stored.find((review) => review.userId === adminReview.userId),
    adminReview,
  )
  assert.deepEqual(reviews.getRatingSummary(stored), { average: 2.5, count: 2 })
  reviews.saveReview({ rating: 1, comment: 'Updated feedback.' })
  assert.equal(reviews.getReviews().length, 2)
})

test('rating aggregation uses every review and does not round individual scores', async () => {
  const reviews = await loadReviews()
  assert.deepEqual(reviews.getRatingSummary([{ rating: 1 }, { rating: 4 }, { rating: 5 }]), {
    average: 10 / 3,
    count: 3,
  })
  assert.deepEqual(reviews.getRatingSummary([{ rating: 5 }]), { average: 5, count: 1 })
})

test('only whole-number ratings from one to five can be saved', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  for (const rating of [0, 6, -1, 4.5, '5', null, undefined, NaN, Infinity]) {
    assert.ok(reviews.validateReview({ rating, comment: '' }).rating)
    assert.throws(() => reviews.saveReview({ rating, comment: '' }), {
      name: 'ReviewError',
      field: 'rating',
    })
  }
  assert.equal(localStorage.getItem(reviewsKey), null)
  for (const rating of [1, 2, 3, 4, 5]) {
    assert.deepEqual(reviews.validateReview({ rating, comment: '' }), {})
    reviews.saveReview({ rating, comment: '' })
  }
  assert.equal(reviews.getReviews().length, 1)
})

test('comments are trimmed optional text of at most 300 characters', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  assert.equal(reviews.saveReview({ rating: 4 }).comment, '')
  assert.equal(reviews.saveReview({ rating: 4, comment: ' ' }).comment, '')
  assert.equal(
    reviews.saveReview({ rating: 4, comment: `  ${'x'.repeat(300)}  ` }).comment.length,
    300,
  )
  const stored = localStorage.getItem(reviewsKey)
  for (const comment of [null, {}, 'x'.repeat(301)]) {
    assert.ok(reviews.validateReview({ rating: 4, comment }).comment)
    assert.throws(() => reviews.saveReview({ rating: 4, comment }), {
      name: 'ReviewError',
      field: 'comment',
    })
    assert.equal(localStorage.getItem(reviewsKey), stored)
  }
})

test('older long reviews stay readable and can be shortened without losing other reviews', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  const original = reviews.saveReview({ rating: 4, comment: 'Original.' })
  const legacy = { ...original, comment: 'x'.repeat(1000) }
  localStorage.setItem(reviewsKey, JSON.stringify([legacy]))
  assert.deepEqual(reviews.getReviews(), [legacy])
  assert.throws(() => reviews.saveReview({ rating: 4, comment: legacy.comment }), {
    name: 'ReviewError',
    field: 'comment',
  })
  assert.deepEqual(reviews.getReviews(), [legacy])
  reviews.saveReview({ rating: 5, comment: '  Shorter review.  ' })
  assert.deepEqual(reviews.getReviews(), [{ ...original, rating: 5, comment: 'Shorter review.' }])
})

test('submission rechecks the session and rejects a deleted account', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  localStorage.setItem('greenlink.users', '[]')
  assert.throws(() => reviews.saveReview({ rating: 5, comment: '' }), { name: 'ReviewError' })
  assert.equal(localStorage.getItem(reviewsKey), null)
})

test('unreadable or invalid stored reviews are never silently overwritten', async () => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  const valid = reviews.saveReview({ rating: 5, comment: 'Keep this review.' })
  for (const stored of [
    'broken json',
    '{}',
    '[null]',
    JSON.stringify([{ ...valid, rating: 6 }]),
    JSON.stringify([{ ...valid, createdAt: 'invalid date' }]),
    JSON.stringify([valid, { ...valid, id: 'duplicate-user-review' }]),
  ]) {
    localStorage.setItem(reviewsKey, stored)
    assert.throws(() => reviews.getReviews(), { name: 'ReviewError' })
    assert.throws(() => reviews.saveReview({ rating: 4, comment: 'New' }), { name: 'ReviewError' })
    assert.equal(localStorage.getItem(reviewsKey), stored)
  }
})

test('storage write failures report an error and preserve the previous review', async (t) => {
  const reviews = await loadReviews()
  await auth.registerUser(may)
  await auth.login(may)
  reviews.saveReview({ rating: 4, comment: 'Saved.' })
  const stored = localStorage.getItem(reviewsKey)
  t.mock.method(localStorage, 'setItem', () => {
    throw new Error('Storage full')
  })
  assert.throws(() => reviews.saveReview({ rating: 5, comment: 'Not saved.' }), {
    name: 'ReviewError',
  })
  assert.equal(localStorage.getItem(reviewsKey), stored)
})
