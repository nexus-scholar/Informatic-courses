export type NodeKind = 'start' | 'end' | 'input' | 'output' | 'process' | 'decision' | 'join'

export interface FNode {
  id: string
  kind: NodeKind
  /** Centre of the shape in SVG units. */
  x: number
  y: number
  /** input: Read(a, b) → "a, b" · output: Write(...) args · process: one assignment per line · decision: condition */
  code?: string
}

export type Side = 'top' | 'bottom' | 'left' | 'right'

export interface FEdge {
  from: string
  to: string
  /** Only on edges leaving a decision. */
  branch?: 'yes' | 'no'
  fromSide?: Side
  toSide?: Side
  /** Intermediate corner points. */
  via?: Array<[number, number]>
}

export interface InputSpec {
  name: string
  label: string
  value: number
  /** Range used to generate practice questions. */
  min: number
  max: number
}

export interface Slide {
  /** Nodes revealed on this slide (added to those of earlier slides). */
  reveal: string[]
  /** Index of an edge to emphasise on this slide (e.g. a loop's return arrow). */
  edge?: number
  title: string
  text: string
}

export interface Example {
  id: string
  title: string
  level: 'sequence' | 'decision' | 'loop'
  /** Lesson where the example lives, e.g. "/docs/unit-15". */
  lesson: string
  problem: string
  /** Inputs / processing / outputs analysis shown on the first slide. */
  analysis: { inputs: string; processing: string; outputs: string }
  inputs: InputSpec[]
  width: number
  height: number
  nodes: FNode[]
  edges: FEdge[]
  slides: Slide[]
  /** The same solution as an algorithm (units 16–17). */
  pseudo: string
}

export interface Step {
  node: string
  /** Edge index taken to reach the next step. */
  edge: number | null
  vars: Record<string, string>
  output: string[]
  /** Arabic note for this step, e.g. "9.67 ≥ 10 ؟ لا". */
  note: string
  branch?: 'yes' | 'no'
  turn?: number
}

export interface RunResult {
  steps: Step[]
  error?: string
}
