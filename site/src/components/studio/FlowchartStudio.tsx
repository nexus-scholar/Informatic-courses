'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { EXAMPLES, LEVELS } from './examples'
import { FlowchartSvg, nodeLabel, type NodeState } from './FlowchartSvg'
import { runExample } from './runner'
import type { Example, Step } from './types'
import { Btn, Card, Code, FullscreenIcon, ModeTabs, QuestionCard, Rich, rnd, shuffle, studioKeys, useFullscreen, useScore, useSwipe } from './ui'

type Mode = 'explain' | 'run' | 'train'

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'explain', label: 'شرح' },
  { id: 'run', label: 'تنفيذ' },
  { id: 'train', label: 'تدريب' },
]

function defaults(ex: Example) {
  return Object.fromEntries(ex.inputs.map((i) => [i.name, i.value]))
}

// ---------- practice questions ----------

interface Question {
  inputs: Record<string, number>
  prompt: string
  options: string[]
  answer: string
}

function screenAnswer(steps: Step[]): { text: string; lastOnly: boolean } {
  let out = steps[steps.length - 1]?.output ?? []
  return out.length > 2 ? { text: out[out.length - 1], lastOnly: true } : { text: out.join(' / '), lastOnly: false }
}

function makeQuestion(ex: Example): Question {
  let inputs = Object.fromEntries(ex.inputs.map((i) => [i.name, rnd(i.min, i.max)]))
  let run = runExample(ex, inputs)
  let decisions = run.steps.filter((s) => s.branch)
  let kinds: Array<'output' | 'branch' | 'turns'> = ['output', 'output']
  if (ex.level === 'decision' && decisions.length) kinds.push('branch')
  if (ex.level === 'loop') kinds.push('turns', 'turns')
  let kind = kinds[rnd(0, kinds.length - 1)]

  if (kind === 'branch') {
    let cond = ex.nodes.find((n) => n.id === decisions[0].node)?.code ?? ''
    return { inputs, prompt: `عند الوصول إلى الشرط «${cond}» أول مرة، أي فرع نتبع؟`, options: ['نعم', 'لا'], answer: decisions[0].branch === 'yes' ? 'نعم' : 'لا' }
  }
  if (kind === 'turns') {
    let turns = decisions.filter((s) => s.branch === 'yes').length
    let opts = new Set([turns, turns + 1, Math.max(0, turns - 1), turns + 2])
    return { inputs, prompt: 'كم مرة يُنفَّذ جسم الحلقة؟', options: [...opts].slice(0, 3).map(String).sort((a, b) => +a - +b), answer: String(turns) }
  }
  let { text, lastOnly } = screenAnswer(run.steps)
  let opts = new Set([text])
  for (let tries = 0; tries < 40 && opts.size < 3; tries++) {
    let other = Object.fromEntries(ex.inputs.map((i) => [i.name, rnd(i.min, i.max)]))
    let r = runExample(ex, other)
    if (!r.error) opts.add(screenAnswer(r.steps).text)
  }
  return {
    inputs,
    prompt: lastOnly ? 'ما آخر سطر يظهر على الشاشة؟' : 'ماذا يظهر على الشاشة؟',
    options: shuffle([...opts]),
    answer: text,
  }
}

// ---------- main component ----------

