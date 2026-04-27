'use server'

import { getSidebarProfile } from './userProfiles'

export const getSidebarUserProfile = async (userId:string) => {
    return getSidebarProfile(userId)
}
