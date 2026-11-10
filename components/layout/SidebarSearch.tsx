'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BiSearch } from "react-icons/bi"
import Avatar from "@/components/shared/Avatar"
import { profileAvatarUrl } from "@/components/ProfileResults"
import { suggestProfiles } from "@/app/actions/search"
import type { ProfileResult } from "@/lib/searchProfiles"

const SUGGEST_DELAY_MS = 250

export default function SidebarSearch() {
	const [query, setQuery] = useState('')
	const [suggestions, setSuggestions] = useState<ProfileResult[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const router = useRouter()

	useEffect(() => {
		const term = query.trim()
		if (!term) {
			setSuggestions([])
			return
		}

		// Ignore the answer if the user kept typing or the component went away.
		let isCurrent = true
		const timer = setTimeout(async () => {
			try {
				const results = await suggestProfiles(term)
				if (isCurrent) setSuggestions(results)
			} catch (error) {
				console.error('Failed to load profile suggestions', error)
			}
		}, SUGGEST_DELAY_MS)

		return () => {
			isCurrent = false
			clearTimeout(timer)
		}
	}, [query])

	useEffect(() => {
		const closeOnOutsideClick = (event: MouseEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
		}
		document.addEventListener('mousedown', closeOnOutsideClick)
		return () => document.removeEventListener('mousedown', closeOnOutsideClick)
	}, [])

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		const trimmed = query.trim()
		if (!trimmed) return
		setIsOpen(false)
		router.push(`/search/${encodeURIComponent(trimmed)}`)
	}

	const showSuggestions = isOpen && query.trim() !== '' && suggestions.length > 0

	return (
		<div ref={containerRef} className="relative">
			<form onSubmit={handleSubmit} className="relative">
				<BiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lvartsmusic-muted" />
				<input
					type="text"
					value={query}
					onChange={(event) => {
						setQuery(event.target.value)
						setIsOpen(true)
					}}
					onFocus={() => setIsOpen(true)}
					onKeyDown={(event) => {
						if (event.key === 'Escape') setIsOpen(false)
					}}
					placeholder="Search the Valley"
					className="w-full rounded-full border border-transparent bg-lvartsmusic-card py-2.5 pl-11! pr-4 text-sm text-lvartsmusic-foreground placeholder:text-lvartsmusic-muted focus:border-lvartsmusic-accent/50 focus:outline-none"
				/>
			</form>

			{showSuggestions && (
				<ul className="lvartsmusic-card absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden py-1 shadow-lg">
					{suggestions.map((profile) => (
						<li key={profile.id}>
							<Link
								href={`/user/${profile.handle}`}
								onClick={() => setIsOpen(false)}
								className="flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
							>
								<Avatar imageUrl={profileAvatarUrl(profile)} displayName={profile.displayname} handle={profile.handle} size="sm" />
								<div className="min-w-0">
									<div className="truncate text-sm font-bold text-lvartsmusic-foreground">{profile.displayname || `@${profile.handle}`}</div>
									{profile.displayname && <div className="truncate text-xs text-lvartsmusic-muted">@{profile.handle}</div>}
								</div>
							</Link>
						</li>
					))}
					<li>
						<Link
							href={`/search/${encodeURIComponent(query.trim())}?tab=profiles`}
							onClick={() => setIsOpen(false)}
							className="block px-4 py-2 text-sm font-semibold text-lvartsmusic-accent hover:bg-black/5 dark:hover:bg-white/10"
						>
							See all profiles
						</Link>
					</li>
				</ul>
			)}
		</div>
	)
}
