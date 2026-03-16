import { AuthUser } from "../types"
import { STORAGE_KEYS } from "../utils/consts"
import { loadFromStorage, saveToStorage } from "../utils/storage-helper"
import { create } from "zustand"

interface SessionStore {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

export const useSessionStore = create<SessionStore>((set: (update: Partial<SessionStore>) => void) => ({
  user: loadFromStorage<AuthUser | null>(
    STORAGE_KEYS.SESSION,
    sessionStorage,
    null
  ),

  setUser: (user: AuthUser | null) => {
    saveToStorage(STORAGE_KEYS.SESSION, sessionStorage, user)
    set({ user })
  },
}))