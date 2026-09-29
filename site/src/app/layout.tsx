import { type Metadata } from 'next'
import { Cairo } from 'next/font/google'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { Layout } from '@/components/Layout'

import '@/styles/tailwind.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    template: '%s - منهاج الإعلام الآلي 1AS',
    default: 'منهاج الإعلام الآلي | السنة الأولى ثانوي',
  },
  description:
    'المنصة التعليمية الرقمية لمقرر مادة الإعلام الآلي للسنة الأولى ثانوي في الجزائر — وحدات تعليمية عصرية، تمارين ومشاريع مخبرية.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={clsx('h-full antialiased scroll-smooth', cairo.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-white font-sans text-slate-900 selection:bg-sky-500 selection:text-white dark:bg-slate-900 dark:text-slate-100">
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  )
}
