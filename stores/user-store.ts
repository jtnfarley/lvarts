import { create } from 'zustand';

import User from '@/lib/models/user';

interface UserStore {
    user: User | null;
    updateUser: (user: User) => void
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    updateUser: (user) => set(() => ({user}))
}))