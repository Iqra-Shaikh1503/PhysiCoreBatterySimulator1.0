import { isConfiguration } from './configuration'
import type { SavedCase } from '../types/model'

const KEY = 'physicore.cases.v1'
export function readCases(): SavedCase[] {
  const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
  if (!Array.isArray(raw)) throw new Error('Saved cases have an unsupported format.')
  return raw.filter((item: unknown): item is SavedCase => {
    if (!item || typeof item !== 'object') return false
    const c = item as Partial<SavedCase>
    return typeof c.id === 'string' && typeof c.name === 'string' && c.name.length <= 80 && typeof c.createdAt === 'string' && Number.isFinite(Date.parse(c.createdAt)) && isConfiguration(c.configuration)
  })
}
export function writeCases(cases: SavedCase[]) { localStorage.setItem(KEY, JSON.stringify(cases)) }
export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
