import { defineStore } from "pinia"
import { computed, ref } from "vue"

export type UserRole = 'admin' | 'user'

export const useAuthStore = defineStore('auth', () => {
  const role = ref<UserRole>('admin')
  const isAdmin = computed(() => role.value === 'admin')
  function setRole(newRole:UserRole) {
    role.value = newRole
  }

  return {
    role,
    isAdmin,
    setRole
  }
})
