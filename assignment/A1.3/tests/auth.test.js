import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { pbkdf2Sync } from 'node:crypto'
import { beforeEach, test } from 'node:test'

// Browser storage is the only substitute: hashing uses the real Web Crypto API.
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
const usersKey = 'greenlink.users'
const sessionKey = 'greenlink.currentUser'
const registration = {
  name: 'Alex Green',
  email: 'alex@example.com',
  password: 'GreenLink1',
  confirmPassword: 'GreenLink1',
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  auth.logout()
})

test('registration reports each required field inline', () => {
  const errors = auth.validateRegistration({
    name: ' ',
    email: '',
    password: '',
    confirmPassword: '',
  })
  for (const field of ['name', 'email', 'password', 'confirmPassword']) {
    assert.ok(errors[field], `Missing validation for ${field}`)
  }
})

test('registration enforces email, each password rule, and confirmation', () => {
  const cases = [
    [{ email: 'alex@' }, 'email'],
    [{ email: 'alex example.com' }, 'email'],
    [{ password: 'Short1' }, 'password'],
    [{ password: 'lowercase1' }, 'password'],
    [{ password: 'UPPERCASE1' }, 'password'],
    [{ password: 'NoNumbers' }, 'password'],
    [{ confirmPassword: 'Different1' }, 'confirmPassword'],
  ]
  for (const [change, field] of cases) {
    assert.ok(auth.validateRegistration({ ...registration, ...change })[field])
  }
  assert.deepEqual(auth.validateRegistration(registration), {})
  assert.deepEqual(
    auth.validateRegistration({
      ...registration,
      password: 'Abcdefg1',
      confirmPassword: 'Abcdefg1',
    }),
    {},
  )
})

test('login validates email format and a required password without registration strength rules', () => {
  assert.ok(auth.validateLogin({ email: '', password: '' }).email)
  assert.ok(auth.validateLogin({ email: 'invalid', password: '' }).password)
  assert.ok(auth.validateLogin({ email: 'invalid', password: 'x' }).email)
  assert.deepEqual(auth.validateLogin({ email: 'alex@example.com', password: 'x' }), {})
})

test('invalid registrations never reach storage', async () => {
  await assert.rejects(auth.registerUser({ ...registration, password: 'weak' }))
  assert.equal(localStorage.getItem(usersKey), null)
})

test('multiple users have unique salts and PBKDF2 hashes, with no stored plaintext', async () => {
  await auth.registerUser({ ...registration, name: ' Alex Green ', email: ' ALEX@EXAMPLE.COM ' })
  await auth.registerUser({
    ...registration,
    name: 'Sam Park',
    email: 'sam@example.com',
    role: 'admin',
  })
  const users = JSON.parse(localStorage.getItem(usersKey))
  assert.equal(users.length, 2)
  assert.notEqual(users[0].id, users[1].id)
  assert.notEqual(users[0].salt, users[1].salt)
  assert.notEqual(users[0].passwordHash, users[1].passwordHash)
  assert.equal(users[0].name, 'Alex Green')
  assert.equal(users[0].email, 'alex@example.com')
  for (const user of users) {
    assert.deepEqual(Object.keys(user).sort(), [
      'email',
      'id',
      'name',
      'passwordHash',
      'role',
      'salt',
    ])
    assert.equal(user.role, 'user')
    assert.match(user.salt, /^[0-9a-f]{32}$/)
    // Independently verify the stored hash with Node's PBKDF2 implementation.
    assert.equal(
      user.passwordHash,
      pbkdf2Sync(
        registration.password,
        Buffer.from(user.salt, 'hex'),
        600000,
        32,
        'sha256',
      ).toString('hex'),
    )
  }
  assert.ok(!localStorage.getItem(usersKey).includes(registration.password))
  assert.equal(sessionStorage.getItem(sessionKey), null)
  assert.equal(auth.currentUser.value, null)
})

