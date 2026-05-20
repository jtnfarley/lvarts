import { create } from 'zustand';

export interface FollowsState {
    followers: number[];
    following: number[];
}

interface FollowsStore extends FollowsState {
    setFollows: (follows: FollowsState) => void;
    setFollowers: (followers: number[]) => void;
    setFollowing: (following: number[]) => void;
    addFollower: (userDetailsId: number) => void;
    removeFollower: (userDetailsId: number) => void;
    addFollowing: (userDetailsId: number) => void;
    removeFollowing: (userDetailsId: number) => void;
    clearFollows: () => void;
}

const addUniqueId = (ids: number[], userDetailsId: number) => {
    if (ids.includes(userDetailsId)) {
        return ids;
    }

    return [...ids, userDetailsId];
};

export const useFollowsStore = create<FollowsStore>((set) => ({
    followers: [],
    following: [],
    setFollows: ({ followers, following }) => set({ followers, following }),
    setFollowers: (followers) => set({ followers }),
    setFollowing: (following) => set({ following }),
    addFollower: (userDetailsId) =>
        set((state) => ({
            followers: addUniqueId(state.followers, userDetailsId)
        })),
    removeFollower: (userDetailsId) =>
        set((state) => ({
            followers: state.followers.filter((id) => id !== userDetailsId)
        })),
    addFollowing: (userDetailsId) =>
        set((state) => ({
            following: addUniqueId(state.following, userDetailsId)
        })),
    removeFollowing: (userDetailsId) =>
        set((state) => ({
            following: state.following.filter((id) => id !== userDetailsId)
        })),
    clearFollows: () => set({ followers: [], following: [] })
}));
