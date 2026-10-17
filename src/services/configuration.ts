import { fields } from '../data/parameters'
import type { Configuration, ConfigurationReview, DraftConfiguration, FieldKey, Issue } from '../types/model'

export function reviewConfiguration(draft: DraftConfiguration): ConfigurationReview {
  const issues: Issue[] = []
  for (const f of fields) {
    const raw = draft.values[f.key]
    const n = Number(raw)
    if (raw.trim() === '' || !Number.isFinite(n)) {
      issues.push({ field: f.key, severity: 'error', message: f.label + ': enter a finite number in ' + f.unit + '.' })
    } else if (n < f.min || (f.exclusiveMin && n === f.min) || (f.max !== undefined && n > f.max) || (f.integer && !Number.isInteger(n))) {
      issues.push({ field: f.key, severity: 'error', message: f.label + ': ' + (f.integer ? 'use a whole number' : 'use a value') + ' ' + (f.exclusiveMin ? 'greater than' : 'at least') + ' ' + f.min + (f.max !== undefined ? ' and at most ' + f.max : '') + ' ' + f.unit + '.' })
    }
  }
  if (issues.length) return { valid: false, issues }
  const v = Object.fromEntries(fields.map(f => [f.key, Number(draft.values[f.key])])) as Record<FieldKey, number>
  // Input consistency checks only, not solver diagnostics.
  const negativeCharge = 2 * v.znII + v.negativeH - v.negativeAnion
  const positiveCharge = 3 * v.ceIII + 4 * v.ceIV + v.positiveH - v.positiveAnion
  if (Math.abs(negativeCharge) > 1e-9) issues.push({ severity: 'warning', message: 'Negative input charge imbalance: ' + negativeCharge.toPrecision(4) + ' mol charge/L. Review the composition before a future run.' })
  if (Math.abs(positiveCharge) > 1e-9) issues.push({ severity: 'warning', message: 'Positive input charge imbalance: ' + positiveCharge.toPrecision(4) + ' mol charge/L. The literal paper baseline has a 0.004 discrepancy from its Ce(IV) seed (U-04); values are preserved.' })
  if (v.cycles > 5) issues.push({ severity: 'warning', message: 'More than five cycles exceeds the paper’s investigation horizon. Precipitation is not modeled.' })
  if (fields.some(f => v[f.key] !== f.baseline)) issues.push({ severity: 'warning', message: 'Modified scenario. Baseline validation does not transfer to changed operating conditions or geometry.' })
  if (Math.abs(v.area - v.height * v.width / 100) > 1e-6) issues.push({ severity: 'warning', message: 'Apparent active area differs from height × width (mm² ÷ 100 → cm²). No value has been changed automatically.' })
  issues.push({ severity: 'warning', message: 'Zn surface inventory normalization (U-03) and membrane/voltage conventions remain unresolved. Backend scientific review is required.' })
  return { valid: true, issues }
}
export function toConfiguration(draft: DraftConfiguration): Configuration {
  if (!reviewConfiguration(draft).valid) throw new Error('Correct the configuration errors before continuing.')
  return { values: Object.fromEntries(fields.map(f => [f.key, Number(draft.values[f.key])])) as Record<FieldKey, number>, mode: draft.mode, model: 'published', schemaVersion: 1, zincInventory: null }
}
export function isConfiguration(value: unknown): value is Configuration {
  if (!value || typeof value !== 'object') return false
  const c = value as Partial<Configuration>
  return c.schemaVersion === 1 && c.model === 'published' && c.zincInventory === null &&
    (c.mode === 'charge' || c.mode === 'discharge') && !!c.values &&
    fields.every(f => typeof c.values?.[f.key] === 'number' && Number.isFinite(c.values[f.key])) &&
    reviewConfiguration({ values: Object.fromEntries(fields.map(f => [f.key, String(c.values?.[f.key])])) as Record<FieldKey, string>, mode: c.mode }).valid
}
