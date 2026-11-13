'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BiChevronDown, BiChevronUp, BiLinkAlt, BiSolidVolumeFull } from "react-icons/bi";
import { cn } from "@/lib/utils";
import { LiveDot, PlayStateIcon } from "./RadioControls";
import { useRadio } from "./RadioProvider";

const EXPANDED_KEY = 'lvartsmusic-radio-expanded';

const readSavedExpanded = (): boolean | null => {
	try {
		const saved = window.localStorage.getItem(EXPANDED_KEY);
		return saved === null ? null : saved === 'true';
	} catch {
		// Storage can be blocked (private mode); fall back to the screen-size default.
		return null;
	}
};

const saveExpanded = (expanded: boolean) => {
	try {
		window.localStorage.setItem(EXPANDED_KEY, String(expanded));
	} catch {
		// Not being able to remember the choice is harmless.
	}
};

export default function RadioPlayer(props: { hasBottomNav: boolean }) {
	const { track, status, volume, toggle, stop, setVolume } = useRadio();
	const pathname = usePathname();
	const [expanded, setExpanded] = useState(false);
	const containerRef = useRef<HTMLElement | null>(null);

	const isAdminPage = pathname.startsWith('/admin');
	const isHidden = !track || isAdminPage;

	useEffect(() => {
		// Logged-in desktop pages have a left sidebar the expanded card would cover, so they default to the compact pill.
		const defaultExpanded = !props.hasBottomNav && window.matchMedia('(min-width: 768px)').matches;
		setExpanded(readSavedExpanded() ?? defaultExpanded);
	}, [props.hasBottomNav]);

	// Admin pages have no controls, so don't leave audio playing behind them.
	useEffect(() => {
		if (isAdminPage) stop();
	}, [isAdminPage, stop]);

	// Lets other fixed elements (the support chat) sit above the player on mobile.
	useEffect(() => {
		const element = containerRef.current;
		if (!element) return;

		const root = document.documentElement;
		const observer = new ResizeObserver(() => root.style.setProperty('--radio-h', `${element.offsetHeight}px`));
		observer.observe(element);

		return () => {
			observer.disconnect();
			root.style.removeProperty('--radio-h');
		};
	}, [isHidden]);

	const changeExpanded = (next: boolean) => {
		setExpanded(next);
		saveExpanded(next);
	};

	if (isHidden) return null;

	const playLabel = status === 'idle' ? 'Play radio' : 'Pause radio';

	return (
		<section
			ref={containerRef}
			aria-label="Radio player"
			className={cn(
				'fixed inset-x-0 z-50 text-white md:inset-x-auto md:bottom-4 md:left-4 md:w-[320px]',
				props.hasBottomNav ? 'bottom-[55px]' : 'bottom-0',
			)}
		>
			<div className="bg-gray-900/90 backdrop-blur md:rounded-2xl md:border md:border-white/10 md:shadow-2xl">
				{expanded ? (
					<div className="relative p-3 md:p-4">
						<button
							type="button"
							onClick={() => changeExpanded(false)}
							aria-label="Collapse player"
							className="absolute right-2 top-2 text-2xl"
						>
							<BiChevronDown/>
						</button>

						<div className="flex gap-3">
							<Image
								src={track.coverUrl}
								width={88}
								height={88}
								alt={`${track.trackname} by ${track.artist}`}
								className="h-[88px] w-[88px] shrink-0 rounded-lg object-cover"
							/>
							<div className="min-w-0 flex-1 pr-6 text-sm">
								<div className="flex items-center gap-1.5 text-xs uppercase tracking-wide opacity-80">
									<LiveDot active={status === 'playing'}/>
									<em>Now playing</em>
								</div>
								{track.postId !== null ? (
									<Link href={`/post/${track.postId}`} className="flex items-center gap-1.5 font-bold">
										<span className="truncate">{track.trackname}</span>
										<BiLinkAlt className="shrink-0"/>
									</Link>
								) : (
									<div className="truncate font-bold">{track.trackname}</div>
								)}
								<div className="truncate">{track.artist}</div>
								{track.album && <div className="truncate text-xs opacity-80">{track.album}</div>}
								{track.releaseyear && <div className="text-xs opacity-80">{track.releaseyear}</div>}
							</div>
						</div>

						<div className="mt-2 flex items-center gap-3">
							<button type="button" onClick={toggle} aria-label={playLabel} className="text-5xl">
								<PlayStateIcon status={status}/>
							</button>
							<label className="flex flex-1 items-center gap-2 text-sm">
								<BiSolidVolumeFull/>
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									value={volume}
									onChange={(event) => setVolume(Number(event.target.value))}
									aria-label="Volume"
									className="w-full"
								/>
							</label>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3 px-3 py-2">
						<Image
							src={track.coverUrl}
							width={40}
							height={40}
							alt={`${track.trackname} by ${track.artist}`}
							className="h-10 w-10 shrink-0 rounded-md object-cover"
						/>
						<div className="min-w-0 flex-1 text-sm leading-tight">
							<div className="truncate font-semibold">{track.trackname}</div>
							<div className="truncate text-xs opacity-80">{track.artist}</div>
						</div>
						<button type="button" onClick={toggle} aria-label={playLabel} className="text-4xl">
							<PlayStateIcon status={status}/>
						</button>
						<button type="button" onClick={() => changeExpanded(true)} aria-label="Expand player" className="text-2xl">
							<BiChevronUp/>
						</button>
					</div>
				)}
			</div>
		</section>
	);
}
