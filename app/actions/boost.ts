'use server'

import { currentUser, isLoggedIn } from '@/app/data/currentUser'
import { createBoostPaymentIntentDAL, recordBoostImpressionDAL, BoostPaymentIntentResult } from '@/app/data/boosts'
import { ImpressionTierKey } from '@/constants/boost'

export const createBoostPaymentIntent = async (postid: number, impressionTier: ImpressionTierKey): Promise<BoostPaymentIntentResult> => {
    const user = await currentUser()
    const userdetailsid = user?.userdetails?.id

    if (!userdetailsid) {
        return { error: 'You must be logged in to boost a post' }
    }

    return await createBoostPaymentIntentDAL(postid, impressionTier, userdetailsid)
}

export const recordBoostImpression = async (postid: number) => {
    const user = await isLoggedIn()
    const userdetailsid = user?.userdetails?.id

    if (!userdetailsid) return

    await recordBoostImpressionDAL(postid, userdetailsid)
}
