import { draftFromConfiguration } from '../data/parameters'
import { reviewConfiguration } from './configuration'
import type { Configuration, ConfigurationReview, SavedCase } from '../types/model'

export interface ConfigurationCheck { transport: 'mock' | 'http'; scope: 'input-only'; review: ConfigurationReview }
export interface Capabilities { phase: number; solverImplemented: boolean; persistence: boolean; asyncJobs: boolean }
export interface BackendJob { id: string; status: 'queued' | 'running' | 'completed' | 'failed'; error: { code: string; message: string } | null }
export interface BatteryApi {
  getCapabilities(): Promise<Capabilities>
  listSimulations(): Promise<BackendJob[]>
  saveCase(name: string, configuration: Configuration): Promise<SavedCase>
  readonly mode: 'mock' | 'http'
  checkConfiguration(configuration: Configuration): Promise<ConfigurationCheck>
  submitSimulation(configuration: Configuration): Promise<{ jobId: string }>
}
export class MockBatteryApi implements BatteryApi {
  readonly mode = 'mock' as const
  async getCapabilities(): Promise<Capabilities> { throw new Error('Mock mode: backend not connected.') }
  async listSimulations(): Promise<BackendJob[]> { return [] }
  async saveCase(): Promise<SavedCase> { throw new Error('Mock mode: database not connected.') }
  async checkConfiguration(configuration: Configuration): Promise<ConfigurationCheck> {
    await new Promise(resolve => setTimeout(resolve, 450))
    return { transport: 'mock', scope: 'input-only', review: reviewConfiguration(draftFromConfiguration(configuration)) }
  }
  async submitSimulation(configuration: Configuration): Promise<{ jobId: string }> {
    void configuration
    throw new Error('No simulation backend is connected. Mock mode does not calculate scientific results.')
  }
}
/** Phase 2 HTTP client. Unit names match the source-unit API schema. */
export class HttpBatteryApi implements BatteryApi {
  readonly mode = 'http' as const
  constructor(private readonly baseUrl: string) {}
  async getCapabilities(): Promise<Capabilities> {
    const result = await this.request('/capabilities')
    if (!result || typeof result !== 'object' || !('phase' in result) || typeof result.phase !== 'number' || !('solverImplemented' in result) || typeof result.solverImplemented !== 'boolean' || !('persistence' in result) || typeof result.persistence !== 'boolean' || !('asyncJobs' in result) || typeof result.asyncJobs !== 'boolean') throw new Error('Unexpected capabilities response.')
    return { phase: result.phase, solverImplemented: result.solverImplemented, persistence: result.persistence, asyncJobs: result.asyncJobs }
  }
  async listSimulations(): Promise<BackendJob[]> {
    const result = await this.request('/simulations')
    if (!result || typeof result !== 'object' || !('items' in result) || !Array.isArray(result.items)) throw new Error('Unexpected job list response.')
    return result.items.map((item: unknown) => {
      if (!item || typeof item !== 'object' || !('id' in item) || typeof item.id !== 'string' || !('status' in item) || !['queued','running','completed','failed'].includes(String(item.status)) || !('error' in item)) throw new Error('Unexpected job response.')
      let error: BackendJob['error'] = null
      if (item.error !== null) {
        if (typeof item.error !== 'object' || !item.error || !('code' in item.error) || typeof item.error.code !== 'string' || !('message' in item.error) || typeof item.error.message !== 'string') throw new Error('Unexpected job error response.')
        error = { code: item.error.code, message: item.error.message }
      }
      return { id: item.id, status: item.status as BackendJob['status'], error }
    })
  }
  async saveCase(name: string, configuration: Configuration): Promise<SavedCase> {
    const result = await this.request('/cases', { name, configuration })
    if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !('name' in result) || typeof result.name !== 'string' || !('createdAt' in result) || typeof result.createdAt !== 'string') throw new Error('Unexpected saved case response.')
    return { id: result.id, name: result.name, createdAt: result.createdAt, configuration }
  }
  async checkConfiguration(configuration: Configuration): Promise<ConfigurationCheck> {
    const result: unknown = await this.request('/configurations/validate', configuration)
    if (!result || typeof result !== 'object' || !('valid' in result) || typeof result.valid !== 'boolean' || !('issues' in result) || !Array.isArray(result.issues)) throw new Error('Unexpected configuration-check response.')
    const issues = result.issues.map((issue: unknown) => {
      if (!issue || typeof issue !== 'object' || !('message' in issue) || typeof issue.message !== 'string' || !('severity' in issue) || (issue.severity !== 'error' && issue.severity !== 'warning')) throw new Error('Unexpected issue in configuration-check response.')
      return { message: issue.message, severity: issue.severity as 'error' | 'warning' }
    })
    return { transport: 'http', scope: 'input-only', review: { valid: result.valid, issues } }
  }
  async submitSimulation(configuration: Configuration): Promise<{ jobId: string }> {
    const result: unknown = await this.request('/simulations', configuration)
    if (!result || typeof result !== 'object' || !('jobId' in result) || typeof result.jobId !== 'string') throw new Error('Unexpected simulation-submission response.')
    return { jobId: result.jobId }
  }
  private async request(path: string, payload?: unknown): Promise<unknown> {
    const response = await fetch(this.baseUrl.replace(/\/$/, '') + path, { method: payload === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error('Backend request failed (' + response.status + ').')
    return response.json() as Promise<unknown>
  }
}
export const batteryApi: BatteryApi = import.meta.env.VITE_API_MODE === 'http' ? new HttpBatteryApi(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000') : new MockBatteryApi()
