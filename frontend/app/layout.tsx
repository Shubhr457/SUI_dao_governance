import type { Metadata } from 'next'
import './globals.css'
import '@mysten/dapp-kit/dist/index.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'SUI DAO Governance',
  description: 'Decentralized Autonomous Organization governance platform built on Sui blockchain',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
