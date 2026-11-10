'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { ALGO_EXAMPLES, ALGO_LEVELS, type AlgoExample } from './algoExamples'
import { ControlBar, MemoryAndScreen } from './FlowchartStudio'
import { runAlgorithm, type AlgoRun } from './interpreter'
import { Btn, Card, Code, FullscreenIcon, ModeTabs, QuestionCard, Rich, rnd, shuffle, studioKeys, useFullscreen, useScore, useSwipe } from './ui'

type Mode = 'explain' | 'run' | 'train'

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'explain', label: 'شرح' },
  { id: 'run', label: 'تنفيذ' },
  { id: 'train', label: 'تدريب' },
]

const ARABIC = /[؀-ۿ]/

// ---------- code view ----------

type LineState = 'hidden' | 'new' | 'active' | 'error' | 'normal'

function CodeText({ text }: { text: string }) {
  // monospace fonts have no Arabic shaping: draw Arabic strings in the site's font
  return (
    <>
      {text.split(/("[^"]*")/).map((p, i) =>
        ARABIC.test(p) ? <span key={i} className="font-sans">{p}</span> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

function CodeView({ code, state, follow }: { code: string; state: (line: number) => LineState; follow: number | null }) {
  let refs = useRef<Array<HTMLDivElement | null>>([])
  useEffect(() => {
    if (follow) refs.current[follow - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [follow])
  return (
    <div dir="ltr" className="overflow-x-auto rounded-2xl bg-slate-900 py-3 text-left font-mono text-[13px] leading-7 text-slate-100 sm:text-[15px] dark:bg-slate-950 dark:ring-1 dark:ring-slate-700">
      {code.split('\n').map((text, i) => {
        let s = state(i + 1)
        return (
          <div
            key={i}
            ref={(el) => { refs.current[i] = el }}
            className={clsx(
              'flex scroll-mt-24 scroll-mb-28 whitespace-pre transition-all duration-300',
              s === 'hidden' && 'opacity-15',
              s === 'new' && 'bg-amber-400/20',
              s === 'active' && 'bg-sky-500/30',
              s === 'error' && 'bg-rose-500/30',
            )}
          >
            <span className={clsx('w-9 shrink-0 select-none pe-3 text-right text-slate-500', (s === 'active' || s === 'error') && 'text-white')}>
              {s === 'active' ? '▶' : i + 1}
            </span>
            <span className="pe-4"><CodeText text={text} /></span>
          </div>
        )
      })}
    </div>
  )
}

// ---------- practice ----------

interface Question {
  inputs: string
  prompt: string
  options: string[]
  answer: string
}

function lastScreen(run: AlgoRun): { text: string; lastOnly: boolean } {
  let out = run.steps[run.steps.length - 1]?.output ?? []
  return out.length > 2 ? { text: out[out.length - 1], lastOnly: true } : { text: out.join(' / '), lastOnly: false }
}

function makeQuestion(ex: AlgoExample): Question | null {
  if (!ex.gen) return null
  let inputs = ex.gen()
  let run = runAlgorithm(ex.code, inputs)
  if (run.error) return null
  let lines = ex.code.split('\n')
  let ifStep = run.steps.find((s) => s.branch && /^\s*If\b/.test(lines[s.line - 1]))
  let turns = Math.max(0, ...run.steps.map((s) => (s.branch === 'yes' || /^\s*Repeat\b/.test(lines[s.line - 1]) ? s.turn ?? 0 : 0)))
  let kinds: Array<'output' | 'watch' | 'turns' | 'branch'> = ['output', 'output']
  if (ex.watch) kinds.push('watch')
  if (ex.level === 'loop') kinds.push('turns')
  if (ex.level === 'decision' && ifStep) kinds.push('branch')
  let kind = kinds[rnd(0, kinds.length - 1)]

  let others = (pick: (r: AlgoRun) => string, answer: string) => {
    let opts = new Set([answer])
    for (let k = 0; k < 40 && opts.size < 3; k++) {
      let r = runAlgorithm(ex.code, ex.gen!())
      if (!r.error) opts.add(pick(r))
    }
    return shuffle([...opts])
  }

  if (kind === 'branch' && ifStep) {
    let cond = lines[ifStep.line - 1].trim().replace(/^If\s+/, '').replace(/\s+Then$/, '')
    return { inputs, prompt: `هل الشرط ${cond} في السطر ${ifStep.line} صحيح عند أول تنفيذ؟`, options: ['نعم', 'لا'], answer: ifStep.branch === 'yes' ? 'نعم' : 'لا' }
  }
  if (kind === 'turns') {
    let opts = [...new Set([turns, turns + 1, Math.max(0, turns - 1)])].sort((a, b) => a - b).map(String)
    return { inputs, prompt: 'كم دورة تُنفَّذ الحلقة؟', options: opts, answer: String(turns) }
  }
  if (kind === 'watch' && ex.watch) {
    let w = ex.watch
    let val = (r: AlgoRun) => r.steps[r.steps.length - 1].vars[w]
    return { inputs, prompt: `ما القيمة النهائية للمتغير ${w}؟`, options: others(val, val(run)), answer: val(run) }
  }
  let { text, lastOnly } = lastScreen(run)
  return { inputs, prompt: lastOnly ? 'ما آخر سطر يظهر على الشاشة؟' : 'ماذا يظهر على الشاشة؟', options: others((r) => lastScreen(r).text, text), answer: text }
}

// ---------- keyword bar for phones ----------

/** `caret` = where the cursor lands inside the inserted text (default: after it). */
const KEYS: Array<{ label: string; text: string; caret?: number }> = [
  { label: '←', text: ' ← ' },
  { label: '≠', text: ' ≠ ' },
  { label: '≤', text: ' ≤ ' },
  { label: '≥', text: ' ≥ ' },
  { label: 'If', text: 'If  Then\n\nEndIf', caret: 3 },
  { label: 'Else', text: 'Else' },
  { label: 'For', text: 'For i ← 1 To n Do\n\nEndFor', caret: 18 },
  { label: 'While', text: 'While  Do\n\nEndWhile', caret: 6 },
  { label: 'Read', text: 'Read()', caret: 5 },
  { label: 'Write', text: 'Write("")', caret: 7 },
  { label: 'مسافة', text: '    ' },
]

// ---------- main component ----------

export function AlgorithmStudio({ example: initial = 'sum', only }: { example?: string; only?: string }) {
  let list = useMemo(() => {
    let ids = only?.split(',').map((s) => s.trim()).filter(Boolean)
    return ids?.length ? ALGO_EXAMPLES.filter((e) => ids!.includes(e.id)) : ALGO_EXAMPLES
  }, [only])
  let [exId, setExId] = useState(list.find((e) => e.id === initial)?.id ?? list[0].id)
  let ex = list.find((e) => e.id === exId) ?? list[0]

  let [mode, setMode] = useState<Mode>('explain')
  let [slide, setSlide] = useState(0)
  let [code, setCode] = useState(ex.code)
  let [inputText, setInputText] = useState(ex.inputs)
  let [editing, setEditing] = useState(false)
  let [step, setStep] = useState(0)
  let [playing, setPlaying] = useState(false)
  let [question, setQuestion] = useState<Question | null>(null)
  let [picked, setPicked] = useState<string | null>(null)
  let [score, addScore] = useScore(`algo-${ex.id}`)
  let rootRef = useRef<HTMLDivElement>(null)
  let areaRef = useRef<HTMLTextAreaElement>(null)
  let [full, toggleFull] = useFullscreen(rootRef)

  let run = useMemo(() => runAlgorithm(code, inputText), [code, inputText])
  let last = Math.max(0, run.steps.length - 1)
  let cur = run.steps[Math.min(step, last)]
  let atEnd = step >= last

  function chooseExample(id: string) {
    let next = list.find((e) => e.id === id)!
    setExId(id)
    setCode(next.code)
    setInputText(next.inputs)
    setEditing(false)
    setSlide(0)
    setStep(0)
    setPlaying(false)
    setQuestion(null)
    setPicked(null)
  }

  function newQuestion() {
    setQuestion(makeQuestion(ex))
    setPicked(null)
  }

  function chooseMode(m: Mode) {
    setMode(m)
    setPlaying(false)
    setSlide(0)
    setStep(0)
    setEditing(false)
    if (m === 'train') newQuestion()
  }

  let next = useCallback(() => {
    if (mode === 'explain') setSlide((s) => Math.min(s + 1, ex.slides.length - 1))
    else if (mode === 'run') setStep((s) => Math.min(s + 1, last))
    else { setQuestion(makeQuestion(ex)); setPicked(null) }
  }, [mode, ex, last])

  let prev = useCallback(() => {
    if (mode === 'explain') setSlide((s) => Math.max(s - 1, 0))
    else if (mode === 'run') setStep((s) => Math.max(s - 1, 0))
  }, [mode])

  let swipe = useSwipe(next, prev)

  useEffect(() => {
    if (!playing) return
    if (step >= last) { setPlaying(false); return }
    let t = setTimeout(() => setStep((s) => s + 1), 800)
    return () => clearTimeout(t)
  }, [playing, step, last])

  function insert(text: string, caretAt = text.length) {
    let el = areaRef.current
    if (!el) return
    let { selectionStart: a, selectionEnd: b } = el
    setCode(code.slice(0, a) + text + code.slice(b))
    setStep(0)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(a + caretAt, a + caretAt)
    })
  }

  // ----- line states -----
  let revealedTo = Math.max(...ex.slides.slice(0, slide + 1).map((s) => s.to))
  let sl = ex.slides[slide]
  let lineState = (n: number): LineState => {
    if (mode === 'explain') return n > revealedTo ? 'hidden' : n >= sl.from && n <= sl.to ? 'new' : 'normal'
    if (mode === 'run') {
      if (run.error?.line === n && (atEnd || run.steps.length === 0)) return 'error'
      return cur?.line === n ? 'active' : 'normal'
    }
    return 'normal'
  }

  let prevVars = step > 0 ? run.steps[step - 1].vars : {}
  let varNames = Object.keys(run.steps[0]?.vars ?? {})
  let codeLines = code.split('\n')
  let counter = mode === 'explain' ? `${slide + 1} / ${ex.slides.length}` : mode === 'run' ? `${run.steps.length ? Math.min(step, last) + 1 : 0} / ${run.steps.length}` : `${score.right} / ${score.total}`
  // while editing, report the error at once; while stepping, only when execution reaches it
  let errorBox = run.error && (editing || atEnd || run.steps.length === 0) && (
    <p className="rounded-xl bg-rose-50 p-3 text-sm leading-7 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
      <span className="font-bold">خطأ{run.error.line ? ` في السطر ${run.error.line}` : ''}: </span>
      {run.error.message}
    </p>
  )

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      onKeyDown={(e) => studioKeys(e, { next, prev, full, toggleFull })}
      dir="rtl"
      className={clsx(
        '@container not-prose my-8 rounded-3xl bg-slate-50 p-3 outline-none ring-1 ring-slate-200 sm:p-5 dark:bg-slate-900 dark:ring-slate-700',
        full && 'fixed inset-0 z-[60] my-0 flex flex-col overflow-y-auto rounded-none',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ModeTabs modes={MODES} mode={mode} onChange={chooseMode} />
        <select
          value={ex.id}
          onChange={(e) => chooseExample(e.target.value)}
          aria-label="اختر مثالًا"
          className="order-last min-h-11 w-full min-w-0 rounded-xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-300 sm:order-none sm:w-auto dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
        >
          {(['basics', 'decision', 'loop'] as const).map((lvl) =>
            list.some((e) => e.level === lvl) ? (
              <optgroup key={lvl} label={ALGO_LEVELS[lvl]}>
                {list.filter((e) => e.level === lvl).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
              </optgroup>
            ) : null,
          )}
        </select>
        <div className="ms-auto">
          <Btn onClick={toggleFull} label={full ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}>
            <FullscreenIcon on={full} />
          </Btn>
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-slate-100">المسألة: </span>
        <Rich text={ex.problem} />
      </p>

      <div className={clsx('mt-3 grid gap-4 @4xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]', full && 'flex-1')}>
        {/* phones: caption right above the code */}
        {mode !== 'train' && !editing && (
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 @4xl:hidden dark:bg-slate-800/70 dark:ring-slate-700" aria-live="polite">
            {mode === 'explain' ? (
              <>
                <p className="text-base font-bold text-slate-900 dark:text-white">{sl.title}</p>
                <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-200"><Rich text={sl.text} /></p>
              </>
            ) : errorBox ? (
              errorBox
            ) : (
              <p className="text-sm leading-7 text-slate-800 dark:text-slate-100">
                <span className="font-semibold">السطر {cur?.line}{cur?.turn ? ` · الدورة ${cur.turn}` : ''}: </span>
                <Rich text={cur?.note ?? ''} />
              </p>
            )}
          </div>
        )}

        <div className="min-w-0" {...(editing ? {} : swipe)}>
          {editing ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5" dir="ltr">
                {KEYS.map((k) => (
                  <button
                    key={k.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insert(k.text, k.caret)}
                    className="min-h-10 min-w-10 rounded-lg bg-white px-2.5 font-mono text-sm text-slate-800 ring-1 ring-slate-300 active:scale-95 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
                  >
                    {k.label}
                  </button>
                ))}
              </div>
              <textarea
                ref={areaRef}
                value={code}
                dir="ltr"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                rows={Math.min(Math.max(codeLines.length + 1, 10), 26)}
                onChange={(e) => { setCode(e.target.value); setStep(0) }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') { e.preventDefault(); insert('    ') }
                }}
                className="w-full rounded-2xl bg-slate-900 p-3 text-left font-mono text-[14px] leading-7 text-slate-100 outline-none ring-2 ring-sky-500"
                aria-label="نص الخوارزمية"
              />
              <div className="flex flex-wrap gap-2">
                <Btn primary onClick={() => { setEditing(false); setStep(0) }}>نفّذ التعديل</Btn>
                <Btn onClick={() => { setCode(ex.code); setStep(0) }}>إعادة الأصل</Btn>
              </div>
              {errorBox}
            </div>
          ) : (
            <CodeView code={code} state={lineState} follow={mode === 'run' ? cur?.line ?? null : null} />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {mode === 'explain' && (
            <>
              <Card title={`الشريحة ${slide + 1} من ${ex.slides.length} · الأسطر ${sl.from}${sl.to !== sl.from ? `–${sl.to}` : ''}`} className="hidden @4xl:block">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sl.title}</h3>
                <p className="mt-2 text-base leading-8 text-slate-700 dark:text-slate-200"><Rich text={sl.text} /></p>
              </Card>
              {slide === ex.slides.length - 1 && <Btn primary onClick={() => chooseMode('run')}>نفّذ الخوارزمية سطرًا بسطر</Btn>}
            </>
          )}

          {mode === 'run' && (
            <>
              <Card title="ما يكتبه المستخدم (بالترتيب، تفصل بينها فاصلة)">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={inputText}
                    dir="ltr"
                    inputMode="decimal"
                    onChange={(e) => { setInputText(e.target.value); setStep(0); setPlaying(false) }}
                    className="h-11 min-w-0 flex-1 rounded-lg bg-slate-50 px-3 font-mono ring-1 ring-slate-300 dark:bg-slate-900 dark:ring-slate-600"
                    aria-label="القيم المُدخلة"
                  />
                  {!editing && <Btn onClick={() => { setEditing(true); setPlaying(false) }}>عدّل الخوارزمية</Btn>}
                  {code !== ex.code && !editing && <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">نسخة معدّلة</span>}
                </div>
              </Card>

              {!editing && (
                <Card title={`الخطوة ${run.steps.length ? Math.min(step, last) + 1 : 0} من ${run.steps.length}`} className={clsx(!errorBox && 'hidden @4xl:block')}>
                  {errorBox || (
                    <p className="text-base leading-8 text-slate-800 dark:text-slate-100">
                      <span className="font-semibold">السطر {cur?.line}{cur?.turn ? ` · الدورة ${cur.turn}` : ''}: </span>
                      <Rich text={cur?.note ?? ''} />
                    </p>
                  )}
                </Card>
              )}

              <MemoryAndScreen vars={cur?.vars ?? {}} prevVars={prevVars} output={cur?.output ?? []} />

              <details className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">جدول التتبع</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-center text-sm">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400">
                        <th className="p-1">السطر</th>
                        {varNames.map((v) => <th key={v} className="p-1 font-mono">{v}</th>)}
                        <th className="p-1">الشاشة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {run.steps.slice(0, step + 1).map((s, i) => {
                        let before = i > 0 ? run.steps[i - 1].output.length : 0
                        return (
                          <tr key={i} className={clsx('border-t border-slate-100 dark:border-slate-700', i === step && 'bg-sky-50 dark:bg-sky-900/30')}>
                            <td className="p-1 text-start font-mono text-xs whitespace-nowrap" dir="ltr">
                              {s.line}: {codeLines[s.line - 1]?.trim()}
                            </td>
                            {varNames.map((v) => <td key={v} className="p-1 font-mono">{s.vars[v] ?? ''}</td>)}
                            <td className="p-1 text-xs" dir="auto">{s.output.slice(before).join(' / ')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}

          {mode === 'train' &&
            (question ? (
              <QuestionCard
                score={score}
                inputsLabel={<>ما يكتبه المستخدم: <Code>{question.inputs}</Code></>}
                prompt={question.prompt}
                options={question.options}
                answer={question.answer}
                picked={picked}
                onPick={(o) => { setPicked(o); addScore(o === question.answer) }}
                onWatch={() => { setCode(ex.code); setInputText(question.inputs); setMode('run'); setStep(0) }}
                onNext={newQuestion}
              />
            ) : (
              <Card>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">هذا المثال للاكتشاف فقط. نفّذه في «تنفيذ» ثم أصلحه بزر «عدّل الخوارزمية».</p>
              </Card>
            ))}
        </div>
      </div>

      <ControlBar
        mode={mode}
        counter={counter}
        full={full}
        playing={playing}
        onPrev={prev}
        onNext={next}
        onReset={() => { setStep(0); setPlaying(false) }}
        onPlay={() => { if (step >= last) setStep(0); setPlaying((p) => !p) }}
      />
    </div>
  )
}
