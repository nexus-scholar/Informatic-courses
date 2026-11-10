import type { Example } from './types'

// Coordinates are SVG units; every chart is ≤ 380 wide so it fits a phone.
// Keywords and identifiers in English, messages in Arabic
// (.agents/rules/pseudocode_conventions.md).

const rectangle: Example = {
  id: 'rectangle',
  title: 'مساحة ومحيط مستطيل',
  level: 'sequence',
  lesson: '/docs/unit-15',
  problem: 'نريد حساب مساحة مستطيل ومحيطه انطلاقًا من طوله وعرضه.',
  analysis: { inputs: 'الطول length والعرض width', processing: 'area ← length × width ؛ perimeter ← 2 × (length + width)', outputs: 'المساحة والمحيط' },
  inputs: [
    { name: 'length', label: 'الطول', value: 5, min: 1, max: 20 },
    { name: 'width', label: 'العرض', value: 3, min: 1, max: 20 },
  ],
  width: 360,
  height: 415,
  nodes: [
    { id: 's', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 95, code: 'length, width' },
    { id: 'p', kind: 'process', x: 180, y: 175, code: 'area ← length * width\nperimeter ← 2 * (length + width)' },
    { id: 'o1', kind: 'output', x: 180, y: 255, code: '"المساحة = ", area' },
    { id: 'o2', kind: 'output', x: 180, y: 320, code: '"المحيط = ", perimeter' },
    { id: 'e', kind: 'end', x: 180, y: 385 },
  ],
  edges: [
    { from: 's', to: 'in' },
    { from: 'in', to: 'p' },
    { from: 'p', to: 'o1' },
    { from: 'o1', to: 'o2' },
    { from: 'o2', to: 'e' },
  ],
  slides: [
    { reveal: ['s'], title: 'البداية', text: 'كل مخطط يبدأ بشكل بيضوي واحد مكتوب فيه «بداية».' },
    { reveal: ['in'], title: 'المدخلات', text: 'نحتاج الطول والعرض. نقرؤهما بمتوازي الأضلاع: Read(length, width).' },
    { reveal: ['p'], title: 'المعالجة', text: 'المستطيل يعني «احسب». نسند كل نتيجة إلى متغير بالسهم ←.' },
    { reveal: ['o1', 'o2'], title: 'المخرجات', text: 'نُظهر النتيجتين بمتوازي الأضلاع: Write. لاحظ أن الرسالة بالعربية والقيمة تأتي بعدها.' },
    { reveal: ['e'], title: 'النهاية', text: 'شكل «نهاية» واحد. هذا مخطط متسلسل: كل شكل يُنفَّذ مرة واحدة من الأعلى إلى الأسفل.' },
  ],
  pseudo: `Algorithm Rectangle
Var
    length, width, area, perimeter : Real
Begin
    Read(length, width)
    area ← length * width
    perimeter ← 2 * (length + width)
    Write("المساحة = ", area)
    Write("المحيط = ", perimeter)
End`,
}

const minutes: Example = {
  id: 'minutes',
  title: 'تحويل الدقائق إلى ساعات',
  level: 'sequence',
  lesson: '/docs/unit-17',
  problem: 'مدة فيلم بالدقائق، نريد كتابتها بالساعات والدقائق.',
  analysis: { inputs: 'عدد الدقائق minutes', processing: 'h ← minutes div 60 ؛ m ← minutes mod 60', outputs: 'الساعات والدقائق' },
  inputs: [{ name: 'minutes', label: 'الدقائق', value: 135, min: 30, max: 600 }],
  width: 360,
  height: 340,
  nodes: [
    { id: 's', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 95, code: 'minutes' },
    { id: 'p', kind: 'process', x: 180, y: 170, code: 'h ← minutes div 60\nm ← minutes mod 60' },
    { id: 'o', kind: 'output', x: 180, y: 245, code: 'h, " سا و ", m, " د"' },
    { id: 'e', kind: 'end', x: 180, y: 310 },
  ],
  edges: [
    { from: 's', to: 'in' },
    { from: 'in', to: 'p' },
    { from: 'p', to: 'o' },
    { from: 'o', to: 'e' },
  ],
  slides: [
    { reveal: ['s', 'in'], title: 'المدخلات', text: 'نقرأ عددًا واحدًا: عدد الدقائق.' },
    { reveal: ['p'], title: 'div و mod', text: 'div يعطي حاصل القسمة الصحيح (عدد الساعات)، و mod يعطي الباقي (الدقائق المتبقية). مثال: `135 div 60 = 2` و `135 mod 60 = 15`.' },
    { reveal: ['o'], title: 'المخرج', text: 'Write يلصق الأجزاء بعضها ببعض دون مسافات، لذلك نضع المسافات داخل الرسائل.' },
    { reveal: ['e'], title: 'النهاية', text: 'جرّب في «تنفيذ» قيمًا مثل 59 و 60 و 125.' },
  ],
  pseudo: `Algorithm Minutes
Var
    minutes, h, m : Integer
Begin
    Read(minutes)
    h ← minutes div 60
    m ← minutes mod 60
    Write(h, " سا و ", m, " د")
End`,
}

