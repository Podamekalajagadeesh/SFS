import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SFS Frontend',
  description: 'Smart Financial Services Frontend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
