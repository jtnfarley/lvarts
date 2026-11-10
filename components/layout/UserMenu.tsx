'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import Avatar from '@/components/shared/Avatar'

const itemClass = 'block w-full px-4 py-2 text-left text-sm text-lvartsmusic-foreground hover:bg-black/5 dark:hover:bg-white/10'

export default function UserMenu(props: { avatarUrl?: string, displayName?: string | null, handle?: string | null }) {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', closeOnOutsideClick)
        document.addEventListener('keydown', closeOnEscape)
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick)
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [open])

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((isOpen) => !isOpen)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                title="Account menu"
            >
                <Avatar imageUrl={props.avatarUrl} displayName={props.displayName} handle={props.handle} size="sm" />
            </button>

            {open &&
                <div role="menu" className="lvartsmusic-card absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden py-1">
                    <Link href="/profile" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                        My Profile
                    </Link>
                    <Link href="/settings" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                        Settings
                    </Link>
                    <button type="button" role="menuitem" className={itemClass} onClick={() => signOut({ callbackUrl: '/' })}>
                        Sign Out
                    </button>
                </div>
            }
        </div>
    )
}
