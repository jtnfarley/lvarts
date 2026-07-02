'use client'

import { useEffect, useState } from "react"
import { BiSun, BiMoon } from "react-icons/bi"

const STORAGE_KEY = 'lvartsmusic-theme'

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false)

	const getShell = () => document.querySelector('[data-theme="lvartsmusic"]')

	useEffect(() => {
		setIsDark(getShell()?.classList.contains('dark') ?? false)
	}, [])

	const toggleTheme = () => {
		const next = !isDark
		getShell()?.classList.toggle('dark', next)
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
