import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { activateBoostFromPaymentIntent } from '@/app/data/boosts'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
    const signature = request.headers.get('stripe-signature')
    const rawBody = await request.text()

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
        await activateBoostFromPaymentIntent(event.data.object as Stripe.PaymentIntent)
    }

    return NextResponse.json({ received: true })
}
