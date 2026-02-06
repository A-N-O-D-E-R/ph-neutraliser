import ky from 'ky'
import type {
  NeutralizerStatus,
  NeutralizerConfiguration,
  HardwareStatus,
  CalibrationRequest,
  ManualControlRequest,
} from '../types'

const api = ky.create({
  prefixUrl: '/api',
})

export const neutralizerApi = {
  // Status
  getStatus: () => api.get('neutralizer/status').json<NeutralizerStatus>(),

  // Configuration
  getConfiguration: () =>
    api.get('neutralizer/configuration').json<NeutralizerConfiguration>(),

  updateConfiguration: (config: NeutralizerConfiguration) =>
    api.put('neutralizer/configuration', { json: config }).json<void>(),

  // Mode control
  startAutomatic: () => api.post('neutralizer/mode/automatic').json<void>(),

  stopAutomatic: () => api.post('neutralizer/mode/manual').json<void>(),

  // Manual controls
  triggerNeutralization: () => api.post('neutralizer/neutralize').json<void>(),

  emptyTank1: (req: ManualControlRequest) =>
    api.post('neutralizer/manual/empty-tank1', { json: req }).json<void>(),

  emptyTank2: (req: ManualControlRequest) =>
    api.post('neutralizer/manual/empty-tank2', { json: req }).json<void>(),

  emptyNeutralizer: (req: ManualControlRequest) =>
    api.post('neutralizer/manual/empty-neutralizer', { json: req }).json<void>(),

  activateAcidPump: (req: ManualControlRequest) =>
    api.post('neutralizer/manual/acid-pump', { json: req }).json<void>(),

  activateAgitation: (req: ManualControlRequest) =>
    api.post('neutralizer/manual/agitation', { json: req }).json<void>(),

  // Calibration
  calibratePh: (req: CalibrationRequest) =>
    api.post('neutralizer/calibrate', { json: req }).json<void>(),

  // Hardware
  getHardwareStatus: () => api.get('neutralizer/hardware').json<HardwareStatus>(),

  synchronizeTime: () => api.post('neutralizer/sync-time').json<void>(),
}
