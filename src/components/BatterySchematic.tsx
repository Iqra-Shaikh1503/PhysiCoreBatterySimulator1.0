import { useId } from 'react'
import type { Mode } from '../types/model'

export function BatterySchematic({ mode, compact = false }: { mode: Mode; compact?: boolean }) {
  const id = useId().replaceAll(':', '')
  const charging = mode === 'charge'
  return <div className={'schematic ' + (compact ? 'schematic-compact' : '')}>
    <svg viewBox="0 0 620 350" role="img" aria-label={'Illustrative Zn–Ce battery schematic: ' + (charging ? 'zinc deposition and cerium oxidation during charge' : 'zinc dissolution and cerium reduction during discharge') + '. Not to scale; no calculated field.'}>
      <defs>
        <pattern id={id + '-mesh'} width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0L9 9M9 0L0 9" stroke="#467b79" strokeWidth="0.7" /></pattern>
        <marker id={id + '-arrow'} markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L5 3L0 6" fill="none" stroke="#63baa9" /></marker>
      </defs>
      <text x="103" y="24" className="svg-overline">NEGATIVE HALF-CELL</text><text x="371" y="24" className="svg-overline">POSITIVE HALF-CELL</text>
      <path d="M112 106V62H238V93M112 236v53h126v-35M508 106V62H382V93M508 236v53H382v-35" fill="none" stroke="#3b5d61" strokeWidth="2" />
      <path d="M172 62h32M444 289h-28" fill="none" stroke="#63baa9" markerEnd={'url(#' + id + '-arrow)'} />
      <rect x="63" y="106" width="98" height="130" rx="12" fill="#172327" stroke="#37565a" />
      <rect x="75" y="174" width="74" height="50" rx="5" fill="#1e393b" /><path d="M75 174q18-6 37 0t37 0" fill="none" stroke="#47797a" />
      <text x="112" y="144" textAnchor="middle" className="svg-label">Zn(II)</text><text x="112" y="161" textAnchor="middle" className="svg-small">reservoir</text>
      <rect x="459" y="106" width="98" height="130" rx="12" fill="#172327" stroke="#37565a" />
      <rect x="471" y="174" width="74" height="50" rx="5" fill="#203637" /><path d="M471 174q18-6 37 0t37 0" fill="none" stroke="#47797a" />
      <text x="508" y="144" textAnchor="middle" className="svg-label">Ce(III / IV)</text><text x="508" y="161" textAnchor="middle" className="svg-small">reservoir</text>
      <rect x="202" y="93" width="216" height="161" rx="7" fill="#10181c" stroke="#40515c" />
      <rect x="215" y="105" width="15" height="137" fill="#78868c" rx="2" />
      <rect x="230" y="105" width="55" height="137" fill="#193337" />
      <rect x="295" y="105" width="18" height="137" fill="#53797a" rx="1" />
      <rect x="323" y="105" width="67" height="137" fill="#1a3134" />
      <rect x="323" y="105" width="67" height="137" fill={'url(#' + id + '-mesh)'} />
      <rect x="390" y="105" width="14" height="137" fill="#73818a" rx="2" />
      <path d="M258 222V193M357 222V193" stroke="#63baa9" fill="none" markerEnd={'url(#' + id + '-arrow)'} />
      <text x="256" y="139" textAnchor="middle" className="svg-label">Zn²⁺</text><text x="356" y="139" textAnchor="middle" className="svg-label">{charging ? 'Ce³⁺ → Ce⁴⁺' : 'Ce⁴⁺ → Ce³⁺'}</text>
      <path d={charging ? 'M348 171H267' : 'M267 171H348'} stroke="#b9d8cd" strokeDasharray="4 4" markerEnd={'url(#' + id + '-arrow)'} />
      <rect x="290" y="157" width="30" height="26" rx="5" fill="#17292d" /><text x="305" y="174" textAnchor="middle" className="svg-label">H⁺</text>
      <path d="M222 105V53H397v52" stroke="#718088" fill="none" strokeDasharray="4 4" />
      <text x="310" y="47" textAnchor="middle" className="svg-small">external circuit</text>
      {charging && <g><circle cx="238" cy="116" r="2.5" fill="none" stroke="#c8ad77" /><circle cx="243" cy="108" r="2" fill="none" stroke="#c8ad77" /><circle cx="378" cy="115" r="2.5" fill="none" stroke="#c8ad77" /><text x="249" y="98" className="svg-small">H₂</text><text x="367" y="98" className="svg-small">O₂</text></g>}
      <text x="220" y="271" textAnchor="middle" className="svg-small">Carbon / Zn</text><text x="305" y="271" textAnchor="middle" className="svg-small">Nafion</text><text x="370" y="271" textAnchor="middle" className="svg-small">Porous Pt/Ti</text>
      <circle cx="172" cy="289" r="10" fill="#132226" stroke="#47716d" /><path d="M169 284l6 5-6 5z" fill="#64b7a8" /><circle cx="444" cy="289" r="10" fill="#132226" stroke="#47716d" /><path d="M447 284l-6 5 6 5z" fill="#64b7a8" />
      <text x="310" y="313" textAnchor="middle" className="svg-small">{charging ? 'Zn deposition · Ce oxidation · HER / OER' : 'Zn dissolution · Ce reduction · no modeled gas evolution'}</text>
      <text x="310" y="338" textAnchor="middle" className="svg-footnote">EXPLANATORY SCHEMATIC · NOT TO SCALE · NO CALCULATED FIELD</text>
    </svg>
  </div>
}