const average: Example = {
  id: 'average',
  title: 'معدل ثلاث مواد: ناجح أم راسب؟',
  level: 'decision',
  lesson: '/docs/unit-15',
  problem: 'نحسب معدل الرياضيات والفيزياء والعلوم، ثم نقرر: ناجح إذا كان المعدل 10 أو أكثر.',
  analysis: { inputs: 'النقاط الثلاث', processing: 'حساب المعدل ثم مقارنته بـ 10', outputs: 'ناجح أو راسب' },
  inputs: [
    { name: 'math', label: 'رياضيات', value: 12, min: 0, max: 20 },
    { name: 'physics', label: 'فيزياء', value: 8, min: 0, max: 20 },
    { name: 'science', label: 'علوم', value: 9, min: 0, max: 20 },
  ],
  width: 360,
  height: 475,
  nodes: [
    { id: 's', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 95, code: 'math, physics, science' },
    { id: 'p', kind: 'process', x: 180, y: 160, code: 'avg ← (math + physics + science) / 3' },
    { id: 'd', kind: 'decision', x: 180, y: 245, code: 'avg ≥ 10' },
    { id: 'oy', kind: 'output', x: 85, y: 330, code: '"ناجح"' },
    { id: 'on', kind: 'output', x: 275, y: 330, code: '"راسب"' },
    { id: 'j', kind: 'join', x: 180, y: 390 },
    { id: 'e', kind: 'end', x: 180, y: 445 },
  ],
  edges: [
    { from: 's', to: 'in' },
    { from: 'in', to: 'p' },
    { from: 'p', to: 'd' },
    { from: 'd', to: 'oy', branch: 'yes', fromSide: 'left', via: [[85, 245]] },
    { from: 'd', to: 'on', branch: 'no', fromSide: 'right', via: [[275, 245]] },
    { from: 'oy', to: 'j', via: [[85, 390]], toSide: 'left' },
    { from: 'on', to: 'j', via: [[275, 390]], toSide: 'right' },
    { from: 'j', to: 'e' },
  ],
  slides: [
    { reveal: ['s', 'in'], title: 'المدخلات', text: 'نقرأ النقاط الثلاث دفعة واحدة.' },
    { reveal: ['p'], title: 'المعالجة', text: 'نضع الجمع بين قوسين قبل القسمة على 3، لأن القسمة أولى من الجمع.' },
    { reveal: ['d'], title: 'القرار', text: 'المعين سؤال جوابه نعم أو لا. منه يخرج سهمان، ولا يُنفَّذ إلا واحد منهما.' },
    { reveal: ['oy'], title: 'فرع «نعم»', text: 'إذا كان avg ≥ 10 نكتب «ناجح». انتبه: المعدل 10 بالضبط ناجح.' },
    { reveal: ['on'], title: 'فرع «لا»', text: 'وإلا نكتب «راسب».' },
    { reveal: ['j', 'e'], title: 'نقطة الربط والنهاية', text: 'يلتقي الفرعان في نقطة الربط، فيبقى للمخطط نهاية واحدة.' },
  ],
  pseudo: `Algorithm Average
Var
    math, physics, science, avg : Real
Begin
    Read(math, physics, science)
    avg ← (math + physics + science) / 3
    If avg ≥ 10 Then
        Write("ناجح")
    Else
        Write("راسب")
    EndIf
End`,
}

