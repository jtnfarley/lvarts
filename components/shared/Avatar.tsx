'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
	imageUrl?: string | null
	displayName?: string | null
	handle?: string | null
	size?: AvatarSize
	className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
	sm: 'h-9 w-9 text-xs',
	md: 'h-11 w-11 text-sm',
	lg: 'h-16 w-16 text-lg',
}

// 2-3 stop linear gradients only
const GRADIENT_PALETTE = [
	'from-amber-400 to-fuchsia-600',
	'from-emerald-400 to-teal-600',
	'from-orange-400 to-rose-600',
	'from-sky-400 to-blue-600',
	'from-violet-500 to-indigo-600',
	'from-rose-400 to-orange-500',
	'from-fuchsia-500 to-purple-700',
	'from-cyan-400 to-sky-600',
	'from-emerald-400 via-teal-500 to-cyan-600',
	'from-amber-400 via-orange-500 to-rose-600',
]

const initials = (displayName?: string | null, handle?: string | null) => {
	if (displayName) {
		const parts = displayName.split(' ').map(part => part[0]).filter(Boolean)
		if (parts.length) return parts.slice(0, 2).join('').toUpperCase()
	}

	if (handle) return handle[0].toUpperCase()

	return '?'
}

export default function Avatar({ imageUrl, displayName, handle, size = 'md', className }: AvatarProps) {
	// Starts on a fixed gradient so server and client agree on first paint (avoids a
	// hydration mismatch), then swaps to a random one client-side once mounted.
	const [gradient, setGradient] = useState(GRADIENT_PALETTE[0])

	useEffect(() => {
		setGradient(GRADIENT_PALETTE[Math.floor(Math.random() * GRADIENT_PALETTE.length)])
	}, [])

	if (imageUrl) {
		return (
			<img
				src={imageUrl}
				alt={displayName || handle || 'avatar'}
				className={cn('shrink-0 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/10', sizeClasses[size], className)}
			/>
		)
	}

	return (
		<div
			title={displayName || handle || undefined}
			className={cn(
				'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ring-1 ring-black/10 dark:ring-white/10',
				gradient,
				sizeClasses[size],
				className
			)}
		>
			{initials(displayName, handle)}
		</div>
	)
}
