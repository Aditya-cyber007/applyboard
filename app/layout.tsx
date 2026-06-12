import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ApplyBoard — Track Your Job Applications',
  description: 'AI-powered Kanban board for managing your job search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <ClerkProvider appearance={{ theme: shadcn }} clockSkewInMs={60000}>{children}</ClerkProvider>
      </body>
    </html>
  )
}
