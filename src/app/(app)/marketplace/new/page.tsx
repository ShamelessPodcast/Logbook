'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ImagePlus, X } from 'lucide-react'

const CATEGORIES = [
  'Complete vehicle',
  'Engine & drivetrain',
  'Bodywork & exterior',
  'Interior',
  'Wheels & tyres',
  'Performance',
  'Electrical',
  'Tools & equipment',
  'Other',
]

export default function NewListingPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  function addImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 8 - images.length)
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  async function handleSubmit() {
    if (!title || !description || !price || !category) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const imageUrls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(path, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
    }

    const priceInPence = Math.round(parseFloat(price) * 100)

    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        seller_id: user.id,
        title,
        description,
        price: priceInPence,
        category,
        location: location || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Could not create listing')
      setLoading(false)
      return
    }

    toast.success('Listing created!')
    router.push(`/marketplace/${listing.id}`)
  }

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-bold">New Listing</h1>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Images */}
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Photos</p>
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    setImages((p) => p.filter((_, j) => j !== i))
                    setPreviews((p) => p.filter((_, j) => j !== i))
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-neutral-400"
              >
                <ImagePlus className="h-6 w-6" />
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={addImages}
          />
        </div>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. OEM rear bumper MX-5 NC"
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Input
          label="Price (£)"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the item — condition, fitment, reason for selling…"
          rows={5}
        />

        <Input
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Manchester"
        />

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!title || !description || !price || !category}
          className="w-full"
        >
          List for sale
        </Button>
      </div>
    </div>
  )
}
