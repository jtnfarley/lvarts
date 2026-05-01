'use client'

import { APIProvider } from '@vis.gl/react-google-maps'
import { useEffect, useState } from 'react'

import { getSceneHubData, type SceneHubData } from '@/app/data/scene'
import PostUi from '@/components/PostUi/PostUi'
import type Post from '@/lib/models/post'
import type User from '@/lib/models/user'

import SceneComposer from './SceneComposer'
import SceneMap from './SceneMap'

const TrendGroup = (props:{title:string, items:Array<{label:string, count:number}>, emptyLabel:string}) => {
    const { emptyLabel, items, title } = props

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</div>
            {items.length > 0 ?
                <div className="space-y-2">
                    {items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                            <span>{item.label}</span>
                            <span className="font-semibold text-orange-700">{item.count}</span>
                        </div>
                    ))}
                </div>
                :
                <div className="text-sm text-gray-500">{emptyLabel}</div>
            }
        </div>
    )
}

const SceneSection = (props:{
    title:string
    description:string
    posts:Post[]
    emptyMessage:string
    user:User
    googleMapsApiKey:string | undefined
    renderKey:number
}) => {
    const { description, emptyMessage, googleMapsApiKey, posts, renderKey, title, user } = props

    return (
        <section className="rounded-box border border-gray-200 bg-white p-5">
            <div className="mb-4">
                <div className="text-xl font-bold">{title}</div>
                <div className="text-sm text-gray-600">{description}</div>
            </div>
            {posts.length > 0 ?
                <div className="flex flex-col gap-5">
                    {posts.map((post, index) => (
                        <PostUi
                            key={`${post.id}-${renderKey}-${index}`}
                            postData={post}
                            user={user}
                            googleMapsApiKey={googleMapsApiKey}
                        />
                    ))}
                </div>
                :
                <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                    {emptyMessage}
                </div>
            }
        </section>
    )
}

interface Props {
    initialData: SceneHubData
    user: User
    googleMapsApiKey:string | undefined
    savePost: Function
}

export default function SceneHub(props: Props) {
    const { googleMapsApiKey, initialData, savePost, user } = props
    const [sceneData, setSceneData] = useState(initialData)
    const [renderKey, setRenderKey] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        let cancelled = false

        const refreshSceneHub = async () => {
            setIsRefreshing(true)

            try {
                const nextData = await getSceneHubData()

                if (!cancelled) {
                    setSceneData(nextData)
                    setRenderKey((previous) => previous + 1)
                }
            } finally {
                if (!cancelled) {
                    setIsRefreshing(false)
                }
            }
        }

        window.addEventListener('postsUpdated', refreshSceneHub)

        return () => {
            cancelled = true
            window.removeEventListener('postsUpdated', refreshSceneHub)
        }
    }, [])

    return (
        <APIProvider apiKey={googleMapsApiKey || ''}>
            <div className="flex flex-col gap-5 py-5">
                <section className="overflow-hidden rounded-[2rem] border border-orange/20 bg-gradient-to-br from-orange/15 via-white to-slate-50 p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-orange-700">Lehigh Valley Scene Radar</div>
                            <h1 className="text-3xl font-bold text-slate-900">Collabs, recommendations, open mics, and jam sessions in one local board.</h1>
                            <p className="mt-3 text-sm text-slate-600">
                                This is the community utility layer for the Valley. Post a collab call, ask for recommendations, or surface the next open mic so people can actually find it.
                            </p>
                        </div>
                        <div className="text-sm text-slate-500">
                            {isRefreshing ? 'Refreshing scene data...' : 'Live scene data updates after new posts, edits, and deletes.'}
                        </div>
                    </div>
                </section>

                <SceneComposer user={user} savePost={savePost}/>

                <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <div className="rounded-box border border-gray-200 bg-white p-5">
                        <div className="mb-4">
                            <div className="text-xl font-bold">Trend Radar</div>
                            <div className="text-sm text-gray-600">What has momentum in the last two weeks across community posts.</div>
                        </div>
                        <div className="grid gap-4">
                            <TrendGroup title="Top Tags" items={sceneData.trendRadar.tags} emptyLabel="No tagged community posts yet."/>
                            <TrendGroup title="Top Towns" items={sceneData.trendRadar.towns} emptyLabel="No location data yet."/>
                            <TrendGroup title="Top Formats" items={sceneData.trendRadar.postTypes} emptyLabel="No scene post activity yet."/>
                        </div>
                    </div>

                    <section className="rounded-box border border-gray-200 bg-white p-5">
                        <div className="mb-4">
                            <div className="text-xl font-bold">Scene Map</div>
                            <div className="text-sm text-gray-600">Addresses from community posts are geocoded here so people can browse the scene geographically.</div>
                        </div>
                        <SceneMap posts={sceneData.mapPosts} googleMapsApiKey={googleMapsApiKey}/>
                    </section>
                </section>

                <SceneSection
                    title="Collab Board"
                    description="Recent calls for bandmates, creative partners, organizers, and project help."
                    posts={sceneData.collabs}
                    emptyMessage="No collab calls yet. Be the first to ask the Valley for something specific."
                    user={user}
                    googleMapsApiKey={googleMapsApiKey}
                    renderKey={renderKey}
                />

                <SceneSection
                    title="Open Mic & Jam Tracker"
                    description="Upcoming sessions sorted by date so people can discover where the scene is happening next."
                    posts={sceneData.openMicAndJam}
                    emptyMessage="No upcoming open mics or jam sessions are listed right now."
                    user={user}
                    googleMapsApiKey={googleMapsApiKey}
                    renderKey={renderKey}
                />

                <SceneSection
                    title="Local Recommendations"
                    description="Questions, tips, and local knowledge about venues, vendors, rehearsal spots, and more."
                    posts={sceneData.recommendations}
                    emptyMessage="No recommendation threads yet. Ask the Valley something useful."
                    user={user}
                    googleMapsApiKey={googleMapsApiKey}
                    renderKey={renderKey}
                />
            </div>
        </APIProvider>
    )
}
