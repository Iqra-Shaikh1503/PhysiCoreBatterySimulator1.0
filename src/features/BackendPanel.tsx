import { useEffect, useRef, useState } from 'react'
import { batteryApi } from '../services/api'
import type { BackendJob, Capabilities } from '../services/api'
import type { Workbench } from '../hooks/useWorkbench'
import { toConfiguration } from '../services/configuration'
import { Panel, Badge } from '../components/ui'

export function BackendPanel({ work }: { work: Workbench }) {
  const [caps, setCaps] = useState<Capabilities | null>(null)
  const [jobs, setJobs] = useState<BackendJob[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    if (batteryApi.mode !== 'http') return
    let active = true
    const update = async () => {
      try {
        const [capabilities, history] = await Promise.all([batteryApi.getCapabilities(), batteryApi.listSimulations()])
        if (active) { setCaps(capabilities); setJobs(history); setMessage('Connected. Job records are stored in the backend database.') }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : 'Backend unavailable') }
    }
    void update()
    const timer = window.setInterval(() => { void update() }, 1500)
    return () => { active = false; alive.current = false; window.clearInterval(timer) }
  }, [])
  async function submit() {
    setBusy(true)
    try {
      const result = await batteryApi.submitSimulation(toConfiguration(work.draft))
      if (alive.current) setMessage('Job accepted: '+result.jobId+'. Polling for status.')
    } catch (error) { if (alive.current) setMessage(error instanceof Error ? error.message : 'Submission failed') }
    finally { if (alive.current) setBusy(false) }
  }
  async function save() {
    setBusy(true)
    try {
      const item = await batteryApi.saveCase(work.name, toConfiguration(work.draft))
      if (alive.current) setMessage('Saved to backend database: '+item.id)
    } catch (error) { if (alive.current) setMessage(error instanceof Error ? error.message : 'Save failed') }
    finally { if (alive.current) setBusy(false) }
  }
  return <Panel title="Backend jobs & persistence" eyebrow="FOUNDATION STATUS" action={<Badge tone={caps ? 'teal' : 'amber'}>{caps ? 'Connected' : batteryApi.mode}</Badge>}>
    <p>Use a foundation job to check submission, persistence and status polling. The Phase 2 runner reports SOLVER_NOT_IMPLEMENTED; it produces no voltage or concentration data.</p>
    <div className="panel-actions"><button className="button primary" disabled={!caps || !work.review.valid || busy} onClick={() => { void submit() }}>Submit foundation job</button><button className="button secondary" disabled={!caps || !work.review.valid || !work.name.trim() || busy} onClick={() => { void save() }}>Save case to database</button></div>
    <p role="status">{batteryApi.mode === 'mock' ? 'Set VITE_API_MODE=http in .env.local and restart Vite to connect.' : message}</p>
    {jobs.length > 0 && <div className="table-scroll"><table className="data-table"><thead><tr><th>Job ID</th><th>Status</th><th>Details</th></tr></thead><tbody>{jobs.map(job => <tr key={job.id}><td className="mono">{job.id}</td><td>{job.status}</td><td>{job.error?.code ?? 'Awaiting execution'}{job.error && <small>{job.error.message}</small>}</td></tr>)}</tbody></table></div>}
  </Panel>
}
