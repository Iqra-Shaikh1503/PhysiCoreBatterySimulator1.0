import { LayoutDashboard, SlidersHorizontal, Layers3, Atom, Waves, ChartNoAxesCombined, Repeat2, ScanLine, Crosshair, FlaskConical, TrendingDown, FileText } from 'lucide-react'
import type { Section } from '../types/model'

export const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'WORKSPACE', description: 'Your configuration, research workflow and model status at a glance.' },
  { id: 'simulation', label: 'Simulation', icon: SlidersHorizontal, group: 'WORKSPACE', description: 'Configure a source-traceable case before the numerical backend is connected.' },
  { id: 'visualizer', label: 'Battery Visualizer', icon: Layers3, group: 'WORKSPACE', description: 'Explore the cell architecture and the direction of each electrochemical process.' },
  { id: 'electrochemistry', label: 'Electrochemistry', icon: Atom, group: 'ANALYSIS', description: 'Electrode potentials, desired reaction currents and side-reaction contributions.' },
  { id: 'transport', label: 'Transport Analysis', icon: Waves, group: 'ANALYSIS', description: 'Spatial species transport, electrolyte velocity and pressure.' },
  { id: 'charge', label: 'Charge/Discharge Analysis', icon: ChartNoAxesCombined, group: 'ANALYSIS', description: 'Inspect voltage profiles, phase transitions and capacity when results are available.' },
  { id: 'cycles', label: 'Cycle Analysis', icon: Repeat2, group: 'ANALYSIS', description: 'Compare cycle efficiencies and track residual cerium over successive cycles.' },
  { id: 'sensitivity', label: 'Parameter Sensitivity', icon: ScanLine, group: 'RESEARCH', description: 'Define a parameter study. Sweep execution requires a verified numerical backend.' },
  { id: 'optimization', label: 'Optimization', icon: Crosshair, group: 'RESEARCH', description: 'Define a research objective within the model’s declared conditions.' },
  { id: 'validation', label: 'Experimental Validation', icon: FlaskConical, group: 'RESEARCH', description: 'Import genuine measurements and prepare comparisons with future simulation results.' },
  { id: 'degradation', label: 'Degradation Analysis', icon: TrendingDown, group: 'RESEARCH', description: 'Track cycle accumulation while keeping long-term model limitations visible.' },
  { id: 'report', label: 'Research Report', icon: FileText, group: 'RESEARCH', description: 'Preview the case record, sources, assumptions and available evidence.' },
] satisfies { id: Section; label: string; icon: typeof Atom; group: string; description: string }[]
export const dashboardTiles = ['temperature', 'currentDensity', 'flowRate', 'reservoirVolume', 'cycles'] as const
