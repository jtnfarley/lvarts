export const SCENE_COMMUNITY_POST_TYPES = ['collab', 'recommendation', 'openmic', 'jam'] as const
export const SCENE_SCHEDULED_POST_TYPES = ['event', 'openmic', 'jam'] as const

const postTypeLabels: Record<string, string> = {
    post: 'Post',
    comment: 'Comment',
    event: 'Event',
    collab: 'Collab Call',
    recommendation: 'Recommendation',
    openmic: 'Open Mic',
    jam: 'Jam Session'
}

export const isSceneCommunityPostType = (postType?: string | null) => {
    if (!postType) {
        return false
    }

    return SCENE_COMMUNITY_POST_TYPES.includes(postType as typeof SCENE_COMMUNITY_POST_TYPES[number])
}

export const isSceneScheduledPostType = (postType?: string | null) => {
    if (!postType) {
        return false
    }

    return SCENE_SCHEDULED_POST_TYPES.includes(postType as typeof SCENE_SCHEDULED_POST_TYPES[number])
}

export const getPostTypeLabel = (postType?: string | null) => {
    if (!postType) {
        return 'Post'
    }

    return postTypeLabels[postType] || 'Post'
}

export const splitPostTags = (tags?: string | null) => {
    if (!tags) {
        return []
    }

    return tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
}
