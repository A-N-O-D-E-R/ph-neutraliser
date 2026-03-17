import * as React from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { LogIn } from "lucide-react"

export default function CredentialsForm({ onLogin }: { onLogin: (u: string, p: string) => Promise<boolean> }) {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const ok = await onLogin(username, password)
    setLoading(false)
    if (!ok) setError("Invalid username or password")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="username">Username</label>
        <Input
          id="username"
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="admin"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn className="h-4 w-4 mr-2" />
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}
