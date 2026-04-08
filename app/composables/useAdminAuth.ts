import { ref } from 'vue'

const isAdmin = ref(false)
const adminToken = ref<string | null>(null)
const checked = ref(false)

export function useAdminAuth() {
  async function checkAdmin() {
    if (checked.value) return
    checked.value = true

    if (import.meta.server) return

    const token = useCookie('g2d_token')
    if (!token.value) return

    try {
      const config = useRuntimeConfig()
      const user = await $fetch<{ roles: string[] }>('/api/auth/me', {
        baseURL: config.public.apiBase as string,
        headers: { Authorization: `Bearer ${token.value}` },
      })
      const adminRoles = ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_EDITOR']
      if (user.roles?.some(r => adminRoles.includes(r))) {
        isAdmin.value = true
        adminToken.value = token.value
      }
    } catch {
      // Token invalid or expired — not an admin
      isAdmin.value = false
      adminToken.value = null
    }
  }

  return {
    isAdmin,
    adminToken,
    checkAdmin,
  }
}
