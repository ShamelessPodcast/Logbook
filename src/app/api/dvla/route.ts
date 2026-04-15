import { lookupPlate } from '@/lib/dvla'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reg = searchParams.get('reg')

  if (!reg) {
    return NextResponse.json({ error: 'reg parameter required' }, { status: 400 })
  }

  const { data, error } = await lookupPlate(reg)

  if (error) {
    return NextResponse.json({ error }, { status: error === 'Vehicle not found' ? 404 : 500 })
  }

  return NextResponse.json({ data })
}
