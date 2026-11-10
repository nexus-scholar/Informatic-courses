import { evaluate, parseAssignment, PseudoError, show, splitArgs, substitute, type Env, type Value } from './evaluator'
import type { Example, RunResult, Step } from './types'

const MAX_STEPS = 400

function snapshot(env: Env): Record<string, string> {
  let out: Record<string, string> = {}
  for (let [k, v] of Object.entries(env)) out[k] = show(v)
  return out
}

/** Execute a flowchart from its start node and record every step. */
export function runExample(ex: Example, inputs: Record<string, number>): RunResult {
  let env: Env = {}
  let output: string[] = []
  let steps: Step[] = []
  let byId = new Map(ex.nodes.map((n) => [n.id, n]))
  let visits = new Map<string, number>()
  let node = ex.nodes.find((n) => n.kind === 'start')
  if (!node) return { steps, error: 'لا توجد بداية في المخطط' }

  try {
    while (node) {
      if (steps.length >= MAX_STEPS) {
        return { steps, error: 'توقّف التنفيذ: الحلقة لا تنتهي (حلقة لانهائية؟)' }
      }
      let note = ''
      let branch: 'yes' | 'no' | undefined
      let count = (visits.get(node.id) ?? 0) + 1
      visits.set(node.id, count)

      switch (node.kind) {
        case 'start':
          note = 'نبدأ من شكل «بداية».'
          break
        case 'end':
          note = 'وصلنا إلى «نهاية»: انتهى التنفيذ.'
          break
        case 'join':
          note = 'نقطة الربط: تلتقي الطرق هنا.'
          break
        case 'input': {
          let names = splitArgs(node.code ?? '')
          for (let n of names) {
            if (!(n in inputs)) throw new PseudoError(`لا توجد قيمة مُدخلة للمتغير ${n}`)
            env[n] = inputs[n]
          }
          note = `نقرأ من لوحة المفاتيح: \`${names.map((n) => `${n} = ${show(env[n])}`).join(', ')}\``
          break
        }
        case 'process': {
          let parts: string[] = []
          for (let line of (node.code ?? '').split('\n')) {
            let [name, expr] = parseAssignment(line)
            let v: Value = evaluate(expr, env)
            env[name] = v
            parts.push(`${name} ← ${show(v)}`)
          }
          note = `نحسب ونخزّن: \`${parts.join(', ')}\``
          break
        }
        case 'output': {
          let text = splitArgs(node.code ?? '').map((a) => show(evaluate(a, env))).join('')
          output = [...output, text]
          note = `نكتب على الشاشة: ${text}`
          break
        }
        case 'decision': {
          let ok = evaluate(node.code ?? '', env)
          if (typeof ok !== 'boolean') throw new PseudoError('الشرط لا ينتج نعم/لا')
          branch = ok ? 'yes' : 'no'
          note = `\`${describeCondition(node.code ?? '', env)}\` ؟ ${ok ? 'نعم' : 'لا'}`
          break
        }
      }

      let nextIndex: number | null = null
      if (node.kind !== 'end') {
        nextIndex = ex.edges.findIndex(
          (e) => e.from === node!.id && (node!.kind !== 'decision' || e.branch === branch),
        )
        if (nextIndex < 0) throw new PseudoError(`لا يوجد سهم يخرج من الشكل ${node.id}`)
      }

      steps.push({
        node: node.id,
        edge: nextIndex,
        vars: snapshot(env),
        output,
        note,
        branch,
        turn: node.kind === 'decision' && count > 1 ? count : undefined,
      })

      node = nextIndex === null ? undefined : byId.get(ex.edges[nextIndex].to)
    }
  } catch (e) {
    return { steps, error: e instanceof Error ? e.message : String(e) }
  }
  return { steps }
}

const describeCondition = substitute

/** Final screen output, joined by line, for practice questions. */
export function finalOutput(ex: Example, inputs: Record<string, number>): string {
  let r = runExample(ex, inputs)
  let last = r.steps[r.steps.length - 1]
  return r.error ? `خطأ: ${r.error}` : (last?.output ?? []).join(' / ')
}
