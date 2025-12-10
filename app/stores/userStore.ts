import { create } from 'zustand';
import User from '@/lib/models/user';

export const useUserStore = create<{
		user: User | null;
		setUser: (user: User | null) => void;
	}>((set) => ({
		user: null,
		setUser: (user) => {
			set(() => ({ user }))
		},
}));


// // src/stores/counter-store.ts
// import { createStore } from 'zustand/vanilla'
// import User from '@/lib/models/user'

// export type UserState = {
//   user: User | null
// }

// export type UserActions = {
//   setUser: (user: User) => void
// }

// export type UserStore = UserState & UserActions

// export const defaultInitState: UserState = {
//   user: null,
// }

// export const createUserStore = (
//   initState: UserState = defaultInitState,
// ) => {
//   return createStore<UserStore>()((set) => ({
//     ...initState,
//     setUser: (user) => set((state) => ({ user: state.user })),
//   }))
// }
