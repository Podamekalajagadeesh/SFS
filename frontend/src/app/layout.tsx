import type { Metadata } from 'next'
import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers'
import { Navbar } from '../components/Navbar'
import { WalletGuard } from '../components/WalletGuard'

export const metadata: Metadata = {
  title: 'SFS - Secure File Sharing',
  description: 'Decentralized secure file sharing on blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <WalletGuard>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </WalletGuard>
        </Providers>
      </body>
    </html>
  )
}
