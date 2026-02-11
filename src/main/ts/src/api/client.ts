import ky from 'ky'
import type {
  NeutralizerStatus,
  NeutralizerConfiguration,
  HardwareStatus,
  CalibrationRequest,
  ManualControlRequest,
  ApiResponse,
} from '../types'


const api = ky.create({
  prefixUrl: `/api`,
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
  startAutomatic: () => api.post('control/mode/automatic').json<void>(),

  stopAutomatic: () => api.post('control/mode/manual').json<void>(),

  // Manual controls
  triggerNeutralization: () => api.post('control/neutralize').json<void>(),

  emptyTank1: (req: ManualControlRequest) =>
    api.post('control/manual/empty-tank1', { json: req }).json<void>(),

  emptyTank2: (req: ManualControlRequest) =>
    api.post('control/manual/empty-tank2', { json: req }).json<void>(),

  emptyNeutralizer: (req: ManualControlRequest) =>
    api.post('control/manual/empty-neutralizer', { json: req }).json<void>(),

  activateAcidPump: (req: ManualControlRequest) =>
    api.post('control/manual/acid-pump', { json: req }).json<void>(),

  activateAgitation: (req: ManualControlRequest) =>
    api.post('control/manual/agitation', { json: req }).json<void>(),

  // Calibration
  calibratePh: (req: CalibrationRequest) =>
    api.post('control/calibrate', { json: req }).json<void>(),

  // Hardware
  getHardwareStatus: () => api.get('control/hardware').json<ApiResponse<HardwareStatus>>(),

  synchronizeTime: () => api.post('control/sync-time').json<void>(),
}
