import { CircleDashed, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Badge, Panel } from './ui'

const checks = ['Solver convergence', 'Mass conservation', 'Charge conservation', 'Electroneutrality', 'Concentration bounds', 'Mesh / time refinement']
export function Diagnostics({ full = false }: { full?: boolean }) {
  return <Panel title="Numerical diagnostics" eyebrow="QUALITY CONTROL" action={<Badge>Not evaluated</Badge>}><div className="diagnostics">{checks.map(check => <div className="diagnostic-row" key={check}><CircleDashed size={14} /><span>{check}</span><span className="diagnostic-status">Not evaluated</span></div>)}</div>{full && <div className="diagnostic-note"><TriangleAlert size={16} /><p>Input checks only validate the configuration format and consistency. Solver convergence and experimental validation require a connected backend and genuine comparison data.</p></div>}</Panel>
}
export function ValidationStatus() {
  return <div className="validation-status"><ShieldCheck size={18} /><div><strong>Validation not performed</strong><p>A completed simulation would still require independent experimental comparison.</p></div></div>
}
