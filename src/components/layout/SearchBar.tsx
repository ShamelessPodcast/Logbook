'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search Logbook…"
        className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-4 text-sm focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-colors"
        autoComplete="off"
      />
    </form>
  )
}
