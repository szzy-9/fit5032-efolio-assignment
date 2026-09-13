import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'

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

let vite
let auth
let reviews
let ReviewsView
let VolunteerForm
let router

before(async () => {
  vite = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    configFile: false,
    plugins: [vue()],
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  })
  auth = await vite.ssrLoadModule('/src/services/auth.js')
  reviews = await vite.ssrLoadModule('/src/services/reviews.js')
  ReviewsView = (await vite.ssrLoadModule('/src/views/ReviewsView.vue')).default
  VolunteerForm = (await vite.ssrLoadModule('/src/components/VolunteerForm.vue')).default
  router = createRouter({
    history: createMemoryHistory(),
    routes: ['home', 'login', 'register'].map((name) => ({
      name,
      path: name === 'home' ? '/' : `/${name}`,
      component: { render: () => null },
    })),
  })
  await router.push('/')
  await router.isReady()
})

after(async () => {
  await vite?.close()
})

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  auth.logout()
})

async function renderRegistration(prepare = () => {}) {
  const RegisterView = (await vite.ssrLoadModule('/src/views/RegisterView.vue')).default
  let state
  const html = await renderToString(
    createSSRApp({
      ...RegisterView,
      async setup(props, context) {
        state = RegisterView.setup(props, context)
        await prepare(state)
        return state
      },
    }).use(router),
  )
  return { html, state }
}

test('registration defaults to User with a labelled account type control and no admin code input', async () => {
  const { html, state } = await renderRegistration()
  assert.equal(state.form.role, 'user')
  assert.match(html, /<label[^>]*for="register-role"[^>]*>Account Type<\/label>/)
  assert.match(html, /<select\b[^>]*id="register-role"[^>]*required/)
  assert.match(html, /<option\b[^>]*value="user"[^>]*selected[^>]*>User<\/option>/)
  assert.match(html, /<option\b[^>]*value="admin"[^>]*>Admin<\/option>/)
  assert.ok(!html.includes('register-admin-code'))
  assert.ok(!html.includes('GREENLINK-ADMIN-2026'))
})

test('admin selection shows a required password-style code input and its inline validation error', async () => {
  const { html, state } = await renderRegistration((state) => {
    state.form.role = 'admin'
    state.form.adminCode = 'incorrect'
    state.submitted.value = true
  })
  assert.equal(state.errors.value.adminCode, 'Invalid admin code.')
  assert.match(html, /<label[^>]*for="register-admin-code"[^>]*>Admin Code<\/label>/)
  const input = html.match(/<input\b[^>]*id="register-admin-code"[^>]*>/)?.[0]
  assert.ok(input?.includes('type="password"'))
  assert.ok(input.includes('required'))
  assert.ok(input.includes('aria-invalid="true"'))
  assert.ok(input.includes('aria-describedby="register-admin-code-error"'))
  assert.match(html, /<p\b[^>]*id="register-admin-code-error"[^>]*>\s*Invalid admin code\.\s*<\/p>/)
  assert.ok(!html.includes('GREENLINK-ADMIN-2026'))
})

test('the registration form submits the selected role and code and clears secrets on success', async () => {
  for (const [role, adminCode] of [
    ['user', 'ignored'],
    ['admin', 'GREENLINK-ADMIN-2026'],
  ]) {
    const { state } = await renderRegistration(async (state) => {
      Object.assign(state.form, {
        name: 'Test Account',
        email: `${role}@example.com`,
        password: 'GreenLink1',
        confirmPassword: 'GreenLink1',
        role,
        adminCode,
      })
      await state.handleSubmit()
    })
    assert.equal(state.success.value, true)
    assert.equal(state.form.password, '')
    assert.equal(state.form.confirmPassword, '')
    assert.equal(state.form.adminCode, '')
    assert.equal(
      (await auth.login({ email: `${role}@example.com`, password: 'GreenLink1' })).role,
      role,
    )
  }
})

test('switching back to User ignores an invalid admin code and hides its input and error', async () => {
  const { html, state } = await renderRegistration((state) => {
    state.form.role = 'admin'
    state.form.adminCode = 'incorrect'
    state.submitted.value = true
    state.form.role = 'user'
  })
  assert.equal(state.errors.value.adminCode, undefined)
  assert.ok(!html.includes('register-admin-code'))
  assert.ok(!html.includes('Invalid admin code.'))
})

test('the hero keeps its card and actions inside an inner layout container', async () => {
  const HeroSection = (await vite.ssrLoadModule('/src/components/HeroSection.vue')).default
  const html = await renderToString(createSSRApp(HeroSection))
  assert.match(
    html,
    /<section\b[^>]*class="hero"[^>]*>\s*<div\b[^>]*class="hero__inner"[^>]*>\s*<div\b[^>]*class="hero__content"/,
  )
  assert.match(html, /<h1\b[^>]*id="hero-title"/)
  assert.match(html, /href="#opportunities"[^>]*>\s*Explore Opportunities/)
  assert.match(html, /href="#volunteer"[^>]*>Get Involved/)
})

