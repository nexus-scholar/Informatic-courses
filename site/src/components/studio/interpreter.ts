// Statement-level interpreter for complete algorithms written in the course
// dialect (.agents/rules/pseudocode_conventions.md). It records one step per
// executed line so the studio can highlight the line, the memory and the screen.

import { evaluate, PseudoError, show, splitArgs, substitute, type Env, type Value } from './evaluator'

export type VarType = 'Integer' | 'Real' | 'Char' | 'String' | 'Boolean'
const TYPES: VarType[] = ['Integer', 'Real', 'Char', 'String', 'Boolean']
const RESERVED = new Set([
  'Algorithm', 'Const', 'Var', 'Begin', 'End', 'Read', 'Write', 'If', 'Then', 'Else', 'EndIf',
  'For', 'To', 'Do', 'EndFor', 'While', 'EndWhile', 'Repeat', 'Until', 'div', 'mod', 'AND', 'OR',
  'NOT', 'True', 'False', ...TYPES,
])

type Stmt =
  | { k: 'assign'; line: number; name: string; expr: string }
  | { k: 'read'; line: number; names: string[] }
  | { k: 'write'; line: number; args: string[] }
  | { k: 'if'; line: number; cond: string; then: Stmt[]; else: Stmt[] | null }
  | { k: 'for'; line: number; v: string; from: string; to: string; body: Stmt[] }
  | { k: 'while'; line: number; cond: string; body: Stmt[] }
  | { k: 'repeat'; line: number; body: Stmt[]; cond: string; untilLine: number }

export interface Program {
  name: string
  consts: Array<{ name: string; value: Value; line: number }>
  vars: Array<{ name: string; type: VarType; line: number }>
  body: Stmt[]
  beginLine: number
  endLine: number
}

export interface AlgoStep {
  /** 1-based line number in the source. */
  line: number
  vars: Record<string, string>
  output: string[]
  note: string
  turn?: number
  branch?: 'yes' | 'no'
}

export interface AlgoRun {
  steps: AlgoStep[]
  error?: { line: number | null; message: string }
}

class LineError extends Error {
  line: number | null
  constructor(line: number | null, message: string) {
    super(message)
    this.line = line
  }
}

const ID = '[A-Za-z_][A-Za-z0-9_]*'
const ASSIGN = new RegExp(`^(${ID})\\s*(?:←|<-)\\s*(.+)$`)

// ---------- parsing ----------

interface Line { no: number; text: string }

