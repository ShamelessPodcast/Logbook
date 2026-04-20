import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Normalise a plate string to alphanumeric uppercase, e.g. "GU22 YNH" → "GU22YNH"
function normaliseReg(raw: string): string {
  return raw.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const apiKey = process.env.PLATE_RECOGNIZER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ plates: [] })
  }

  let imageBase64: string | undefined
  let imageUrl: string | undefined

  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    imageBase64 = body.image // base64 data URL: "data:image/jpeg;base64,..."
    imageUrl = body.url
  } else if (contentType.includes('multipart/form-data')) {
    const form = await request.formData()
    const file = form.get('image') as File | null
    if (file) {
      const buf = await file.arrayBuffer()
      imageBase64 = `data:${file.type};base64,${Buffer.from(buf).toString('base64')}`
    }
  }

  if (!imageBase64 && !imageUrl) {
    return NextResponse.json({ error: 'Provide image (base64 data URL) or url' }, { status: 400 })
  }

  try {
    const formData = new FormData()
    formData.append('regions', 'gb') // UK plates only

    if (imageBase64) {
      // Convert data URL to a Blob the PlateRecognizer API expects
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        const mime = matches[1]
        const bytes = Buffer.from(matches[2], 'base64')
        formData.append('upload', new Blob([bytes], { type: mime }), 'plate.jpg')
      }
    } else if (imageUrl) {
      formData.append('upload_url', imageUrl)
    }

    const res = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: { Authorization: `Token ${apiKey}` },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[detect-plate] PlateRecognizer error:', res.status, text)
      return NextResponse.json({ plates: [] })
    }

    const json = await res.json()

    // Extract unique UK-format results with confidence > 0.7
    const plates: string[] = []
    for (const result of json.results ?? []) {
      const score: number = result.score ?? 0
      if (score < 0.7) continue
      const rawPlate: string = result.plate ?? ''
      const norm = normaliseReg(rawPlate)
      if (norm.length >= 2 && norm.length <= 8 && !plates.includes(norm)) {
        plates.push(norm)
      }
    }

    return NextResponse.json({ plates })
  } catch (err) {
    console.error('[detect-plate] unexpected error:', err)
    return NextResponse.json({ plates: [] })
  }
}