test('review authors and attack strings render as text for members and guests, including in the edit field', async () => {
  const details = {
    name: '<img src=x onerror=alert(1)>',
    email: 'xss-test@example.com',
    role: 'user',
    password: 'GreenLink1',
    confirmPassword: 'GreenLink1',
  }
  await auth.registerUser(details)
  await auth.login(details)
  const comment =
    '</textarea><script>alert(1)</script><svg onload=alert(1)><img src=x onerror=alert(1)>'
  reviews.saveReview({ rating: 5, comment })
  const stored = reviews.getReviews()[0]
  assert.equal(stored.comment, comment)
  for (const loggedIn of [true, false]) {
    if (!loggedIn) auth.logout()
    const html = await renderToString(createSSRApp(ReviewsView).use(router))
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
    assert.ok(html.includes('&lt;/textarea&gt;&lt;script&gt;alert(1)&lt;/script&gt;'))
    assert.ok(!/<(?:script|img|svg)\b/i.test(html))
    assert.equal((html.match(/<textarea\b/g) ?? []).length, loggedIn ? 1 : 0)
  }
})

test('volunteer submissions enforce free-text lengths and trim accepted fields', async () => {
  let state
  // Capture the actual component setup while Vue supplies its normal rendering context.
  await renderToString(
    createSSRApp({
      ...VolunteerForm,
      setup(props, context) {
        state = VolunteerForm.setup(props, context)
        return state
      },
    }),
  )
  const valid = {
    fullName: `  ${'x'.repeat(80)}  `,
    email: '  MAY@EXAMPLE.COM  ',
    suburb: `  ${'y'.repeat(80)}  `,
    postcode: ' 3000 ',
    preferredActivity: 'tree-planting',
  }
  for (const [field, invalid] of [
    ['fullName', 'x'.repeat(81)],
    ['suburb', 'y'.repeat(81)],
    ['email', `${'a'.repeat(250)}@example.com`],
  ]) {
    Object.assign(state.form, valid, { [field]: invalid })
    state.handleSubmit()
    assert.equal(state.submissionSuccess.value, false, `${field} should reject overlong input`)
    assert.ok(state.errors[field])
  }
  Object.assign(state.form, valid)
  state.handleSubmit()
  assert.equal(state.submissionSuccess.value, true)
  assert.equal(state.form.fullName, 'x'.repeat(80))
  assert.equal(state.form.email, 'may@example.com')
  assert.equal(state.form.suburb, 'y'.repeat(80))
  assert.equal(state.form.postcode, '3000')
})

test('rendered name, email, comment and search controls expose their length limits', async () => {
  for (const [path, props, fields] of [
    ['/src/views/RegisterView.vue', {}, { 'register-name': 80, 'register-email': 254 }],
    [
      '/src/components/VolunteerForm.vue',
      {},
      { 'full-name': 80, email: 254, suburb: 80, postcode: 4 },
    ],
    ['/src/components/OpportunityList.vue', { opportunities: [] }, { 'opportunity-search': 100 }],
  ]) {
    const component = (await vite.ssrLoadModule(path)).default
    const html = await renderToString(createSSRApp(component, props).use(router))
    for (const [id, limit] of Object.entries(fields)) {
      const tag = [...html.matchAll(/<input\b[^>]*>/g)].find(([input]) =>
        input.includes(`id="${id}"`),
      )?.[0]
      assert.ok(tag?.includes(`maxlength="${limit}"`), `Missing length limit for ${id}`)
    }
  }
  const details = {
    name: 'Test User',
    email: 'security-test@example.com',
    role: 'user',
    password: 'GreenLink1',
    confirmPassword: 'GreenLink1',
  }
  await auth.registerUser(details)
  await auth.login(details)
  const html = await renderToString(createSSRApp(ReviewsView).use(router))
  assert.match(html, /<textarea\b[^>]*maxlength="300"/)
  assert.match(html, /Up to 300 characters/)
})

test('the login input does not truncate email credentials accepted by previous versions', async () => {
  const LoginView = (await vite.ssrLoadModule('/src/views/LoginView.vue')).default
  const html = await renderToString(createSSRApp(LoginView).use(router))
  const emailInput = [...html.matchAll(/<input\b[^>]*>/g)].find(([input]) =>
    input.includes('id="login-email"'),
  )?.[0]
  assert.ok(emailInput)
  assert.ok(!emailInput.includes('maxlength='))
})
