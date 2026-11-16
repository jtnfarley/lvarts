'use client'

import { useRef, useState } from 'react';
import Image from 'next/image';

const arrowClass = 'hidden md:flex absolute top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white cursor-pointer';

// Swipeable image set: native scroll-snap does the swiping, so touch, trackpad and keyboard all work.
function PostImageCarousel(props: { urls: string[], alt: string }) {
    const { urls, alt } = props;
    const trackRef = useRef<HTMLUListElement>(null);
    const [index, setIndex] = useState(0);

    const goTo = (target: number) => {
        const track = trackRef.current;
        if (!track) return;
        track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
    };

    const handleScroll = () => {
        const track = trackRef.current;
        if (!track || !track.clientWidth) return;
        setIndex(Math.round(track.scrollLeft / track.clientWidth));
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowRight' && index < urls.length - 1) goTo(index + 1);
        if (event.key === 'ArrowLeft' && index > 0) goTo(index - 1);
    };

    return (
        <div className="relative mt-3 overflow-hidden rounded-2xl bg-black/10" role="region" aria-roledescription="carousel" aria-label={alt}>
            <ul
                ref={trackRef}
                tabIndex={0}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                className="flex aspect-[4/5] overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {urls.map((url, position) => (
                    <li key={url} className="relative h-full w-full shrink-0 snap-center" aria-label={`Image ${position + 1} of ${urls.length}`}>
                        <Image
                            src={url}
                            alt={`${alt} (${position + 1} of ${urls.length})`}
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            className="object-contain"
                        />
                    </li>
                ))}
            </ul>

            <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                {index + 1}/{urls.length}
            </div>

            {index > 0 && (
                <button type="button" className={`${arrowClass} left-2`} aria-label="Previous image" onClick={() => goTo(index - 1)}>
                    ‹
                </button>
            )}
            {index < urls.length - 1 && (
                <button type="button" className={`${arrowClass} right-2`} aria-label="Next image" onClick={() => goTo(index + 1)}>
                    ›
                </button>
            )}

            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5" aria-hidden="true">
                {urls.map((url, position) => (
                    <span key={url} className={`h-1.5 w-1.5 rounded-full ${position === index ? 'bg-white' : 'bg-white/50'}`} />
                ))}
            </div>
        </div>
    );
}

export default PostImageCarousel;
