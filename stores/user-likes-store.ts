import { create } from 'zustand';

export interface UserLikesState {
    postids: number[];
}

interface UserLikesStore extends UserLikesState {
    setLikes: (postids: number[]) => void;
    addLike: (postid: number) => void;
    removeLike: (postid: number) => void;
    clearLikes: () => void;
}

const addUniqueId = (ids: number[], postid: number) => {
    if (ids.includes(postid)) {
        return ids;
    }

    return [...ids, postid];
};

export const useLikesStore = create<UserLikesStore>((set) => ({
    postids: [],
    setLikes: (postids: number[]) => set({ postids }),
    addLike: (postid) =>
        set((state) => ({
            postids: addUniqueId(state.postids, postid),
        })),
    removeLike: (postid) =>
        set((state) => ({
            postids: state.postids.filter((id) => id !== postid),
        })),
    clearLikes: () => set({ postids: [] })
}));
