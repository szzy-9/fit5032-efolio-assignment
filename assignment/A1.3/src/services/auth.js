import { readonly, ref } from 'vue'

const USERS_KEY = 'greenlink.users'
const SESSION_KEY = 'greenlink.currentUser'
const PBKDF2_ITERATIONS = 600000
const ADMIN_CODE = 'GREENLINK-ADMIN-2026'

export class AuthError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'AuthError'
    this.field = field
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (typeof password !== 'string' || !password) errors.password = 'Password is required.'
  return errors
}

export function validateRegistration({ name, email, password, confirmPassword, role, adminCode }) {
  const errors = validateLogin({ email, password })
  // Apply new account limits at registration so existing credentials remain usable.
  if (typeof email === 'string' && email.trim().length > 254) {
    errors.email = 'Email must be 254 characters or fewer.'
  }
  if (typeof name !== 'string' || !name.trim()) {
    errors.name = 'Full name is required.'
  } else if (name.trim().length > 80) {
    errors.name = 'Full name must be 80 characters or fewer.'
  }
  if (typeof password === 'string' && password) {
    const missing = []
    if (password.length < 8) missing.push('at least 8 characters')
    if (!/[A-Z]/.test(password)) missing.push('an uppercase letter')
    if (!/[a-z]/.test(password)) missing.push('a lowercase letter')
    if (!/[0-9]/.test(password)) missing.push('a number')
    if (missing.length) errors.password = `Password must contain ${missing.join(', ')}.`
  }
  if (typeof confirmPassword !== 'string' || !confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords must match.'
  }
  if (role === undefined || role === null || role === '') {
    errors.role = 'Account type is required.'
  } else if (!['user', 'admin'].includes(role)) {
    errors.role = 'Please select User or Admin.'
  }
  if (role === 'admin') {
    if (
      adminCode === undefined ||
      adminCode === null ||
      (typeof adminCode === 'string' && !adminCode.trim())
    ) {
      errors.adminCode = 'Admin code is required.'
    } else if (adminCode !== ADMIN_CODE) {
      errors.adminCode = 'Invalid admin code.'
    }
  }
  return errors
}

function requireValid(errors) {
  const firstError = Object.entries(errors)[0]
  if (firstError) throw new AuthError(firstError[1], firstError[0])
}

function hasSafeFields(user) {
  return (
    user &&
    ['user', 'admin'].includes(user.role) &&
    ['id', 'name', 'email', 'role'].every(
      (field) => typeof user[field] === 'string' && user[field].trim(),
    )
  )
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

function readUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY)
    if (stored === null) return []
    const users = JSON.parse(stored)
    if (
      !Array.isArray(users) ||
      !users.every(
        (user) =>
          hasSafeFields(user) &&
          /^[0-9a-f]{64}$/.test(user.passwordHash) &&
          /^[0-9a-f]{32}$/.test(user.salt),
      )
    ) {
      throw new Error('Invalid account data')
    }
    return users
  } catch {
    // Do not replace unreadable account data with an empty array and lose existing users.
    throw new AuthError(
      'Unable to read registered accounts. Please check your browser storage and try again.',
    )
  }
}

function restoreSession() {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === null) return null
    const user = JSON.parse(stored)
    if (!hasSafeFields(user)) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    // Resolve the role from the account, never from the cached session alone.
    const account = readUsers().find(
      (account) => account.id === user.id && account.email === user.email,
    )
    if (!account) {
      sessionStorage.removeItem(SESSION_KEY)
      return null
    }
    const session = safeUser(account)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  } catch {
    return null
  }
}

const sessionUser = ref(restoreSession())
export const currentUser = readonly(sessionUser)

export function getCurrentUser() {
  return currentUser.value
}

export function isAdmin() {
  return getCurrentUser()?.role === 'admin'
}

export function refreshSession() {
  sessionUser.value = restoreSession()
  return sessionUser.value
}

export function getRegisteredUsers() {
  refreshSession()
  if (!isAdmin()) {
    throw new AuthError('Only administrators can view registered users.')
  }
  return readUsers().map(safeUser)
}

function requireWebCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new AuthError(
      'Authentication requires a secure connection. Please open this app on localhost or HTTPS.',
    )
  }
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password, salt) {
  requireWebCrypto()
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: Uint8Array.from(salt.match(/.{2}/g), (byte) => Number.parseInt(byte, 16)),
      iterations: PBKDF2_ITERATIONS,
    },
    key,
    256,
  )
  return toHex(new Uint8Array(bits))
}

function requireUniqueEmail(users, email) {
  if (users.some((user) => normalizeEmail(user.email) === email)) {
    throw new AuthError('An account with this email already exists. Please log in.', 'email')
  }
}

export async function registerUser(details) {
  // Keep the validated values stable while password hashing is in progress.
  details = { ...details }
  requireValid(validateRegistration(details))
  const email = normalizeEmail(details.email)
  requireUniqueEmail(readUsers(), email)
  requireWebCrypto()
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const passwordHash = await hashPassword(details.password, salt)

  // Re-read after hashing so overlapping submissions see newly registered accounts.
  const users = readUsers()
  requireUniqueEmail(users, email)
  const user = {
    id: crypto.randomUUID(),
    name: details.name.trim(),
    email,
    passwordHash,
    salt,
    role: details.role,
  }
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]))
  } catch {
    throw new AuthError('Unable to save your account. Please allow browser storage and try again.')
  }
  return safeUser(user)
}

export async function login({ email, password }) {
  requireValid(validateLogin({ email, password }))
  const user = readUsers().find(
    (account) => normalizeEmail(account.email) === normalizeEmail(email),
  )
  // Also derive a hash for unknown emails before returning the same credential error.
  const passwordHash = await hashPassword(
    password,
    user?.salt ?? '00000000000000000000000000000000',
  )
  if (!user || passwordHash !== user.passwordHash) {
    throw new AuthError('Invalid email or password')
  }
  const session = safeUser(user)
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    throw new AuthError('Unable to start your session. Please allow browser storage and try again.')
  }
  sessionUser.value = session
  return session
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    throw new AuthError('Unable to clear your session. Please allow browser storage and try again.')
  }
  sessionUser.value = null
}
