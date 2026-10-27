import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'user'

interface AuthUser {
  username: string
  role: UserRole
}

interface LoginResult {
  success: boolean
  message?: string
}

const SESSION_STORAGE_KEY = 'eksim-insight:auth-session:v1'
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false'

const DEMO_ACCOUNTS: Record<string, { password: string; role: UserRole }> = {
  admin: { password: 'admin123', role: 'admin' },
  user: { password: 'user123', role: 'user' },
}

function readStoredUser(): AuthUser | null {
  if (!AUTH_ENABLED) return { username: 'development', role: 'admin' }

  const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!storedSession) return null

  try {
    const parsedSession: unknown = JSON.parse(storedSession)

    if (
      typeof parsedSession === 'object' &&
      parsedSession !== null &&
      'username' in parsedSession &&
      'role' in parsedSession &&
      typeof parsedSession.username === 'string' &&
      (parsedSession.role === 'admin' || parsedSession.role === 'user')
    ) {
      return {
        username: parsedSession.username,
        role: parsedSession.role,
      }
    }
  } catch (error) {
    console.warn('Sesi login sementara tidak dapat dibaca.', error)
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
  return null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(readStoredUser())
  const role = computed<UserRole>(() => user.value?.role ?? 'user')
  const isAdmin = computed(() => role.value === 'admin')
  const isAuthenticated = computed(() => !AUTH_ENABLED || user.value !== null)

  function persistUser(): void {
    if (!user.value || !AUTH_ENABLED) return

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user.value))
  }

  function setRole(newRole: UserRole): void {
    if (!user.value) return

    user.value = { ...user.value, role: newRole }
    persistUser()
  }

  function login(username: string, password: string): LoginResult {
    const normalizedUsername = username.trim().toLowerCase()
    const account = DEMO_ACCOUNTS[normalizedUsername]

    if (!account || account.password !== password) {
      return {
        success: false,
        message: 'Username atau kata sandi tidak sesuai.',
      }
    }

    user.value = { username: normalizedUsername, role: account.role }
    persistUser()

    return { success: true }
  }

  function logout(): void {
    user.value = null
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  return {
    authEnabled: AUTH_ENABLED,
    user,
    role,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    setRole,
  }
})
