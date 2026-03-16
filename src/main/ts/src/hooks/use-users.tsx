import { AppUser } from "../types";
import { STORAGE_KEYS } from "../utils/consts";
import { loadArrayFromStorage, saveToStorage } from "../utils/storage-helper";
import { useQuery } from "@tanstack/react-query";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => {
        const users = loadArrayFromStorage<AppUser>(
            STORAGE_KEYS.USERS,
            localStorage
        )

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
    }
  })
}