'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface RealtimeOptions {
  table: string
  schema?: string
  filter?: string
  event?: RealtimeEvent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEvent: (payload: any) => void
}

export function useRealtime({ table, schema = 'public', filter, event = '*', onEvent }: RealtimeOptions) {
  const supabase = createClient()

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(`${table}-${filter ?? 'all'}`) as any)
      .on(
        'postgres_changes',
        { event, schema, table, ...(filter ? { filter } : {}) },
        onEvent
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [table, schema, filter, event, onEvent, supabase])
}
