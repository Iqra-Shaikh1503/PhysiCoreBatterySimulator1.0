import { useRef, useState } from 'react'
import { FileUp, Upload, X, LoaderCircle } from 'lucide-react'
import type { ExperimentalDataset } from '../types/model'
import { experimentalSeries, isMeasurementColumn, measurementColumns, parseExperimentalCsv } from '../services/csv'
import type { MeasurementColumn } from '../services/csv'
import { Badge, InfoStrip, Panel } from '../components/ui'
import { ScientificPlot } from '../components/ScientificPlot'

export function ExperimentalValidation({ datasets, setDatasets }: { datasets: ExperimentalDataset[]; setDatasets: (datasets: ExperimentalDataset[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState('')
  const [column, setColumn] = useState<MeasurementColumn>('voltage_v')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const active = datasets.find(d => d.id === selected) ?? datasets[0]
  const columns = active?.columns.filter(isMeasurementColumn) ?? []
  const actualColumn = columns.includes(column) ? column : columns[0] ?? 'voltage_v'
  const definition = measurementColumns[actualColumn]
  async function importFile(file?: File) {
    if (!file) return
    setBusy(true); setMessage(''); setFailed(false)
    try {
      if (file.size > 2_000_000) throw new Error('CSV must be smaller than 2 MB.')
      if (datasets.length >= 10) throw new Error('Remove a dataset before importing another (10-file session limit).')
      const dataset = parseExperimentalCsv(await file.text(), file.name)
      setDatasets([...datasets, dataset]); setSelected(dataset.id)
      setMessage('Imported ' + dataset.rows + ' measurement rows locally. No simulated comparison or validation was performed.')
    } catch (e) { setFailed(true); setMessage(e instanceof Error ? e.message : 'Could not read the CSV file.') }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }
  return <div className="feature-stack"><InfoStrip>Files remain on your device and in this session’s memory. Imported measurements are not automatically validated or uploaded to a backend.</InfoStrip>
    <Panel title="Experimental measurements" eyebrow="CSV IMPORT" action={<Badge>Local only</Badge>}><div className="upload-area"><FileUp size={28} /><h3>Bring your measurements into the workspace</h3><p>CSV · up to 2 MB · 50,000 rows · explicit source units</p><button className="button primary" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? <LoaderCircle size={15} className="spin" /> : <Upload size={15} />}{busy ? 'Reading CSV…' : 'Choose CSV file'}</button><input className="sr-only" ref={fileRef} tabIndex={-1} type="file" accept=".csv,text/csv" aria-label="Upload experimental CSV" onChange={e => { void importFile(e.target.files?.[0]) }} /></div>
      <details className="csv-format"><summary>Accepted CSV format and unit conventions</summary><p>Required: <code>time_s</code>. Include at least one measurement column below. All cells must be finite numbers; times must be nonnegative and strictly increasing. No silent conversion, interpolation or duplicate removal.</p><div className="column-list">{Object.entries(measurementColumns).map(([key, value]) => <div key={key}><code>{key}</code><span>{value.unit}</span></div>)}</div><p>Potential columns require you to retain the original electrode-reference metadata. Reference conversion and validation metrics are deferred until a corresponding simulation exists. No sample measurements are supplied.</p></details>
      {message && <div className={'inline-message ' + (failed ? 'failure' : 'success')} role={failed ? 'alert' : 'status'}>{message}</div>}
    </Panel>
    {active && <Panel title="Imported datasets" eyebrow="SESSION DATA"><div className="dataset-controls"><label className="field"><span>Dataset</span><select value={active.id} onChange={e => setSelected(e.target.value)}>{datasets.map(d => <option key={d.id} value={d.id}>{d.name} · {d.rows} rows</option>)}</select></label><label className="field"><span>Measurement</span><select value={actualColumn} onChange={e => setColumn(e.target.value as MeasurementColumn)}>{columns.map(c => <option key={c} value={c}>{measurementColumns[c].label} ({measurementColumns[c].unit})</option>)}</select></label><button className="button secondary small" onClick={() => { setDatasets(datasets.filter(d => d.id !== active.id)); setMessage('Dataset removed from this session. Original file unchanged.') }}><X size={14} />Remove dataset</button></div><p className="panel-description">Imported {new Date(active.importedAt).toLocaleString()} · {active.rows} rows · measured data only</p></Panel>}
    <ScientificPlot kind="comparison" series={active ? experimentalSeries(active, actualColumn) : []} definition={{ title: definition.label + ' · experimental data', xLabel: 'Time (s)', yLabel: definition.label + ' (' + definition.unit + ')', empty: 'Import measurements to view a real dataset. Simulated overlays require backend results.' }} provenance={active ? 'Uploaded CSV · ' + active.name + ' · original units' : 'No experimental dataset imported'} />
    <Panel title="Validation metrics" eyebrow="INDEPENDENT COMPARISON"><div className="metric-placeholder-grid">{['RMSE', 'MAE', 'R²'].map(label => <div key={label}><span>{label}</span><strong>—</strong><small>Requires paired simulation and experimental data</small></div>)}</div><InfoStrip>Import success means the file was parsed. It does not mean validation passed.</InfoStrip></Panel>
  </div>
}
