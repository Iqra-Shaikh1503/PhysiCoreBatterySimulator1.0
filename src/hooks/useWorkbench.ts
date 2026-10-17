import { useMemo, useRef, useState } from 'react'
import { baselineDraft, draftFromConfiguration } from '../data/parameters'
import { batteryApi } from '../services/api'
import { readCases, writeCases } from '../services/cases'
import { reviewConfiguration, toConfiguration } from '../services/configuration'
import type { DraftConfiguration, SavedCase } from '../types/model'

function loadCases() {
  try { return { cases: readCases(), error: '' } }
  catch { return { cases: [] as SavedCase[], error: 'Saved cases could not be read. Browser storage may be unavailable or damaged. Nothing was overwritten.' } }
}
export function useWorkbench() {
  const [initial] = useState(loadCases)
  const [cases, setCases] = useState(initial.cases)
  const [draft, setDraft] = useState<DraftConfiguration>(baselineDraft)
  const [name, setName] = useState('Paper baseline')
  const [notice, setNotice] = useState(initial.error)
  const [error, setError] = useState(!!initial.error)
  const [checking, setChecking] = useState(false)
  const [checked, setChecked] = useState(false)
  const sequence = useRef(0)
  const review = useMemo(() => reviewConfiguration(draft), [draft])
  function announce(message: string, failed = false) { setNotice(message); setError(failed) }
  function updateDraft(next: DraftConfiguration) {
    sequence.current++
    setDraft(next)
    setChecked(false)
    setChecking(false)
  }
  function loadBaseline() {
    updateDraft(baselineDraft()); setName('Paper baseline')
    announce('Paper baseline loaded with original values and source units. Scientific warnings are preserved.')
  }
  function saveCase() {
    if (!name.trim() || name.trim().length > 80) { announce('Use a case name between 1 and 80 characters.', true); return }
    try {
      const item: SavedCase = { id: crypto.randomUUID(), name: name.trim(), createdAt: new Date().toISOString(), configuration: toConfiguration(draft) }
      const next = [item, ...cases].slice(0, 50)
      writeCases(next); setCases(next); announce('Configuration saved in this browser. No simulation results were created.')
    } catch (e) { announce(e instanceof Error ? e.message : 'Could not save the case.', true) }
  }
  function loadCase(item: SavedCase) {
    updateDraft(draftFromConfiguration(item.configuration)); setName(item.name)
    announce('Loaded configuration: ' + item.name + '. This case has not been simulated.')
  }
  function deleteCase(id: string) {
    try { const next = cases.filter(c => c.id !== id); writeCases(next); setCases(next); announce('Saved configuration removed from this browser. Any downloaded copy is unchanged.') }
    catch { announce('Browser storage could not be updated. The case was not removed.', true) }
  }
  async function checkConfiguration() {
    if (!review.valid) { announce('Correct the highlighted input errors before checking.', true); return }
    const request = ++sequence.current
    setChecking(true); setChecked(false)
    try {
      const result = await batteryApi.checkConfiguration(toConfiguration(draft))
      if (request !== sequence.current) return
      setChecked(result.review.valid)
      announce((result.transport === 'http' ? 'Backend' : 'Mock') + ' input check complete. Scientific warnings remain; no solver or experimental validation was run.')
    } catch (e) {
      if (request === sequence.current) announce(e instanceof Error ? e.message : 'Input check failed.', true)
    } finally { if (request === sequence.current) setChecking(false) }
  }
  return { draft, updateDraft, name, setName, review, cases, notice, error, checking, checked, announce, loadBaseline, saveCase, loadCase, deleteCase, checkConfiguration }
}
export type Workbench = ReturnType<typeof useWorkbench>
