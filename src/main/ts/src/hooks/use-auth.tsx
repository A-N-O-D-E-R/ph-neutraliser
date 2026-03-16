import { useSettings } from "./use-settings"
import { useUsers } from "./use-users"
import type { AuthUser } from "../types"
import { useSessionStore } from "../store/userStore"

export function useAuth() {
  const { user, setUser } = useSessionStore()
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { data: users, isLoading: usersLoading } = useUsers()

  function login(username: string, password: string): boolean {
    if (!settings) return false

    // check stored users first
    if (users && users.length > 0) {
      const match = users.find(
        (u) => u.username === username && u.passwordHash === password
      )

      if (match) {
        const authUser: AuthUser = {
          username: match.username,
          role: match.role,
        }

        setUser(authUser)
        return true
      }

      return false
    }

    // fallback credential auth
    if (
      settings.credUsername &&
      username === settings.credUsername &&
      password === settings.credPassword
    ) {
      const authUser: AuthUser = { username, role: "admin" }
      setUser(authUser)
      return true
    }

    return false
  }

  function loginOAuth2() {
    if (!settings) return

    const redirectUri = window.location.origin + window.location.pathname

    const params = new URLSearchParams({
      response_type: "code",
      client_id: settings.oauth2ClientId,
      redirect_uri: redirectUri,
    })

    window.location.href = `${settings.oauth2Url}?${params.toString()}`
  }

  function logout() {
    setUser(null)
  }

  return {
    user,
    isLoading: settingsLoading || usersLoading,
    authMethod: settings?.authMethod,
    oauth2Url: settings?.oauth2Url,
    login,
    loginOAuth2,
    logout,
  }
}