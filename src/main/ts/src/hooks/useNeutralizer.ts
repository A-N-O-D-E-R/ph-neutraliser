import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { neutralizerApi } from '../api/client'
import type { NeutralizerConfiguration, CalibrationRequest, ManualControlRequest, UsageConnectionRequest, CreateSensorRequest, StreamEventConfig, ApiResponse, NeutralizerStatus, MeasureEvent, NeutralizerEvent } from '../types'
import { useEffect, useRef, useState } from 'react'

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: neutralizerApi.getStatus,
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

export function usePhMeasureEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['phMeasureEvents', startDate, endDate],
    queryFn: () => neutralizerApi.getPhMeasureEvents(startDate, endDate),
  })
}

export function useStatusEvents(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['statusEvents', startDate, endDate],
    queryFn: () => neutralizerApi.getStatusEvents(startDate, endDate),
  })
}

export function useComponents() {
  return useQuery({
    queryKey: ['components'],
    queryFn: neutralizerApi.getComponents,
  })
}

export function useUsages() {
  return useQuery({
    queryKey: ['usages'],
    queryFn: neutralizerApi.getUsages,
  })
}

export function useModbusConnections() {
  return useQuery({
    queryKey: ['modbusConnections'],
    queryFn: neutralizerApi.getModbusConnections,
  })
}

export function useUpdateUsageConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UsageConnectionRequest }) =>
      neutralizerApi.updateUsageConnection(id, req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usages'] }),
  })
}

export function useCreateSensor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: CreateSensorRequest) => neutralizerApi.createSensor(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usages'] }),
  })
}

export function useDeleteSensor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => neutralizerApi.deleteSensor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usages'] }),
  })
}

export function useRestartSensorMonitor() {
  return useMutation({
    mutationFn: neutralizerApi.restartSensorMonitor,
  })
}


const LIVE_TIMEOUT_MS = 30_000

export function useServerEvents() {
  const lastEventAt = useRef<number | null>(null)
  const [isLive, setIsLive] = useState(false)

  useStreamedEvents([
    {
      event: "status",
      queryKey: ["status"],
      updater: (old: ApiResponse<NeutralizerStatus>, data: NeutralizerEvent) => {
        lastEventAt.current = Date.now()
        return old?.data ? { ...old, data: { ...old.data, status: data.status, acidLevel: data.acidTankState } } : old
      },
    },
    {
      event: "ph",
      queryKey: ["status"],
      updater: (old: ApiResponse<NeutralizerStatus>, data: MeasureEvent) => {
        lastEventAt.current = Date.now()
        return old?.data ? { ...old, data: { ...old.data, currentPh: data.value } } : old
      },
    },
    {
      event: "degree",
      queryKey: ["status"],
      updater: (old: ApiResponse<NeutralizerStatus>, data: MeasureEvent) => {
        lastEventAt.current = Date.now()
        return old?.data ? { ...old, data: { ...old.data, temperature: data.value } } : old
      },
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      const live = lastEventAt.current !== null && Date.now() - lastEventAt.current < LIVE_TIMEOUT_MS
      setIsLive(live)
    }, 5_000)

    return () => clearInterval(interval)
  }, [])

  return { isLive }
}

export function useStreamedEvents(configs: StreamEventConfig[]) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const es = neutralizerApi.getEventSource()

    const handlers = configs.map(({ event, queryKey, updater }) => {
      const handler = (e: MessageEvent) => {
        const data = JSON.parse(e.data)

        queryClient.setQueryData(queryKey, (old: any) =>
          updater ? updater(old, data) : data
        )
      }

      es.addEventListener(event, handler)
      return { event, handler }
    })

    return () => {
      handlers.forEach(({ event, handler }) => {
        es.removeEventListener(event, handler)
      })
      // ❌ do NOT close (shared connection)
    }
  }, [configs, queryClient])
}


