'use client'

import imageUrl from "@/constants/imageUrl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BiPlay, BiPause, BiSolidVolumeFull, BiLinkAlt } from "react-icons/bi";

const STREAM_URL = "https://a6.asurahosting.com:6870/radio.mp3";

export default function RadioClient(props:{nowPlaying:any}) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const [isStreaming, setIsStreaming] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(.75);

	const isPlaying = isStreaming && !isMuted;

	const nowPlaying = props.nowPlaying;
	const audiotrack = (nowPlaying.audiotracks?.length) ? nowPlaying.audiotracks[0] : undefined;
	const coverartfile = (audiotrack?.coverartfile) ? `${imageUrl}/${nowPlaying.usertoposts[0].userdetails!.userdir}/${audiotrack.coverartfile}` : '/logos/arts-abbr-sq.png';

	useEffect(() => {
		const audio = new Audio(STREAM_URL);
		audio.crossOrigin = "anonymous";
		audio.preload = "none";

		audioRef.current = audio;

		return () => {
			audio.pause();
			audio.src = "";

			sourceNodeRef.current?.disconnect();
			gainNodeRef.current?.disconnect();

			sourceNodeRef.current = null;
			gainNodeRef.current = null;

			if (audioContextRef.current) {
				void audioContextRef.current.close();
				audioContextRef.current = null;
			}

			audioRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (gainNodeRef.current && !isMuted) {
			gainNodeRef.current.gain.value = volume;
		}
	}, [volume, isMuted]);

	const ensureAudioGraph = async () => {
		const audio = audioRef.current;

		if (!audio) {
			return null;
		}

		if (!audioContextRef.current) {
			const context = new AudioContext();
			const source = context.createMediaElementSource(audio);
			const gainNode = context.createGain();

			source.connect(gainNode);
			gainNode.connect(context.destination);
			gainNode.gain.value = volume;

			audioContextRef.current = context;
			sourceNodeRef.current = source;
			gainNodeRef.current = gainNode;
		}

		if (audioContextRef.current.state === "suspended") {
			await audioContextRef.current.resume();
		}

		return audio;
	};

	const togglePlayback = async () => {
		const audio = await ensureAudioGraph();

		if (!audio) {
			return;
		}

		if (!isStreaming) {
			await audio.play();
			setIsStreaming(true);
			return;
		}

		if (isMuted) {
			if (gainNodeRef.current) gainNodeRef.current.gain.value = volume;
			setIsMuted(false);
		} else {
			if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;
			setIsMuted(true);
		}
	};

	return (
		<div className="flex justify-center w-full bg-gray-900/80">
			{audiotrack && 
				<div className="p-3 flex gap-2 items-center">
					<div className="text-white"><Image src={coverartfile} width={75} height={75} alt={`${audiotrack.trackname} by ${audiotrack.artist}`}/></div>
					<div className="text-white text-sm w-[150px]">
						<div className="text-xs"><em>Now Playing</em></div>
						<div className="flex items-center">
							<div><Link href={`/post/${nowPlaying.id}`}><strong>{audiotrack.trackname}</strong></Link></div>
							<div className="ms-2"><BiLinkAlt/></div>
						</div>
						<div>{audiotrack.artist}</div>
						{audiotrack.album && <div>{audiotrack.album}</div>}
						{audiotrack.releaseyear && <div>{audiotrack.releaseyear}</div>}
					</div>
				</div>
			}

			<div className="text-white p-3 flex items-center gap-3">
				<button
					type="button"
					onClick={() => void togglePlayback()}
					className="text-white text-5xl font-semibold"
				>
					{isPlaying ? <BiPause/> : <BiPlay/>}
				</button>
				<label className="flex items-center gap-2 text-sm">
					<span><BiSolidVolumeFull/></span>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={(event) => setVolume(Number(event.target.value))}
					/>
				</label>
			</div>		
		</div>
	)
}
