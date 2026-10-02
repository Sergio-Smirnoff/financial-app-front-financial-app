import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UI_SIDEBAR_STORAGE_KEY, useUiStore } from '../ui.store'

describe('useUiStore sidebar', () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarCollapsed: false, sidebarOpen: false })
    localStorage.clear()
  })

  it('toggles the desktop rail between expanded and collapsed', () => {
    useUiStore.getState().toggleSidebarCollapsed()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    useUiStore.getState().toggleSidebarCollapsed()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  it('persists only the collapsed flag, never the mobile drawer', () => {
    useUiStore.getState().setSidebarOpen(true)
    useUiStore.getState().setSidebarCollapsed(true)

    const saved = JSON.parse(localStorage.getItem(UI_SIDEBAR_STORAGE_KEY) ?? 'null')
    expect(saved).toEqual({ state: { sidebarCollapsed: true }, version: 1 })
  })

  it('restores a collapsed rail and keeps the drawer closed', async () => {
    localStorage.setItem(UI_SIDEBAR_STORAGE_KEY, JSON.stringify({ state: { sidebarCollapsed: true, sidebarOpen: true }, version: 1 }))
    await useUiStore.persist.rehydrate()

    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
    expect(useUiStore.getState().sidebarOpen).toBe(false)
  })

  it('opens expanded when the stored value is unreadable or the wrong shape', async () => {
    localStorage.setItem(UI_SIDEBAR_STORAGE_KEY, '{not json')
    await useUiStore.persist.rehydrate()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)

    localStorage.setItem(UI_SIDEBAR_STORAGE_KEY, JSON.stringify({ state: { sidebarCollapsed: 'yes' }, version: 1 }))
    await useUiStore.persist.rehydrate()
    expect(useUiStore.getState().sidebarCollapsed).toBe(false)
  })

  it('keeps the current rail state when storage is blocked', async () => {
    useUiStore.setState({ sidebarCollapsed: true })
    const blocked = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    await useUiStore.persist.rehydrate()
    blocked.mockRestore()
    expect(useUiStore.getState().sidebarCollapsed).toBe(true)
  })
})
