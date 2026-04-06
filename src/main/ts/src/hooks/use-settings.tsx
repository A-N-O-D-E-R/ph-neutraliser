import { Settings } from "../types"
import { DEFAULT_SETTINGS } from "../utils/consts"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "../api/client"

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await settingsApi.get()
      return res.data ?? DEFAULT_SETTINGS
    },
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (settings: Settings) => settingsApi.save(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}
