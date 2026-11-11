'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

import { ControlBar } from './FlowchartStudio'
import { checkHtml } from './htmlCheck'
import { HTML_EXAMPLES, type Files, type HtmlExample } from './htmlExamples'
import { Btn, Card, FullscreenIcon, ModeTabs, Rich, studioKeys, useFullscreen, useScore, useSwipe } from './ui'

type Mode = 'explain' | 'try' | 'challenge'

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'explain', label: 'شرح' },
  { id: 'try', label: 'جرّب' },
  { id: 'challenge', label: 'تحدٍّ' },
]

const ARABIC_RUN = /([؀-ۿ][؀-ۿ\s،.؟!:0-9-]*)/

/** Monospace fonts lack Arabic shaping: draw Arabic runs in the site font. */
function CodeLine({ text }: { text: string }) {
  return (
    <>
      {text.split(ARABIC_RUN).map((p, i) => (i % 2 ? <span key={i} className="font-sans">{p}</span> : <span key={i}>{p}</span>))}
    </>
  )
}

function tryFiles(ex: HtmlExample): Files {
  if (ex.id === 'project') return { 'index.html': ex.slides[0].code, 'page2.html': ex.slides[1].code }
  return { 'index.html': ex.slides[ex.slides.length - 1].code }
}

// Links inside the sandboxed preview are reported to the studio instead of navigating.
const LINK_JS =
  "<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;e.preventDefault();parent.postMessage({studioLink:a.getAttribute('href')||''},'*')})<\/script>"

