export type ImpressionTierKey = 'tier_1k' | 'tier_5k' | 'tier_20k'

export const impressionTiers: Record<ImpressionTierKey, { label: string, impressions: number, cents: number }> = {
    tier_1k: { label: '1,000 impressions — $1', impressions: 1000, cents: 100 },
    tier_5k: { label: '5,000 impressions — $5', impressions: 5000, cents: 500 },
    tier_20k: { label: '20,000 impressions — $20', impressions: 20000, cents: 2000 }
}

export const BOOST_BACKSTOP_DAYS = 30
