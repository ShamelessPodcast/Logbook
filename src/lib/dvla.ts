/**
 * DVLA Vehicle Enquiry Service (VES) API wrapper.
 * UK Government API — requires API key from DVLA.
 * Docs: https://developer-portal.driver-vehicle-licensing.api.gov.uk/apis/vehicle-enquiry-service
 */

const DVLA_BASE_URL = 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles'

export interface DVLAVehicle {
  registrationNumber: string
  taxStatus: string
  taxDueDate?: string
  artEndDate?: string
  motStatus: string
  motExpiryDate?: string
  make: string
  monthOfFirstDvlaRegistration?: string
  monthOfFirstRegistration?: string
  yearOfManufacture: number
  engineCapacity?: number
  co2Emissions?: number
  fuelType: string
  markedForExport?: boolean
  colour: string
  typeApproval?: string
  wheelplan?: string
  revenueWeight?: number
  realDrivingEmissions?: string
  dateOfLastV5CIssued?: string
  euroStatus?: string
  automatedVehicle?: boolean
}

export interface DVLAError {
  title: string
  status: number
  detail: string
}

export async function lookupPlate(
  registration: string
): Promise<{ data: DVLAVehicle | null; error: string | null }> {
  const apiKey = process.env.DVLA_API_KEY
  if (!apiKey) {
    return { data: null, error: 'DVLA API key not configured' }
  }

  const reg = registration.toUpperCase().replace(/\s/g, '')

  try {
    const res = await fetch(DVLA_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ registrationNumber: reg }),
      // No-store: always fresh from DVLA
      cache: 'no-store',
    })

    if (res.status === 404) {
      return { data: null, error: 'Vehicle not found' }
    }

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as DVLAError
      return { data: null, error: errBody.detail ?? `DVLA error ${res.status}` }
    }

    const vehicle = (await res.json()) as DVLAVehicle
    return { data: vehicle, error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error' }
  }
}
