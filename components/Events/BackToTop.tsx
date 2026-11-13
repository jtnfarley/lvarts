'use client'

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BiUpArrowAlt } from 'react-icons/bi';

// Renders an invisible marker at the top of the list. The button appears once the
// marker has scrolled out above the viewport, so it works whichever element scrolls.
export default function BackToTop() {
	const topMarkerRef = useRef<HTMLDivElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const marker = topMarkerRef.current;
		if (!marker) return;

		const observer = new IntersectionObserver(([entry]) => {
			setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
		});
		observer.observe(marker);
		return () => observer.disconnect();
	}, []);

	return (
		<>
			<div ref={topMarkerRef} aria-hidden='true' className='scroll-mt-32'/>
			{visible && createPortal(
				// Portaled to <body> because the page wrapper's backdrop-blur would otherwise
				// make it the containing block for this fixed button.
				// Sits just above the support chat button, which uses the same bottom offsets.
				<button
					type='button'
					title='Back to top'
					aria-label='Back to top'
					onClick={() => topMarkerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
					className='fixed bottom-[calc(55px+var(--radio-h,0px)+5rem)] right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-lvartsmusic-accent text-3xl text-lvartsmusic-accent-foreground shadow-lg md:bottom-24 md:right-6'
				>
					<BiUpArrowAlt/>
				</button>,
				document.body
			)}
		</>
	)
}
