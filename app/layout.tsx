import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/ui/themes'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ApplyBoard — Track Your Job Applications',
  description: 'AI-powered Kanban board for managing your job search',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-gray-50 antialiased" suppressHydrationWarning>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-expect-error clockSkewInMs exists at runtime but missing from @clerk/ui type definitions */}
        <ClerkProvider appearance={{ theme: shadcn }} clockSkewInMs={60000}>{children}</ClerkProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
