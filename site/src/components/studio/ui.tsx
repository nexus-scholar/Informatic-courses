'use client'

import { useCallback, useEffect, useState } from 'react'
import clsx from 'clsx'

export { rnd, shuffle } from './random'

export function Btn({ onClick, children, primary, label, className }: { onClick: () => void; children: React.ReactNode; primary?: boolean; label?: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-xl px-3 text-sm font-semibold whitespace-nowrap transition select-none active:scale-[0.98] sm:px-4',
        primary
          ? 'bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400'
          : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600 dark:hover:bg-slate-700',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-2xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:ring-slate-700', className)}>
      {title && <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>}
      {children}
    </div>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <span dir="ltr" className="font-mono [unicode-bidi:isolate]">
      {children}
    </span>
  )
}

/** Arabic text where `back-ticked` parts are code/maths kept left-to-right. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : <span key={i}>{part}</span>))}
    </>
  )
}

export function FullscreenIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      {on ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
    </svg>
  )
}

/** Practice score kept only in this browser (no accounts, no personal data). */
export function useScore(id: string) {
  let key = `studio-score-${id}`
  let [score, setScore] = useState({ right: 0, total: 0 })
  useEffect(() => {
    try {
      let saved = localStorage.getItem(key)
      setScore(saved ? JSON.parse(saved) : { right: 0, total: 0 })
    } catch {
      setScore({ right: 0, total: 0 })
    }
  }, [key])
  let add = useCallback(
    (ok: boolean) =>
      setScore((s) => {
        let next = { right: s.right + (ok ? 1 : 0), total: s.total + 1 }
        try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
        return next
      }),
    [key],
  )
  return [score, add] as const
}

/** Native full screen when available, otherwise a full-page overlay (iPhone Safari). */
export function useFullscreen(rootRef: React.RefObject<HTMLDivElement | null>) {
  let [full, setFull] = useState(false)
  let toggle = useCallback(() => {
    if (full) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      setFull(false)
      return
    }
    let el = rootRef.current
    setFull(true)
    if (el && document.fullscreenEnabled && el.requestFullscreen) el.requestFullscreen().catch(() => {})
    setTimeout(() => rootRef.current?.focus(), 50)
  }, [full, rootRef])
  useEffect(() => {
    function onChange() { if (!document.fullscreenElement) setFull(false) }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  useEffect(() => {
    if (!full) return
    let prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [full])
  return [full, toggle] as const
}

/** Arrow keys / space / F / Esc, mirrored for RTL: the next item is to the left. */
export function studioKeys(e: React.KeyboardEvent, a: { next: () => void; prev: () => void; full: boolean; toggleFull: () => void }) {
  if ((e.target as HTMLElement).closest('input, select, textarea')) return
  if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); a.next() }
  else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); a.prev() }
  else if (e.key === 'Escape' && a.full) a.toggleFull()
  else if (e.key === 'f' || e.key === 'F') a.toggleFull()
}

/** Swipe handlers (RTL: swiping right goes forward). */
export function useSwipe(next: () => void, prev: () => void) {
  let [start, setStart] = useState<number | null>(null)
  return {
    onTouchStart: (e: React.TouchEvent) => setStart(e.touches[0].clientX),
    onTouchEnd: (e: React.TouchEvent) => {
      if (start === null) return
      let dx = e.changedTouches[0].clientX - start
      setStart(null)
      if (Math.abs(dx) < 50) return
      if (dx > 0) next(); else prev()
    },
  }
}

export function ModeTabs<M extends string>({ modes, mode, onChange }: { modes: Array<{ id: M; label: string }>; mode: M; onChange: (m: M) => void }) {
  return (
    <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" role="tablist">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={mode === m.id}
          onClick={() => onChange(m.id)}
          className={clsx(
            'min-h-10 rounded-lg px-4 text-sm font-semibold transition',
            mode === m.id ? 'bg-sky-600 text-white dark:bg-sky-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700',
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}

/** Multiple-choice practice card shared by both studios. */
export function QuestionCard({
  score,
  inputsLabel,
  prompt,
  options,
  answer,
  picked,
  onPick,
  onWatch,
  onNext,
}: {
  score: { right: number; total: number }
  inputsLabel: React.ReactNode
  prompt: string
  options: string[]
  answer: string
  picked: string | null
  onPick: (o: string) => void
  onWatch: () => void
  onNext: () => void
}) {
  return (
    <Card title={`تدريب · النتيجة ${score.right} من ${score.total}`}>
      <p className="text-sm text-slate-600 dark:text-slate-300">{inputsLabel}</p>
      <p className="mt-2 text-base font-semibold leading-8 text-slate-900 dark:text-white">{prompt}</p>
      <div className="mt-3 grid gap-2">
        {options.map((o) => {
          let isAnswer = o === answer
          return (
            <button
              key={o}
              type="button"
              disabled={picked !== null}
              onClick={() => onPick(o)}
              className={clsx(
                'min-h-12 rounded-xl px-4 text-start text-base ring-1 transition',
                picked === null && 'bg-white ring-slate-300 hover:bg-sky-50 dark:bg-slate-800 dark:ring-slate-600 dark:hover:bg-slate-700',
                picked !== null && isAnswer && 'bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-900/40',
                picked !== null && !isAnswer && picked === o && 'bg-rose-50 ring-2 ring-rose-500 dark:bg-rose-900/40',
                picked !== null && !isAnswer && picked !== o && 'opacity-60 ring-slate-200 dark:ring-slate-700',
              )}
            >
              <span dir="auto" className="[unicode-bidi:plaintext]">{o}</span>
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className={clsx('text-sm font-semibold', picked === answer ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
            {picked === answer ? 'صحيح، أحسنت.' : `ليس بعد. الجواب الصحيح: ${answer}`}
          </p>
          <Btn onClick={onWatch}>شاهد التنفيذ</Btn>
          <Btn primary onClick={onNext}>سؤال آخر</Btn>
        </div>
      )}
    </Card>
  )
}
