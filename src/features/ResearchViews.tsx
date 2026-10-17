import { useState } from 'react'
import { Download, FlaskConical, Layers3, LockKeyhole } from 'lucide-react'
import type { Section, ExperimentalDataset, Mode, PlotKind } from '../types/model'
import type { Workbench } from '../hooks/useWorkbench'
import { fields, fittedParameters, scopeAssumptions } from '../data/parameters'
import { toConfiguration } from '../services/configuration'
import { downloadJson } from '../services/cases'
import { Badge, InfoStrip, Panel } from '../components/ui'
import { ScientificPlot } from '../components/ScientificPlot'
import { BatterySchematic } from '../components/BatterySchematic'
import { Diagnostics } from '../components/Diagnostics'

export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className="segmented" role="group" aria-label="Schematic operating view"><button aria-pressed={mode === 'charge'} onClick={() => onChange('charge')}>Charge</button><button aria-pressed={mode === 'discharge'} onClick={() => onChange('discharge')}>Discharge</button></div>
}
export function Visualizer() {
  const [mode, setMode] = useState<Mode>('charge')
  return <div className="feature-stack"><Panel title="Zn–Ce cell architecture" eyebrow="EXPLANATORY VIEW" action={<ModeSwitch mode={mode} onChange={setMode} />}><BatterySchematic mode={mode} /><div className="schematic-legend"><span><i className="legend-dot" />Electrolyte circulation</span><span><i className="legend-dot muted-dot" />Proton exchange</span><span><i className="legend-dot amber-dot" />Charging gas evolution</span></div></Panel><div className="three-grid">{[
    ['Negative half-cell', mode === 'charge' ? 'Zn(II) is reduced and zinc deposits on carbon. HER competes for charging current.' : 'Zinc dissolves into Zn(II), releasing electrons. Finite zinc inventory limits discharge.'],
    ['Membrane', 'Nafion permits proton transport. Other-ion and water crossover are omitted by the published model. Arrows illustrate phase direction, not a computed flux.'],
    ['Positive half-cell', mode === 'charge' ? 'Ce(III) oxidizes to Ce(IV) in the porous Pt/Ti mesh. OER can consume charging current.' : 'Ce(IV) reduces to Ce(III). Surface mass transfer can limit the rate even with reactant remaining in the tank.'],
  ].map(([title, text]) => <Panel key={title} title={title!}><p className="panel-description">{text}</p></Panel>)}</div><InfoStrip>Illustrative topology only · source: paper Fig. 1d, p. 4. Component dimensions, particle positions and arrows do not represent a numerical solution.</InfoStrip></div>
}
const chartPages: Partial<Record<Section, PlotKind[]>> = {
  electrochemistry: ['potentials', 'reactions'], transport: ['heatmap', 'velocity', 'pressure'],
  charge: ['charge', 'voltage'], cycles: ['efficiency', 'cerium'], degradation: ['cerium', 'efficiency'],
}
export function AnalysisView({ section }: { section: Section }) {
  const [species, setSpecies] = useState('Ce(IV)')
  return <div className="feature-stack">{section === 'transport' && <Panel title="Spatial field selection" action={<Badge>No mesh loaded</Badge>}><div className="dataset-controls"><label className="field"><span>Species</span><select value={species} onChange={e => setSpecies(e.target.value)}>{['Zn(II)', 'Ce(III)', 'Ce(IV)', 'H⁺', 'CH₃SO₃⁻'].map(s => <option key={s}>{s}</option>)}</select></label><p className="muted">Select a field to inspect when spatial results become available.</p></div></Panel>}
    {section === 'degradation' && <ScopePanel />}
    <div className="analysis-grid">{chartPages[section]?.map(kind => <ScientificPlot key={kind} kind={kind} definition={kind === 'heatmap' ? { title: species + ' concentration field', xLabel: 'Thickness x (mm)', yLabel: 'Height y (mm)', empty: 'No spatial mesh or species field is available.' } : undefined} />)}</div>
    <div className="two-grid"><Diagnostics full /><Panel title="Limiting-process interpretation" eyebrow="EVIDENCE REQUIRED"><div className="process-empty"><Layers3 size={23} /><strong>Not determined</strong><p>No electrode response, concentration field or surface-inventory result is available to diagnose the limiting process.</p><Badge>Not simulated</Badge></div></Panel></div>
  </div>
}
export function ScopePanel() {
  return <Panel title="Published model scope" eyebrow="SCIENTIFIC CONTEXT" action={<Badge tone="amber">Limited horizon</Badge>}><ul className="scope-list">{scopeAssumptions.map(s => <li key={s}>{s}</li>)}</ul><InfoStrip warning>Ce(IV) precipitation is omitted. The paper reports onset around cycle 4 and limits its investigation to five cycles. Long-term lifetime predictions require an extended, independently validated model.</InfoStrip><p className="source-note">Amini & Pritzker, 2021 · §3, p. 3; §6.1, pp. 8–10 · Phase 0 SCIENTIFIC_MODEL.md</p></Panel>
}
export function StudyView({ optimize, work }: { optimize: boolean; work: Workbench }) {
  const [parameter, setParameter] = useState('currentDensity')
  const [start, setStart] = useState('15')
  const [end, setEnd] = useState('35')
  const [count, setCount] = useState('5')
  const [objective, setObjective] = useState('Energy efficiency')
  const field = fields.find(f => f.key === parameter)!
  const n = Number(count), low = Number(start), high = Number(end)
  const valid = start.trim() !== '' && end.trim() !== '' && Number.isFinite(low) && Number.isFinite(high) && low >= field.min && (!field.exclusiveMin || low > field.min) && high > low && (field.max === undefined || high <= field.max) && Number.isInteger(n) && n >= 2 && n <= 100 && (!field.integer || (Number.isInteger(low) && Number.isInteger(high)))
  function exportPlan() { downloadJson('physicore-study-plan.json', { status: 'planned-not-executed', kind: optimize ? 'optimization' : 'sensitivity', parameter, unit: field.unit, start: low, end: high, samples: n, objective: optimize ? objective : null, configuration: toConfiguration(work.draft), scope: 'Unvalidated study. No solver connected; parameter dependencies require scientific review.' }); work.announce('Study plan exported. No sweep or optimization has been executed.') }
  return <div className="feature-stack"><InfoStrip warning>Changing a parameter does not transfer the paper’s validation. Flow, temperature and geometry changes require consistent dependent properties; no correlations are invented.</InfoStrip><Panel title={optimize ? 'Optimization objective' : 'Study definition'} eyebrow="PLANNED RESEARCH" action={<Badge>Not executed</Badge>}>
    {optimize && <label className="field objective-field"><span>Objective</span><select value={objective} onChange={e => setObjective(e.target.value)}>{['Energy efficiency', 'Voltage efficiency', 'Charge efficiency', 'Capacity', 'Minimum side reactions', 'Minimum voltage loss'].map(o => <option key={o}>{o}</option>)}</select></label>}
    <div className="field-grid"><label className="field"><span>Parameter</span><select value={parameter} onChange={e => { const f = fields.find(f => f.key === e.target.value)!; setParameter(f.key); setStart(String(f.baseline)); setEnd(String(f.baseline * 2)) }}>{fields.map(f => <option key={f.key} value={f.key}>{f.label} ({f.unit})</option>)}</select></label><label className="field"><span>Start ({field.unit})</span><input type="number" value={start} onChange={e => setStart(e.target.value)} /></label><label className="field"><span>End ({field.unit})</span><input type="number" value={end} onChange={e => setEnd(e.target.value)} /></label><label className="field"><span>Samples (2–100)</span><input type="number" value={count} onChange={e => setCount(e.target.value)} /></label></div>
    {!valid && <p className="error-text panel-description" role="alert">Use a finite increasing range within the parameter’s input bounds and 2–100 whole samples.</p>}
    <div className="panel-actions"><button className="button secondary" disabled={!valid || !work.review.valid} onClick={exportPlan}><Download size={14} />Export study plan</button><button className="button secondary" disabled title="Requires a verified simulation backend"><LockKeyhole size={14} />{optimize ? 'Optimize conditions' : 'Run parameter sweep'}</button></div>
  </Panel><ScientificPlot kind="sensitivity" /><Panel title={optimize ? 'Recommended conditions' : 'Study interpretation'}><div className="process-empty"><FlaskConical size={23} /><strong>{optimize ? 'No recommendation available' : 'No response data available'}</strong><p>Objectives, sensitivity rankings and performance gains require genuine solver output.</p></div></Panel></div>
}
export function ResearchReport({ work, datasets }: { work: Workbench; datasets: ExperimentalDataset[] }) {
  function exportConfiguration() { downloadJson('physicore-configuration.json', { name: work.name, configuration: toConfiguration(work.draft), units: Object.fromEntries(fields.map(f => [f.key, f.unit])), sources: Object.fromEntries(fields.map(f => [f.key, f.source])), scientificWarnings: work.review.issues, simulationStatus: 'not-simulated', validationStatus: 'not-performed' }); work.announce('Configuration JSON exported with units, sources and scientific warnings.') }
  return <div className="feature-stack"><div className="report-toolbar"><span className="muted">Preview · configuration record only</span><div className="button-row"><button className="button secondary" disabled={!work.review.valid} onClick={exportConfiguration}><Download size={14} />Export configuration</button><button className="button secondary" disabled title="A scientific results report requires simulation data">Export results report</button></div></div>
    <article className="report-paper"><div className="report-masthead"><span className="eyebrow">PHYSICORE / RESEARCH RECORD</span><Badge>Draft · no results</Badge></div><h2>{work.name || 'Untitled configuration'}</h2><p className="report-subtitle">Zinc–Cerium Redox Flow Battery · Published Model configuration</p><div className="report-status-grid"><div><span>SIMULATION</span><strong>Not simulated</strong></div><div><span>VALIDATION</span><strong>Not performed</strong></div><div><span>MODE</span><strong>{work.draft.mode}</strong></div></div><h3>01 / Configuration & sources</h3><div className="table-scroll"><table className="data-table"><thead><tr><th>Parameter</th><th>Value</th><th>Source</th></tr></thead><tbody>{fields.map(f => <tr key={f.key}><td>{f.label}</td><td className="mono">{work.draft.values[f.key] || 'Unset'} {f.unit}</td><td>{f.source}</td></tr>)}</tbody></table></div><h3>02 / Fitted parameters</h3><p className="panel-description">These values were fitted to the paper’s second cycle and are not universal constants.</p>{fittedParameters.map(p => <p key={p.name} className="report-line">{p.name}<span className="mono">{p.value}</span></p>)}<h3>03 / Model assumptions</h3><ul className="scope-list">{scopeAssumptions.map(s => <li key={s}>{s}</li>)}</ul><h3>04 / Evidence & open questions</h3><p className="panel-description">{datasets.length} experimental dataset(s) imported this session. No solver output or paired-data error metrics are available. U-03 zinc inventory and U-04 seed neutrality remain unresolved; see the Phase 0 specification for all open questions.</p><ul className="issue-list">{work.review.issues.map((issue, i) => <li key={i}><span className="issue-dot warning" />{issue.message}</li>)}</ul><h3>05 / Scientific reference</h3><p className="panel-description">Amini, K. & Pritzker, M. D. (2021). A two-dimensional transient model for a zinc-cerium redox flow battery validated by extensive experimental data. Journal of Power Sources 506, 230237.</p><a className="source-link" href="https://doi.org/10.1016/j.jpowsour.2021.230237" target="_blank" rel="noreferrer">doi:10.1016/j.jpowsour.2021.230237 ↗</a><p className="report-footnote">Configuration preview only. No research findings or validation results are asserted.</p></article>
  </div>
}
