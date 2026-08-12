import type { Section } from '@/lib/api/bff/types'

export type SectionState<T> =
  | { state: 'loading' }
  | { state: 'unavailable'; observedAt: string }
  | { state: 'empty'; observedAt: string }
  | { state: 'ready'; data: T; observedAt: string }

export function useSection<T>(section: Section<T> | undefined, isLoading: boolean): SectionState<T> {
  if (isLoading || !section) return { state: 'loading' }
  if (section.status === 'UNAVAILABLE') return { state: 'unavailable', observedAt: section.observedAt }
  const empty = Array.isArray(section.data) ? section.data.length === 0 : section.data == null
  return empty
    ? { state: 'empty', observedAt: section.observedAt }
    : { state: 'ready', data: section.data!, observedAt: section.observedAt }
}