const parity: Example = {
  id: 'parity',
  title: 'عدد زوجي أم فردي؟',
  level: 'decision',
  lesson: '/docs/unit-17',
  problem: 'نقرأ عددًا صحيحًا ونُظهر هل هو زوجي أم فردي.',
  analysis: { inputs: 'العدد n', processing: 'باقي قسمة n على 2', outputs: 'زوجي أو فردي' },
  inputs: [{ name: 'n', label: 'العدد', value: 7, min: 1, max: 99 }],
  width: 360,
  height: 410,
  nodes: [
    { id: 's', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 95, code: 'n' },
    { id: 'd', kind: 'decision', x: 180, y: 180, code: 'n mod 2 = 0' },
    { id: 'oy', kind: 'output', x: 85, y: 265, code: '"زوجي"' },
    { id: 'on', kind: 'output', x: 275, y: 265, code: '"فردي"' },
    { id: 'j', kind: 'join', x: 180, y: 325 },
    { id: 'e', kind: 'end', x: 180, y: 380 },
  ],
  edges: [
    { from: 's', to: 'in' },
    { from: 'in', to: 'd' },
    { from: 'd', to: 'oy', branch: 'yes', fromSide: 'left', via: [[85, 180]] },
    { from: 'd', to: 'on', branch: 'no', fromSide: 'right', via: [[275, 180]] },
    { from: 'oy', to: 'j', via: [[85, 325]], toSide: 'left' },
    { from: 'on', to: 'j', via: [[275, 325]], toSide: 'right' },
    { from: 'j', to: 'e' },
  ],
  slides: [
    { reveal: ['s', 'in'], title: 'المدخلات', text: 'نقرأ عددًا واحدًا n.' },
    { reveal: ['d'], title: 'الشرط', text: 'n mod 2 هو باقي قسمة n على 2. إذا كان الباقي 0 فالعدد زوجي.' },
    { reveal: ['oy', 'on'], title: 'الفرعان', text: 'فرع «نعم» يكتب «زوجي»، وفرع «لا» يكتب «فردي».' },
    { reveal: ['j', 'e'], title: 'النهاية', text: 'جرّب 0 و 1 و 100: هل النتيجة صحيحة دائمًا؟' },
  ],
  pseudo: `Algorithm Parity
Var
    n : Integer
Begin
    Read(n)
    If n mod 2 = 0 Then
        Write("زوجي")
    Else
        Write("فردي")
    EndIf
End`,
}