export function parse(src: string): Program {
  let lines: Line[] = src
    .split('\n')
    .map((text, i) => ({ no: i + 1, text: text.trim() }))
    .filter((l) => l.text !== '')
  let p = 0
  let at = () => lines[p]

  let head = at()?.text.match(new RegExp(`^Algorithm\\s+(${ID})$`))
  if (!head) throw new LineError(at()?.no ?? 1, 'يجب أن تبدأ الخوارزمية بالسطر: Algorithm الاسم')
  let program: Program = { name: head[1], consts: [], vars: [], body: [], beginLine: 0, endLine: 0 }
  p++

  let declared = new Set<string>()
  function declare(name: string, line: number) {
    if (RESERVED.has(name)) throw new LineError(line, `${name} كلمة محجوزة، لا يمكن استعمالها اسمًا`)
    if (declared.has(name)) throw new LineError(line, `الاسم ${name} مُصرَّح به من قبل`)
    declared.add(name)
  }

  if (at()?.text === 'Const') {
    p++
    while (at() && !['Var', 'Begin'].includes(at().text)) {
      let m = at().text.match(new RegExp(`^(${ID})\\s*=\\s*(.+)$`))
      if (!m) throw new LineError(at().no, 'التصريح عن ثابت يُكتب: NAME = قيمة')
      declare(m[1], at().no)
      program.consts.push({ name: m[1], value: evaluate(m[2], {}), line: at().no })
      p++
    }
  }
  if (at()?.text === 'Var') {
    p++
    while (at() && at().text !== 'Begin') {
      let m = at().text.match(new RegExp(`^(${ID}(?:\\s*,\\s*${ID})*)\\s*:\\s*(\\w+)$`))
      if (!m) throw new LineError(at().no, 'التصريح عن متغير يُكتب: name : Type')
      if (!TYPES.includes(m[2] as VarType)) throw new LineError(at().no, `النوع ${m[2]} غير معروف. الأنواع: ${TYPES.join('، ')}`)
      for (let name of m[1].split(',').map((s) => s.trim())) {
        declare(name, at().no)
        program.vars.push({ name, type: m[2] as VarType, line: at().no })
      }
      p++
    }
  }
  if (at()?.text !== 'Begin') throw new LineError(at()?.no ?? null, 'ينقص Begin قبل التعليمات')
  program.beginLine = at().no
  p++

  function block(stop: string[], open?: { name: string; line: number }): { stmts: Stmt[]; term: Line } {
    let stmts: Stmt[] = []
    let missing = () =>
      new LineError(open?.line ?? null, open ? `ينقص ${stop[stop.length - 1]} لإغلاق ${open.name} المفتوح في السطر ${open.line}` : `ينقص ${stop.join(' أو ')}`)
    for (;;) {
      let l = at()
      if (!l) throw missing()
      if (stop.some((s) => l.text === s || l.text.startsWith(s + ' '))) return { stmts, term: l }
      if (open && /^(End|EndIf|EndFor|EndWhile|Until)\b/.test(l.text) && !stop.some((s) => l.text.startsWith(s))) throw missing()
      p++
      let t = l.text
      let m: RegExpMatchArray | null
      if ((m = t.match(/^If\s+(.+)\s+Then$/))) {
        let a = block(['Else', 'EndIf'], { name: 'If', line: l.no })
        p++
        let els: Stmt[] | null = null
        if (a.term.text === 'Else') {
          let b = block(['EndIf'], { name: 'If', line: l.no })
          p++
          els = b.stmts
        }
        stmts.push({ k: 'if', line: l.no, cond: m[1], then: a.stmts, else: els })
      } else if ((m = t.match(new RegExp(`^For\\s+(${ID})\\s*(?:←|<-)\\s*(.+?)\\s+To\\s+(.+?)\\s+Do$`)))) {
        let b = block(['EndFor'], { name: 'For', line: l.no })
        p++
        stmts.push({ k: 'for', line: l.no, v: m[1], from: m[2], to: m[3], body: b.stmts })
      } else if ((m = t.match(/^While\s+(.+)\s+Do$/))) {
        let b = block(['EndWhile'], { name: 'While', line: l.no })
        p++
        stmts.push({ k: 'while', line: l.no, cond: m[1], body: b.stmts })
      } else if (t === 'Repeat') {
        let b = block(['Until'], { name: 'Repeat', line: l.no })
        let until = b.term
        p++
        stmts.push({ k: 'repeat', line: l.no, body: b.stmts, cond: until.text.replace(/^Until\s+/, ''), untilLine: until.no })
      } else if ((m = t.match(/^Read\s*\((.*)\)$/))) {
        stmts.push({ k: 'read', line: l.no, names: splitArgs(m[1]) })
      } else if ((m = t.match(/^Write\s*\((.*)\)$/))) {
        stmts.push({ k: 'write', line: l.no, args: splitArgs(m[1]) })
      } else if ((m = t.match(ASSIGN))) {
        stmts.push({ k: 'assign', line: l.no, name: m[1], expr: m[2] })
      } else if (new RegExp(`^${ID}\\s*:?=`).test(t)) {
        throw new LineError(l.no, `الإسناد يُكتب بالسهم ←، مثل: ${t.replace(/\s*:?=\s*/, ' ← ')}`)
      } else if (/^(Else|EndIf|EndFor|EndWhile|Until|End)\b/.test(t)) {
        throw new LineError(l.no, `${t.split(' ')[0]} في غير مكانه: لا يوجد ما يغلقه`)
      } else if (/^(If|While)\b/.test(t)) {
        throw new LineError(l.no, t.startsWith('If') ? 'الشرط يُكتب: If شرط Then' : 'الحلقة تُكتب: While شرط Do')
      } else if (/^For\b/.test(t)) {
        throw new LineError(l.no, 'الحلقة تُكتب: For i ← 1 To n Do')
      } else {
        throw new LineError(l.no, 'تعليمة غير مفهومة')
      }
    }
  }

  let main = block(['End'])
  program.body = main.stmts
  program.endLine = main.term.no
  return program
}

