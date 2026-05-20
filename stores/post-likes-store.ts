import { create } from 'zustand';


//user logs in
//load their post like ids into an array 
export interface LikesState {
    likes: number;
    likesuserdetailsids: number[];
}

interface LikesStore extends LikesState {
    setLikesUserdetails: (likesUsers: LikesState) => void;
    setLikes: (likes: number) => void;
    setLikesUserDetailsIds: (likesuserdetailsids: number[]) => void;
    addLike: (userDetailsId: number) => void;
    removeLike: (userDetailsId: number) => void;
    clearLikes: () => void;
}

const addUniqueId = (ids: number[], userDetailsId: number) => {
    if (ids.includes(userDetailsId)) {
        return ids;
    }

    return [...ids, userDetailsId];
};

export const useLikesStore = create<LikesStore>((set) => ({
    likes: 0,
    likesuserdetailsids: [],
    setLikesUserdetails: ({ likes, likesuserdetailsids }) => set({  likes, likesuserdetailsids }),
    setLikes: (likes) => set({ likes }),
    setLikesUserDetailsIds: (likesuserdetailsids) => set({ likesuserdetailsids }),
    addLike: (userDetailsId) =>
        set((state) => ({
            likesuserdetailsids: addUniqueId(state.likesuserdetailsids, userDetailsId),
            likes: state.likes++
        })),
    removeLike: (userDetailsId) =>
        set((state) => ({
            likesuserdetailsidss: state.likesuserdetailsids.filter((id) => id !== userDetailsId),
            likes: state.likes--
        })),
    clearLikes: () => set({ likes: 0, likesuserdetailsids: [] })
}));
