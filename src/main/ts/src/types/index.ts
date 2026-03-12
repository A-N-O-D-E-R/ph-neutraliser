export type Status =
  | 'IDLE'
  | 'NEUTRALIZING'
  | 'FORCING_EMPTYING_WASTE'
  | 'FORCING_EMPTYING_NEUTRALIZER'
  | 'MANUALLY_PUMPING_ACID'
  | 'MANUALLY_BULLING'

export type RunningMode = 'MANUAL' | 'AUTOMATIC'

export type StatusCardLevel = 'OK' |'INFO' | 'WARN' | 'ERROR'
export type Level = 'OK' | 'LOW' | 'FULL'

export type CalibrationPoint = 'LOW' | 'MID' | 'HIGH'

export interface NeutralizerConfiguration {
  phTarget: number
  wasteSelect: number
  emptyingTank1: number
  emptyingTank2: number
  emptyingNeutralizer: number
  idleTimeBeforeNeutralization: number
  neutralizationTimeout: number
  neutralizationPeriod: number
  acidPulseTiming: number
  acidPulsePeriod: number
  firstNeutralizationHour: number
}

export interface NeutralizerStatus {
  currentPh: number
  targetPh: number
  temperature: number
  status: Status
  runningMode: RunningMode
  acidLevel: Level
  neutralizerLevel: Level
  wasteLevel: Level
  wasteBisLevel: Level
  systemTime: string
  configuration: NeutralizerConfiguration
}

export interface HardwareStatus {
  connected: boolean
  portName: string
  baudrate: number
  slaveId: number
  relayStatus: number
  deviceTime: string
  firmwareVersion: string
}

export interface CalibrationRequest {
  point: CalibrationPoint
  phValue: number
}

export interface ManualControlRequest {
  duration: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface MeasureEvent {
  timestamp: string
  metricName: string
  value: number
  unit: string
}

export interface NeutralizerEvent {
  timestamp: string
  status: Status
  acidTankState: Level
}

export interface ComponentDto {
  id: string
  type: string
  serialNumber: string
  version: number
  modelName: string
  supplierName: string
}

export interface UsageDto {
  id: string
  name: string
  category: 'SENSOR' | 'ACTUATOR' | 'COMPUTE' | 'CLOCK'
  usageType?: string
  accessible: boolean
  version: number
  componentSerialNumber: string
  componentModelName: string
  installed?: boolean
  metricName?: string
  unit?: string
  connectionType?: 'MODBUS' | 'SYSTEM'
  portName?: string
  slaveId?: number
  offset?: number
  poolName?: string
}

export interface UsageConnectionRequest {
  portName?: string
  slaveId?: number
  offset?: number
  poolName?: string
}
