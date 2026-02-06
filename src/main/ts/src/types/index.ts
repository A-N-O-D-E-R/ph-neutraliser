export type Status =
  | 'IDLE'
  | 'NEUTRALIZING'
  | 'MANUALLY_EMPTYING_WASTE'
  | 'FORCING_EMPTYING_NEUTRALIZER'
  | 'MANUALLY_PUMPING_ACID'
  | 'MANUALLY_BULLING'

export type RunningMode = 'MANUAL' | 'AUTOMATIC'

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
