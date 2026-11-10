import clsx from 'clsx'

import type { Example, FEdge, FNode, Side } from './types'

const CHAR_W = 7.8
const SKEW = 12

export function nodeLabel(n: FNode): string[] {
  switch (n.kind) {
    case 'start': return ['بداية']
    case 'end': return ['نهاية']
    case 'join': return []
    case 'input': return [`Read(${n.code})`]
    case 'output': return [`Write(${n.code})`]
    case 'decision': return [`${n.code} ?`]
    case 'process': return (n.code ?? '').split('\n')
  }
}

function textW(s: string) {
  return s.length * CHAR_W
}

export function nodeBox(n: FNode): { w: number; h: number } {
  let lines = nodeLabel(n)
  let tw = Math.max(0, ...lines.map(textW))
  switch (n.kind) {
    case 'start':
    case 'end': return { w: 100, h: 38 }
    case 'join': return { w: 18, h: 18 }
    case 'input':
    case 'output': return { w: tw + 44, h: 38 }
    case 'process': return { w: tw + 28, h: 20 * lines.length + 18 }
    case 'decision': return { w: Math.max(tw + 70, 120), h: 66 }
  }
}

function anchor(n: FNode, side: Side): [number, number] {
  let { w, h } = nodeBox(n)
  let inset = n.kind === 'input' || n.kind === 'output' ? SKEW / 2 : 0
  switch (side) {
    case 'top': return [n.x, n.y - h / 2]
    case 'bottom': return [n.x, n.y + h / 2]
    case 'left': return [n.x - w / 2 + inset, n.y]
    case 'right': return [n.x + w / 2 - inset, n.y]
  }
}

export function edgePoints(e: FEdge, byId: Map<string, FNode>): Array<[number, number]> {
  let a = byId.get(e.from)!
  let b = byId.get(e.to)!
  return [anchor(a, e.fromSide ?? 'bottom'), ...(e.via ?? []), anchor(b, e.toSide ?? 'top')]
}

function Shape({ n }: { n: FNode }) {
  let { w, h } = nodeBox(n)
  let l = n.x - w / 2
  let t = n.y - h / 2
  switch (n.kind) {
    case 'start':
    case 'end':
      return <rect x={l} y={t} width={w} height={h} rx={h / 2} />
    case 'join':
      return <circle cx={n.x} cy={n.y} r={9} />
    case 'process':
      return <rect x={l} y={t} width={w} height={h} rx={3} />
    case 'input':
    case 'output':
      return <polygon points={`${l + SKEW},${t} ${l + w},${t} ${l + w - SKEW},${t + h} ${l},${t + h}`} />
    case 'decision':
      return <polygon points={`${n.x},${t} ${l + w},${n.y} ${n.x},${t + h} ${l},${n.y}`} />
  }
}

const ARABIC = /[؀-ۿ]/

/** Monospace fonts have no Arabic shaping: draw Arabic string literals in the site's Arabic font. */
function CodeLine({ line }: { line: string }) {
  let parts = line.split(/("[^"]*")/)
  return (
    <>
      {parts.map((p, i) =>
        ARABIC.test(p) ? (
          <tspan key={i} className="font-sans">{p}</tspan>
        ) : (
          <tspan key={i}>{p}</tspan>
        ),
      )}
    </>
  )
}

export type NodeState = 'hidden' | 'new' | 'active' | 'visited' | 'normal'

export function FlowchartSvg({
  example,
  nodeState,
  activeEdge = null,
  takenEdges,
  className,
}: {
  example: Example
  nodeState: (id: string) => NodeState
  activeEdge?: number | null
  takenEdges?: Set<number>
  className?: string
}) {
  let byId = new Map(example.nodes.map((n) => [n.id, n]))
  let markerId = `ah-${example.id}`

  return (
    <svg
      viewBox={`0 0 ${example.width} ${example.height}`}
      className={clsx('mx-auto block h-auto w-full', className)}
      role="img"
      aria-label={`المخطط النسقي: ${example.title}`}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-slate-500 dark:fill-slate-400" />
        </marker>
        <marker id={`${markerId}-on`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-sky-600 dark:fill-sky-400" />
        </marker>
      </defs>

      {example.edges.map((e, i) => {
        let hidden = nodeState(e.from) === 'hidden' || nodeState(e.to) === 'hidden'
        let on = activeEdge === i
        let taken = takenEdges?.has(i)
        let pts = edgePoints(e, byId)
        let [x0, y0] = pts[0]
        let side = e.fromSide ?? 'bottom'
        let lx = side === 'left' ? x0 - 8 : side === 'right' ? x0 + 8 : x0 + 8
        let ly = side === 'bottom' ? y0 + 16 : y0 - 8
        return (
          <g key={i} className={clsx('transition-opacity duration-300', hidden && 'opacity-0')}>
            <polyline
              points={pts.map((p) => p.join(',')).join(' ')}
              fill="none"
              strokeWidth={on ? 3 : 1.6}
              markerEnd={`url(#${on ? `${markerId}-on` : markerId})`}
              className={clsx(
                on ? 'stroke-sky-600 dark:stroke-sky-400' : taken ? 'stroke-slate-500 dark:stroke-slate-300' : 'stroke-slate-400 dark:stroke-slate-500',
              )}
            />
            {e.branch && (
              <text
                x={lx}
                y={ly}
                fontSize={12}
                textAnchor={side === 'left' ? 'end' : 'start'}
                className={clsx('font-sans font-bold', e.branch === 'yes' ? 'fill-emerald-700 dark:fill-emerald-400' : 'fill-rose-700 dark:fill-rose-400')}
              >
                {e.branch === 'yes' ? 'نعم' : 'لا'}
              </text>
            )}
          </g>
        )
      })}

      {example.nodes.map((n) => {
        let state = nodeState(n.id)
        let lines = nodeLabel(n)
        let code = n.kind !== 'start' && n.kind !== 'end'
        return (
          <g
            key={n.id}
            className={clsx(
              'transition-opacity duration-300',
              state === 'hidden' && 'opacity-0',
              state === 'active' && '[&>:first-child]:fill-sky-100 [&>:first-child]:stroke-sky-600 dark:[&>:first-child]:fill-sky-900/70 dark:[&>:first-child]:stroke-sky-400',
              state === 'new' && '[&>:first-child]:fill-amber-50 [&>:first-child]:stroke-amber-500 dark:[&>:first-child]:fill-amber-900/40 dark:[&>:first-child]:stroke-amber-400',
              state === 'visited' && '[&>:first-child]:fill-slate-100 dark:[&>:first-child]:fill-slate-700',
              (state === 'normal' || state === 'visited') && '[&>:first-child]:stroke-slate-600 dark:[&>:first-child]:stroke-slate-300',
              '[&>:first-child]:fill-white dark:[&>:first-child]:fill-slate-800',
            )}
            strokeWidth={state === 'active' || state === 'new' ? 2.5 : 1.6}
          >
            <Shape n={n} />
            {lines.map((line, i) => (
              <text
                key={i}
                x={n.x}
                y={n.y - ((lines.length - 1) * 20) / 2 + i * 20}
                textAnchor="middle"
                dominantBaseline="central"
                direction={code ? 'ltr' : 'rtl'}
                fontSize={13}
                className={clsx('fill-slate-800 dark:fill-slate-100', code ? 'font-mono' : 'font-sans font-bold')}
              >
                {code ? <CodeLine line={line} /> : line}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}
