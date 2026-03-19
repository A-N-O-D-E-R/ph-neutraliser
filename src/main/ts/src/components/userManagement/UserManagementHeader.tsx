import { Plus } from "lucide-react"
import { Button } from "../ui/button"

type UserManagementHeaderProps = {
  showForm: boolean
  setShowForm: (v: boolean) => void
  setEditingId: (v: string | null) => void
}

export function UserManagementHeader({
  showForm,
  setShowForm,
  setEditingId,
}: UserManagementHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage local accounts used for authentication
        </p>
      </div>

      {!showForm && (
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
          }}
        >
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      )}
    </div>
  )
}