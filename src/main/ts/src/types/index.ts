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

export interface CreateSensorRequest {
  usageType: string
  modelName: string
  serialNumber: string
  metricName?: string
  connectionType: 'MODBUS' | 'SYSTEM'
  portName?: string
  slaveId?: number
  offset?: number
  poolName?: string
}

export type ActionWithDuration = (params: { duration: number }) => void


export interface Settings {
  systemName: string
  location: string
  networkMode: "dhcp" | "static"
  ipAddress: string
  subnetMask: string
  gateway: string
  dns1: string
  dns2: string
  hostname: string
  timezone: string
  ntpServer: string
  authMethod: "oauth2" | "credentials"
  oauth2Url: string
  oauth2ClientId: string
  oauth2ClientSecret: string
  credUsername: string
  credPassword: string
  teamsEnabled: boolean
  teamsWebhook: string
  slackEnabled: boolean
  slackWebhook: string
  telegramEnabled: boolean
  telegramBotToken: string
  telegramChatId: string
  zabbixUrl: string
  zabbixApiToken: string
  zabbixHost: string
}

export type LogType = "measures" | "ph" | "status"
export type ExportFormat = "csv" | "json"

export type UserRole = "admin" | "operator"


export interface AuthUser {
  username: string
  token: string
  role: UserRole
}

export interface AppUser extends AuthUser {
  id: string
  passwordHash: string
  createdAt: string
}


export type StreamEventConfig<T = any> = {
  event: string
  queryKey: unknown[]
  updater?: (old: T | undefined, data: T) => T
}