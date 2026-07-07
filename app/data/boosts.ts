'use server'

import { prisma } from '@/prisma'
import { Prisma } from '@prisma/client'
import { stripe } from '@/lib/stripe'
import { impressionTiers, ImpressionTierKey, BOOST_BACKSTOP_DAYS } from '@/constants/boost'
import { activeBoostPredicate } from '@/lib/boostQueries'
import type Stripe from 'stripe'

export type BoostPaymentIntentResult = { error: string } | { clientSecret: string }

export const createBoostPaymentIntentDAL = async (postid: number, impressionTier: ImpressionTierKey, userdetailsid: number): Promise<BoostPaymentIntentResult> => {
    const tier = impressionTiers[impressionTier]

    if (!tier) {
        return { error: 'Invalid impressions selection' }
    }

    const authorship = await prisma.usertoposts.findFirst({
        where: { postid },
        orderBy: { id: 'asc' }
    })

    if (!authorship || authorship.userdetailsid !== userdetailsid) {
        return { error: 'You can only boost your own posts' }
    }

    const post = await prisma.posts.findFirst({ where: { id: postid } })

    if (!post || post.privatepost) {
        return { error: 'This post cannot be boosted' }
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: tier.cents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
            postid: String(postid),
            userdetailsid: String(userdetailsid),
            impressionspurchased: String(tier.impressions)
        }
    })

    if (!paymentIntent.client_secret) {
        return { error: 'Unable to start checkout' }
    }

    return { clientSecret: paymentIntent.client_secret }
}

export const activateBoostFromPaymentIntent = async (paymentIntent: Stripe.PaymentIntent) => {
    const { postid, userdetailsid, impressionspurchased } = paymentIntent.metadata

    if (!postid || !userdetailsid || !impressionspurchased) {
        console.error('Boost activation skipped: missing metadata on payment intent', paymentIntent.id)
        return
    }

    const existing = await prisma.postboosts.findUnique({
        where: { stripepaymentintentid: paymentIntent.id }
    })

    if (existing) return

    const post = await prisma.posts.findFirst({ where: { id: Number.parseInt(postid) } })

    if (!post) {
        console.error('Boost activation skipped: post no longer exists', postid)
        return
    }

    const activatedat = new Date()
    const expiresat = new Date(activatedat.getTime() + BOOST_BACKSTOP_DAYS * 24 * 60 * 60 * 1000)

    await prisma.postboosts.create({
        data: {
            postid: Number.parseInt(postid),
            userdetailsid: Number.parseInt(userdetailsid),
            budgetcents: paymentIntent.amount,
            impressionspurchased: Number.parseInt(impressionspurchased),
            status: 'active',
            stripepaymentintentid: paymentIntent.id,
            activatedat,
            expiresat
        }
    })
}

export const recordBoostImpressionDAL = async (postid: number, userdetailsid: number) => {
    const activeBoosts = await prisma.$queryRaw<Array<{ id: number }>>(
        Prisma.sql`
            SELECT pb.id
            FROM postboosts pb
            WHERE pb.postid = ${postid}
            AND ${activeBoostPredicate(Prisma.sql`pb`)}
        `
    )

    for (const boost of activeBoosts) {
        await prisma.postboostimpressions.createMany({
            data: [{ postboostid: boost.id, userdetailsid }],
            skipDuplicates: true
        })
    }
}
