import * as React from "react"
import { Users, Plus, Trash2, Pencil, Check, X, Eye, EyeOff, ShieldCheck, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"

// ---------------------------------------------------------------------------
// Types & persistence
// ---------------------------------------------------------------------------

export type UserRole = "admin" | "operator"

export interface AppUser {
  id: string
  username: string
  passwordHash: string   // stored as plain text for this local-only store
  role: UserRole
  createdAt: string
}

const STORAGE_KEY = "app-users"

function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveUsers(users: AppUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      role === "admin"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground"
    )}>
      {role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
      {role === "admin" ? "Admin" : "Operator"}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Add / Edit form
// ---------------------------------------------------------------------------

interface UserFormProps {
  initial?: AppUser
  existingUsernames: string[]
  onSave: (data: { username: string; password: string; role: UserRole }) => void
  onCancel: () => void
}

function UserForm({ initial, existingUsernames, onSave, onCancel }: UserFormProps) {
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

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function UserManagementPage() {
  const [users, setUsers] = React.useState<AppUser[]>(loadUsers)
  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  function persist(next: AppUser[]) {
    setUsers(next)
    saveUsers(next)
  }

  function handleCreate(data: { username: string; password: string; role: UserRole }) {
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      username: data.username,
      passwordHash: data.password,
      role: data.role,
      createdAt: new Date().toISOString(),
    }
    persist([...users, newUser])
    setShowForm(false)
  }

  function handleEdit(id: string, data: { username: string; password: string; role: UserRole }) {
    persist(users.map(u => u.id === id
      ? { ...u, username: data.username, role: data.role, ...(data.password ? { passwordHash: data.password } : {}) }
      : u
    ))
    setEditingId(null)
  }

  function handleDelete(id: string) {
    persist(users.filter(u => u.id !== id))
    setDeleteConfirmId(null)
  }

  const existingUsernames = users.map(u => u.username)

  return (
    <div className="space-y-6 p-6 md:p-8 lg:p-10 max-w-3xl">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage local accounts used for authentication</p>
        </div>
        {!showForm && (
          <Button size="sm" className="gap-2" onClick={() => { setShowForm(true); setEditingId(null) }}>
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        )}
      </div>

      {showForm && (
        <UserForm
          existingUsernames={existingUsernames}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Users</CardTitle>
              <CardDescription>{users.length} account{users.length !== 1 ? "s" : ""}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No users yet. Add one to get started.</p>
          )}

          {users.map(user => (
            <div key={user.id} className="space-y-2">
              {editingId === user.id ? (
                <UserForm
                  initial={user}
                  existingUsernames={existingUsernames}
                  onSave={data => handleEdit(user.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <RoleBadge role={user.role} />
                    <button
                      type="button"
                      onClick={() => { setEditingId(user.id); setShowForm(false); setDeleteConfirmId(null) }}
                      className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteConfirmId === user.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setDeleteConfirmId(user.id); setEditingId(null) }}
                        className="rounded p-1.5 text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