export function FlowchartStudio({ example: initial = 'average', only }: { example?: string; only?: string }) {
  let list = useMemo(() => {
    let ids = only?.split(',').map((s) => s.trim()).filter(Boolean)
    return ids?.length ? EXAMPLES.filter((e) => ids!.includes(e.id)) : EXAMPLES
  }, [only])
  let [exId, setExId] = useState(list.find((e) => e.id === initial)?.id ?? list[0].id)
  let ex = list.find((e) => e.id === exId) ?? list[0]

  let [mode, setMode] = useState<Mode>('explain')
  let [slide, setSlide] = useState(0)
  let [inputs, setInputs] = useState<Record<string, number>>(() => defaults(ex))
  let [step, setStep] = useState(0)
  let [playing, setPlaying] = useState(false)
  let [showPseudo, setShowPseudo] = useState(false)
  let [question, setQuestion] = useState<Question | null>(null)
  let [picked, setPicked] = useState<string | null>(null)
  let [score, addScore] = useScore(ex.id)
  let rootRef = useRef<HTMLDivElement>(null)
  let [full, toggleFull] = useFullscreen(rootRef)

  let run = useMemo(() => runExample(ex, inputs), [ex, inputs])
  let last = run.steps.length - 1
  let cur = run.steps[Math.min(step, last)]

  function chooseExample(id: string) {
    let next = list.find((e) => e.id === id)!
    setExId(id)
    setInputs(defaults(next))
    setSlide(0)
    setStep(0)
    setPlaying(false)
    setQuestion(null)
    setPicked(null)
  }

  function chooseMode(m: Mode) {
    setMode(m)
    setPlaying(false)
    setSlide(0)
    setStep(0)
    if (m === 'train') newQuestion()
  }

  function newQuestion() {
    setQuestion(makeQuestion(ex))
    setPicked(null)
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
    let t = setTimeout(() => setStep((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [playing, step, last])

  // ----- what the chart shows -----
  let revealed = useMemo(() => new Set(ex.slides.slice(0, slide + 1).flatMap((s) => s.reveal)), [ex, slide])
  let fresh = new Set(ex.slides[slide]?.reveal ?? [])
  let visited = useMemo(() => new Set(run.steps.slice(0, step).map((s) => s.node)), [run, step])
  let taken = useMemo(() => new Set(run.steps.slice(0, step).map((s) => s.edge).filter((e): e is number => e !== null)), [run, step])

  let nodeState = (id: string): NodeState => {
    if (mode === 'explain') return !revealed.has(id) ? 'hidden' : fresh.has(id) ? 'new' : 'normal'
    if (mode === 'run') return cur?.node === id ? 'active' : visited.has(id) ? 'visited' : 'normal'
    return 'normal'
  }
  let activeEdge = mode === 'explain' ? ex.slides[slide]?.edge ?? null : mode === 'run' && step > 0 ? run.steps[step - 1]?.edge ?? null : null

  let varNames = useMemo(() => Object.keys(run.steps[last]?.vars ?? {}), [run, last])
  let traceRows = run.steps
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => i <= step && ['input', 'process', 'output', 'decision'].includes(ex.nodes.find((n) => n.id === s.node)!.kind))

  let prevVars = step > 0 ? run.steps[step - 1].vars : {}
  let counter =
    mode === 'explain' ? `${slide + 1} / ${ex.slides.length}` : mode === 'run' ? `${Math.min(step, last) + 1} / ${run.steps.length}` : `${score.right} / ${score.total}`

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
          {(['sequence', 'decision', 'loop'] as const).map((lvl) =>
            list.some((e) => e.level === lvl) ? (
              <optgroup key={lvl} label={LEVELS[lvl]}>
                {list.filter((e) => e.level === lvl).map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </optgroup>
            ) : null,
          )}
        </select>
        <div className="ms-auto flex items-center gap-2">
          <Btn onClick={() => setShowPseudo((v) => !v)} className={clsx(showPseudo && 'ring-sky-500 dark:ring-sky-400')}>
            الخوارزمية
          </Btn>
          <Btn onClick={toggleFull} label={full ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}>
            <FullscreenIcon on={full} />
          </Btn>
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-slate-100">المسألة: </span>
        <Rich text={ex.problem} />
      </p>

      <div className={clsx('mt-3 grid gap-4 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]', full && 'flex-1')}>
        {/* phones: the caption sits right above the chart so each tap shows its effect without scrolling */}
        {mode !== 'train' && (
          <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 @4xl:hidden dark:bg-slate-800/70 dark:ring-slate-700" aria-live="polite">
            {mode === 'explain' ? (
              <>
                <p className="text-base font-bold text-slate-900 dark:text-white">{ex.slides[slide].title}</p>
                <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-200"><Rich text={ex.slides[slide].text} /></p>
              </>
            ) : (
              <p className="text-sm leading-7 text-slate-800 dark:text-slate-100">
                {cur?.turn ? <span className="font-semibold">الدورة {cur.turn} · </span> : null}
                <Rich text={cur?.note ?? ''} />
              </p>
            )}
          </div>
        )}
        <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-200 dark:bg-slate-800/40 dark:ring-slate-700" {...swipe}>
          <FlowchartSvg
            example={ex}
            nodeState={nodeState}
            activeEdge={activeEdge}
            takenEdges={mode === 'run' ? taken : undefined}
            className={full ? 'max-h-[calc(100dvh-15rem)]' : 'max-h-[75vh]'}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3" aria-live="polite">
          {showPseudo && (
            <Card title="الخوارزمية نفسها (الوحدتان 16 و17)">
              <pre dir="ltr" className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-left font-mono text-[13px] leading-6 text-slate-100">{ex.pseudo}</pre>
            </Card>
          )}

          {mode === 'explain' && (
            <>
              {slide === 0 && (
                <Card title="تحليل المسألة">
                  <dl className="grid gap-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <div><dt className="inline font-semibold">المدخلات: </dt><dd className="inline">{ex.analysis.inputs}</dd></div>
                    <div><dt className="inline font-semibold">المعالجة: </dt><dd className="inline">{ex.analysis.processing}</dd></div>
                    <div><dt className="inline font-semibold">المخرجات: </dt><dd className="inline">{ex.analysis.outputs}</dd></div>
                  </dl>
                </Card>
              )}
              <Card title={`الشريحة ${slide + 1} من ${ex.slides.length}`} className="hidden @4xl:block">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ex.slides[slide].title}</h3>
                <p className="mt-2 text-base leading-8 text-slate-700 dark:text-slate-200"><Rich text={ex.slides[slide].text} /></p>
              </Card>
              {slide === ex.slides.length - 1 && (
                <Btn primary onClick={() => chooseMode('run')}>نفّذ هذا المخطط خطوة بخطوة</Btn>
              )}
            </>
          )}

          {mode === 'run' && (
            <>
              <Card title="المدخلات (غيّرها ثم أعد التنفيذ)">
                <div className="flex flex-wrap gap-3">
                  {ex.inputs.map((inp) => (
                    <label key={inp.name} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      {inp.label !== inp.name && <span>{inp.label}</span>}
                      <Code>{inp.name}</Code>
                      <input
                        type="number"
                        inputMode="decimal"
                        dir="ltr"
                        value={inputs[inp.name]}
                        onChange={(e) => {
                          let v = e.target.value === '' ? 0 : Number(e.target.value)
                          setInputs((s) => ({ ...s, [inp.name]: v }))
                          setStep(0)
                          setPlaying(false)
                        }}
                        className="h-11 w-20 rounded-lg bg-slate-50 px-2 text-center font-mono ring-1 ring-slate-300 dark:bg-slate-900 dark:ring-slate-600"
                      />
                    </label>
                  ))}
                </div>
              </Card>

              <Card title={`الخطوة ${Math.min(step, last) + 1} من ${run.steps.length}${cur?.turn ? ` · الدورة ${cur.turn}` : ''}`} className={clsx(!(run.error && step >= last) && 'hidden @4xl:block')}>
                <p className="text-base leading-8 text-slate-800 dark:text-slate-100"><Rich text={cur?.note ?? ''} /></p>
                {run.error && step >= last && (
                  <p className="mt-2 rounded-lg bg-rose-50 p-2 text-sm text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">{run.error}</p>
                )}
              </Card>

              <MemoryAndScreen vars={cur?.vars ?? {}} prevVars={prevVars} output={cur?.output ?? []} />

              <details className="rounded-2xl bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">جدول التتبع</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-center text-sm">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-400">
                        <th className="p-1">الشكل</th>
                        {varNames.map((v) => <th key={v} className="p-1 font-mono">{v}</th>)}
                        <th className="p-1">الشاشة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traceRows.map(({ s, i }) => {
                        let n = ex.nodes.find((x) => x.id === s.node)!
                        let before = i > 0 ? run.steps[i - 1].output.length : 0
                        return (
                          <tr key={i} className={clsx('border-t border-slate-100 dark:border-slate-700', i === step && 'bg-sky-50 dark:bg-sky-900/30')}>
                            <td className="p-1 font-mono text-xs whitespace-nowrap" dir="ltr">{n.kind === 'decision' ? `${n.code} → ${s.branch === 'yes' ? 'نعم' : 'لا'}` : nodeLabel(n).join(' ; ')}</td>
                            {varNames.map((v) => <td key={v} className="p-1 font-mono">{s.vars[v] ?? ''}</td>)}
                            <td className="p-1 font-mono text-xs">{s.output.slice(before).join(' / ')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}

          {mode === 'train' && question && (
            <QuestionCard
              score={score}
              inputsLabel={<>المدخلات:{' '}{Object.entries(question.inputs).map(([k, v], i) => <span key={k}>{i > 0 && '، '}<Code>{k} = {v}</Code></span>)}</>}
              prompt={question.prompt}
              options={question.options}
              answer={question.answer}
              picked={picked}
              onPick={(o) => { setPicked(o); addScore(o === question.answer) }}
              onWatch={() => { setInputs(question.inputs); setMode('run'); setStep(0) }}
              onNext={newQuestion}
            />
          )}
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

// ---------- pieces shared with the algorithm studio ----------

export function MemoryAndScreen({ vars, prevVars, output }: { vars: Record<string, string>; prevVars: Record<string, string>; output: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card title="الذاكرة (المتغيرات)">
        {Object.keys(vars).length === 0 ? (
          <p className="text-sm text-slate-400">فارغة بعد</p>
        ) : (
          <div className="flex flex-wrap gap-2" dir="ltr">
            {Object.entries(vars).map(([k, v]) => (
              <div
                key={k}
                className={clsx(
                  'min-w-16 rounded-lg px-2 py-1 text-center ring-1 transition',
                  prevVars[k] !== undefined && prevVars[k] !== v ? 'bg-amber-50 ring-amber-400 dark:bg-amber-900/40' : 'bg-slate-50 ring-slate-200 dark:bg-slate-900 dark:ring-slate-600',
                )}
              >
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{k}</div>
                <div className={clsx('font-mono text-base font-bold', v === '؟' ? 'text-slate-400' : 'text-slate-900 dark:text-white')}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="الشاشة (المخرجات)">
        <div className="min-h-12 rounded-lg bg-slate-900 p-2 text-sm leading-6 text-emerald-300" dir="auto">
          {output.length === 0 ? <span className="text-slate-500">…</span> : output.map((line, i) => <div key={i} dir="auto">{line}</div>)}
        </div>
      </Card>
    </div>
  )
}

export function ControlBar({ mode, counter, full, playing, onPrev, onNext, onReset, onPlay }: {
  mode: string
  counter: string
  full: boolean
  playing: boolean
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onPlay: () => void
}) {
  return (
    <div className={clsx('sticky bottom-0 -mx-3 mt-4 flex items-center gap-2 bg-slate-50/95 px-3 py-2 backdrop-blur sm:-mx-5 sm:px-5 dark:bg-slate-900/95', full && 'mt-auto')}>
      {mode !== 'train' && (
        <Btn onClick={onPrev} label="السابق"><span className="hidden sm:inline">→</span> السابق</Btn>
      )}
      <span className="mx-auto font-mono text-sm whitespace-nowrap text-slate-500 dark:text-slate-400" dir="ltr">{counter}</span>
      {mode === 'run' && (
        <>
          <Btn onClick={onReset} label="إعادة">↺</Btn>
          <Btn onClick={onPlay} label={playing ? 'إيقاف' : 'تشغيل تلقائي'}>{playing ? '❚❚' : '▶'}</Btn>
        </>
      )}
      <Btn primary onClick={onNext} label="التالي">
        {mode === 'train' ? 'سؤال آخر' : <>التالي <span className="hidden sm:inline">←</span></>}
      </Btn>
    </div>
  )
}