const equation: Example = {
  id: 'equation',
  title: 'حل المعادلة ax + b = 0',
  level: 'decision',
  lesson: '/docs/unit-15',
  problem: 'نحل المعادلة `ax + b = 0` مع معالجة الحالة `a = 0`.',
  analysis: { inputs: 'المعاملان a و b', processing: 'اختبار a ثم b، أو حساب x ← -b / a', outputs: 'قيمة x أو «لا يوجد حل» أو «كل عدد حل»' },
  inputs: [
    { name: 'a', label: 'a', value: 2, min: -5, max: 5 },
    { name: 'b', label: 'b', value: -6, min: -12, max: 12 },
  ],
  width: 380,
  height: 550,
  nodes: [
    { id: 's', kind: 'start', x: 190, y: 30 },
    { id: 'in', kind: 'input', x: 190, y: 90, code: 'a, b' },
    { id: 'd1', kind: 'decision', x: 190, y: 170, code: 'a = 0' },
    { id: 'd2', kind: 'decision', x: 100, y: 250, code: 'b = 0' },
    { id: 'p', kind: 'process', x: 290, y: 250, code: 'x ← -b / a' },
    { id: 'o1', kind: 'output', x: 100, y: 330, code: '"كل عدد حل"' },
    { id: 'o3', kind: 'output', x: 290, y: 330, code: '"x = ", x' },
    { id: 'o2', kind: 'output', x: 190, y: 400, code: '"لا يوجد حل"' },
    { id: 'j', kind: 'join', x: 190, y: 465 },
    { id: 'e', kind: 'end', x: 190, y: 520 },
  ],
  edges: [
    { from: 's', to: 'in' },
    { from: 'in', to: 'd1' },
    { from: 'd1', to: 'd2', branch: 'yes', fromSide: 'left', via: [[100, 170]] },
    { from: 'd1', to: 'p', branch: 'no', fromSide: 'right', via: [[290, 170]] },
    { from: 'd2', to: 'o1', branch: 'yes' },
    { from: 'd2', to: 'o2', branch: 'no', fromSide: 'right', via: [[190, 250]] },
    { from: 'p', to: 'o3' },
    { from: 'o1', to: 'j', via: [[100, 465]], toSide: 'left' },
    { from: 'o2', to: 'j' },
    { from: 'o3', to: 'j', via: [[290, 465]], toSide: 'right' },
    { from: 'j', to: 'e' },
  ],
  slides: [
    { reveal: ['s', 'in'], title: 'المدخلات', text: 'نقرأ المعاملين a و b.' },
    { reveal: ['d1'], title: 'القرار الأول', text: 'لا يمكن القسمة على 0، لذلك نختبر `a = 0` قبل أي حساب.' },
    { reveal: ['p', 'o3'], title: 'الحالة العادية', text: 'إذا كان a ≠ 0 فالحل الوحيد x ← -b / a.' },
    { reveal: ['d2'], title: 'قرار داخل قرار', text: 'إذا كان `a = 0` تصبح المعادلة `b = 0`، فنحتاج سؤالًا ثانيًا.' },
    { reveal: ['o1', 'o2'], title: 'الحالتان الخاصتان', text: '`b = 0`: المساواة `0 = 0` صحيحة دائمًا ← كل عدد حل. `b ≠ 0`: مساواة خاطئة ← لا يوجد حل.' },
    { reveal: ['j', 'e'], title: 'ثلاثة طرق ونهاية واحدة', text: 'تلتقي الطرق الثلاثة في نقطة الربط. اختبر كل طريق في «تنفيذ».' },
  ],
  pseudo: `Algorithm Equation
Var
    a, b, x : Real
Begin
    Read(a, b)
    If a = 0 Then
        If b = 0 Then
            Write("كل عدد حل")
        Else
            Write("لا يوجد حل")
        EndIf
    Else
        x ← -b / a
        Write("x = ", x)
    EndIf
End`,
}

const evens: Example = {
  id: 'evens',
  title: 'مجموع الأعداد الزوجية الأقل من n',
  level: 'loop',
  lesson: '/docs/unit-15',
  problem: 'نحسب `2 + 4 + 6 + …` لكل الأعداد الزوجية الأقل من n (مثال الكتاب: `n = 20`).',
  analysis: { inputs: 'الحد n', processing: 'تكرار الجمع s ← s + i مع i ← i + 2', outputs: 'المجموع s' },
  inputs: [{ name: 'n', label: 'n', value: 20, min: 4, max: 30 }],
  width: 360,
  height: 565,
  nodes: [
    { id: 's0', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 90, code: 'n' },
    { id: 'p1', kind: 'process', x: 180, y: 160, code: 's ← 0\ni ← 2' },
    { id: 'd', kind: 'decision', x: 180, y: 250, code: 'i < n' },
    { id: 'p2', kind: 'process', x: 180, y: 330, code: 's ← s + i' },
    { id: 'p3', kind: 'process', x: 180, y: 395, code: 'i ← i + 2' },
    { id: 'o', kind: 'output', x: 180, y: 470, code: '"المجموع = ", s' },
    { id: 'e', kind: 'end', x: 180, y: 535 },
  ],
  edges: [
    { from: 's0', to: 'in' },
    { from: 'in', to: 'p1' },
    { from: 'p1', to: 'd' },
    { from: 'd', to: 'p2', branch: 'yes' },
    { from: 'p2', to: 'p3' },
    { from: 'p3', to: 'd', fromSide: 'left', via: [[40, 395], [40, 205], [180, 205]] },
    { from: 'd', to: 'o', branch: 'no', fromSide: 'right', via: [[320, 250], [320, 470]], toSide: 'right' },
    { from: 'o', to: 'e' },
  ],
  slides: [
    { reveal: ['s0', 'in'], title: 'المدخلات', text: 'نقرأ الحد n. في الكتاب `n = 20`.' },
    { reveal: ['p1'], title: 'التهيئة', text: 'قبل أي حلقة نعطي قيمًا أولية: المجمّع s يبدأ من 0، والعدّاد i يبدأ من أول عدد زوجي 2.' },
    { reveal: ['d'], title: 'شرط الاستمرار', text: 'نسأل: هل ما زال i أقل من n؟' },
    { reveal: ['p2', 'p3'], title: 'جسم الحلقة', text: 'نضيف i إلى المجموع، ثم ننتقل إلى العدد الزوجي الموالي.' },
    { reveal: [], edge: 5, title: 'السهم الراجع', text: 'السهم يعود إلى الشرط: هذه هي الحلقة. نكرر ما دام الجواب «نعم».' },
    { reveal: ['o', 'e'], title: 'الخروج من الحلقة', text: 'عندما يصبح الجواب «لا» نخرج ونكتب المجموع. مع `n = 20` يكون المجموع 90.' },
  ],
  pseudo: `Algorithm EvenSum
Var
    n, s, i : Integer
Begin
    Read(n)
    s ← 0
    i ← 2
    While i < n Do
        s ← s + i
        i ← i + 2
    EndWhile
    Write("المجموع = ", s)
End`,
}

