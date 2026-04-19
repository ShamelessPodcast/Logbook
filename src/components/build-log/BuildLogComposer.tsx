'use client'

import { useState } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Part {
  name: string
  part_number: string
  supplier: string
  cost_pence: string // string for form input
}

interface BuildLogComposerProps {
  vehicleId: string
  vehicleReg?: string
  onSuccess?: () => void
}

const CATEGORIES = [
  { value: 'mod', label: 'Modification' },
  { value: 'service', label: 'Service' },
  { value: 'repair', label: 'Repair' },
  { value: 'track', label: 'Track Prep' },
  { value: 'detail', label: 'Detail' },
  { value: 'other', label: 'Other' },
]

export function BuildLogComposer({ vehicleId, vehicleReg, onSuccess }: BuildLogComposerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('mod')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [partsCost, setPartsCost] = useState('')
  const [labourCost, setLabourCost] = useState('')
  const [hours, setHours] = useState('')
  const [mileage, setMileage] = useState('')
  const [difficulty, setDifficulty] = useState(0)
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [showParts, setShowParts] = useState(false)

  function addPart() {
    setParts([...parts, { name: '', part_number: '', supplier: '', cost_pence: '' }])
  }

  function removePart(i: number) {
    setParts(parts.filter((_, idx) => idx !== i))
  }

  function updatePart(i: number, field: keyof Part, value: string) {
    const updated = [...parts]
    updated[i] = { ...updated[i], [field]: value }
    setParts(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return setError('Title is required')
    setLoading(true)
    setError(null)

    const body = {
      vehicle_id: vehicleId,
      category,
      title: title.trim(),
      description: description.trim() || null,
      parts: parts
        .filter(p => p.name.trim())
        .map(p => ({
          name: p.name.trim(),
          part_number: p.part_number.trim() || undefined,
          supplier: p.supplier.trim() || undefined,
          cost_pence: p.cost_pence ? Math.round(parseFloat(p.cost_pence) * 100) : undefined,
        })),
      parts_cost_pence: partsCost ? Math.round(parseFloat(partsCost) * 100) : 0,
      labour_cost_pence: labourCost ? Math.round(parseFloat(labourCost) * 100) : 0,
      hours_spent: hours ? parseFloat(hours) : null,
      mileage: mileage ? parseInt(mileage) : null,
      difficulty: difficulty > 0 ? difficulty : null,
      would_recommend: wouldRecommend,
    }

    try {
      const res = await fetch('/api/build-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save')
      }
      router.refresh()
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                category === c.value
                  ? 'bg-brand-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-brand-600 hover:text-brand-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={`e.g. ${category === 'mod' ? 'Fitted Milltek exhaust' : category === 'service' ? 'Oil & filter change at 80k' : 'Fixed ARB link'}`}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="What did you do? Any tips for others?"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
        />
      </div>

      {/* Cost + Hours row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Parts cost (£)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={partsCost}
            onChange={e => setPartsCost(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Labour cost (£)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={labourCost}
            onChange={e => setLabourCost(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Hours</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="e.g. 2.5"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mileage</label>
          <input
            type="number"
            min="0"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
            placeholder="e.g. 82000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600"
          />
        </div>
      </div>

      {/* Difficulty + recommend */}
      <div className="flex flex-wrap gap-6">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Difficulty</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(difficulty === n ? 0 : n)}
                className={`text-lg transition-transform hover:scale-110 ${n <= difficulty ? 'opacity-100' : 'opacity-25'}`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Would recommend?</label>
          <div className="flex gap-2">
            {[{ v: true, label: '👍 Yes' }, { v: false, label: '👎 No' }].map(({ v, label }) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setWouldRecommend(wouldRecommend === v ? null : v)}
                className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                  wouldRecommend === v
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-brand-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parts list */}
      <div>
        <button
          type="button"
          onClick={() => { setShowParts(!showParts); if (!showParts && parts.length === 0) addPart() }}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add parts used
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showParts ? 'rotate-180' : ''}`} />
        </button>

        {showParts && (
          <div className="mt-3 space-y-2">
            {parts.map((part, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    placeholder="Part name *"
                    value={part.name}
                    onChange={e => updatePart(i, 'name', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600/30"
                  />
                  <input
                    placeholder="Part number"
                    value={part.part_number}
                    onChange={e => updatePart(i, 'part_number', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600/30"
                  />
                  <input
                    placeholder="Supplier"
                    value={part.supplier}
                    onChange={e => updatePart(i, 'supplier', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600/30"
                  />
                  <input
                    type="number"
                    placeholder="Cost (£)"
                    value={part.cost_pence}
                    onChange={e => updatePart(i, 'cost_pence', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-600/30"
                  />
                </div>
                <button type="button" onClick={() => removePart(i)} className="mt-1 p-1 hover:text-red-500 text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPart}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-3 w-3" /> Add another part
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {vehicleReg && (
          <span className="text-xs bg-[#F5C800] border border-gray-700 rounded px-1.5 py-0.5 font-black font-mono tracking-widest text-sm">
            {vehicleReg}
          </span>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="ml-auto rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Log it'}
        </button>
      </div>
    </form>
  )
}
