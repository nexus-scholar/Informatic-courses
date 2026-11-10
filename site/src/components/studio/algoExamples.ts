// Algorithm examples for units 16–17. English keywords, Arabic messages
// (.agents/rules/pseudocode_conventions.md). Slide line numbers are 1-based.

import { rnd } from './random'

export interface AlgoSlide {
  /** First and last line highlighted on this slide; everything up to `to` is revealed. */
  from: number
  to: number
  title: string
  text: string
}

export interface AlgoExample {
  id: string
  title: string
  level: 'basics' | 'decision' | 'loop'
  lesson: '/docs/unit-16' | '/docs/unit-17'
  problem: string
  code: string
  /** Values the user types, in order, separated by commas. */
  inputs: string
  slides: AlgoSlide[]
  /** Random inputs for practice; omit to disable practice. */
  gen?: () => string
  /** Variable asked about in "final value" questions. */
  watch?: string
}

const r = (min: number, max: number) => rnd(min, max)
const half = (min: number, max: number) => rnd(min * 2, max * 2) / 2

export const ALGO_EXAMPLES: AlgoExample[] = [
  {
    id: 'sum',
    title: 'مجموع عددين',
    level: 'basics',
    lesson: '/docs/unit-16',
    problem: 'نقرأ عددين صحيحين ونُظهر مجموعهما (التقويم الرسمي للوحدة 16).',
    code: `Algorithm SumTwoNumbers
Var
    a, b, s : Integer
Begin
    Write("أدخل عددين:")
    Read(a, b)
    s ← a + b
    Write("المجموع = ", s)
End`,
    inputs: '5, 7',
    gen: () => `${r(0, 50)}, ${r(0, 50)}`,
    watch: 's',
    slides: [
      { from: 1, to: 1, title: 'الرأس', text: 'Algorithm ثم اسم الخوارزمية: معرّف بحروف لاتينية دون مسافات.' },
      { from: 2, to: 3, title: 'التصريحات', text: 'نصرّح عن كل متغير ونوعه قبل استعماله. هنا ثلاث علب من النوع Integer.' },
      { from: 4, to: 4, title: 'Begin', text: 'تبدأ هنا التعليمات، وتُنفَّذ بالترتيب من الأعلى إلى الأسفل.' },
      { from: 5, to: 6, title: 'المدخلات', text: 'Write تُظهر رسالة توجّه المستخدم، ثم Read تأخذ ما يكتبه وتضعه في a و b.' },
      { from: 7, to: 7, title: 'المعالجة', text: 'الإسناد ←: نحسب a + b ونضع النتيجة في s.' },
      { from: 8, to: 9, title: 'المخرجات والنهاية', text: 'نُظهر النتيجة مع رسالة، ثم End. جرّبها في «تنفيذ».' },
    ],
  },
  {
    id: 'compare',
    title: 'مقارنة عددين',
    level: 'decision',
    lesson: '/docs/unit-16',
    problem: 'نقرأ عددين ونُظهر الأكبر بينهما (التقويم الرسمي للوحدة 16).',
    code: `Algorithm CompareTwo
Var
    a, b : Integer
Begin
    Read(a, b)
    If a > b Then
        Write("الأكبر هو: ", a)
    Else
        Write("الأكبر هو: ", b)
    EndIf
End`,
    inputs: '4, 9',
    gen: () => `${r(0, 20)}, ${r(0, 20)}`,
    slides: [
      { from: 1, to: 5, title: 'قراءة العددين', text: 'التصريح ثم القراءة كما في مثال المجموع.' },
      { from: 6, to: 6, title: 'السؤال', text: 'If يطرح سؤالًا جوابه نعم أو لا: هل a أكبر من b؟ إنه المعين في المخطط النسقي.' },
      { from: 7, to: 7, title: 'جواب «نعم»', text: 'ما بين Then و Else يُنفَّذ فقط إذا كان الشرط صحيحًا.' },
      { from: 8, to: 10, title: 'جواب «لا»', text: 'ما بين Else و EndIf يُنفَّذ إذا كان الشرط خاطئًا. يُنفَّذ فرع واحد فقط.' },
      { from: 11, to: 11, title: 'سؤال للتفكير', text: 'ماذا يظهر إذا كان العددان متساويين؟ جرّب 5 و 5 في «تنفيذ».' },
    ],
  },
  {
    id: 'circle',
    title: 'مساحة دائرة (ثابت ومتغير)',
    level: 'basics',
    lesson: '/docs/unit-16',
    problem: 'نقرأ نصف قطر دائرة ونحسب مساحتها باستعمال الثابت PI.',
    code: `Algorithm Circle
Const
    PI = 3.14
Var
    r, area : Real
Begin
    Read(r)
    area ← PI * r * r
    Write("المساحة = ", area)
End`,
    inputs: '2',
    gen: () => `${r(1, 10)}`,
    watch: 'area',
    slides: [
      { from: 2, to: 3, title: 'الثابت', text: 'Const: قيمة لا تتغير أثناء التنفيذ. نكتب اسمه بالحروف الكبيرة.' },
      { from: 4, to: 5, title: 'المتغيرات', text: 'Var: علب تتغير قيمتها. النوع Real لأن المساحة عدد بفاصلة.' },
      { from: 6, to: 8, title: 'الحساب', text: 'الضرب قبل الجمع، وتُحسب العبارة كلها ثم توضع في area.' },
      { from: 9, to: 10, title: 'النتيجة', text: 'مع `r = 2` نحصل على `12.56`. في «تنفيذ» لاحظ أن PI موجودة في الذاكرة منذ البداية.' },
    ],
  },
  {
    id: 'typeError',
    title: 'خطأ في النوع: لماذا Real؟',
    level: 'basics',
    lesson: '/docs/unit-16',
    problem: 'خوارزمية فيها خطأ مقصود: نضع نتيجة قسمة في متغير من النوع Integer.',
    code: `Algorithm WrongType
Var
    total, avg : Integer
Begin
    Read(total)
    avg ← total / 4
    Write("المعدل = ", avg)
End`,
    inputs: '10',
    slides: [
      { from: 2, to: 3, title: 'التصريح', text: 'صرّحنا عن avg بالنوع Integer: لا يقبل إلا أعدادًا صحيحة.' },
      { from: 5, to: 6, title: 'القسمة', text: '`10 / 4 = 2.5` عدد حقيقي. ماذا سيحدث؟ نفّذ وانظر رسالة الخطأ.' },
      { from: 7, to: 8, title: 'الإصلاح', text: 'في «تنفيذ» اضغط «عدّل» وغيّر Integer إلى Real في السطر 3، ثم أعد التنفيذ.' },
    ],
  },
  {
    id: 'swap',
    title: 'تبادل قيمتي متغيرين',
    level: 'basics',
    lesson: '/docs/unit-17',
    problem: 'نبادل قيمتي a و b باستعمال متغير مساعد temp.',
    code: `Algorithm Swap
Var
    a, b, temp : Integer
Begin
    Read(a, b)
    temp ← a
    a ← b
    b ← temp
    Write("a = ", a, " و b = ", b)
End`,
    inputs: '3, 7',
    gen: () => `${r(1, 20)}, ${r(1, 20)}`,
    watch: 'a',
    slides: [
      { from: 5, to: 5, title: 'البداية', text: 'نقرأ a و b. الهدف: أن تصبح قيمة a في b والعكس.' },
      { from: 6, to: 6, title: 'نحفظ a', text: 'لو كتبنا a ← b مباشرة لضاعت قيمة a. لذلك نحفظها أولًا في temp.' },
      { from: 7, to: 8, title: 'التبادل', text: 'a يأخذ قيمة b، ثم b يأخذ القيمة المحفوظة في temp.' },
      { from: 9, to: 10, title: 'تحقّق', text: 'نفّذ خطوة بخطوة وراقب العلب الثلاث في الذاكرة.' },
    ],
  },
  {
    id: 'minutes',
    title: 'الدقائق إلى ساعات (div و mod)',
    level: 'basics',
    lesson: '/docs/unit-17',
    problem: 'مدة بالدقائق نكتبها بالساعات والدقائق.',
    code: `Algorithm Minutes
Var
    minutes, h, m : Integer
Begin
    Read(minutes)
    h ← minutes div 60
    m ← minutes mod 60
    Write(h, " سا و ", m, " د")
End`,
    inputs: '135',
    gen: () => `${r(30, 600)}`,
    watch: 'm',
    slides: [
      { from: 5, to: 5, title: 'المدخل', text: 'عدد الدقائق، مثل 135.' },
      { from: 6, to: 6, title: 'div', text: 'حاصل القسمة الصحيح: `135 div 60 = 2` ساعة.' },
      { from: 7, to: 7, title: 'mod', text: 'الباقي: `135 mod 60 = 15` دقيقة.' },
      { from: 8, to: 9, title: 'Write يلصق الأجزاء', text: 'لا يضيف Write مسافات: نضعها داخل الرسائل " سا و ".' },
    ],
  },
  {
    id: 'mention',
    title: 'تقدير المعدل (شروط متداخلة)',
    level: 'decision',
    lesson: '/docs/unit-17',
    problem: 'نُظهر التقدير: ممتاز (16 فأكثر)، جيد (12 فأكثر)، مقبول (10 فأكثر)، وإلا راسب.',
    code: `Algorithm Mention
Var
    avg : Real
Begin
    Read(avg)
    If avg ≥ 16 Then
        Write("ممتاز")
    Else
        If avg ≥ 12 Then
            Write("جيد")
        Else
            If avg ≥ 10 Then
                Write("مقبول")
            Else
                Write("راسب")
            EndIf
        EndIf
    EndIf
End`,
    inputs: '13.5',
    gen: () => `${half(5, 19)}`,
    slides: [
      { from: 5, to: 7, title: 'السؤال الأول', text: 'نبدأ بأعلى تقدير: هل avg ≥ 16؟' },
      { from: 8, to: 10, title: 'If داخل Else', text: 'إذا كان الجواب لا، نطرح سؤالًا ثانيًا داخل Else.' },
      { from: 11, to: 15, title: 'السؤال الثالث', text: 'ثم مقبول أو راسب. كل If له EndIf خاص به.' },
      { from: 16, to: 19, title: 'الإغلاق', text: 'ثلاثة If ⇐ ثلاثة EndIf. المسافات في بداية الأسطر تُظهر من داخل من.' },
    ],
  },
  {
    id: 'max3',
    title: 'أكبر ثلاثة أعداد',
    level: 'decision',
    lesson: '/docs/unit-17',
    problem: 'نقرأ ثلاثة أعداد ونُظهر أكبرها.',
    code: `Algorithm MaxOfThree
Var
    a, b, c, max : Integer
Begin
    Read(a, b, c)
    max ← a
    If b > max Then
        max ← b
    EndIf
    If c > max Then
        max ← c
    EndIf
    Write("الأكبر هو: ", max)
End`,
    inputs: '4, 11, 7',
    gen: () => `${r(0, 30)}, ${r(0, 30)}, ${r(0, 30)}`,
    watch: 'max',
    slides: [
      { from: 5, to: 6, title: 'نفترض', text: 'نفترض أن الأول هو الأكبر: max ← a.' },
      { from: 7, to: 9, title: 'نقارن بالثاني', text: 'If بسيط دون Else: إذا كان b أكبر نصحّح max، وإلا لا نفعل شيئًا.' },
      { from: 10, to: 12, title: 'نقارن بالثالث', text: 'نفس الفكرة مع c. تصلح هذه الطريقة لأي عدد من القيم.' },
      { from: 13, to: 14, title: 'النتيجة', text: 'جرّب أن يكون الأكبر في المرتبة الأولى ثم الثانية ثم الثالثة.' },
    ],
  },
  {
    id: 'bus',
    title: 'ثمن التذكرة (شرط مركّب OR)',
    level: 'decision',
    lesson: '/docs/unit-17',
    problem: 'التذكرة مجانية للأطفال دون 6 سنوات ولمن عمره 60 سنة فأكثر، وإلا ثمنها 25 دج.',
    code: `Algorithm BusTicket
Var
    age : Integer
Begin
    Read(age)
    If age < 6 OR age ≥ 60 Then
        Write("التذكرة مجانية")
    Else
        Write("ثمن التذكرة: 25 دج")
    EndIf
End`,
    inputs: '15',
    gen: () => `${[r(1, 5), r(6, 59), r(60, 80), 6, 60][r(0, 4)]}`,
    slides: [
      { from: 5, to: 6, title: 'شرط من جزأين', text: 'OR: يكفي أن يكون أحد الجزأين صحيحًا ليكون الشرط كله صحيحًا.' },
      { from: 7, to: 10, title: 'الفرعان', text: 'جرّب الحدود: 5 و 6 و 59 و 60. أين يتغير الجواب؟' },
    ],
  },
  {
    id: 'sumToN',
    title: 'مجموع الأعداد من 1 إلى n (For)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'نحسب `1 + 2 + … + n`.',
    code: `Algorithm SumToN
Var
    n, i, s : Integer
Begin
    Read(n)
    s ← 0
    For i ← 1 To n Do
        s ← s + i
    EndFor
    Write("المجموع = ", s)
End`,
    inputs: '5',
    gen: () => `${r(2, 10)}`,
    watch: 's',
    slides: [
      { from: 5, to: 6, title: 'المجمّع', text: 's يبدأ من 0 قبل الحلقة: علبة نجمع فيها.' },
      { from: 7, to: 7, title: 'For', text: 'عدد الدورات معروف: i يأخذ 1 ثم 2 … حتى n. الحلقة تزيد i وحدها.' },
      { from: 8, to: 9, title: 'جسم الحلقة', text: 'في كل دورة نضيف i إلى s.' },
      { from: 10, to: 11, title: 'بعد الحلقة', text: 'مع `n = 5` المجموع 15، ومع `n = 100` المجموع 5050 دون أي سطر إضافي.' },
    ],
  },
  {
    id: 'table',
    title: 'جدول الضرب (For)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'نقرأ n ونكتب جدول ضربه من 1 إلى 10.',
    code: `Algorithm Table
Var
    n, i : Integer
Begin
    Read(n)
    For i ← 1 To 10 Do
        Write(n, " × ", i, " = ", n * i)
    EndFor
End`,
    inputs: '7',
    gen: () => `${r(2, 9)}`,
    slides: [
      { from: 5, to: 6, title: 'عشر دورات', text: 'For i ← 1 To 10: الحلقة تُنفَّذ عشر مرات بالضبط.' },
      { from: 7, to: 9, title: 'سطر في كل دورة', text: 'Write داخل الحلقة يكتب سطرًا جديدًا في كل دورة.' },
    ],
  },
  {
    id: 'validGrade',
    title: 'مراقبة صحة الإدخال (While)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'نطلب نقطة بين 0 و 20، ونعيد الطلب ما دامت القيمة خاطئة.',
    code: `Algorithm ValidGrade
Var
    grade : Real
Begin
    Write("أدخل نقطة بين 0 و 20:")
    Read(grade)
    While grade < 0 OR grade > 20 Do
        Write("نقطة غير صحيحة، أعد الإدخال:")
        Read(grade)
    EndWhile
    Write("النقطة المقبولة: ", grade)
End`,
    inputs: '25, -3, 14',
    gen: () => [...Array(r(0, 2))].map(() => [r(21, 40), -r(1, 5)][r(0, 1)]).concat([half(0, 20)]).join(', '),
    slides: [
      { from: 5, to: 6, title: 'القراءة الأولى', text: 'نقرأ قيمة أولى قبل الحلقة.' },
      { from: 7, to: 7, title: 'While', text: 'عدد الدورات غير معروف: نكرر ما دامت القيمة خارج المجال.' },
      { from: 8, to: 10, title: 'إعادة الطلب', text: 'داخل الحلقة نقرأ من جديد، وإلا بقيت القيمة نفسها ودارت الحلقة بلا نهاية.' },
      { from: 11, to: 12, title: 'صفر دورة ممكن', text: 'إذا كانت القيمة الأولى صحيحة لا تُنفَّذ الحلقة أبدًا. جرّب المدخلات 14 فقط.' },
    ],
  },
  {
    id: 'charging',
    title: 'شحن البطارية (While)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'كل 15 دقيقة تزيد البطارية 10%. كم دقيقة حتى تصل إلى 100% أو أكثر؟',
    code: `Algorithm Charging
Var
    battery, minutes : Integer
Begin
    Read(battery)
    minutes ← 0
    While battery < 100 Do
        battery ← battery + 10
        minutes ← minutes + 15
    EndWhile
    Write("مدة الشحن: ", minutes, " دقيقة")
End`,
    inputs: '40',
    gen: () => `${r(0, 10) * 10}`,
    watch: 'minutes',
    slides: [
      { from: 5, to: 6, title: 'التهيئة', text: 'نقرأ نسبة البطارية، والعدّاد minutes يبدأ من 0.' },
      { from: 7, to: 10, title: 'الحلقة', text: 'ما دامت البطارية أقل من 100 نضيف 10% و 15 دقيقة.' },
      { from: 11, to: 12, title: 'جرّب 100', text: 'مع 100 يكون الشرط خاطئًا من البداية: صفر دورة و 0 دقيقة.' },
    ],
  },
  {
    id: 'pin',
    title: 'رمز الهاتف (Repeat … Until)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'يُسمح بثلاث محاولات لإدخال الرمز 1234، وإلا يُقفل الهاتف (إثراء).',
    code: `Algorithm Pin
Const
    PIN = 1234
Var
    code, tries : Integer
Begin
    tries ← 0
    Repeat
        Read(code)
        tries ← tries + 1
    Until code = PIN OR tries = 3
    If code = PIN Then
        Write("مرحبًا!")
    Else
        Write("تم قفل الهاتف")
    EndIf
End`,
    inputs: '1111, 1234',
    gen: () => {
      let wrong = [...Array(r(0, 3))].map(() => r(1000, 9999)).filter((n) => n !== 1234)
      return (wrong.length < 3 ? [...wrong, 1234] : wrong).join(', ')
    },
    watch: 'tries',
    slides: [
      { from: 8, to: 10, title: 'Repeat', text: 'الجسم يُنفَّذ أولًا ثم نختبر: دورة واحدة على الأقل دائمًا.' },
      { from: 11, to: 11, title: 'Until', text: 'نتوقف عندما يصبح الشرط صحيحًا: الرمز صحيح أو انتهت المحاولات.' },
      { from: 12, to: 17, title: 'بعد الحلقة', text: 'نعرف لماذا توقفنا باختبار الرمز مرة أخرى. جرّب 1, 2, 3.' },
    ],
  },
  {
    id: 'classStats',
    title: 'إحصائيات القسم (المشروع المصغر)',
    level: 'loop',
    lesson: '/docs/unit-17',
    problem: 'نقرأ عدد التلاميذ ثم نقاطهم، ونُظهر المعدل وعدد الناجحين وأعلى نقطة (التقويم الرسمي للوحدة 17).',
    code: `Algorithm ClassStats
Var
    n, i, passCount : Integer
    grade, total, best, avg : Real
Begin
    Read(n)
    total ← 0
    passCount ← 0
    best ← 0
    For i ← 1 To n Do
        Read(grade)
        total ← total + grade
        If grade ≥ 10 Then
            passCount ← passCount + 1
        EndIf
        If grade > best Then
            best ← grade
        EndIf
    EndFor
    avg ← total / n
    Write("المعدل: ", avg)
    Write("الناجحون: ", passCount, " من ", n)
    Write("أعلى نقطة: ", best)
End`,
    inputs: '5, 12, 8, 15.5, 9, 17.5',
    gen: () => {
      let n = r(3, 5)
      return [n, ...[...Array(n)].map(() => half(4, 19))].join(', ')
    },
    watch: 'passCount',
    slides: [
      { from: 6, to: 9, title: 'التهيئة', text: 'نقرأ عدد التلاميذ، ونصفّر المجمّع total والعدّاد passCount وأعلى نقطة best.' },
      { from: 10, to: 12, title: 'حلقة القراءة', text: 'في كل دورة نقرأ نقطة واحدة ونضيفها إلى المجموع.' },
      { from: 13, to: 15, title: 'عدّاد بشرط', text: 'نزيد passCount فقط إذا كانت النقطة 10 فأكثر.' },
      { from: 16, to: 19, title: 'أعلى نقطة', text: 'نفس فكرة أكبر ثلاثة أعداد، لكن داخل الحلقة.' },
      { from: 20, to: 24, title: 'النتائج', text: 'بعد الحلقة نحسب المعدل ونكتب ثلاثة أسطر.' },
    ],
  },
]

export const ALGO_LEVELS: Record<AlgoExample['level'], string> = {
  basics: 'تعليمات متسلسلة',
  decision: 'شروط',
  loop: 'حلقات',
}
