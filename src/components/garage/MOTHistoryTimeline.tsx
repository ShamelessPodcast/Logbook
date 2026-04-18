import type { MOTTest } from '@/lib/mot'
import { cn } from '@/utils/cn'
import { CheckCircle2, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface MOTHistoryTimelineProps {
  tests: MOTTest[]
  className?: string
}

function formatTestDate(raw: string) {
  // "2023.06.14 09:23:00" → "14 Jun 2023"
  const [datePart] = raw.split(' ')
  const [y, m, d] = datePart.split('.')
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatMileage(value: string, unit: string) {
  const n = parseInt(value, 10)
  if (isNaN(n)) return null
  return `${n.toLocaleString('en-GB')} ${unit}`
}

const defectColour: Record<string, string> = {
  FAIL:     'text-red-600 bg-red-50 border-red-100',
  ADVISORY: 'text-amber-700 bg-amber-50 border-amber-100',
  MINOR:    'text-yellow-700 bg-yellow-50 border-yellow-100',
  PRS:      'text-blue-700 bg-blue-50 border-blue-100',
}

const defectLabel: Record<string, string> = {
  FAIL:     'Failure',
  ADVISORY: 'Advisory',
  MINOR:    'Minor',
  PRS:      'Pass at retest',
}

export function MOTHistoryTimeline({ tests, className }: MOTHistoryTimelineProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0) // most recent open by default
  const sorted = [...tests].sort((a, b) => b.completedDate.localeCompare(a.completedDate))

  if (!sorted.length) {
    return (
      <div className={cn('rounded-xl border border-[--border] p-4 text-sm text-[--ink-subtle]', className)}>
        No MOT history on record.
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {sorted.map((test, idx) => {
        const passed   = test.testResult === 'PASSED'
        const expanded = expandedIdx === idx
        const mileage  = test.odometerResultType === 'READ'
          ? formatMileage(test.odometerValue, test.odometerUnit)
          : null
        const failures  = test.rfrAndComments.filter(d => d.type === 'FAIL')
        const advisories = test.rfrAndComments.filter(d => d.type === 'ADVISORY')
        const minors    = test.rfrAndComments.filter(d => d.type === 'MINOR')

        return (
          <div
            key={test.motTestNumber}
            className={cn(
              'rounded-xl border transition-colors',
              passed ? 'border-[--border]' : 'border-red-100 bg-red-50/30'
            )}
          >
            {/* Header row */}
            <button
              onClick={() => setExpandedIdx(expanded ? null : idx)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              {passed
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                : <XCircle     className="h-5 w-5 shrink-0 text-red-500" />
              }

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className={cn('text-sm font-semibold', passed ? 'text-emerald-700' : 'text-red-600')}>
                    {passed ? 'Pass' : 'Fail'}
                  </span>
                  <span className="text-sm text-[--ink]">{formatTestDate(test.completedDate)}</span>
                  {mileage && (
                    <span className="text-xs text-[--ink-subtle]">{mileage}</span>
                  )}
                </div>

                {/* Summary pills */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {failures.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0 text-[11px] font-medium text-red-700">
                      {failures.length} failure{failures.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {advisories.length > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0 text-[11px] font-medium text-amber-700">
                      {advisories.length} advisory{advisories.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {minors.length > 0 && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0 text-[11px] font-medium text-yellow-700">
                      {minors.length} minor{minors.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {test.rfrAndComments.length === 0 && passed && (
                    <span className="text-[11px] text-[--ink-subtle]">No issues recorded</span>
                  )}
                </div>
              </div>

              {test.rfrAndComments.length > 0 && (
                expanded
                  ? <ChevronUp   className="h-4 w-4 shrink-0 text-[--ink-muted]" />
                  : <ChevronDown className="h-4 w-4 shrink-0 text-[--ink-muted]" />
              )}
            </button>

            {/* Defect list */}
            {expanded && test.rfrAndComments.length > 0 && (
              <div className="border-t border-[--border] px-3 pb-3 pt-2">
                <div className="flex flex-col gap-1.5">
                  {test.rfrAndComments.map((defect, di) => (
                    <div
                      key={di}
                      className={cn(
                        'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm',
                        defectColour[defect.type] ?? 'bg-[--surface-raised] border-[--border] text-[--ink]'
                      )}
                    >
                      {defect.type === 'FAIL' && <XCircle       className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                      {defect.type === 'ADVISORY' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                      {defect.type === 'MINOR' && <Info          className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />}
                      {defect.type === 'PRS' && <CheckCircle2   className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">[{defectLabel[defect.type] ?? defect.type}]</span>{' '}
                        {defect.text}
                        {defect.dangerous && (
                          <span className="ml-1.5 rounded bg-red-600 px-1.5 py-px text-[10px] font-bold uppercase text-white">
                            Dangerous
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
