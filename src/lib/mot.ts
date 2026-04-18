/**
 * DVSA MOT History API wrapper.
 *
 * Official UK Government API — free, requires API key.
 * Register: https://documentation.history.mot.api.gov.uk/mot-history-api/register
 * Takes up to 5 working days for approval.
 *
 * Returns full MOT test history per vehicle including:
 *  - Test date, result (PASSED/FAILED), expiry date
 *  - Odometer reading at time of test
 *  - Every advisory, minor, and failure reason
 */

const MOT_BASE_URL = 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration'

export type MOTResult = 'PASSED' | 'FAILED'
export type DefectType = 'FAIL' | 'ADVISORY' | 'PRS' | 'MINOR'
export type OdometerResultType = 'READ' | 'UNREADABLE' | 'NO_ODOMETER'

export interface MOTDefect {
  text: string
  type: DefectType
  dangerous: boolean
}

export interface MOTTest {
  completedDate: string      // "2023.06.14 09:23:00"
  testResult: MOTResult
  expiryDate?: string        // "2024-06-14" — only on PASSED
  odometerValue: string      // "47125"
  odometerUnit: 'mi' | 'km'
  odometerResultType: OdometerResultType
  motTestNumber: string
  rfrAndComments: MOTDefect[]
}

export interface MOTVehicle {
  registration: string
  make: string
  model: string
  firstUsedDate: string      // "2010.11.13"
  fuelType: string
  primaryColour: string
  vehicleId: string
  registrationDate: string
  manufactureDate: string
  engineSize: string
  motTests: MOTTest[]
}

export async function getMOTHistory(
  registration: string
): Promise<{ data: MOTVehicle | null; error: string | null }> {
  const apiKey = process.env.DVSA_MOT_API_KEY
  if (!apiKey) {
    return { data: null, error: 'DVSA_MOT_API_KEY not configured' }
  }

  const reg = registration.toUpperCase().replace(/\s/g, '')

  try {
    const res = await fetch(`${MOT_BASE_URL}/${reg}`, {
      headers: {
        'Accept':        'application/json+v6',
        'X-API-Key':     apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    })

    if (res.status === 404) return { data: null, error: 'Vehicle not found' }
    if (res.status === 403) return { data: null, error: 'DVSA API key not authorised' }

    if (!res.ok) {
      return { data: null, error: `DVSA error ${res.status}` }
    }

    // API returns an array; take first element for a reg lookup
    const json = await res.json() as MOTVehicle[]
    return { data: json[0] ?? null, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' }
  }
}

/**
 * Derive a mileage trend from MOT history — useful for spotting clocking.
 * Returns array of { year, mileage } sorted oldest → newest.
 */
export function mileageTrend(motTests: MOTTest[]): { date: string; mileage: number }[] {
  return motTests
    .filter(t => t.odometerResultType === 'READ')
    .map(t => ({
      date: t.completedDate.split(' ')[0].replace(/\./g, '-'),
      mileage: parseInt(t.odometerValue, 10),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get the most recent recorded mileage from MOT history.
 */
export function latestMileage(motTests: MOTTest[]): number | null {
  const readings = motTests
    .filter(t => t.odometerResultType === 'READ')
    .sort((a, b) => b.completedDate.localeCompare(a.completedDate))
  if (!readings.length) return null
  return parseInt(readings[0].odometerValue, 10)
}

/**
 * Count advisories and failures across all tests.
 */
export function summariseDefects(motTests: MOTTest[]) {
  const all = motTests.flatMap(t => t.rfrAndComments)
  return {
    failures:   all.filter(d => d.type === 'FAIL').length,
    advisories: all.filter(d => d.type === 'ADVISORY').length,
    dangerous:  all.filter(d => d.dangerous).length,
    minors:     all.filter(d => d.type === 'MINOR').length,
  }
}
