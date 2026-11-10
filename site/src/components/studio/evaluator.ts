// Expression evaluator for the course pseudo-code dialect
// (.agents/rules/pseudocode_conventions.md): numbers, Arabic/Latin strings,
// + - * / div mod, = ≠ < > ≤ ≥, AND OR NOT, True/False, parentheses.

export type Value = number | string | boolean
export type Env = Record<string, Value>

export class PseudoError extends Error {}

type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }

const ALIASES: Record<string, string> = { '<=': '≤', '>=': '≥', '<>': '≠', '!=': '≠', '==': '=' }
const WORD_OPS = new Set(['div', 'mod', 'AND', 'OR', 'NOT'])

function tokenize(src: string): Tok[] {
  let out: Tok[] = []
  let i = 0
  while (i < src.length) {
    let c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      out.push({ t: 'num', v: parseFloat(src.slice(i, j)) })
      i = j
      continue
    }
    if (c === '"') {
      let j = src.indexOf('"', i + 1)
      if (j < 0) throw new PseudoError('علامة تنصيص غير مغلقة')
      out.push({ t: 'str', v: src.slice(i + 1, j) })
      i = j + 1
      continue
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++
      let w = src.slice(i, j)
      out.push(WORD_OPS.has(w) ? { t: 'op', v: w } : { t: 'id', v: w })
      i = j
      continue
    }
    let two = src.slice(i, i + 2)
    if (ALIASES[two]) { out.push({ t: 'op', v: ALIASES[two] }); i += 2; continue }
    if ('+-*/()=≠<>≤≥,'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue }
    throw new PseudoError(`رمز غير معروف: ${c}`)
  }
  return out
}

class Parser {
  private p = 0
  private toks: Tok[]
  private env: Env
  constructor(toks: Tok[], env: Env) {
    this.toks = toks
    this.env = env
  }

  private peek() { return this.toks[this.p] }
  private isOp(v: string) { let t = this.peek(); return !!t && t.t === 'op' && t.v === v }
  private take() { return this.toks[this.p++] }
  private expect(v: string) {
    if (!this.isOp(v)) throw new PseudoError(`كان منتظرًا: ${v}`)
    this.p++
  }
  done() { return this.p >= this.toks.length }

  expr(): Value { return this.or() }

  private or(): Value {
    let l = this.and()
    while (this.isOp('OR')) { this.take(); let r = this.and(); l = bool(l) || bool(r) }
    return l
  }
  private and(): Value {
    let l = this.not()
    while (this.isOp('AND')) { this.take(); let r = this.not(); l = bool(l) && bool(r) }
    return l
  }
  private not(): Value {
    if (this.isOp('NOT')) { this.take(); return !bool(this.not()) }
    return this.cmp()
  }
  private cmp(): Value {
    let l = this.add()
    let t = this.peek()
    if (t && t.t === 'op' && ['=', '≠', '<', '>', '≤', '≥'].includes(t.v)) {
      this.take()
      let r = this.add()
      switch (t.v) {
        case '=': return l === r
        case '≠': return l !== r
        case '<': return num(l) < num(r)
        case '>': return num(l) > num(r)
        case '≤': return num(l) <= num(r)
        case '≥': return num(l) >= num(r)
      }
    }
    return l
  }
  private add(): Value {
    let l = this.mul()
    for (;;) {
      if (this.isOp('+')) { this.take(); let r = this.mul(); l = typeof l === 'string' || typeof r === 'string' ? `${show(l)}${show(r)}` : num(l) + num(r) }
      else if (this.isOp('-')) { this.take(); l = num(l) - num(this.mul()) }
      else return l
    }
  }
  private mul(): Value {
    let l = this.unary()
    for (;;) {
      let t = this.peek()
      if (!t || t.t !== 'op' || !['*', '/', 'div', 'mod'].includes(t.v)) return l
      this.take()
      let r = num(this.unary())
      if (t.v === '*') l = num(l) * r
      else {
        if (r === 0) throw new PseudoError('قسمة على صفر')
        if (t.v === '/') l = num(l) / r
        else if (t.v === 'div') l = Math.trunc(num(l) / r)
        else l = num(l) % r
      }
    }
  }
  private unary(): Value {
    if (this.isOp('-')) { this.take(); return -num(this.unary()) }
    if (this.isOp('+')) { this.take(); return num(this.unary()) }
    return this.primary()
  }
  private primary(): Value {
    let t = this.take()
    if (!t) throw new PseudoError('عبارة ناقصة')
    if (t.t === 'num' || t.t === 'str') return t.v
    if (t.t === 'id') {
      if (t.v === 'True') return true
      if (t.v === 'False') return false
      if (!(t.v in this.env)) throw new PseudoError(`المتغير ${t.v} لم تُسند له قيمة بعد`)
      return this.env[t.v]
    }
    if (t.v === '(') { let v = this.expr(); this.expect(')'); return v }
    throw new PseudoError(`رمز في غير مكانه: ${t.v}`)
  }
}

function num(v: Value): number {
  if (typeof v !== 'number') throw new PseudoError('عملية حسابية على قيمة ليست عددًا')
  return v
}
function bool(v: Value): boolean {
  if (typeof v !== 'boolean') throw new PseudoError('شرط لا ينتج صحيح/خطأ')
  return v
}

/** Display a value the way the course writes it: 13.5, 9.67, True. */
export function show(v: Value): string {
  if (typeof v === 'boolean') return v ? 'True' : 'False'
  if (typeof v === 'number') {
    let r = Math.round(v * 100) / 100
    return Object.is(r, -0) ? '0' : String(r)
  }
  return v
}

export function evaluate(src: string, env: Env): Value {
  let p = new Parser(tokenize(src), env)
  let v = p.expr()
  if (!p.done()) throw new PseudoError(`بقية غير مفهومة في: ${src}`)
  return v
}

/** "avg ≥ 10" with avg = 9.67 → "9.67 ≥ 10" (for step notes). */
export function substitute(cond: string, env: Env): string {
  return cond.replace(/"[^"]*"|\b[A-Za-z_][A-Za-z0-9_]*\b/g, (w) =>
    w.startsWith('"') || !(w in env) ? w : show(env[w]),
  )
}

/** Split `"x = ", x, y` at top-level commas (outside strings and parentheses). */
export function splitArgs(src: string): string[] {
  let parts: string[] = []
  let depth = 0
  let inStr = false
  let cur = ''
  for (let c of src) {
    if (c === '"') inStr = !inStr
    if (!inStr && c === '(') depth++
    if (!inStr && c === ')') depth--
    if (!inStr && depth === 0 && c === ',') { parts.push(cur.trim()); cur = ''; continue }
    cur += c
  }
  if (cur.trim()) parts.push(cur.trim())
  return parts
}

/** `x ← expr` (also accepts `<-`). Returns [name, expression]. */
export function parseAssignment(line: string): [string, string] {
  let m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:←|<-)\s*(.+)$/)
  if (!m) throw new PseudoError(`ليست تعليمة إسناد: ${line}`)
  return [m[1], m[2]]
}
