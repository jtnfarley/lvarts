'use server'

import { getSidebarProfile } from './userProfiles'

export const getSidebarUserProfile = async (handle:string) => {
    return getSidebarProfile(handle)
}
