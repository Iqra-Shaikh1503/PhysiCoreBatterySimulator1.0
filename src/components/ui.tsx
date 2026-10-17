import type { ReactNode } from 'react'
import { ArrowUpRight, Circle, Info } from 'lucide-react'

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'teal' | 'amber' | 'red' }) {
  return <span className={'badge badge-' + tone}><Circle size={6} fill="currentColor" strokeWidth={0} />{children}</span>
}
export function Panel({ title, eyebrow, action, children, className = '' }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={'panel ' + className}><div className="panel-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>{children}</section>
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-symbol"><ScanGlyph /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}
function ScanGlyph() { return <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M4 9V4h5m8 0h5v5M4 17v5h5m8 0h5v-5M8 14l3-4 4 6 3-4" stroke="currentColor" strokeWidth="1.4" /></svg> }
export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button className="text-link" onClick={onClick}>{children}<ArrowUpRight size={13} /></button>
}
export function InfoStrip({ children, warning = false }: { children: ReactNode; warning?: boolean }) {
  return <div className={'info-strip ' + (warning ? 'warning' : '')}><Info size={16} /><div>{children}</div></div>
}
