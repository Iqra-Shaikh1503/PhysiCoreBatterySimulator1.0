import type { Configuration, DraftConfiguration, FieldDefinition, FieldGroup, FieldKey } from '../types/model'

const p = 'Paper · Table 3, p. 7'
const g = 'Paper · Table 1, p. 3'
export const groups: FieldGroup[] = ['Operating conditions', 'Negative electrolyte', 'Positive electrolyte', 'Cell geometry']
export const fields: FieldDefinition[] = [
  { key: 'temperature', label: 'Temperature', unit: '°C', baseline: 50, group: groups[0]!, source: p, min: -273.15, exclusiveMin: true, step: '0.1', note: 'Property values in the paper are at 50 °C.' },
  { key: 'currentDensity', label: 'Applied current density', unit: 'mA/cm²', baseline: 25, group: groups[0]!, source: p, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'flowRate', label: 'Flow rate · each loop', unit: 'mL/min', baseline: 65, group: groups[0]!, source: p, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'reservoirVolume', label: 'Volume · each reservoir', unit: 'cm³', baseline: 30, group: groups[0]!, source: p, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'chargeDuration', label: 'Charge duration', unit: 'h', baseline: 1, group: groups[0]!, source: 'Paper · §2, p. 3', min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'cycles', label: 'Maximum cycles', unit: 'cycles', baseline: 5, group: groups[0]!, source: 'Paper · §6.1, pp. 8–10', min: 1, max: 1000, integer: true, step: '1', note: '1–1,000 is a UI limit; the paper studies five cycles.' },
  { key: 'cutoff', label: 'Discharge cutoff', unit: 'V', baseline: 0.5, group: groups[0]!, source: 'Paper · §2, p. 3', min: 0, exclusiveMin: true, step: '0.01' },
  { key: 'znII', label: 'Zn(II)', unit: 'mol/L', baseline: 1.5, group: groups[1]!, source: p, min: 0, step: '0.001' },
  { key: 'negativeH', label: 'H⁺ · negative', unit: 'mol/L', baseline: 1, group: groups[1]!, source: p, min: 0, step: '0.001' },
  { key: 'negativeAnion', label: 'CH₃SO₃⁻ · negative', unit: 'mol/L', baseline: 4, group: groups[1]!, source: p, min: 0, step: '0.001' },
  { key: 'ceIII', label: 'Ce(III)', unit: 'mol/L', baseline: 0.8, group: groups[2]!, source: p, min: 0, exclusiveMin: true, step: '0.001' },
  { key: 'ceIV', label: 'Ce(IV)', unit: 'mol/L', baseline: 0.001, group: groups[2]!, source: p, min: 0, exclusiveMin: true, step: '0.001', note: 'Numerical seed, not a measured initial Ce(IV) concentration.' },
  { key: 'positiveH', label: 'H⁺ · positive', unit: 'mol/L', baseline: 4, group: groups[2]!, source: p, min: 0, step: '0.001' },
  { key: 'positiveAnion', label: 'CH₃SO₃⁻ · positive', unit: 'mol/L', baseline: 6.4, group: groups[2]!, source: p, min: 0, step: '0.001' },
  { key: 'height', label: 'Electrode height', unit: 'mm', baseline: 45, group: groups[3]!, source: g, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'width', label: 'Electrode width', unit: 'mm', baseline: 20, group: groups[3]!, source: g, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'channel', label: 'Flow-channel thickness', unit: 'mm', baseline: 6, group: groups[3]!, source: g, min: 0, exclusiveMin: true, step: '0.1' },
  { key: 'membrane', label: 'Membrane thickness', unit: 'µm', baseline: 180, group: groups[3]!, source: g, min: 0, exclusiveMin: true, step: '1' },
  { key: 'porosity', label: 'Positive-electrode porosity', unit: 'fraction', baseline: 0.758, group: groups[3]!, source: g, min: 0, exclusiveMin: true, max: 0.999999, step: '0.001' },
  { key: 'area', label: 'Apparent active area', unit: 'cm²', baseline: 9, group: groups[3]!, source: 'Derived from 2 × 4.5 cm · §2, p. 3', min: 0, exclusiveMin: true, step: '0.1', note: 'Apparent area, not the internal mesh surface area.' },
]
export function baselineDraft(): DraftConfiguration {
  return { values: Object.fromEntries(fields.map(f => [f.key, String(f.baseline)])) as Record<FieldKey, string>, mode: 'charge' }
}
export function draftFromConfiguration(config: Configuration): DraftConfiguration {
  return { values: Object.fromEntries(fields.map(f => [f.key, String(config.values[f.key])])) as Record<FieldKey, string>, mode: config.mode }
}
export const fittedParameters = [
  { name: 'Positive volumetric area', value: '150 m⁻¹', source: 'Table 1, p. 3 · second-cycle fit' },
  { name: 'HER exchange current density', value: '2.21 × 10⁻⁵ A/m²', source: 'Table 4, p. 7 · second-cycle fit' },
  { name: 'Ce(IV) mass transfer', value: '2.8 × 10⁻⁵ m/s', source: 'Table 4, p. 7 · second-cycle fit' },
]
export const scopeAssumptions = [
  'Two-dimensional transient model with incompressible, laminar flow.',
  'Isothermal operation and dilute-solution transport.',
  'Only protons cross the membrane; water and other-ion crossover are omitted.',
  'Perfectly mixed external reservoirs.',
  'HER and OER currents are included; gas-bubble effects are omitted.',
  'No homogeneous reactions or Ce(IV) precipitation model.',
  'Five-cycle investigation horizon; later-cycle precipitation still limits interpretation.',
]
