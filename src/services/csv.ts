import type { ExperimentalDataset, PlotSeries } from '../types/model'

export const measurementColumns = {
  voltage_v: { label: 'Cell voltage', unit: 'V' },
  current_a: { label: 'Applied current', unit: 'A' },
  ce_iv_mol_l: { label: 'Ce(IV) concentration', unit: 'mol/L' },
  positive_potential_v: { label: 'Positive potential', unit: 'V' },
  negative_potential_v: { label: 'Negative potential', unit: 'V' },
}
export type MeasurementColumn = keyof typeof measurementColumns
export function isMeasurementColumn(key: string): key is MeasurementColumn { return Object.hasOwn(measurementColumns, key) }
function tokenizeCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++ }
      else if (!quoted && field.length !== 0) throw new Error('A quote must start at the beginning of a CSV field.')
      else quoted = !quoted
    } else if (c === ',' && !quoted) { row.push(field.trim()); field = '' }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field.trim()); field = ''
      if (row.some(Boolean)) rows.push(row)
      row = []
    } else field += c
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.')
  row.push(field.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}
export function parseExperimentalCsv(text: string, name: string): ExperimentalDataset {
  if (text.length > 2_000_000) throw new Error('CSV must be smaller than 2 MB.')
  const rows = tokenizeCsv(text.replace(/^\uFEFF/, ''))
  const headers = rows.shift()
  if (!headers || !rows.length) throw new Error('Add a header and at least one measurement row.')
  if (rows.length > 50000) throw new Error('Use at most 50,000 rows per file in this frontend preview.')
  if (new Set(headers).size !== headers.length) throw new Error('CSV column names must be unique.')
  if (!headers.includes('time_s')) throw new Error('Required column: time_s (seconds). Units are never converted automatically.')
  const measurements = headers.filter(isMeasurementColumn)
  if (!measurements.length) throw new Error('Include voltage_v, current_a, ce_iv_mol_l, positive_potential_v, or negative_potential_v.')
  const unknown = headers.filter(h => h !== 'time_s' && !isMeasurementColumn(h))
  if (unknown.length) throw new Error('Unsupported columns: ' + unknown.join(', ') + '. Use the documented unit-bearing headers.')
  const time: number[] = [], data: Record<string, number[]> = Object.fromEntries(measurements.map(h => [h, []]))
  rows.forEach((row, r) => {
    if (row.length !== headers.length) throw new Error('Row ' + (r + 2) + ': expected ' + headers.length + ' columns.')
    const values = row.map(value => value === '' ? NaN : Number(value))
    if (values.some(n => !Number.isFinite(n))) throw new Error('Row ' + (r + 2) + ': all measurement cells must contain finite numbers.')
    const t = values[headers.indexOf('time_s')]!
    if (t < 0 || (time.length && t <= time[time.length - 1]!)) throw new Error('Row ' + (r + 2) + ': time_s must be nonnegative and strictly increasing. Duplicates are not silently removed.')
    time.push(t)
    measurements.forEach(h => {
      const n = values[headers.indexOf(h)]!
      if (h === 'ce_iv_mol_l' && n < 0) throw new Error('Row ' + (r + 2) + ': Ce(IV) concentration cannot be negative.')
      data[h]!.push(n)
    })
  })
  return { id: crypto.randomUUID(), name, importedAt: new Date().toISOString(), rows: rows.length, columns: headers, time, measurements: data }
}
export function experimentalSeries(dataset: ExperimentalDataset, column: MeasurementColumn): PlotSeries[] {
  const values = dataset.measurements[column]
  return values ? [{ name: 'Experimental · ' + dataset.name, x: dataset.time, y: values, color: '#59d5c3' }] : []
}
