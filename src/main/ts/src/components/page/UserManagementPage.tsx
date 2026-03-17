import * as React from "react"
import { UserForm } from "../userManagement/UserForm"
import { AppUser, UserRole } from "../../types"
import { UsersCard } from "../userManagement/UserCard"
import { UserManagementHeader } from "../userManagement/UserManagementHeader"
import { useUsers, useSaveUsers } from "../../hooks/use-users"
import { useAbility } from "../../hooks/use-ability"
import { useNavigation } from "../../hooks/use-navigation"

export function UserManagementPage() {
  const ability = useAbility()
  const { setPage } = useNavigation()
  const { data: users = [] } = useUsers()
  const saveUsers = useSaveUsers()

  const [showForm, setShowForm] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!ability.can("manage", "User")) {
      setPage("dashboard")
    }
  }, [ability, setPage])

  if (!ability.can("manage", "User")) return null

  function handleCreate(data: { username: string; password: string; role: UserRole }) {
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      username: data.username,
      passwordHash: data.password,
      role: data.role,
      createdAt: new Date().toISOString(),
    }
    saveUsers.mutate([...users, newUser])
    setShowForm(false)
  }

  function handleEdit(id: string, data: { username: string; password: string; role: UserRole }) {
    saveUsers.mutate(
      users.map(u =>
        u.id === id
          ? { ...u, username: data.username, role: data.role, ...(data.password ? { passwordHash: data.password } : {}) }
          : u
      )
    )
    setEditingId(null)
  }

  function handleDelete(id: string) {
    saveUsers.mutate(users.filter(u => u.id !== id))
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
