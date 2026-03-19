import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "../api/client"
import type { UserRole } from "../types"

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userApi.getAll()
      return res.data ?? []
    },
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { username: string; password: string; role: UserRole }) =>
      userApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; username: string; password?: string; role: UserRole }) =>
      userApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  })
}
