'use client'

import { useEffect, useState } from "react";

// the photos to ghost behind the app — one is picked per visit
export const BG_IMAGES = [
	'IMG_0492.png', 'IMG_0650.png', 'IMG_1419-2.png', 'IMG_1419.png', 
	'IMG_2124.png', 'IMG_2396.png', 'IMG_2873-2.png', 'IMG_2873.png', 'IMG_3727.png',
];

// locked riso inks — one tints the photo per visit (orange / purple / electric blue / acid green)
const INKS = ['#ff7f25', '#9422B4', '#3126FF', '#2CFF00'];

// deep ink-black backdrop; shadows lean into this, highlights lean into the ink → fake duotone
const INK_BLACK = '#0c0a18';

export default function RandoBgs() {
	const [pick, setPick] = useState<{ image: string; ink: string } | null>(null);

	useEffect(() => {
		// random per visit, but constrained to the brand palette (calm, not the old rainbow)
		const image = BG_IMAGES[Math.floor(Math.random() * BG_IMAGES.length)];
		const ink = INKS[Math.floor(Math.random() * INKS.length)];
		setPick({ image, ink });
	}, []);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: INK_BLACK }}>
			{pick && (
				<>
					{/* ghosted, desaturated photo */}
					<div
						className="absolute inset-0 bg-cover bg-center"
						style={{
							backgroundImage: `url(/images/bgs/${pick.image})`,
							filter: 'grayscale(1) contrast(1.15) brightness(0.55)',
							opacity: 0.8,
						}}
					/>
					{/* single-ink duotone tint — lifts the highlights into the riso color */}
					<div
						className="absolute inset-0"
						style={{ backgroundColor: pick.ink, mixBlendMode: 'screen', opacity: 0.3 }}
					/>
					{/* push the shadows back toward ink-black for depth */}
					<div
						className="absolute inset-0"
						style={{ backgroundColor: INK_BLACK, mixBlendMode: 'multiply', opacity: 0.35 }}
					/>
					{/* vignette: open in the center (where the feed sits), dark at the edges (under the sidebars) */}
					<div
						className="absolute inset-0"
						style={{
							background:
								`radial-gradient(ellipse 70% 60% at 50% 42%, transparent 0%, ${INK_BLACK}cc 100%)`,
						}}
					/>
				</>
			)}
		</div>
	);
}
