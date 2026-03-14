import { AppUser, UserRole } from "../../types";
import React from "react";
import { PasswordInput } from "../settings/Section";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";
import { Check, ShieldCheck, User, X } from "lucide-react";
import { Button } from "../ui/button";

interface UserFormProps {
  initial?: AppUser
  existingUsernames: string[]
  onSave: (data: { username: string; password: string; role: UserRole }) => void
  onCancel: () => void
}

export function UserForm({ initial, existingUsernames, onSave, onCancel }: UserFormProps) {
  const [username, setUsername] = React.useState(initial?.username ?? "")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<UserRole>(initial?.role ?? "operator")
  const [error, setError] = React.useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) { setError("Username is required."); return }
    const conflict = existingUsernames.filter(u => u !== initial?.username).includes(trimmed)
    if (conflict) { setError("Username already exists."); return }
    if (!initial && !password) { setError("Password is required."); return }
    setError("")
    onSave({ username: trimmed, password, role })
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Username</label>
        <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Password {initial && <span className="text-muted-foreground font-normal">(leave blank to keep current)</span>}
        </label>
        <PasswordInput value={password} onChange={setPassword} placeholder="••••••••" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Role</label>
        <div className="flex gap-2">
          {(["operator", "admin"] as UserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                role === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              )}
            >
              {r === "admin" ? <ShieldCheck className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
              {r === "admin" ? "Admin" : "Operator"}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" className="gap-1.5"><Check className="h-3.5 w-3.5" />{initial ? "Update" : "Create"}</Button>
        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onCancel}><X className="h-3.5 w-3.5" />Cancel</Button>
      </div>
    </form>
  )
}