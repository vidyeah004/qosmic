import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QOSMIC FOOS — Founder\'s Office Operating System',
  description: 'Internal AI platform for QOSMIC operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
