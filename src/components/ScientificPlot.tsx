import { useEffect, useId, useRef, useState } from 'react'
import { ChartNoAxesCombined } from 'lucide-react'
import type { Data, Layout } from 'plotly.js'
import type { PlotDefinition, PlotKind, PlotSeries } from '../types/model'
import { Badge, Panel } from './ui'

const plotDefinitions: Record<PlotKind, PlotDefinition> = {
  voltage: { title: 'Cell voltage', xLabel: 'Time (h)', yLabel: 'Cell voltage (V)', empty: 'Run a simulation to inspect the voltage response.' },
  charge: { title: 'Charge / discharge profile', xLabel: 'Time (h)', yLabel: 'Cell voltage (V)', empty: 'Phase-resolved voltage data will appear here.' },
  potentials: { title: 'Electrode potentials', xLabel: 'Time (h)', yLabel: 'Potential (V · reference required)', empty: 'Positive and negative potentials require solver output and a declared reference.' },
  cerium: { title: 'Ce(IV) accumulation', xLabel: 'Cycle', yLabel: 'Ce(IV) (mol/L)', empty: 'No cycle concentration data is available.' },
  heatmap: { title: 'Species concentration field', xLabel: 'Thickness x (mm)', yLabel: 'Height y (mm)', empty: 'No spatial mesh or species field is available. No heatmap has been generated.' },
  velocity: { title: 'Electrolyte velocity', xLabel: 'Thickness x (mm)', yLabel: 'Height y (mm)', empty: 'Velocity fields require the fluid-flow solver.' },
  pressure: { title: 'Pressure distribution', xLabel: 'Thickness x (mm)', yLabel: 'Height y (mm)', empty: 'No calculated pressure field is available.' },
  reactions: { title: 'Reaction-current allocation', xLabel: 'Reaction', yLabel: 'Current density (A/m²)', empty: 'Zn, Ce, HER and OER current contributions have not been calculated.' },
  efficiency: { title: 'Efficiency across cycles', xLabel: 'Cycle', yLabel: 'Efficiency (%)', empty: 'Charge, voltage and energy efficiencies require completed cycles.' },
  sensitivity: { title: 'Parameter response', xLabel: 'Parameter (selected unit)', yLabel: 'Response (selected metric)', empty: 'No parameter sweep has been executed.' },
  comparison: { title: 'Experimental / simulated comparison', xLabel: 'Time (s)', yLabel: 'Cell voltage (V)', empty: 'Import measurements to view experimental data. Simulated overlays remain unavailable.' },
}
export function ScientificPlot({ kind, series = [], definition, provenance, compact = false }: { kind: PlotKind; series?: PlotSeries[]; definition?: PlotDefinition; provenance?: string; compact?: boolean }) {
  const d = definition ?? plotDefinitions[kind]
  const hasData = series.some(s => s.x.length > 0 && s.y.length > 0)
  return <Panel title={d.title} eyebrow="SCIENTIFIC PLOT" action={<Badge tone={hasData ? 'teal' : 'muted'}>{hasData ? 'Imported measurements' : 'No data'}</Badge>} className={'plot-panel ' + (compact ? 'compact' : '')}>
    {hasData ? <PlotCanvas series={series} definition={d} /> : <div className="chart-empty" role="img" aria-label={d.title + ': no data available'}>
      <div className="chart-grid" aria-hidden="true" />
      <span className="axis-y">{d.yLabel}</span><span className="axis-x">{d.xLabel}</span>
      <div className="chart-message"><ChartNoAxesCombined size={25} /><strong>Awaiting data</strong><span>{d.empty}</span></div>
    </div>}
    <div className="plot-caption"><span className="legend-dot" />{provenance ?? 'Simulation results · numerical backend not connected'}<span className="mono">Zn–Ce / 2D</span></div>
  </Panel>
}
function PlotCanvas({ series, definition }: { series: PlotSeries[]; definition: PlotDefinition }) {
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    const el = ref.current
    let plot: typeof import('plotly.js') | undefined
    let observer: ResizeObserver | undefined
    if (!el) return
    setLoading(true); setError('')
    void import('plotly.js-dist-min').then(async module => {
      if (cancelled) return
      plot = module.default
      const traces: Data[] = series.map(s => ({
        x: s.x, y: s.y, ...(s.z ? { z: s.z } : {}), name: s.name, type: s.type ?? 'scatter',
        ...(s.type === 'heatmap' ? { colorscale: 'Viridis', showscale: true } : { mode: 'lines+markers', line: { color: s.color ?? '#59d5c3', width: 2 }, marker: { size: 5 } }),
      } as Data))
      const layout: Partial<Layout> = {
        autosize: true, paper_bgcolor: '#11161b', plot_bgcolor: '#11161b', font: { color: '#a5b0bc', family: 'system-ui', size: 11 },
        margin: { t: 25, r: 30, b: 62, l: 65 },
        xaxis: { title: { text: definition.xLabel }, gridcolor: '#252d35', zerolinecolor: '#38444d', automargin: true },
        yaxis: { title: { text: definition.yLabel }, gridcolor: '#252d35', zerolinecolor: '#38444d', automargin: true },
        legend: { orientation: 'h', y: 1.18 }, hovermode: 'closest',
      }
      const plotted = await plot.react(el, traces, layout, { responsive: true, displaylogo: false, displayModeBar: 'hover', toImageButtonOptions: { filename: 'physicore-experimental-data' } })
      if (cancelled) { plot.purge(el); return }
      setLoading(false)
      if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(() => { if (plot && !cancelled) void plot.Plots.resize(plotted) }); observer.observe(el) }
    }).catch(() => { if (!cancelled) { setError('The plot library could not load. Measurements remain imported; reload the page to retry.'); setLoading(false) } })
    return () => { cancelled = true; observer?.disconnect(); plot?.purge(el) }
  }, [series, definition])
  return <div className="plot-canvas-wrap" aria-busy={loading}><div id={id} ref={ref} className="plot-canvas" role="img" aria-label={definition.title + ' — imported experimental measurements'} />{loading && <p className="plot-loading" role="status">Loading scientific chart…</p>}{error && <p className="plot-loading error-text" role="alert">{error}</p>}</div>
}
