import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/messaging/ConversationView'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ conversationId: string }>
}

export const metadata: Metadata = { title: 'Conversation' }

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .contains('participant_ids', [user!.id])
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles(id, moniker, display_name, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  const otherId = conversation.participant_ids.find((id: string) => id !== user!.id)
  const { data: otherProfile } = otherId
    ? await supabase.from('profiles').select('*').eq('id', otherId).single()
    : { data: null }

  // Mark all as read
  await supabase
    .from('messages')
    .update({ read_by: [user!.id] })
    .eq('conversation_id', conversationId)
    .not('read_by', 'cs', `{${user!.id}}`)

  return (
    <ConversationView
      conversationId={conversationId}
      currentUserId={user!.id}
      initialMessages={messages ?? []}
      otherProfile={otherProfile}
    />
  )
}