test('duplicate email detection ignores casing and surrounding whitespace', async () => {
  await auth.registerUser(registration)
  await assert.rejects(
    auth.registerUser({ ...registration, email: ' ALEX@EXAMPLE.COM ' }),
    (error) => error.field === 'email',
  )
  assert.equal(JSON.parse(localStorage.getItem(usersKey)).length, 1)
})

test('overlapping registrations cannot duplicate an email', async () => {
  const results = await Promise.allSettled([
    auth.registerUser(registration),
    auth.registerUser(registration),
  ])
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1)
  assert.equal(JSON.parse(localStorage.getItem(usersKey)).length, 1)
})

test('each registered account can log in and stores only safe session fields', async () => {
  await auth.registerUser(registration)
  await auth.registerUser({ ...registration, email: 'sam@example.com', name: 'Sam Park' })
  for (const [email, name] of [
    [' ALEX@EXAMPLE.COM ', 'Alex Green'],
    ['sam@example.com', 'Sam Park'],
  ]) {
    const user = await auth.login({ email, password: registration.password })
    const session = JSON.parse(sessionStorage.getItem(sessionKey))
    assert.deepEqual(Object.keys(session).sort(), ['email', 'id', 'name', 'role'])
    assert.equal(session.name, name)
    assert.deepEqual(session, user)
    assert.deepEqual(auth.currentUser.value, user)
    auth.logout()
  }
})

test('unknown emails and incorrect passwords get the same generic login error', async () => {
  await auth.registerUser(registration)
  for (const credentials of [
    { email: 'unknown@example.com', password: registration.password },
    { email: registration.email, password: 'WrongPassword1' },
  ]) {
    await assert.rejects(auth.login(credentials), { message: 'Invalid email or password' })
    assert.equal(auth.currentUser.value, null)
    assert.equal(sessionStorage.getItem(sessionKey), null)
  }
})

test('session restores after reload, and logout removes only the authentication session', async () => {
  await auth.registerUser(registration)
  const user = await auth.login(registration)
  const reloaded = await import(`../src/services/auth.js?reload=${Date.now()}`)
  assert.deepEqual(reloaded.currentUser.value, user)
  sessionStorage.setItem('unrelated', 'keep')
  reloaded.logout()
  assert.equal(reloaded.currentUser.value, null)
  assert.equal(sessionStorage.getItem(sessionKey), null)
  assert.equal(sessionStorage.getItem('unrelated'), 'keep')
  assert.equal(JSON.parse(localStorage.getItem(usersKey)).length, 1)
})

test('malformed stored accounts are not silently overwritten', async () => {
  for (const stored of ['broken json', '{}', '[null]']) {
    localStorage.setItem(usersKey, stored)
    await assert.rejects(auth.registerUser(registration))
    assert.equal(localStorage.getItem(usersKey), stored)
  }
})

test('invalid session data does not prevent the application from loading', async () => {
  for (const [index, stored] of ['broken json', '{"name":"Alex"}'].entries()) {
    sessionStorage.setItem(sessionKey, stored)
    const reloaded = await import(`../src/services/auth.js?invalid=${index}`)
    assert.equal(reloaded.currentUser.value, null)
  }
})

async function registerAdmin() {
  await auth.registerUser({ ...registration, name: 'Admin', email: 'admin@example.com' })
  const users = JSON.parse(localStorage.getItem(usersKey))
  users.find((user) => user.email === 'admin@example.com').role = 'admin'
  localStorage.setItem(usersKey, JSON.stringify(users))
}

test('guests and ordinary users cannot read the registered user list', async () => {
  assert.throws(() => auth.getRegisteredUsers(), { name: 'AuthError' })
  await auth.registerUser(registration)
  await auth.login(registration)
  assert.throws(() => auth.getRegisteredUsers(), { name: 'AuthError' })
})