// ---------- execution ----------

const MAX_STEPS = 1500

function checkType(v: Value, type: VarType, name: string, line: number): Value {
  let ok =
    (type === 'Integer' && typeof v === 'number' && Number.isInteger(v)) ||
    (type === 'Real' && typeof v === 'number') ||
    (type === 'String' && typeof v === 'string') ||
    (type === 'Char' && typeof v === 'string' && [...v].length === 1) ||
    (type === 'Boolean' && typeof v === 'boolean')
  if (!ok) throw new LineError(line, `لا يمكن وضع القيمة ${show(v)} في المتغير ${name} من النوع ${type}`)
  return v
}

function fromInput(raw: string, type: VarType, name: string, line: number): Value {
  let s = raw.trim()
  if (type === 'Integer' || type === 'Real') {
    let n = Number(s.replace('٫', '.'))
    if (s === '' || Number.isNaN(n)) throw new LineError(line, `القيمة المُدخلة «${s}» ليست عددًا (المتغير ${name})`)
    return checkType(n, type, name, line)
  }
  if (type === 'Boolean') {
    if (s !== 'True' && s !== 'False') throw new LineError(line, `المتغير ${name} ينتظر True أو False`)
    return s === 'True'
  }
  return checkType(s, type, name, line)
}

/** Split the input box: one value per comma, Arabic comma or new line. */
export function splitInputs(text: string): string[] {
  return text.split(/[,،\n]/).map((s) => s.trim()).filter((s) => s !== '')
}

