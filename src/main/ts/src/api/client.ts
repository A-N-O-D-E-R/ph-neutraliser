import ky from 'ky'
import type {
  NeutralizerStatus,
  NeutralizerConfiguration,
  HardwareStatus,
  CalibrationRequest,
  ManualControlRequest,
  MeasureEvent,
  NeutralizerEvent,
  ApiResponse,
  ComponentDto,
  UsageDto,
  UsageConnectionRequest,
  CreateSensorRequest,
  AppUser,
  AuthUser,
  Settings,
} from '../types'
import { useSessionStore } from '../store/userStore';

const api = ky.create({
  prefixUrl: '/api',
  hooks: {
    beforeRequest: [
      request => {
        const { user } = useSessionStore.getState();
        if (user?.token) {
          request.headers.set('Authorization', `Bearer ${user.token}`);
        }
      }
    ]
  }
});

export const neutralizerApi = {
  // Status
  getStatus: () => api.get('control/status').json<ApiResponse<NeutralizerStatus>>(),

  // Configuration
  getConfiguration: () =>
    api.get('control/configuration').json<ApiResponse<NeutralizerConfiguration>>(),

  updateConfiguration: (config: NeutralizerConfiguration) =>
    api.put('control/configuration', { json: config }).json<void>(),

  // Mode control
  startAutomatic: () => api.post('control/start').json<void>(),

  stopAutomatic: () => api.post('control/stop').json<void>(),

  // Manual controls
  triggerNeutralization: () => api.post('control/trigger').json<void>(),

  emptyTank1: (req: ManualControlRequest) =>
    api.post('control/empty-tank1', { json: req }).json<void>(),

  emptyTank2: (req: ManualControlRequest) =>
    api.post('control/empty-tank2', { json: req }).json<void>(),

  emptyNeutralizer: (req: ManualControlRequest) =>
    api.post('control/empty-neutralizer', { json: req }).json<void>(),

  activateAcidPump: (req: ManualControlRequest) =>
    api.post('control/acid-pump', { json: req }).json<void>(),

  activateAgitation: (req: ManualControlRequest) =>
    api.post('control/agitation', { json: req }).json<void>(),

  // Calibration
  calibratePh: (req: CalibrationRequest) =>
    api.post('control/calibrate', { json: req }).json<void>(),

  // Hardware
  getHardwareStatus: () => api.get('control/hardware').json<ApiResponse<HardwareStatus>>(),

  synchronizeTime: () => api.post('control/sync-time').json<void>(),

  // Events
  getMeasureEvents: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const query = params.toString()
    const res = await api.get(`events/measures${query ? `?${query}` : ''}`).json<ApiResponse<{ events: MeasureEvent[] }>>()
    return res.data?.events ?? []
  },


   getPhMeasureEvents: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const query = params.toString()
    const res = await api.get(`events/ph${query ? `?${query}` : ''}`).json<ApiResponse<{ events: MeasureEvent[] }>>()
    return res.data?.events ?? []
  },

  getStatusEvents: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const query = params.toString()
    const res = await api.get(`events/status${query ? `?${query}` : ''}`).json<ApiResponse<{ events: NeutralizerEvent[] }>>()
    return res.data?.events ?? []
  },

  getComponents: () => api.get('control/components').json<ApiResponse<ComponentDto[]>>(),

  getUsages: () => api.get('control/usages').json<ApiResponse<UsageDto[]>>(),

  getModbusConnections: () => api.get('control/modbus-connections').json<ApiResponse<string[]>>(),

  updateUsageConnection: (id: string, req: UsageConnectionRequest) =>
    api.put(`control/usages/${id}/connection`, { json: req }).json<void>(),

  createSensor: (req: CreateSensorRequest) =>
    api.post('control/usages/sensor', { json: req }).json<ApiResponse<UsageDto>>(),

  deleteSensor: (id: string) =>
    api.delete(`control/usages/${id}`).json<void>(),

  restartSensorMonitor: () =>
    api.post('control/restart-sensor-monitor').json<void>(),


  getEventSource: () => {
    const eventSource = new EventSource('/api/events/subscribe');
    return eventSource;
  }
}

export const settingsApi = {
  get: () => api.get('settings').json<ApiResponse<Settings>>(),
  save: (settings: Settings) => api.put('settings', { json: settings }).json<ApiResponse<void>>(),
}

export const userApi = {
  getAll: () => api.get('users').json<ApiResponse<AppUser[]>>(),

  create: (data: { username: string; password: string; role: string }) =>
    api.post('users', { json: data }).json<ApiResponse<AppUser>>(),

  update: (id: string, data: { username: string; password?: string; role: string }) =>
    api.put(`users/${id}`, { json: data }).json<ApiResponse<AppUser>>(),

  delete: (id: string) =>
    api.delete(`users/${id}`).json<ApiResponse<void>>(),

  login: (username: string, password: string) =>
    api.post('users/login', { json: { username, password } }).json<ApiResponse<AuthUser>>(),
}
