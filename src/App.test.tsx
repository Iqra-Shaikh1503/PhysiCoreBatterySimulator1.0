import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from './App'

it('opens the restored workstation and navigates to source-traceable inputs', () => {
  render(<App />)
  expect(screen.getByRole('heading', {name:'Dashboard'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name:'Submit foundation job'})).toBeDisabled()
  fireEvent.click(screen.getByRole('button', {name:'Simulation'}))
  expect(screen.getByRole('heading', {name:'Case configuration'})).toBeInTheDocument()
  expect(screen.getByLabelText('Electrode height')).toHaveValue(45)
})
