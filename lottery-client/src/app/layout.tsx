import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NextAuthProvider from '@/components/auth/NextAuthProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Crypto Lottery',
  description: 'A refund-first crypto lottery with provable fairness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <NextAuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </NextAuthProvider>
      </body>
    </html>
  )
}
