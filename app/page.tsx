import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Sparkles, BarChart2 } from 'lucide-react'

export default async function LandingPage() {
  const { userId } = await auth()
  if (userId) redirect('/board')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">ApplyBoard</h1>
        <p className="text-lg text-gray-500 mb-8">
          Track your job applications on a Kanban board.<br />
          AI-powered resume matching so you know where you stand.
        </p>

        <div className="flex items-center justify-center gap-3 mb-12">
          <Link href="/sign-up">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline">Sign In</Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 text-left">
          {[
            { icon: <LayoutDashboard className="h-5 w-5 text-blue-500" />, title: 'Kanban Board', desc: 'Drag cards across Applied → Screening → Offer stages' },
            { icon: <Sparkles className="h-5 w-5 text-purple-500" />, title: 'AI Match Score', desc: 'Paste a JD and your resume — get an ATS score and skill gaps instantly' },
            { icon: <BarChart2 className="h-5 w-5 text-green-500" />, title: 'Stats Dashboard', desc: 'Response rate, pipeline breakdown, and average match score' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="mb-2">{icon}</div>
              <p className="font-semibold text-sm text-gray-900 mb-1">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
