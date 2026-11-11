// Friendly checks for student HTML: structure, unclosed tags, obsolete HTML4 markup.

export interface Hint {
  line: number | null
  level: 'error' | 'warn'
  text: string
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW = new Set(['script', 'style'])

const OBSOLETE_TAGS: Record<string, string> = {
  font: 'استعمل CSS: color و font-family و font-size',
  center: 'استعمل CSS: text-align: center',
  big: 'استعمل CSS: font-size',
  basefont: 'استعمل CSS على body',
  marquee: 'وسم قديم غير معتمد في HTML5',
  frame: 'الإطارات قديمة: استعمل صفحات وروابط',
  frameset: 'الإطارات قديمة: استعمل صفحات وروابط',
  tt: 'استعمل code أو CSS',
  strike: 'استعمل s أو del',
}
const OBSOLETE_ATTRS: Record<string, string> = {
  bgcolor: 'background-color',
  align: 'text-align',
  valign: 'vertical-align',
  cellpadding: 'padding',
  cellspacing: 'border-spacing',
  background: 'background-image',
  text: 'color',
}

function lineOf(src: string, index: number) {
  return src.slice(0, index).split('\n').length
}

export function checkHtml(src: string): Hint[] {
  let hints: Hint[] = []
  let clean = src.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))

  if (!/^\s*<!DOCTYPE html>/i.test(clean)) hints.push({ line: 1, level: 'warn', text: 'ابدأ الملف بالسطر <!DOCTYPE html>' })
  let htmlTag = clean.match(/<html\b[^>]*>/i)
  if (htmlTag && !/\blang\s*=/.test(htmlTag[0])) hints.push({ line: lineOf(clean, htmlTag.index!), level: 'warn', text: 'أضف lang="ar" إلى الوسم html' })
  if (htmlTag && !/\bdir\s*=/.test(htmlTag[0])) hints.push({ line: lineOf(clean, htmlTag.index!), level: 'warn', text: 'أضف dir="rtl" إلى الوسم html لصفحة عربية' })
  if (!/<meta\s+charset\s*=\s*["']?utf-8/i.test(clean)) hints.push({ line: null, level: 'warn', text: 'أضف <meta charset="utf-8"> داخل head حتى تظهر العربية سليمة' })
  if (!/<title>[^<]*\S[^<]*<\/title>/i.test(clean)) hints.push({ line: null, level: 'warn', text: 'أعطِ الصفحة عنوانًا: <title>…</title>' })

  let stack: Array<{ name: string; line: number }> = []
  let re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(clean))) {
    let [, closing, rawName, attrs] = m
    let name = rawName.toLowerCase()
    let line = lineOf(clean, m.index)
    if (!closing) {
      if (OBSOLETE_TAGS[name]) hints.push({ line, level: 'warn', text: `الوسم <${name}> قديم: ${OBSOLETE_TAGS[name]}` })
      for (let a of attrs.matchAll(/\b([a-zA-Z-]+)\s*=/g)) {
        let attr = a[1].toLowerCase()
        if (OBSOLETE_ATTRS[attr] && !(attr === 'text' && name !== 'body') && !(attr === 'background' && name !== 'body' && name !== 'table'))
          hints.push({ line, level: 'warn', text: `الخاصية ${attr} قديمة: استعمل CSS ${OBSOLETE_ATTRS[attr]}` })
      }
      if (name === 'img' && !/\balt\s*=\s*["'][^"']*\S/.test(attrs)) hints.push({ line, level: 'warn', text: 'الصورة بلا نص بديل: أضف alt="وصف الصورة"' })
      if (name === 'a' && !/\bhref\s*=/.test(attrs)) hints.push({ line, level: 'warn', text: 'الرابط a يحتاج href' })
      if (VOID.has(name) || attrs.trim().endsWith('/')) continue
      stack.push({ name, line })
      if (RAW.has(name)) {
        let end = clean.toLowerCase().indexOf(`</${name}`, re.lastIndex)
        if (end >= 0) re.lastIndex = end
      }
    } else {
      if (VOID.has(name)) { hints.push({ line, level: 'error', text: `<${name}> لا يُغلق: احذف </${name}>` }); continue }
      let at = stack.map((s) => s.name).lastIndexOf(name)
      if (at < 0) { hints.push({ line, level: 'error', text: `</${name}> يغلق وسمًا لم يُفتح` }); continue }
      for (let open of stack.splice(at + 1)) hints.push({ line: open.line, level: 'error', text: `الوسم <${open.name}> لم يُغلق قبل </${name}>` })
      stack.pop()
    }
  }
  for (let open of stack) hints.push({ line: open.line, level: 'error', text: `الوسم <${open.name}> لم يُغلق: أضف </${open.name}>` })

  return hints.sort((a, b) => (a.line ?? 0) - (b.line ?? 0))
}
