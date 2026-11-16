'use client'

import type { PostImage } from "./hooks/useFileUpload";

interface Props {
    images: PostImage[];
    onRemove: (index: number) => void;
    onMove: (index: number, direction: -1 | 1) => void;
}

const buttonClass = "bg-black/60 text-white text-xs leading-none rounded px-1.5 py-1 cursor-pointer disabled:opacity-30 disabled:cursor-default";

const ImageStrip = ({ images, onRemove, onMove }: Props) => (
    <ul className="flex gap-2 overflow-x-auto px-4 pb-2">
        {images.map((image, index) => (
            <li key={image.name} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                <img src={image.url} alt={`Image ${index + 1} of ${images.length}`} className="w-full h-full object-cover" />
                {index === 0 && (
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] uppercase rounded px-1 py-0.5">Cover</span>
                )}
                <button type="button" className={`${buttonClass} absolute top-1 right-1`} aria-label={`Remove image ${index + 1}`} onClick={() => onRemove(index)}>
                    ✕
                </button>
                <div className="absolute bottom-1 inset-x-1 flex justify-between">
                    <button type="button" className={buttonClass} aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => onMove(index, -1)}>
                        ←
                    </button>
                    <button type="button" className={buttonClass} aria-label={`Move image ${index + 1} later`} disabled={index === images.length - 1} onClick={() => onMove(index, 1)}>
                        →
                    </button>
                </div>
            </li>
        ))}
    </ul>
);

export default ImageStrip;
