'use client'

import { BiLoaderAlt, BiPause, BiPlay, BiRadio } from "react-icons/bi";
import { useRadio } from "./RadioProvider";

export function PlayStateIcon(props: { status: 'idle' | 'loading' | 'playing' }) {
	if (props.status === 'loading') return <BiLoaderAlt className="animate-spin"/>;
	return props.status === 'playing' ? <BiPause/> : <BiPlay/>;
}

export function LiveDot(props: { active: boolean }) {
	return (
		<span className="relative flex h-2 w-2">
			{props.active && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>}
			<span className={`relative inline-flex h-2 w-2 rounded-full ${props.active ? 'bg-red-500' : 'bg-gray-400'}`}></span>
		</span>
	);
}

// Compact entry point for the top bar, so the radio is reachable from every page shell.
export function ListenLiveButton() {
	const { status, toggle } = useRadio();
	const label = status === 'idle' ? 'Listen live' : 'Stop radio';

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={label}
			className="flex items-center gap-2 rounded-full border border-lvartsmusic-border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
		>
			<LiveDot active={status === 'playing'}/>
			<BiRadio className="text-lg"/>
			<span className="hidden sm:inline">{status === 'playing' ? 'Live' : 'Listen live'}</span>
		</button>
	);
}

// Large call to action for the landing page.
export function ListenLiveHero() {
	const { track, status, toggle } = useRadio();

	return (
		<button
			type="button"
			onClick={toggle}
			className="flex w-full items-center gap-4 rounded-2xl bg-lvartsmusic-accent px-5 py-4 text-left text-lvartsmusic-accent-foreground shadow-lg transition-transform hover:scale-[1.01]"
		>
			<span className="text-5xl leading-none"><PlayStateIcon status={status}/></span>
			<span className="min-w-0">
				<span className="block text-lg font-bold uppercase tracking-wide">
					{status === 'playing' ? 'LVAM Radio - Live Now' : 'LVAM Radio - Listen Live'}
				</span>
				<span className="block truncate text-sm opacity-90">
					{track ? `${track.trackname}${track.artist ? ` · ${track.artist}` : ''}` : 'Local art & music radio'}
				</span>
			</span>
		</button>
	);
}
