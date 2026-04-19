'use client'

import Link from 'next/link'
import { Wrench, Clock, PoundSterling, Star, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Part {
  name: string
  part_number?: string
  supplier?: string
  cost_pence?: number
}

interface BuildLogCardProps {
  id: string
  authorMoniker: string
  authorDisplayName?: string
  authorAvatarUrl?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleReg?: string
  vehicleId?: string

  category: 'mod' | 'service' | 'repair' | 'track' | 'detail' | 'other'
  title: string
  description?: string
  parts?: Part[]
  partsCostPence?: number
  labourCostPence?: number
  hoursSpent?: number
  mileage?: number
  beforeImageUrls?: string[]
  afterImageUrls?: string[]
  difficulty?: number
  wouldRecommend?: boolean
  createdAt: string
}

const CATEGORY_LABELS: Record<BuildLogCardProps['category'], { label: string; colour: string }> = {
  mod: { label: 'Modification', colour: 'bg-purple-100 text-purple-700' },
  service: { label: 'Service', colour: 'bg-blue-100 text-blue-700' },
  repair: { label: 'Repair', colour: 'bg-red-100 text-red-700' },
  track: { label: 'Track Prep', colour: 'bg-orange-100 text-orange-700' },
  detail: { label: 'Detail', colour: 'bg-green-100 text-green-700' },
  other: { label: 'Other', colour: 'bg-gray-100 text-gray-700' },
}

export function BuildLogCard({
  authorMoniker,
  authorDisplayName,
  vehicleMake,
  vehicleModel,
  vehicleReg,
  vehicleId,
  category,
  title,
  description,
  parts = [],
  partsCostPence = 0,
  labourCostPence = 0,
  hoursSpent,
  mileage,
  difficulty,
  wouldRecommend,
  createdAt,
}: BuildLogCardProps) {
  const [expanded, setExpanded] = useState(false)
  const totalCost = partsCostPence + labourCostPence
  const cat = CATEGORY_LABELS[category]

  function formatCost(pence: number) {
    return `£${(pence / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <article className="feed-item border-b border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/@${authorMoniker}`} className="shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {(authorDisplayName ?? authorMoniker)[0].toUpperCase()}
            </span>
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href={`/@${authorMoniker}`} className="font-semibold text-gray-900 hover:underline text-sm">
              {authorDisplayName ?? `@${authorMoniker}`}
            </Link>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-400 text-xs">
              {new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          {vehicleReg && (
            <Link href={vehicleId ? `/garage/${vehicleId}` : '#'} className="inline-flex items-center gap-1 mt-0.5">
              <span className="text-xs bg-[#F5C800] border border-gray-800 rounded px-1.5 py-0.5 font-black font-mono tracking-widest">
                {vehicleReg}
              </span>
              {(vehicleMake || vehicleModel) && (
                <span className="text-xs text-gray-400">{vehicleMake} {vehicleModel}</span>
              )}
            </Link>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cat.colour}`}>
          {cat.label}
        </span>
      </div>

      {/* Title + description */}
      <div className="mb-3">
        <h3 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-brand-600 shrink-0" />
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500">
        {totalCost > 0 && (
          <div className="flex items-center gap-1">
            <PoundSterling className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900">{formatCost(totalCost)}</span>
            {partsCostPence > 0 && labourCostPence > 0 && (
              <span className="text-xs">({formatCost(partsCostPence)} parts + {formatCost(labourCostPence)} labour)</span>
            )}
          </div>
        )}
        {hoursSpent != null && (
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>{hoursSpent}h</span>
          </div>
        )}
        {mileage != null && (
          <div className="flex items-center gap-1">
            <span className="text-xs">📍</span>
            <span>{mileage.toLocaleString('en-GB')} mi</span>
          </div>
        )}
        {difficulty != null && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">Difficulty:</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < difficulty ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
            </div>
          </div>
        )}
        {wouldRecommend != null && (
          <div className="flex items-center gap-1">
            <ThumbsUp className={`h-3.5 w-3.5 ${wouldRecommend ? 'text-green-500' : 'text-red-400'}`} />
            <span className="text-xs">{wouldRecommend ? 'Would recommend' : 'Would not recommend'}</span>
          </div>
        )}
      </div>

      {/* Parts list — expandable */}
      {parts.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {parts.length} part{parts.length !== 1 ? 's' : ''} used
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5">
              {parts.map((part, i) => (
                <div key={i} className="flex items-start justify-between text-xs">
                  <div>
                    <span className="font-medium text-gray-800">{part.name}</span>
                    {part.part_number && <span className="text-gray-400 ml-1.5">#{part.part_number}</span>}
                    {part.supplier && <span className="text-gray-400 ml-1.5">via {part.supplier}</span>}
                  </div>
                  {part.cost_pence != null && (
                    <span className="text-gray-600 font-medium shrink-0 ml-2">{formatCost(part.cost_pence)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
