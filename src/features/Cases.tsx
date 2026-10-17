import { ArrowRight, Columns2, Trash2 } from 'lucide-react'
import { fields } from '../data/parameters'
import type { SavedCase } from '../types/model'
import type { Workbench } from '../hooks/useWorkbench'
import { Badge, EmptyState, Panel } from '../components/ui'

export function Cases({ work, selected, onSelect, onConfigure, showComparison = false }: { work: Workbench; selected: string[]; onSelect: (id: string) => void; onConfigure: () => void; showComparison?: boolean }) {
  const chosen = work.cases.filter(c => selected.includes(c.id))
  return <div className="feature-stack"><Panel title="Saved research cases" eyebrow="LOCAL WORKSPACE" action={<Badge>{work.cases.length} saved</Badge>}>
    {!work.cases.length ? <EmptyState title="Your first case starts here" description="Save a configuration to revisit or compare it. Cases are stored in this browser; results are not generated." action={<button className="button secondary small" onClick={onConfigure}>Configure a case<ArrowRight size={13} /></button>} /> :
      <div className="table-scroll"><table className="data-table"><thead><tr><th><span className="sr-only">Compare selection</span></th><th>Case</th><th>Conditions</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{work.cases.map(c => <tr key={c.id}><td><input type="checkbox" checked={selected.includes(c.id)} onChange={() => onSelect(c.id)} aria-label={'Compare ' + c.name} /></td><td><button className="case-name" onClick={() => { work.loadCase(c); onConfigure() }}>{c.name}<ArrowRight size={12} /></button><small>{new Date(c.createdAt).toLocaleString()}</small></td><td className="mono">{c.configuration.values.temperature} °C · {c.configuration.values.currentDensity} mA/cm²</td><td><Badge>Not simulated</Badge></td><td><button className="icon-button" aria-label={'Delete ' + c.name} onClick={() => work.deleteCase(c.id)}><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>}
    {work.cases.length > 0 && <div className="table-footer"><Columns2 size={14} /><span>Select two to four cases to compare input configurations.</span><span className="mono">{chosen.length} selected</span></div>}
  </Panel>{(chosen.length > 0 || showComparison) && <Comparison cases={chosen} />}</div>
}
function Comparison({ cases }: { cases: SavedCase[] }) {
  return <Panel title="Case comparison" eyebrow="CONFIGURATIONS ONLY"><p className="panel-description">Differences are highlighted against the first selected case. Performance comparison requires simulation results.</p>{cases.length < 2 ? <EmptyState title="Select at least two cases" description="Use the checkboxes in the saved-case list. No performance ranking is inferred." /> : <div className="table-scroll"><table className="data-table compare-table"><thead><tr><th>Parameter</th>{cases.map(c => <th key={c.id}>{c.name}</th>)}</tr></thead><tbody><tr><td>Operating mode</td>{cases.map(c => <td key={c.id}>{c.configuration.mode}</td>)}</tr>{fields.map(f => <tr key={f.key}><td>{f.label}<small>{f.unit}</small></td>{cases.map(c => <td className={c.configuration.values[f.key] !== cases[0]?.configuration.values[f.key] ? 'different mono' : 'mono'} key={c.id}>{c.configuration.values[f.key]}</td>)}</tr>)}</tbody></table></div>}</Panel>
}
