/**
 * GET /api/vehicle?reg=AB12CDE
 *
 * Combined vehicle lookup: DVLA VES + DVSA MOT History.
 * Returns everything we know about a plate from official UK government sources.
 */

import { lookupPlate } from '@/lib/dvla'
import { getMOTHistory } from '@/lib/mot'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reg = searchParams.get('reg')

  if (!reg) {
    return NextResponse.json({ error: 'reg parameter required' }, { status: 400 })
  }

  // Run both lookups in parallel — don't let one failure block the other
  const [dvlaResult, motResult] = await Promise.allSettled([
    lookupPlate(reg),
    getMOTHistory(reg),
  ])

  const dvla = dvlaResult.status === 'fulfilled' ? dvlaResult.value : { data: null, error: 'DVLA unavailable' }
  const mot  = motResult.status === 'fulfilled'  ? motResult.value  : { data: null, error: 'MOT history unavailable' }

  // If DVLA returned a hard "not found", surface that
  if (dvla.error === 'Vehicle not found') {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
  }

  return NextResponse.json({
    dvla:  dvla.data,
    mot:   mot.data,
    errors: {
      dvla: dvla.error,
      mot:  mot.error,
    },
  })
}
