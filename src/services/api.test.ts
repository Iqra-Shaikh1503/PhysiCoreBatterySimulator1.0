import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpBatteryApi, MockBatteryApi } from './api'
import { baselineDraft } from '../data/parameters'
import { toConfiguration } from './configuration'

afterEach(() => vi.unstubAllGlobals())
describe('Phase 2 API integration', () => {
  it('keeps mock submission explicitly unsupported', async () => {
    await expect(new MockBatteryApi().submitSimulation(toConfiguration(baselineDraft()))).rejects.toThrow('No simulation backend')
  })
  it('posts the existing source-unit configuration and accepts job IDs', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({jobId:'job-1'}), {status:202}))
    vi.stubGlobal('fetch', fetcher)
    const config = toConfiguration(baselineDraft())
    expect(await new HttpBatteryApi('http://localhost:8000/').submitSimulation(config)).toEqual({jobId:'job-1'})
    const [url, options] = fetcher.mock.calls[0]!
    expect(url).toBe('http://localhost:8000/simulations')
    expect(JSON.parse(options.body)).toEqual(config)
  })
  it('retrieves persisted failure records without fake plots', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({items:[{id:'1',status:'failed',error:{code:'SOLVER_NOT_IMPLEMENTED',message:'Unavailable'}}]}))))
    const jobs = await new HttpBatteryApi('').listSimulations()
    expect(jobs[0]?.error?.code).toBe('SOLVER_NOT_IMPLEMENTED')
  })
  it('rejects malformed capabilities', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')))
    await expect(new HttpBatteryApi('').getCapabilities()).rejects.toThrow('Unexpected capabilities')
  })
  it('reports HTTP failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {status:422})))
    await expect(new HttpBatteryApi('').submitSimulation(toConfiguration(baselineDraft()))).rejects.toThrow('422')
  })
})
