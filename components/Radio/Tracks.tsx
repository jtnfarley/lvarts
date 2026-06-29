'use client'

import { useEffect, useState } from "react";
import RadioClient from "./RadioClient";

const getNowPlaying = async ():Promise<any> => {
	const nowPlaying = await fetch('https://a6.asurahosting.com/api/nowplaying/lehigh_valley_art__music')
		.then(res => res.json())
		.then(res2 => res2)
		.catch(err => console.log(err));

	return nowPlaying;
}

export default function Tracks(props:Readonly<{getAudioTrack:Function}>) {
	const [track, setTrack] = useState();
	const [nowPlaying, setNowPlaying] = useState<any>();

	const getTrack = async () => {
		const nowPlaying = await getNowPlaying();
		setNowPlaying(nowPlaying);

		let audiotrack;
		if (nowPlaying?.now_playing?.song?.title) {
			audiotrack = await props.getAudioTrack(nowPlaying.now_playing.song.title);

			if (!audiotrack) {
				audiotrack = {
					audiotracks: [
						{
							trackname: nowPlaying?.now_playing?.song?.title,
							artist: nowPlaying?.now_playing?.song?.artist,
							album: nowPlaying?.now_playing?.song?.album
						}
					],
				}
			}

			setTrack(audiotrack);
		} 
	}

	useEffect(() => {
		getTrack();
	},[]);

	useEffect(() => {
		const currentTrack = nowPlaying?.now_playing;

		if (!currentTrack) {
			return;
		}

		const playedAt = typeof currentTrack.played_at === 'number' ? currentTrack.played_at * 1000 : null;
		const duration = typeof currentTrack.duration === 'number' ? currentTrack.duration * 1000 : null;
		const remaining = typeof currentTrack.remaining === 'number' ? currentTrack.remaining * 1000 : null;

		const msUntilTrackEnds = playedAt !== null && duration !== null
			? (playedAt + duration) - Date.now()
			: remaining;

		const timeoutMs = msUntilTrackEnds !== null && msUntilTrackEnds > 0
			? msUntilTrackEnds + 2000
			: 5000;

		const timeoutId = globalThis.setTimeout(() => {
			getTrack();
		}, timeoutMs);

		return () => globalThis.clearTimeout(timeoutId);
	}, [nowPlaying]);

	return (
		<div className="w-full">
			{track &&
				<RadioClient nowPlaying={track}/>
			}	
		</div>
	)
}