test('admins can list all registered users without password hashes or salts', async () => {
  await auth.registerUser(registration)
  await registerAdmin()
  const admin = await auth.login({ email: 'admin@example.com', password: registration.password })
  assert.equal(admin.role, 'admin')
  const users = auth.getRegisteredUsers()
  assert.equal(users.length, 2)
  assert.deepEqual(
    users.map(({ name, email, role }) => ({ name, email, role })),
    [
      { name: 'Alex Green', email: 'alex@example.com', role: 'user' },
      { name: 'Admin', email: 'admin@example.com', role: 'admin' },
    ],
  )
  for (const user of users) {
    assert.deepEqual(Object.keys(user).sort(), ['email', 'id', 'name', 'role'])
  }
  auth.logout()
  assert.throws(() => auth.getRegisteredUsers(), { name: 'AuthError' })
})

test('changing only the session role cannot turn a registered user into an admin', async () => {
  await auth.registerUser(registration)
  const user = await auth.login(registration)
  sessionStorage.setItem(sessionKey, JSON.stringify({ ...user, role: 'admin' }))
  const reloaded = await import('../src/services/auth.js?tampered-role')
  assert.equal(reloaded.currentUser.value.role, 'user')
  assert.throws(() => reloaded.getRegisteredUsers(), { name: 'AuthError' })
})

test('deleted accounts and sessions with mismatched emails are not restored', async () => {
  await auth.registerUser(registration)
  const user = await auth.login(registration)
  sessionStorage.setItem(sessionKey, JSON.stringify({ ...user, email: 'someone@example.com' }))
  const mismatched = await import('../src/services/auth.js?mismatched-email')
  assert.equal(mismatched.currentUser.value, null)
  assert.equal(sessionStorage.getItem(sessionKey), null)

  sessionStorage.setItem(sessionKey, JSON.stringify(user))
  localStorage.setItem(usersKey, '[]')
  const deleted = await import('../src/services/auth.js?deleted-user')
  assert.equal(deleted.currentUser.value, null)
  assert.equal(sessionStorage.getItem(sessionKey), null)
})

test('admin list access rechecks the account role and session on every call', async () => {
  await registerAdmin()
  await auth.login({ email: 'admin@example.com', password: registration.password })
  const users = JSON.parse(localStorage.getItem(usersKey))
  users[0].role = 'user'
  localStorage.setItem(usersKey, JSON.stringify(users))
  assert.throws(() => auth.getRegisteredUsers(), { name: 'AuthError' })
  assert.equal(auth.currentUser.value.role, 'user')

  users[0].role = 'admin'
  localStorage.setItem(usersKey, JSON.stringify(users))
  sessionStorage.removeItem(sessionKey)
  assert.throws(() => auth.getRegisteredUsers(), { name: 'AuthError' })
  assert.equal(auth.currentUser.value, null)
})

test('unknown account roles fail closed', async () => {
  await auth.registerUser(registration)
  const users = JSON.parse(localStorage.getItem(usersKey))
  users[0].role = 'superadmin'
  localStorage.setItem(usersKey, JSON.stringify(users))
  await assert.rejects(auth.login(registration), { name: 'AuthError' })
  assert.equal(auth.currentUser.value, null)
})

test('admin route rejects guests and users but allows admins; public routes stay available', async () => {
  const { guardRoute } = await import('../src/router/guards.js')
  const adminRoute = { meta: { requiresAuth: true, role: 'admin' } }
  assert.deepEqual(guardRoute(adminRoute), { name: 'login' })
  assert.equal(guardRoute({ meta: {} }), true)

  await auth.registerUser(registration)
  await auth.login(registration)
  assert.deepEqual(guardRoute(adminRoute), { name: 'home' })
  assert.equal(guardRoute({ meta: {} }), true)

  await registerAdmin()
  await auth.login({ email: 'admin@example.com', password: registration.password })
  assert.equal(guardRoute(adminRoute), true)
  auth.logout()
  assert.deepEqual(guardRoute(adminRoute), { name: 'login' })
})
