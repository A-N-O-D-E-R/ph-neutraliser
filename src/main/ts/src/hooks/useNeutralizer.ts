import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { neutralizerApi } from '../api/client'
import type { NeutralizerConfiguration, CalibrationRequest, ManualControlRequest } from '../types'

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: neutralizerApi.getStatus,
    refetchInterval: 2000,
  })
}

export function useConfiguration() {
  return useQuery({
    queryKey: ['configuration'],
    queryFn: neutralizerApi.getConfiguration,
  })
}

export function useUpdateConfiguration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: NeutralizerConfiguration) =>
      neutralizerApi.updateConfiguration(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration'] })
      queryClient.invalidateQueries({ queryKey: ['status'] })
    },
  })
}

export function useStartAutomatic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: neutralizerApi.startAutomatic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useStopAutomatic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: neutralizerApi.stopAutomatic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useTriggerNeutralization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: neutralizerApi.triggerNeutralization,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useEmptyTank1() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ManualControlRequest) => neutralizerApi.emptyTank1(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useEmptyTank2() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ManualControlRequest) => neutralizerApi.emptyTank2(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useEmptyNeutralizer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ManualControlRequest) => neutralizerApi.emptyNeutralizer(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useActivateAcidPump() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ManualControlRequest) => neutralizerApi.activateAcidPump(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useActivateAgitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: ManualControlRequest) => neutralizerApi.activateAgitation(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  })
}

export function useCalibratePh() {
  return useMutation({
    mutationFn: (req: CalibrationRequest) => neutralizerApi.calibratePh(req),
  })
}

export function useHardwareStatus() {
  return useQuery({
    queryKey: ['hardware'],
    queryFn: neutralizerApi.getHardwareStatus,
    refetchInterval: 5000,
  })
}

export function useSynchronizeTime() {
  return useMutation({
    mutationFn: neutralizerApi.synchronizeTime,
  })
}

export function useMeasureEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['measureEvents', startDate, endDate],
    queryFn: () => neutralizerApi.getMeasureEvents(startDate, endDate),
  })
}

export function useStatusEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['statusEvents', startDate, endDate],
    queryFn: () => neutralizerApi.getStatusEvents(startDate, endDate),
  })
}
