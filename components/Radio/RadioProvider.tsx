'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { RADIO_FALLBACK_COVER } from "@/constants/radio";

const STREAM_URL = "https://a6.asurahosting.com:6870/radio.mp3";
const NOW_PLAYING_URL = "https://a6.asurahosting.com/api/nowplaying/lehigh_valley_art__music";
const RETRY_MS = 15000;

export type RadioTrack = {
	postId: number | null;
	trackname: string;
	artist: string;
	album: string | null;
	releaseyear: number | null;
	coverUrl: string;
};

type RadioStatus = 'idle' | 'loading' | 'playing';

type RadioContextValue = {
	track: RadioTrack | null;
	status: RadioStatus;
	volume: number;
	toggle: () => void;
	stop: () => void;
	setVolume: (volume: number) => void;
};

const nowPlayingSchema = z.object({
	now_playing: z.object({
		played_at: z.number().optional(),
		duration: z.number().optional(),
		remaining: z.number().optional(),
		song: z.object({
			title: z.string(),
			artist: z.string().nullish(),
			album: z.string().nullish(),
		}),
	}),
});

type CurrentSong = z.infer<typeof nowPlayingSchema>['now_playing'];

const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadio(): RadioContextValue {
	const context = useContext(RadioContext);
	if (!context) throw new Error('useRadio must be used inside RadioProvider');
	return context;
}

const fetchNowPlaying = async (): Promise<CurrentSong> => {
	const response = await fetch(NOW_PLAYING_URL);
	if (!response.ok) throw new Error(`Now playing request failed with ${response.status}`);
	return nowPlayingSchema.parse(await response.json()).now_playing;
};

// Check again shortly after the current song ends; 2s of slack lets AzuraCast switch tracks first.
const msUntilNextCheck = (current: CurrentSong): number => {
	const endsInMs = current.played_at !== undefined && current.duration !== undefined
		? (current.played_at + current.duration) * 1000 - Date.now()
		: (current.remaining ?? 0) * 1000;

	return endsInMs > 0 ? endsInMs + 2000 : 5000;
};

export function RadioProvider(props: Readonly<{
	getAudioTrack: (trackname: string) => Promise<RadioTrack | null>;
	children: React.ReactNode;
}>) {
	const { getAudioTrack, children } = props;
	const [track, setTrack] = useState<RadioTrack | null>(null);
	const [status, setStatus] = useState<RadioStatus>('idle');
	const [volume, setVolume] = useState(0.75);

	// The gain node (not audio.volume) controls loudness because iOS ignores audio.volume.
	const engineRef = useRef<{ audio: HTMLAudioElement; context: AudioContext; gain: GainNode } | null>(null);
	const volumeRef = useRef(volume);

	useEffect(() => {
		volumeRef.current = volume;
		if (engineRef.current) engineRef.current.gain.gain.value = volume;
	}, [volume]);

	useEffect(() => {
		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		const refresh = async () => {
			let delayMs = RETRY_MS;

			try {
				const current = await fetchNowPlaying();
				const knownTrack = await getAudioTrack(current.song.title);
				if (cancelled) return;

				setTrack(knownTrack ?? {
					postId: null,
					trackname: current.song.title,
					artist: current.song.artist ?? '',
					album: current.song.album ?? null,
					releaseyear: null,
					coverUrl: RADIO_FALLBACK_COVER,
				});
				delayMs = msUntilNextCheck(current);
			} catch (error) {
				console.error('Radio now-playing refresh failed', error);
			}

			if (!cancelled) timeoutId = setTimeout(refresh, delayMs);
		};

		void refresh();

		return () => {
			cancelled = true;
			clearTimeout(timeoutId);
		};
	}, [getAudioTrack]);

	const ensureEngine = useCallback(() => {
		if (engineRef.current) return engineRef.current;

		const audio = new Audio();
		audio.crossOrigin = "anonymous";
		audio.preload = "none";

		const context = new AudioContext();
		const gain = context.createGain();
		gain.gain.value = volumeRef.current;
		context.createMediaElementSource(audio).connect(gain);
		gain.connect(context.destination);

		audio.addEventListener('playing', () => setStatus('playing'));
		audio.addEventListener('ended', () => setStatus('idle'));
		audio.addEventListener('error', () => {
			// Clearing src to pause can also raise an error event; only a real stream failure has a src.
			if (!audio.getAttribute('src')) return;
			console.error('Radio stream error', audio.error);
			setStatus('idle');
		});

		engineRef.current = { audio, context, gain };
		return engineRef.current;
	}, []);

	// A real pause: dropping src closes the connection, so playing again rejoins the live stream.
	const stop = useCallback(() => {
		const engine = engineRef.current;
		if (!engine) return;

		engine.audio.pause();
		engine.audio.removeAttribute('src');
		engine.audio.load();
		setStatus('idle');
	}, []);

	const start = useCallback(async () => {
		const { audio, context } = ensureEngine();
		setStatus('loading');

		try {
			await context.resume();
			audio.src = STREAM_URL;
			await audio.play();
		} catch (error) {
			// AbortError means the listener hit pause while the stream was still connecting.
			if (error instanceof DOMException && error.name === 'AbortError') return;
			console.error('Radio playback failed', error);
			stop();
		}
	}, [ensureEngine, stop]);

	const toggle = useCallback(() => {
		if (status === 'idle') void start();
		else stop();
	}, [status, start, stop]);

	useEffect(() => {
		return () => {
			const engine = engineRef.current;
			if (!engine) return;

			engine.audio.pause();
			engine.audio.removeAttribute('src');
			engine.audio.load();
			void engine.context.close();
			engineRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!('mediaSession' in navigator)) return;

		navigator.mediaSession.setActionHandler('play', () => void start());
		navigator.mediaSession.setActionHandler('pause', stop);

		return () => {
			navigator.mediaSession.setActionHandler('play', null);
			navigator.mediaSession.setActionHandler('pause', null);
		};
	}, [start, stop]);

	useEffect(() => {
		if (!('mediaSession' in navigator) || !track) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.trackname,
			artist: track.artist,
			album: track.album ?? undefined,
			artwork: [{ src: track.coverUrl }],
		});
	}, [track]);

	const value = useMemo(
		() => ({ track, status, volume, toggle, stop, setVolume }),
		[track, status, volume, toggle, stop],
	);

	return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}