const table: Example = {
  id: 'table',
  title: 'جدول الضرب',
  level: 'loop',
  lesson: '/docs/unit-17',
  problem: 'نقرأ عددًا n ونكتب جدول ضربه من 1 إلى 10.',
  analysis: { inputs: 'العدد n', processing: 'تكرار الضرب n × i لقيم i من 1 إلى 10', outputs: 'عشرة أسطر' },
  inputs: [{ name: 'n', label: 'n', value: 7, min: 2, max: 9 }],
  width: 360,
  height: 480,
  nodes: [
    { id: 's0', kind: 'start', x: 180, y: 30 },
    { id: 'in', kind: 'input', x: 180, y: 90, code: 'n' },
    { id: 'p1', kind: 'process', x: 180, y: 150, code: 'i ← 1' },
    { id: 'd', kind: 'decision', x: 180, y: 235, code: 'i ≤ 10' },
    { id: 'o', kind: 'output', x: 180, y: 315, code: 'n, " × ", i, " = ", n * i' },
    { id: 'p2', kind: 'process', x: 180, y: 380, code: 'i ← i + 1' },
    { id: 'e', kind: 'end', x: 180, y: 450 },
  ],
  edges: [
    { from: 's0', to: 'in' },
    { from: 'in', to: 'p1' },
    { from: 'p1', to: 'd' },
    { from: 'd', to: 'o', branch: 'yes' },
    { from: 'o', to: 'p2' },
    { from: 'p2', to: 'd', fromSide: 'left', via: [[20, 380], [20, 190], [180, 190]] },
    { from: 'd', to: 'e', branch: 'no', fromSide: 'right', via: [[340, 235], [340, 450]], toSide: 'right' },
  ],
  slides: [
    { reveal: ['s0', 'in', 'p1'], title: 'التهيئة', text: 'نقرأ n، ونبدأ العدّاد i من 1.' },
    { reveal: ['d'], title: 'كم مرة؟', text: 'نكرر ما دام i ≤ 10، أي عشر مرات بالضبط.' },
    { reveal: ['o'], title: 'سطر في كل دورة', text: 'في كل دورة نكتب سطرًا واحدًا: n × i = النتيجة.' },
    { reveal: ['p2'], edge: 5, title: 'لا تنسَ العدّاد', text: 'بدون `i ← i + 1` يبقى `i = 1` إلى الأبد: حلقة لانهائية!' },
    { reveal: ['e'], title: 'الخروج', text: 'عندما يصبح `i = 11` يكون الجواب «لا» فنصل إلى النهاية.' },
  ],
  pseudo: `Algorithm Table
Var
    n, i : Integer
Begin
    Read(n)
    For i ← 1 To 10 Do
        Write(n, " × ", i, " = ", n * i)
    EndFor
End`,
}

export const EXAMPLES: Example[] = [rectangle, minutes, average, parity, equation, evens, table]

export const LEVELS: Record<Example['level'], string> = {
  sequence: 'متسلسل',
  decision: 'قرار',
  loop: 'حلقة',
}
