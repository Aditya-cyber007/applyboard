import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Preference order — fastest / most capable first
const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.0-pro',
  'gemini-pro',
]

let availableModels: string[] | null = null

async function getAvailableModels(): Promise<string[]> {
  if (availableModels) return availableModels

  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set in .env.local')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}&pageSize=100`
  )
  if (!res.ok) throw new Error(`Could not list models: ${res.status}`)

  const data = await res.json()
  const names: string[] = (data.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes('generateContent')
    )
    .map((m: { name: string }) => m.name.replace('models/', ''))

  // Keep only models in our preference list, in preference order
  availableModels = PREFERRED_MODELS.filter((m) => names.includes(m))
  if (availableModels.length === 0) availableModels = names.slice(0, 5)

  console.info('[analyze] available models:', availableModels)
  return availableModels
}

const buildPrompt = (jobDescription: string, resumeText: string) => `
You are an ATS (Applicant Tracking System) expert. Analyze the job description against the candidate resume.

Return ONLY a valid JSON object — no markdown, no explanation, just the JSON:
{
  "score": <integer 0-100, how well the resume matches the JD>,
  "gaps": <array of up to 5 short strings: skills/experience missing from the resume>,
  "summary": <2 sentence plain-text summary of the match>,
  "company": <company name extracted from JD, or "">,
  "role": <job title extracted from JD, or "">,
  "salary": <salary range extracted from JD, or "">,
  "location": <location extracted from JD, or "">
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobDescription, resumeText } = await request.json()
  if (!jobDescription || !resumeText) {
    return NextResponse.json({ error: 'Job description and resume are required' }, { status: 400 })
  }

  let models: string[]
  try {
    models = await getAvailableModels()
  } catch (err) {
    availableModels = null
    return NextResponse.json(
      { error: `Could not connect to Gemini API: ${err instanceof Error ? err.message : err}` },
      { status: 502 }
    )
  }

  const prompt = buildPrompt(jobDescription, resumeText)
  const lastError: string[] = []

  // Try each model in order — skip on 503/429/404 and move to next
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      const data = JSON.parse(cleaned)
      console.info('[analyze] success with model:', modelName)
      return NextResponse.json({ ...data, _model: modelName })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn(`[analyze] ${modelName} failed:`, msg)
      lastError.push(`${modelName}: ${msg.slice(0, 120)}`)

      const isTransient = msg.includes('503') || msg.includes('502') || msg.includes('overloaded')
      const isQuota = msg.includes('429') || msg.includes('quota')
      const isNotFound = msg.includes('404') || msg.includes('not found')

      if (isTransient || isQuota || isNotFound) {
        // Try next model
        continue
      }
      // Unexpected error — stop
      break
    }
  }

  // All models failed — reset cache so next request re-discovers
  availableModels = null

  const allQuota = lastError.every((e) => e.includes('429') || e.includes('quota'))
  if (allQuota) {
    return NextResponse.json(
      { error: 'All Gemini models are quota-limited. Wait a minute and try again.' },
      { status: 429 }
    )
  }

  return NextResponse.json(
    { error: `All models unavailable. Last errors:\n${lastError.join('\n')}` },
    { status: 503 }
  )
}
