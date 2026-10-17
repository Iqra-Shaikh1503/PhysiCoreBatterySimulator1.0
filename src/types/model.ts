export type Section = 'dashboard' | 'simulation' | 'visualizer' | 'electrochemistry' | 'transport' | 'charge' | 'cycles' | 'sensitivity' | 'optimization' | 'validation' | 'degradation' | 'report'
export type Mode = 'charge' | 'discharge'
export type FieldKey = 'temperature' | 'currentDensity' | 'flowRate' | 'reservoirVolume' | 'chargeDuration' | 'cycles' | 'cutoff' | 'znII' | 'negativeH' | 'negativeAnion' | 'ceIII' | 'ceIV' | 'positiveH' | 'positiveAnion' | 'height' | 'width' | 'channel' | 'membrane' | 'porosity' | 'area'
export type FieldGroup = 'Operating conditions' | 'Negative electrolyte' | 'Positive electrolyte' | 'Cell geometry'
export interface FieldDefinition {
  key: FieldKey
  label: string
  unit: string
  baseline: number
  group: FieldGroup
  source: string
  min: number
  exclusiveMin?: boolean
  max?: number
  integer?: boolean
  step: string
  note?: string
}
export interface DraftConfiguration { values: Record<FieldKey, string>; mode: Mode }
export interface Configuration { values: Record<FieldKey, number>; mode: Mode; model: 'published'; zincInventory: null; schemaVersion: 1 }
export interface Issue { field?: FieldKey; message: string; severity: 'error' | 'warning' }
export interface ConfigurationReview { issues: Issue[]; valid: boolean }
export interface SavedCase { id: string; name: string; createdAt: string; configuration: Configuration }
export type PlotKind = 'voltage' | 'charge' | 'potentials' | 'cerium' | 'heatmap' | 'velocity' | 'pressure' | 'reactions' | 'efficiency' | 'sensitivity' | 'comparison'
export interface PlotSeries { name: string; x: number[]; y: number[]; z?: number[][]; type?: 'scatter' | 'bar' | 'heatmap'; color?: string }
export interface PlotDefinition { title: string; xLabel: string; yLabel: string; empty: string }
export interface ExperimentalDataset { id: string; name: string; importedAt: string; rows: number; columns: string[]; time: number[]; measurements: Record<string, number[]> }
export interface SimulationResult {
  id: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  validationStatus: 'not-validated' | 'passed' | 'failed'
  plots: Partial<Record<PlotKind, PlotSeries[]>>
  diagnostics: { name: string; status: 'not-evaluated' | 'passed' | 'failed'; detail: string }[]
}
