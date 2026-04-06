export function loadFromStorage<T>(key: string, storage: Storage, fallback: T): T {
  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch {
    return fallback
  }
}

export function loadArrayFromStorage<T>(key: string, storage: Storage): T[] {
  try {
    const raw = storage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToStorage<T>(key: string, storage: Storage, value: T | null) {
  if (value === null) storage.removeItem(key)
  else storage.setItem(key, JSON.stringify(value))
}