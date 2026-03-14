import { AppUser } from "@/types"
import { UserForm } from "./UserForm"
import { RoleBadge } from "../settings/Section"
import { Check, Pencil, Trash2, X } from "lucide-react"

type UserItemProps = {
  user: AppUser
  editingId: string | null
  deleteConfirmId: string | null
  existingUsernames: string[]
  setEditingId: (id: string | null) => void
  setDeleteConfirmId: (id: string | null) => void
  setShowForm: (v: boolean) => void
  handleEdit: (id: string, data: any) => void
  handleDelete: (id: string) => void
}

export default function UserItem({
  user,
  editingId,
  deleteConfirmId,
  existingUsernames,
  setEditingId,
  setDeleteConfirmId,
  setShowForm,
  handleEdit,
  handleDelete
}: UserItemProps) {

  if (editingId === user.id) {
    return (
      <UserForm
        initial={user}
        existingUsernames={existingUsernames}
        onSave={(data) => handleEdit(user.id, data)}
        onCancel={() => setEditingId(null)}
      />
    )
  }

  return (
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
          onClick={() => {
            setEditingId(user.id)
            setShowForm(false)
            setDeleteConfirmId(null)
          }}
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
            onClick={() => {
              setDeleteConfirmId(user.id)
              setEditingId(null)
            }}
            className="rounded p-1.5 text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}