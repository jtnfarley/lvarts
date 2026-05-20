export const SCENE_COMMUNITY_POST_TYPES = ['collab', 'recommendation', 'openmic', 'jam'] as const
export const SCENE_SCHEDULED_POST_TYPES = ['event', 'openmic', 'jam'] as const

const posttypeLabels: Record<string, string> = {
    post: 'Post',
    comment: 'Comment',
    event: 'Event',
    collab: 'Collab Call',
    recommendation: 'Recommendation',
    openmic: 'Open Mic',
    jam: 'Jam Session'
}

export const isSceneCommunityPostType = (posttype?: string | null) => {
    if (!posttype) {
        return false
    }

    return SCENE_COMMUNITY_POST_TYPES.includes(posttype as typeof SCENE_COMMUNITY_POST_TYPES[number])
}

export const isSceneScheduledPostType = (posttype?: string | null) => {
    if (!posttype) {
        return false
    }

    return SCENE_SCHEDULED_POST_TYPES.includes(posttype as typeof SCENE_SCHEDULED_POST_TYPES[number])
}

export const getPostTypeLabel = (posttype?: string | null) => {
    if (!posttype) {
        return 'Post'
    }

    return posttypeLabels[posttype] || 'Post'
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
