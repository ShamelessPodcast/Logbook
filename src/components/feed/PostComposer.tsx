'use client'

import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { UKPlate } from '@/components/ui/UKPlate'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Vehicle } from '@/types/database'
import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const REV_PROMPTS = [
  'Show us some bad driving? 😬',
  'What was your first car and how did it make you feel?',
  'Show us your motor? 🚗',
  "What's happening, car lover?",
]

interface PostComposerProps {
  profile: Profile
  vehicles?: Vehicle[]
  onPost?: () => void
  replyToId?: string
  placeholder?: string
}

export function PostComposer({
  profile,
  vehicles = [],
  onPost,
  replyToId,
  placeholder = "What's happening with your motors?",
}: PostComposerProps) {
  const [content, setContent] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * REV_PROMPTS.length))
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Rotate placeholder every 4 seconds when composer is empty
  useEffect(() => {
    if (content.length > 0) return
    const t = setInterval(() => {
      setPromptIndex(i => (i + 1) % REV_PROMPTS.length)
    }, 4000)
    return () => clearInterval(t)
  }, [content])

  function addFiles(files: File[]) {
    const allowed = files.filter(f => f.type.startsWith('image/')).slice(0, 4 - images.length)
    if (!allowed.length) return
    const previews = allowed.map(f => URL.createObjectURL(f))
    setImages(prev => [...prev, ...allowed])
    setImagePreviews(prev => [...prev, ...previews])
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items)
    const imageItems = items.filter(item => item.type.startsWith('image/'))
    if (!imageItems.length) return
    e.preventDefault()
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[]
    addFiles(files)
  }

  const charCount = content.length
  const MAX = 500
  const remaining = MAX - charCount
  const canPost = content.trim().length > 0 && charCount <= MAX

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []))
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit() {
    if (!canPost) return
    setLoading(true)

    try {
      const imageUrls: string[] = []

      // Upload images
      for (const file of images) {
        const ext = file.name.split('.').pop()
        const path = `${profile.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('post-images').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }

      const { error } = await supabase.from('posts').insert({
        author_id: profile.id,
        content: content.trim(),
        vehicle_id: selectedVehicleId,
        reply_to_id: replyToId ?? null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      })

      if (error) throw error

      setContent('')
      setSelectedVehicleId(null)
      setImages([])
      setImagePreviews([])
      onPost?.()
    } catch (err) {
      toast.error('Could not post. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border-b border-neutral-100 px-4 py-3">
      <div className="flex gap-3">
        <Avatar
          src={profile.avatar_url}
          alt={profile.display_name ?? profile.moniker}
          size="md"
          className="shrink-0"
        />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder ?? REV_PROMPTS[promptIndex]}
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] placeholder:text-neutral-400 focus:outline-none transition-all"
            maxLength={MAX + 50}
          />

          {/* Image previews */}
          {imagePreviews.length > 0 && (
            <div className="mb-2 flex gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vehicle selector */}
          {vehicles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() =>
                    setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)
                  }
                  className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
                    selectedVehicleId === v.id
                      ? 'border-black bg-black text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  {selectedVehicleId === v.id ? (
                    <UKPlate registration={v.registration} size="sm" />
                  ) : (
                    v.registration
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={images.length >= 4}
                className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black disabled:opacity-40"
                title="Add image (or paste from clipboard)"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-sm ${remaining <= 20 ? (remaining < 0 ? 'text-red-500' : 'text-amber-500') : 'text-neutral-400'}`}
              >
                {remaining}
              </span>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!canPost}
                size="sm"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
