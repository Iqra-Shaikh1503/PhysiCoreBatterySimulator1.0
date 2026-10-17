import { useState } from 'react'
import { navigation } from './data/navigation'
import type { ExperimentalDataset, Section } from './types/model'
import { useWorkbench } from './hooks/useWorkbench'
import { ConfigurationEditor } from './features/ConfigurationEditor'
import { Cases } from './features/Cases'
import { ExperimentalValidation } from './features/ExperimentalValidation'
import { AnalysisView, Visualizer, StudyView, ResearchReport, ScopePanel } from './features/ResearchViews'
import { BackendPanel } from './features/BackendPanel'
import { batteryApi } from './services/api'

export function App() {
  const work = useWorkbench()
  const [section, setSection] = useState<Section>('dashboard')
  const [datasets, setDatasets] = useState<ExperimentalDataset[]>([])
  const [selected, setSelected] = useState<string[]>([])
  function toggle(id: string) { setSelected(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id].slice(-4)) }
  const page = navigation.find(item => item.id === section)!
  return <div className="app-layout">
    <aside><h1>Physicore<br />Battery Lab</h1><p>Zinc–Cerium Research</p><nav aria-label="Workspace">{navigation.map(item => <button key={item.id} aria-current={section === item.id ? 'page' : undefined} onClick={() => setSection(item.id)}><item.icon size={16} />{item.label}</button>)}</nav></aside>
    <main><header><span className="eyebrow">PHASE 2 / BACKEND FOUNDATION</span><h1>{page.label}</h1><p>{page.description}</p><span className="badge">{batteryApi.mode === 'http' ? 'HTTP API configured' : 'Explicit mock mode'} · Scientific solver unavailable</span></header>
      {work.notice && <div className={'notice '+(work.error ? 'error-text' : '')} role={work.error ? 'alert' : 'status'}>{work.notice}</div>}
      {(section === 'dashboard' || section === 'simulation') && <BackendPanel work={work} />}
      {section === 'dashboard' && <><ScopePanel /><Cases work={work} selected={selected} onSelect={toggle} onConfigure={() => setSection('simulation')} /></>}
      {section === 'simulation' && <ConfigurationEditor work={work} />}
      {section === 'visualizer' && <Visualizer />}
      {['electrochemistry','transport','charge','cycles','degradation'].includes(section) && <AnalysisView section={section} />}
      {(section === 'sensitivity' || section === 'optimization') && <StudyView optimize={section === 'optimization'} work={work} />}
      {section === 'validation' && <ExperimentalValidation datasets={datasets} setDatasets={setDatasets} />}
      {section === 'report' && <ResearchReport work={work} datasets={datasets} />}
      <footer>Input checks, job completion and scientific validation are separate. No calculated battery results are available in Phase 2.</footer>
    </main>
  </div>
}
