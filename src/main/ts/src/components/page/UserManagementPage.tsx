import * as React from "react"
import { UserForm } from "../userManagement/UserForm"
import { AppUser, UserRole } from "../../types"
import { UsersCard } from "../userManagement/UserCard"
import { UserManagementHeader } from "../userManagement/UserManagementHeader"

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
      <UserManagementHeader
        showForm={showForm}
        setShowForm={setShowForm}
        setEditingId={setEditingId}
      />
      {showForm && (
        <UserForm
          existingUsernames={existingUsernames}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}
      <UsersCard
        users={users}
        editingId={editingId}
        deleteConfirmId={deleteConfirmId}
        existingUsernames={existingUsernames}
        setEditingId={setEditingId}
        setDeleteConfirmId={setDeleteConfirmId}
        setShowForm={setShowForm}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  )
}
