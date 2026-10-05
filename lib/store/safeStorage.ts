import type { PersistStorage, StorageValue } from 'zustand/middleware'

export function safeJsonStorage<T>(): PersistStorage<T> {
  return {
    getItem: (name) => {
      try {
        const raw = window.localStorage.getItem(name)
        return raw ? (JSON.parse(raw) as StorageValue<T>) : null
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, JSON.stringify(value))
      } catch {
        return
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name)
      } catch {
        return
      }
    },
  }
}
