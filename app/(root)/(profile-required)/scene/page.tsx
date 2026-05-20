import type { Metadata } from 'next'

import { currentUser } from '@/app/data/currentUser'
import { savePost } from '@/app/data/posts'
import { getSceneHubData } from '@/app/data/scene'
import SceneHub from '@/components/scene/SceneHub'

export const metadata: Metadata = {
  title: 'Scene Radar - Lehigh Valley Art & Music',
  description: 'Collaborations, recommendations, open mics, and jam sessions across the Valley.',
}

export default async function ScenePage() {
    const user = await currentUser()
    const initialData = await getSceneHubData()
    const googleMapsApiKey = process.env.GOOGLE_MAPS

    return (
        <SceneHub
            initialData={initialData}
            user={user}
            googleMapsApiKey={googleMapsApiKey}
            savePost={savePost}
        />
    )
}
