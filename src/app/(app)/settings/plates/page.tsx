import { createClient } from '@/lib/supabase/server'
import { UKPlate } from '@/components/ui/UKPlate'
import { Badge } from '@/components/ui/Badge'
import { fullDate } from '@/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Plates' }

export default async function PlatesSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: locks } = await supabase
    .from('plate_locks')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">My Plates</h1>
      </div>

      <div className="p-4">
        <p className="mb-6 text-sm text-neutral-500">
          Plate locking verifies you as the owner of a registration on Logbook. Locked plates
          display a verified badge. £9.99/year per plate.
        </p>

        {locks && locks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {locks.map((lock) => (
              <div key={lock.id} className="flex items-center justify-between rounded-xl border border-neutral-100 p-4">
                <div>
                  <UKPlate registration={lock.registration} />
                  {lock.expires_at && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Expires {fullDate(lock.expires_at)}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    lock.status === 'active' ? 'success' :
                    lock.status === 'pending' ? 'warning' :
                    'danger'
                  }
                >
                  {lock.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500">No plates locked yet</p>
        )}
      </div>
    </div>
  )
}
