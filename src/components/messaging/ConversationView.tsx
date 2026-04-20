'use client'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/useRealtime'
import { timeAgo } from '@/utils/format'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  profiles: { moniker: string; display_name: string | null; avatar_url: string | null } | null
}

interface Profile {
  id: string
  moniker: string
  display_name: string | null
  avatar_url: string | null
}

interface ConversationViewProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
  otherProfile: Profile | null
}

export function ConversationView({
  conversationId,
  currentUserId,
  initialMessages,
  otherProfile,
}: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleNewMessage = useCallback(
    (payload: { new: Message }) => {
      setMessages((prev) => [...prev, payload.new])
    },
    []
  )

  useRealtime({
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
    event: 'INSERT',
    onEvent: handleNewMessage,
  })

  async function sendMessage() {
    if (!content.trim()) return
    setSending(true)
    const text = content.trim()
    setContent('')

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: text,
      read_by: [currentUserId],
    })

    setSending(false)
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        {otherProfile && (
          <>
            <Avatar
              src={otherProfile.avatar_url}
              alt={otherProfile.display_name ?? otherProfile.moniker}
              size="sm"
            />
            <Link href={`/${otherProfile.moniker}`} className="font-semibold hover:underline">
              {otherProfile.display_name ?? otherProfile.moniker}
            </Link>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId
            return (
              <div
                key={msg.id}
                className={cn('flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
              >
                {!isOwn && (
                  <Avatar
                    src={msg.profiles?.avatar_url}
                    alt={msg.profiles?.display_name ?? msg.profiles?.moniker ?? '?'}
                    size="xs"
                    className="mt-1 shrink-0"
                  />
                )}
                <div
                  className={cn(
                    'max-w-xs rounded-2xl px-4 py-2 text-sm',
                    isOwn ? 'rounded-tr-sm bg-black text-white' : 'rounded-tl-sm bg-neutral-100 text-black'
                  )}
                >
                  <p>{msg.content}</p>
                  <p className={cn('mt-1 text-[10px]', isOwn ? 'text-neutral-400' : 'text-neutral-400')}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-neutral-100 bg-white px-4 py-3">
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void sendMessage()
              }
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:border-black focus:outline-none"
            maxLength={2000}
          />
          <Button
            onClick={sendMessage}
            loading={sending}
            disabled={!content.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
