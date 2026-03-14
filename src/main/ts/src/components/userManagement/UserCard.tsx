import { AppUser } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Users } from "lucide-react"
import UserItem from "./UserItem"

type UsersCardProps = {
  users: AppUser[]
  editingId: string | null
  deleteConfirmId: string | null
  existingUsernames: string[]
  setEditingId: (v: string | null) => void
  setDeleteConfirmId: (v: string | null) => void
  setShowForm: (v: boolean) => void
  handleEdit: (id: string, data: any) => void
  handleDelete: (id: string) => void
}

export function UsersCard({
  users,
  editingId,
  deleteConfirmId,
  existingUsernames,
  setEditingId,
  setDeleteConfirmId,
  setShowForm,
  handleEdit,
  handleDelete,
}: UsersCardProps) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>
              {users.length} account{users.length !== 1 ? "s" : ""}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-2">
        {users.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No users yet. Add one to get started.
          </p>
        )}

        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            editingId={editingId}
            deleteConfirmId={deleteConfirmId}
            existingUsernames={existingUsernames}
            setEditingId={setEditingId}
            setDeleteConfirmId={setDeleteConfirmId}
            setShowForm={setShowForm}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        ))}
      </CardContent>
    </Card>
  )
}