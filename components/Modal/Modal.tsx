'use client'

import { useEffect, useRef } from "react";
import { useModal } from '@/app/contextProviders/modalProvider'

export default function Modal(props:{isOpen:boolean, children:any}) {
    const { isOpen, children } = props;
    const { setIsOpen } = useModal()

    if (!isOpen) return null;

    const modal = useRef<HTMLDivElement | null>(null)

    return (
        <div ref={modal} className="fixed inset-0 flex
                        items-center justify-center bg-black/50
                        z-50">
            <div className="bg-white rounded-lg
                            shadow-lg p-6 max-w-md
                            w-full relative">
                <button
                    className="absolute top-2 right-2
                               text-gray-500 hover:text-gray-700"
                    onClick={() => setIsOpen(false)}
                >
                    &#x2715; {/* Close button */}
                </button>
                {children}
            </div>
        </div>
    );
};
