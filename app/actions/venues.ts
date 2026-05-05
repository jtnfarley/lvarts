'use server'

import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

export interface VenueSuggestion {
    id: string
    venueName: string
    address: string | null
    neighborhood: string | null
}

export const searchVenues = async (query:string): Promise<VenueSuggestion[]> => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
        return []
    }

    const venues = await prisma.venue.findMany({
        where: {
            venueName: {
                contains: trimmedQuery,
                mode: Prisma.QueryMode.insensitive
            }
        },
        select: {
            id: true,
            venueName: true,
            address: true,
            neighborhood: true
        },
        orderBy: {
            venueName: 'asc'
        },
        take: 8
    })

    const normalizedQuery = trimmedQuery.toLocaleLowerCase()

    return venues.sort((a, b) => {
        const aName = a.venueName.toLocaleLowerCase()
        const bName = b.venueName.toLocaleLowerCase()
        const aExact = aName === normalizedQuery ? 0 : 1
        const bExact = bName === normalizedQuery ? 0 : 1
        const aStarts = aName.startsWith(normalizedQuery) ? 0 : 1
        const bStarts = bName.startsWith(normalizedQuery) ? 0 : 1

        return aExact - bExact || aStarts - bStarts || aName.localeCompare(bName)
    })
}
