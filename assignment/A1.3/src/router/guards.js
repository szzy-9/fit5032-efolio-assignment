import { refreshSession } from '../services/auth.js'

export function guardRoute(to) {
  const user = refreshSession()
  if (!to.meta.requiresAuth && !to.meta.role) return true
  if (!user) return { name: 'login' }
  if (to.meta.role && user.role !== to.meta.role) return { name: 'home' }
  return true
}
