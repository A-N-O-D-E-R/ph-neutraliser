import { AppUser } from "../types"
import { STORAGE_KEYS } from "../utils/consts"
import { loadArrayFromStorage, saveToStorage } from "../utils/storage-helper"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
      const users = loadArrayFromStorage<AppUser>(STORAGE_KEYS.USERS, localStorage)

      if (users.length === 0) {
        const defaultUsers: AppUser[] = [
          {
            id: crypto.randomUUID(),
            username: "admin",
            passwordHash: "admin",
            role: "admin",
            createdAt: new Date().toISOString(),
          },
        ]
        saveToStorage(STORAGE_KEYS.USERS, localStorage, defaultUsers)
        return defaultUsers
      }
      return users
    },
  })
}

export function useSaveUsers() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (users: AppUser[]) => {
      saveToStorage(STORAGE_KEYS.USERS, localStorage, users)
      return users
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
