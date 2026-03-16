import { Settings } from "../types"
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../utils/consts"
import { loadFromStorage, saveToStorage } from "../utils/storage-helper"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () =>
      loadFromStorage<Settings>(
        STORAGE_KEYS.SETTINGS,
        localStorage,
        DEFAULT_SETTINGS
      ),
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (settings: Settings) => {
        saveToStorage(STORAGE_KEYS.SETTINGS, localStorage, settings)
        return settings
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}