function withLinkHandler(html: string) {
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${LINK_JS}</body>`) : html + LINK_JS
}

const KEYS: Array<{ label: string; text: string; caret?: number }> = [
  { label: '<', text: '<' },
  { label: '>', text: '>' },
  { label: '/', text: '/' },
  { label: '"', text: '""', caret: 1 },
  { label: '=', text: '=' },
  { label: 'p', text: '<p></p>', caret: 3 },
  { label: 'h1', text: '<h1></h1>', caret: 4 },
  { label: 'strong', text: '<strong></strong>', caret: 8 },
  { label: 'br', text: '<br>' },
  { label: 'a', text: '<a href=""></a>', caret: 9 },
  { label: 'img', text: '<img src="" alt="">', caret: 10 },
  { label: 'ul', text: '<ul>\n  <li></li>\n</ul>', caret: 11 },
  { label: 'li', text: '<li></li>', caret: 4 },
  { label: 'table', text: '<table>\n  <tr>\n    <td></td>\n  </tr>\n</table>', caret: 26 },
]

export function HtmlStudio({ example: initial = 'skeleton', only }: { example?: string; only?: string }) {
  let list = useMemo(() => {
    let ids = only?.split(',').map((s) => s.trim()).filter(Boolean)
    return ids?.length ? HTML_EXAMPLES.filter((e) => ids!.includes(e.id)) : HTML_EXAMPLES
  }, [only])
  let [exId, setExId] = useState(list.find((e) => e.id === initial)?.id ?? list[0].id)
  let ex = list.find((e) => e.id === exId) ?? list[0]

  let [mode, setMode] = useState<Mode>('explain')
  let [slide, setSlide] = useState(0)
  let [files, setFiles] = useState<Files>(() => tryFiles(ex))
  let [file, setFile] = useState('index.html')
  let [view, setView] = useState<'code' | 'preview'>('code')
  let [note, setNote] = useState<string | null>(null)
  let [score, addScore] = useScore(`html-${ex.id}`)
  let [celebrated, setCelebrated] = useState(false)
  let rootRef = useRef<HTMLDivElement>(null)
  let frameRef = useRef<HTMLIFrameElement>(null)
  let areaRef = useRef<HTMLTextAreaElement>(null)
  let [full, toggleFull] = useFullscreen(rootRef)

  let editing = mode !== 'explain'
  let code = editing ? files[file] ?? '' : ex.slides[slide].code
  let deferred = useDeferredValue(code)

  function reset(nextEx: HtmlExample, nextMode: Mode) {
    setFiles(nextMode === 'challenge' ? { ...nextEx.start } : tryFiles(nextEx))
    setFile('index.html')
    setSlide(0)
    setNote(null)
    setCelebrated(false)
  }
  function chooseExample(id: string) {
    let next = list.find((e) => e.id === id)!
    setExId(id)
    reset(next, mode)
  }
  function chooseMode(m: Mode) {
    setMode(m)
    reset(ex, m)
    setView('code')
  }

  let next = useCallback(() => { if (mode === 'explain') setSlide((s) => Math.min(s + 1, ex.slides.length - 1)) }, [mode, ex])
  let prev = useCallback(() => { if (mode === 'explain') setSlide((s) => Math.max(s - 1, 0)) }, [mode])
  let swipe = useSwipe(next, prev)

  // link clicks from the preview
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow || !e.data || typeof e.data.studioLink !== 'string') return
      let href: string = e.data.studioLink
      if (editing && files[href] !== undefined) { setFile(href); setNote(null); return }
      if (!editing && /^(index|page2)\.html$/.test(href)) { setNote(`رابط إلى ${href}: جرّبه في وضع «جرّب» حيث يوجد الملفان.`); return }
      setNote(href.startsWith('mailto:') ? `رابط بريد: يفتح برنامج البريد إلى ${href.slice(7)}.` : `رابط إلى ${href || '(فارغ)'}: لا يُفتح داخل المعاينة، لكنه يعمل في المتصفح.`)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [editing, files])

  // challenge checks on every file
  let docs = useMemo(() => {
    if (typeof DOMParser === 'undefined') return null
    let parser = new DOMParser()
    return Object.fromEntries(Object.entries(files).map(([n, c]) => [n, parser.parseFromString(c, 'text/html')]))
  }, [files])
  let results = mode === 'challenge' && docs ? ex.challenges.map((c) => { try { return c.test(docs!) } catch { return false } }) : []
  let allDone = results.length > 0 && results.every(Boolean)
  useEffect(() => {
    if (allDone && !celebrated) { setCelebrated(true); addScore(true) }
  }, [allDone, celebrated, addScore])

  let hints = useMemo(() => (editing ? checkHtml(deferred) : []), [editing, deferred])

  function edit(value: string) {
    setFiles((f) => ({ ...f, [file]: value }))
  }
  function insert(text: string, caretAt = text.length) {
    let el = areaRef.current
    if (!el) return
    let { selectionStart: a, selectionEnd: b } = el
    edit(code.slice(0, a) + text + code.slice(b))
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a + caretAt, a + caretAt) })
  }

  let prevLines = new Set(slide > 0 ? ex.slides[slide - 1].code.split('\n') : [])
  let lines = code.split('\n')

  let preview = (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2 rounded-t-xl bg-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300" dir="ltr">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ms-2 truncate font-mono">{editing ? file : 'index.html'}</span>
      </div>
      <iframe
        ref={frameRef}
        title="معاينة الصفحة"
        sandbox="allow-scripts"
        srcDoc={withLinkHandler(deferred)}
        className={clsx('-mt-2 w-full rounded-b-xl bg-white ring-1 ring-slate-200 dark:ring-slate-700', full ? 'h-[calc(100dvh-16rem)]' : 'h-80 @4xl:h-[28rem]')}
      />
      {note && <p className="rounded-lg bg-sky-50 p-2 text-sm text-sky-900 dark:bg-sky-900/40 dark:text-sky-100" dir="rtl">{note}</p>}
    </div>
  )

  let codePane = editing ? (
    <div className="flex min-w-0 flex-col gap-2">
      {Object.keys(files).length > 1 && (
        <div className="flex gap-1" dir="ltr">
          {Object.keys(files).map((f) => (
            <button key={f} type="button" onClick={() => setFile(f)} className={clsx('rounded-t-lg px-3 py-1.5 font-mono text-sm', f === file ? 'bg-slate-900 text-white dark:bg-slate-950' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300')}>
              {f}
            </button>
          ))}
        </div>
      )}
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
        rows={Math.min(Math.max(lines.length + 1, 12), 28)}
        onChange={(e) => edit(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); insert('  ') } }}
        className="w-full rounded-2xl bg-slate-900 p-3 text-left font-mono text-[14px] leading-7 text-slate-100 outline-none ring-2 ring-sky-500"
        aria-label={`كود ${file}`}
      />
      {hints.length > 0 && (
        <ul className="grid gap-1 text-sm" dir="rtl">
          {hints.slice(0, 6).map((h, i) => (
            <li key={i} className={clsx('rounded-lg px-3 py-1.5', h.level === 'error' ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100')}>
              {h.line ? <span className="font-semibold">السطر {h.line}: </span> : null}
              <Rich text={h.text.replace(/(<\/?[a-z0-9]+[^>]*>)/gi, '`$1`')} />
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : (
    <div dir="ltr" className="overflow-x-auto rounded-2xl bg-slate-900 py-3 text-left font-mono text-[13px] leading-7 text-slate-100 @4xl:text-[15px] dark:bg-slate-950 dark:ring-1 dark:ring-slate-700" {...swipe}>
      {lines.map((text, i) => (
        <div key={i} className={clsx('flex whitespace-pre transition-colors duration-300', slide > 0 && !prevLines.has(text) && text.trim() && 'bg-amber-400/20')}>
          <span className="w-9 shrink-0 select-none pe-3 text-right text-slate-500">{i + 1}</span>
          <span className="pe-4"><CodeLine text={text} /></span>
        </div>
      ))}
    </div>
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
          aria-label="اختر موضوعًا"
          className="order-last min-h-11 w-full min-w-0 rounded-xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-300 sm:order-none sm:w-auto dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
        >
          {list.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <div className="ms-auto">
          <Btn onClick={toggleFull} label={full ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}>
            <FullscreenIcon on={full} />
          </Btn>
        </div>
      </div>

      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-slate-800 dark:text-slate-100">الموضوع: </span>
        <Rich text={ex.problem} />
      </p>

      {mode === 'explain' && (
        <Card title={`الشريحة ${slide + 1} من ${ex.slides.length}`} className="mt-3">
          <p className="text-base font-bold text-slate-900 dark:text-white">{ex.slides[slide].title}</p>
          <p className="mt-1 text-sm leading-7 text-slate-700 dark:text-slate-200"><Rich text={ex.slides[slide].text} /></p>
        </Card>
      )}

      {mode === 'challenge' && (
        <Card title={`التحدي · أنجزته ${score.right} مرة`} className="mt-3">
          <ul className="grid gap-1.5">
            {ex.challenges.map((c, i) => (
              <li key={i} className={clsx('flex items-start gap-2 text-sm leading-6', results[i] ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200')}>
                <span aria-hidden="true" className="mt-0.5">{results[i] ? '✔' : '○'}</span>
                <span><Rich text={c.text.replace(/(<\/?[a-z0-9]+[^>]*>|\b[a-z]+\.html\b)/gi, '`$1`')} /></span>
              </li>
            ))}
          </ul>
          {allDone && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">أحسنت! أنجزت كل شروط التحدي.</p>}
        </Card>
      )}

      {/* narrow: switch between code and preview; wide: side by side */}
      {editing && (
        <div className="mt-3 flex rounded-xl bg-white p-1 ring-1 ring-slate-200 @4xl:hidden dark:bg-slate-800 dark:ring-slate-700">
          {(['code', 'preview'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} className={clsx('min-h-10 flex-1 rounded-lg text-sm font-semibold', view === v ? 'bg-sky-600 text-white dark:bg-sky-500' : 'text-slate-600 dark:text-slate-300')}>
              {v === 'code' ? 'الكود' : 'المعاينة'}
            </button>
          ))}
        </div>
      )}

      <div className={clsx('mt-3 grid gap-4 @4xl:grid-cols-2', full && 'flex-1')}>
        <div className={clsx('min-w-0', editing && view !== 'code' && 'hidden @4xl:block')}>{codePane}</div>
        <div className={clsx('min-w-0', editing && view !== 'preview' && 'hidden @4xl:block')}>{preview}</div>
      </div>

      {editing ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn onClick={() => reset(ex, mode)}>{mode === 'challenge' ? 'ابدأ التحدي من جديد' : 'إعادة المثال'}</Btn>
          {mode === 'try' && <Btn onClick={() => chooseMode('challenge')}>انتقل إلى التحدي</Btn>}
        </div>
      ) : (
        <ControlBar mode="explain" counter={`${slide + 1} / ${ex.slides.length}`} full={full} playing={false} onPrev={prev} onNext={next} onReset={() => setSlide(0)} onPlay={() => {}} />
      )}
    </div>
  )
}
