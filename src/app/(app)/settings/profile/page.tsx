import { createClient } from '@/lib/supabase/server'
import { ProfileSettingsForm } from '@/components/auth/ProfileSettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit Profile' }

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (!profile) return null

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">Edit Profile</h1>
      </div>
      <div className="p-4">
        <ProfileSettingsForm profile={profile} />
      </div>
    </div>
  )
}
