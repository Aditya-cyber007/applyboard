import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { jobDescription, resumeText } = await request.json()

  if (!jobDescription || !resumeText) {
    return NextResponse.json({ error: 'Job description and resume are required' }, { status: 400 })
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
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

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Strip markdown code fences if Gemini wraps in ```json
    const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    const data = JSON.parse(cleaned)

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'AI analysis failed. Check your GEMINI_API_KEY.' }, { status: 500 })
  }
}
