import { useSettings } from "./use-settings"
import { userApi } from "../api/client"
import { useSessionStore } from "../store/userStore"

export function useAuth() {
  const { user, setUser } = useSessionStore()
  const { data: settings, isLoading: settingsLoading } = useSettings()

  async function login(username: string, password: string): Promise<boolean> {
    if (!settings) return false

    try {
      const res = await userApi.login(username, password)
      if (res.success && res.data) {
        setUser(res.data)
        return true
      }
    } catch {
      // 401 or network error — fall through to settings fallback
    }

    // fallback credential auth (when no users exist in DB yet)
    if (
      settings.credUsername &&
      username === settings.credUsername &&
      password === settings.credPassword
    ) {
      setUser({ username, role: "admin" })
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
    isLoading: settingsLoading,
    authMethod: settings?.authMethod,
    oauth2Url: settings?.oauth2Url,
    login,
    loginOAuth2,
    logout,
  }
}
