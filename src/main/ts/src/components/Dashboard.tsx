import { useState } from 'react'
import {
  useStatus,
  useStartAutomatic,
  useStopAutomatic,
  useTriggerNeutralization,
  useEmptyTank1,
  useEmptyTank2,
  useEmptyNeutralizer,
  useActivateAcidPump,
  useActivateAgitation,
  useHardwareStatus,
  useSynchronizeTime,
} from '../hooks/useNeutralizer'
import { StatusCard } from './StatusCard'

export function Dashboard() {
  const { data: status, isLoading, error } = useStatus()
  const { data: hardware } = useHardwareStatus()
  const [duration, setDuration] = useState(60)

  const startAuto = useStartAutomatic()
  const stopAuto = useStopAutomatic()
  const triggerNeutralization = useTriggerNeutralization()
  const emptyTank1 = useEmptyTank1()
  const emptyTank2 = useEmptyTank2()
  const emptyNeutralizer = useEmptyNeutralizer()
  const acidPump = useActivateAcidPump()
  const agitation = useActivateAgitation()
  const syncTime = useSynchronizeTime()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!status) return null

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>pH Neutralizer</h1>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <span style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          background: status.data?.runningMode === 'AUTOMATIC' ? '#4caf50' : '#666',
          color: 'white',
        }}>
          {status.data?.runningMode}
        </span>
        <span style={{
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          background: status.data?.status === 'IDLE' ? '#2196f3' : '#ff9800',
          color: 'white',
        }}>
          {status.data?.status}
        </span>
        {hardware && (
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            background: hardware.data?.connected ? '#4caf50' : '#f44336',
            color: 'white',
          }}>
            {hardware.data?.connected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </div>

      {/* Measurements */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <StatusCard label="Current pH" value={status.data?.currentPh?.toFixed(2)||"UNKOWN"} />
        <StatusCard label="Target pH" value={status.data?.targetPh?.toFixed(2)||"UNKOWN"} />
        <StatusCard label="Temperature" value={status?.data?.temperature?.toFixed(1)||"UNKOWN"} unit="°C" />
        <StatusCard label="Acid Level" value={status.data?.acidLevel||"UNKOWN"} level={status.data?.acidLevel} />
        <StatusCard label="Neutralizer" value={status.data?.neutralizerLevel||"UNKOWN"} level={status.data?.neutralizerLevel} />
        <StatusCard label="Waste Tank" value={status.data?.wasteLevel||"UNKOWN"} level={status.data?.wasteLevel} />
      </div>

      {/* Mode controls */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Mode Control</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => startAuto.mutate()}
            disabled={status.data?.runningMode === 'AUTOMATIC'}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Start Automatic
          </button>
          <button
            onClick={() => stopAuto.mutate()}
            disabled={status.data?.runningMode === 'MANUAL'}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Stop Automatic
          </button>
          <button
            onClick={() => triggerNeutralization.mutate()}
            style={{ padding: '0.75rem 1.5rem', background: '#ff9800', color: 'white', border: 'none' }}
          >
            Trigger Neutralization
          </button>
        </div>
      </section>

      {/* Manual controls */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Manual Controls</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label>
            Duration (seconds):{' '}
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: '100px', padding: '0.5rem' }}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => emptyTank1.mutate({ duration })} style={{ padding: '0.75rem 1.5rem' }}>
            Empty Tank 1
          </button>
          <button onClick={() => emptyTank2.mutate({ duration })} style={{ padding: '0.75rem 1.5rem' }}>
            Empty Tank 2
          </button>
          <button onClick={() => emptyNeutralizer.mutate({ duration })} style={{ padding: '0.75rem 1.5rem' }}>
            Empty Neutralizer
          </button>
          <button onClick={() => acidPump.mutate({ duration })} style={{ padding: '0.75rem 1.5rem' }}>
            Acid Pump
          </button>
          <button onClick={() => agitation.mutate({ duration })} style={{ padding: '0.75rem 1.5rem' }}>
            Agitation
          </button>
        </div>
      </section>

      {/* Hardware */}
      <section>
        <h2>Hardware</h2>
        {hardware && (
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
            {hardware.data?.portName} @ {hardware.data?.baudrate} baud | Slave ID: {hardware.data?.slaveId} | FW: {hardware.data?.firmwareVersion}
          </div>
        )}
        <button onClick={() => syncTime.mutate()} style={{ padding: '0.75rem 1.5rem' }}>
          Synchronize Time
        </button>
      </section>
    </div>
  )
}
