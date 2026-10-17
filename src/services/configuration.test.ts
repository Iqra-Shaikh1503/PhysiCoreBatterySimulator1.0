import { expect, it } from 'vitest'
import { baselineDraft } from '../data/parameters'
import { reviewConfiguration } from './configuration'

it('preserves baseline charge imbalance as a warning', () => {
  const review = reviewConfiguration(baselineDraft())
  expect(review.valid).toBe(true)
  expect(review.issues.some(issue => issue.message.includes('0.004'))).toBe(true)
})
it('rejects zero geometry and full porosity', () => {
  for (const field of ['height', 'porosity'] as const) {
    const draft = baselineDraft()
    draft.values[field] = field === 'height' ? '0' : '1'
    expect(reviewConfiguration(draft).valid).toBe(false)
  }
})
