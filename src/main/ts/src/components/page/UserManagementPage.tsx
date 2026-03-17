import * as React from "react"
import { UserForm } from "../userManagement/UserForm"
import { UserRole } from "../../types"
import { UsersCard } from "../userManagement/UserCard"
import { UserManagementHeader } from "../userManagement/UserManagementHeader"
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "../../hooks/use-users"
import { useAbility } from "../../hooks/use-ability"
import { useNavigation } from "../../hooks/use-navigation"

export function UserManagementPage() {
  const ability = useAbility()
  const { setPage } = useNavigation()
  const { data: users = [] } = useUsers()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

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
    createUser.mutate(data, { onSuccess: () => setShowForm(false) })
  }

  function handleEdit(id: string, data: { username: string; password: string; role: UserRole }) {
    updateUser.mutate(
      { id, username: data.username, role: data.role, ...(data.password ? { password: data.password } : {}) },
      { onSuccess: () => setEditingId(null) }
    )
  }

  function handleDelete(id: string) {
    deleteUser.mutate(id, { onSuccess: () => setDeleteConfirmId(null) })
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
