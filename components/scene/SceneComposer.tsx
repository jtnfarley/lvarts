'use client'

import { useState } from 'react'

import PostForm from '@/components/forms/PostForm'
import type Post from '@/lib/models/post'
import type User from '@/lib/models/user'

const composerOptions = [
    {
        id: 'collab',
        label: 'Collab Board',
        description: 'Find bandmates, artists, organizers, and project partners.'
    },
    {
        id: 'recommendation',
        label: 'Recommendations',
        description: 'Ask the Valley for spots, vendors, venues, and local advice.'
    },
    {
        id: 'openmic',
        label: 'Open Mic',
        description: 'Track recurring open mics with dates, venue info, and map data.'
    },
    {
        id: 'jam',
        label: 'Jam Session',
        description: 'Post a session people can actually find and show up to.'
    }
] as const

interface Props {
    user: User
    savePost: Function
}

export default function SceneComposer(props: Props) {
    const { savePost, user } = props
    const [postType, setPostType] = useState<typeof composerOptions[number]['id']>('collab')
    const activeOption = composerOptions.find((option) => option.id === postType)

    return (
        <div className="rounded-box border border-orange/20 bg-white/95 p-5">
            <div className="mb-3 text-xl font-bold">Scene Board</div>
            <div className="mb-4 text-sm text-gray-600">
                Publish calls for collaborators, local recommendations, or upcoming open mics and jam sessions without leaving the main post system.
            </div>
            <div className="mb-5 grid gap-3 md:grid-cols-4">
                {composerOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => setPostType(option.id)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                            postType === option.id
                                ? 'border-orange bg-orange/10 text-orange-800'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-orange/40'
                        }`}
                    >
                        <div className="font-semibold">{option.label}</div>
                        <div className="mt-1 text-xs text-gray-500">{option.description}</div>
                    </button>
                ))}
            </div>
            {activeOption &&
                <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {activeOption.description}
                </div>
            }
            <PostForm
                key={postType}
                user={user}
                post={{ postType } as Post}
                edited={false}
                savePost={savePost}
            />
        </div>
    )
}
