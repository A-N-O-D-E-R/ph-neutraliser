import type { Level } from '../types'

interface Props {
  label: string
  value: string | number
  unit?: string
  level?: Level
}

export function StatusCard({ label, value, unit, level }: Props) {
  const levelColor = level === 'OK' ? '#4caf50' : level === 'LOW' ? '#ff9800' : '#f44336'

  return (
    <div style={{
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      borderLeft: level ? `4px solid ${levelColor}` : undefined,
    }}>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        {value}
        {unit && <span style={{ fontSize: '1rem', fontWeight: 'normal' }}> {unit}</span>}
      </div>
    </div>
  )
}
