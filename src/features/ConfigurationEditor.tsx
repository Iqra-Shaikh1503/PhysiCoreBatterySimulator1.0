import { FlaskConical, RotateCcw, ScanLine, Save, LoaderCircle, Play } from 'lucide-react'
import { fields, fittedParameters, groups } from '../data/parameters'
import type { Workbench } from '../hooks/useWorkbench'
import { Badge, InfoStrip, Panel } from '../components/ui'
import type { Mode } from '../types/model'

export function ConfigurationEditor({ work }: { work: Workbench }) {
  const { draft, review } = work
  return <div className="feature-stack">
    <InfoStrip>Source units stay visible throughout editing and export. Numeric input checks do not establish scientific validity.</InfoStrip>
    <Panel title="Case configuration" eyebrow="INPUTS & PROVENANCE" action={<Badge tone={work.checked ? 'teal' : 'muted'}>{work.checked ? 'Input check complete' : 'Draft'}</Badge>}>
      <div className="config-identity"><label className="field"><span>Case name</span><input value={work.name} maxLength={80} onChange={e => work.setName(e.target.value)} placeholder="Name your research case" /></label><label className="field"><span>Initial operating mode</span><select value={draft.mode} onChange={e => work.updateDraft({ ...draft, mode: e.target.value as Mode })}><option value="charge">Charge</option><option value="discharge">Discharge</option></select></label><div className="identity-action"><button className="button secondary" onClick={work.loadBaseline}><RotateCcw size={14} />Load Paper Baseline</button></div></div>
    </Panel>
    {groups.map((group, index) => <Panel key={group} title={group} eyebrow={'CONFIGURATION / 0' + (index + 1)} action={<span className="source-label">{index === 3 ? 'Table 1 · p. 3' : 'Table 3 · p. 7'}</span>}>
      <div className="field-grid">{fields.filter(f => f.group === group).map(f => {
        const fieldError = review.issues.find(i => i.field === f.key && i.severity === 'error')
        return <label className="field" key={f.key} htmlFor={'field-' + f.key}><span>{f.label}</span><div className="unit-input"><input id={'field-' + f.key} aria-label={f.label} type="number" step={f.step} value={draft.values[f.key]} aria-invalid={!!fieldError} aria-describedby={'help-' + f.key} onChange={e => work.updateDraft({ ...draft, values: { ...draft.values, [f.key]: e.target.value } })} /><span>{f.unit}</span></div><small id={'help-' + f.key} className={fieldError ? 'error-text' : ''}>{fieldError?.message ?? f.note ?? f.source}</small></label>
      })}{group === 'Negative electrolyte' && <label className="field"><span>Zinc deposited on electrode</span><input disabled placeholder="Unresolved · U-03" /><small>Inventory units and normalization require scientific resolution. No value is assumed.</small></label>}</div>
    </Panel>)}
    <Panel title="Configuration review" eyebrow="INPUT CHECK · NOT SOLVER VALIDATION" action={<Badge tone={review.valid ? 'amber' : 'red'}>{review.valid ? 'Scientific warnings' : 'Input errors'}</Badge>}>
      <ul className="issue-list">{review.issues.map((issue, i) => <li key={i} className={issue.severity === 'error' ? 'error-text' : ''}><span className={'issue-dot ' + issue.severity} />{issue.message}</li>)}</ul>
      <div className="panel-actions"><button className="button primary" disabled={!review.valid || work.checking} onClick={() => { void work.checkConfiguration() }}>{work.checking ? <LoaderCircle className="spin" size={15} /> : <ScanLine size={15} />}{work.checking ? 'Checking inputs…' : 'Check configuration'}</button><button className="button secondary" disabled={!review.valid} onClick={work.saveCase}><Save size={14} />Save configuration</button><button className="button secondary" disabled title="Requires a numerical backend and resolved scientific inputs"><Play size={14} />Run simulation</button><span className="muted">Phase 2 · solver unavailable</span></div>
    </Panel>
    <Panel title="Published fitted parameters" eyebrow="SECOND-CYCLE CALIBRATION" action={<FlaskConical size={16} className="muted" />}><div className="fitted-grid">{fittedParameters.map(f => <div key={f.name}><span>{f.name}</span><strong className="mono">{f.value}</strong><small>{f.source}</small><Badge tone="amber">Fitted · not universal</Badge></div>)}</div></Panel>
  </div>
}
