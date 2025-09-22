import { create } from 'zustand'

import Post from '@/lib/models/post';

// Create your store, which includes both state and (optionally) actions
export const useFeedStore = create((set) => ({
    posts: [],
    updatePosts: (posts:Array<Post>) => set(() => ({ posts: posts })),
}))