export function runAlgorithm(src: string, inputText: string): AlgoRun {
  let steps: AlgoStep[] = []
  let program: Program
  try {
    program = parse(src)
  } catch (e) {
    return { steps, error: { line: e instanceof LineError ? e.line : null, message: e instanceof Error ? e.message : String(e) } }
  }

  let env: Env = {}
  let types = new Map<string, VarType>()
  let consts = new Set<string>()
  let order: string[] = []
  for (let c of program.consts) { env[c.name] = c.value; consts.add(c.name); order.push(c.name) }
  for (let v of program.vars) { types.set(v.name, v.type); order.push(v.name) }
  let queue = splitInputs(inputText)
  let output: string[] = []

  function snapshot() {
    let out: Record<string, string> = {}
    for (let n of order) out[n] = n in env ? show(env[n]) : '؟'
    return out
  }
  function push(line: number, note: string, extra: Partial<AlgoStep> = {}) {
    if (steps.length >= MAX_STEPS) throw new LineError(line, 'توقّف التنفيذ: عدد الخطوات كبير جدًا (حلقة لانهائية؟)')
    steps.push({ line, vars: snapshot(), output, note, ...extra })
  }
  function ev(expr: string, line: number): Value {
    try {
      return evaluate(expr, env)
    } catch (e) {
      let unknown = (expr.replace(/"[^"]*"/g, '').match(new RegExp(ID, 'g')) ?? []).find(
        (w) => !types.has(w) && !consts.has(w) && !RESERVED.has(w),
      )
      if (unknown) throw new LineError(line, `المتغير ${unknown} غير مُصرَّح به في Var`)
      throw new LineError(line, e instanceof Error ? e.message : String(e))
    }
  }
  function cond(expr: string, line: number): boolean {
    let v = ev(expr, line)
    if (typeof v !== 'boolean') throw new LineError(line, 'الشرط يجب أن يكون صحيحًا أو خاطئًا (True/False)')
    return v
  }
  function target(name: string, line: number): VarType {
    if (consts.has(name)) throw new LineError(line, `${name} ثابت: لا يمكن تغيير قيمته`)
    let t = types.get(name)
    if (!t) throw new LineError(line, `المتغير ${name} غير مُصرَّح به في Var`)
    return t
  }

  function exec(stmts: Stmt[]) {
    for (let s of stmts) {
      switch (s.k) {
        case 'assign': {
          let t = target(s.name, s.line)
          let v = checkType(ev(s.expr, s.line), t, s.name, s.line)
          let shown = substitute(s.expr, env)
          env[s.name] = v
          push(s.line, shown === show(v) ? `نضع \`${show(v)}\` في ${s.name}` : `نحسب \`${shown} = ${show(v)}\` ونضعها في ${s.name}`)
          break
        }
        case 'read': {
          let got: string[] = []
          for (let name of s.names) {
            let t = target(name, s.line)
            let raw = queue.shift()
            if (raw === undefined) throw new LineError(s.line, `انتهت القيم المُدخلة: أضف قيمة للمتغير ${name}`)
            env[name] = fromInput(raw, t, name, s.line)
            got.push(`${name} = ${show(env[name])}`)
          }
          push(s.line, `يكتب المستخدم قيمة فنخزّنها: \`${got.join(', ')}\``)
          break
        }
        case 'write': {
          let text = s.args.map((a) => show(ev(a, s.line))).join('')
          output = [...output, text]
          push(s.line, `يظهر على الشاشة: ${text}`)
          break
        }
        case 'if': {
          let c = cond(s.cond, s.line)
          push(s.line, `\`${substitute(s.cond, env)}\` ؟ ${c ? 'نعم، ننفّذ ما بعد Then' : s.else ? 'لا، ننفّذ ما بعد Else' : 'لا، نتجاوز إلى ما بعد EndIf'}`, { branch: c ? 'yes' : 'no' })
          if (c) exec(s.then)
          else if (s.else) exec(s.else)
          break
        }
        case 'for': {
          let t = target(s.v, s.line)
          let from = ev(s.from, s.line)
          let to = ev(s.to, s.line)
          if (typeof from !== 'number' || typeof to !== 'number') throw new LineError(s.line, 'حدود الحلقة For يجب أن تكون أعدادًا')
          let turn = 0
          for (let val = from; val <= to; val++) {
            env[s.v] = checkType(val, t, s.v, s.line)
            turn++
            push(s.line, `${turn === 1 ? `${s.v} يبدأ من ${show(from)}` : `${s.v} يزيد آليًا إلى ${show(val)}`} ؛ \`${show(val)} ≤ ${show(to)}\` ؟ نعم: الدورة ${turn}`, { turn, branch: 'yes' })
            exec(s.body)
          }
          push(
            s.line,
            turn === 0
              ? `\`${show(from)} > ${show(to)}\`: لا تُنفَّذ أي دورة`
              : `انتهت الدورات (${turn}). يبقى ${s.v} = ${show(env[s.v])} ونخرج من الحلقة`,
            { branch: 'no' },
          )
          break
        }
        case 'while': {
          let turn = 0
          for (;;) {
            let c = cond(s.cond, s.line)
            if (c) turn++
            push(s.line, `\`${substitute(s.cond, env)}\` ؟ ${c ? `نعم: الدورة ${turn}` : 'لا: نخرج من الحلقة'}`, { turn: c ? turn : undefined, branch: c ? 'yes' : 'no' })
            if (!c) break
            exec(s.body)
          }
          break
        }
        case 'repeat': {
          let turn = 0
          for (;;) {
            turn++
            push(s.line, `الدورة ${turn}: ننفّذ الجسم أولًا ثم نختبر الشرط`, { turn })
            exec(s.body)
            let c = cond(s.cond, s.untilLine)
            push(s.untilLine, `\`${substitute(s.cond, env)}\` ؟ ${c ? 'نعم: نتوقف' : 'لا: نعيد الدورة'}`, { branch: c ? 'yes' : 'no' })
            if (c) break
          }
          break
        }
      }
    }
  }

  try {
    push(program.beginLine, 'تُحجز علب الذاكرة للمتغيرات المُصرَّح بها (فارغة: ؟)، ثم نبدأ التنفيذ.')
    exec(program.body)
    push(program.endLine, 'End: انتهى تنفيذ الخوارزمية.')
  } catch (e) {
    return { steps, error: { line: e instanceof LineError ? e.line : null, message: e instanceof Error ? e.message : String(e) } }
  }
  return { steps }
}

export { PseudoError }
