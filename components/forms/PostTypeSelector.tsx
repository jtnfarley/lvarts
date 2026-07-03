'use client'

import { BiSolidFilePlus, BiSolidMusic, BiCalendarPlus } from 'react-icons/bi'

const types = [
    { type: 'post',  label: 'Post',  Icon: BiSolidFilePlus },
    { type: 'audio', label: 'Audio', Icon: BiSolidMusic },
    { type: 'event', label: 'Event', Icon: BiCalendarPlus },
]

export default function PostTypeSelector({ activeType, onChange }: { activeType: string, onChange: (type: string) => void }) {
    return (
        <div className="flex rounded-lg border border-[var(--lvartsmusic-border)] p-0.5 gap-0.5">
            {types.map(({ type, label, Icon }) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => onChange(type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                        activeType === type
                            ? 'bg-orange text-white'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Icon size={14} />
                    {label}
                </button>
            ))}
        </div>
    )
}
