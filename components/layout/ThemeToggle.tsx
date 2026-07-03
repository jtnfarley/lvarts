'use client'

import { useEffect, useState } from "react"
import { BiSun, BiMoon } from "react-icons/bi"

const STORAGE_KEY = 'lvartsmusic-theme'

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		setIsDark(document.documentElement.classList.contains('dark'))
	}, [])

	const toggleTheme = () => {
		const next = !isDark
		document.documentElement.classList.toggle('dark', next)
		localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
		setIsDark(next)
	}

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			className="rounded-full p-2.5 text-lvartsmusic-muted transition-colors hover:bg-black/5 dark:hover:bg-white/10"
		>
			{isDark ? <BiSun className="h-5 w-5" /> : <BiMoon className="h-5 w-5" />}
		</button>
	)
}
