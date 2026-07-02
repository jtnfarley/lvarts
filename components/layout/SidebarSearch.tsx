'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BiSearch } from "react-icons/bi"

export default function SidebarSearch() {
	const [query, setQuery] = useState('')
	const router = useRouter()

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		const trimmed = query.trim()
		if (trimmed) router.push(`/search/${encodeURIComponent(trimmed)}`)
	}

	return (
		<form onSubmit={handleSubmit} className="relative">
			<BiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lvartsmusic-muted" />
			<input
				type="text"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				placeholder="Search the Valley"
				className="w-full rounded-full border border-transparent bg-lvartsmusic-card py-2.5 pl-11 pr-4 text-sm text-lvartsmusic-foreground placeholder:text-lvartsmusic-muted focus:border-lvartsmusic-accent/50 focus:outline-none"
			/>
		</form>
	)
}
