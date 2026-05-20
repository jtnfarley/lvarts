'use server'

import { Prisma } from '@prisma/client'

import { prisma } from '@/prisma'

export interface VenueSuggestion {
    id: number
    venuename: string
    address: string | null
    neighborhood?: string | null
}

export const searchVenues = async (query:string): Promise<VenueSuggestion[]> => {
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
        return []
    }

    const venues = await prisma.venues.findMany({
        where: {
            venuename: {
                contains: trimmedQuery,
                mode: Prisma.QueryMode.insensitive
            }
        },
        select: {
            id: true,
            venuename: true,
            address: true,
        },
        orderBy: {
            venuename: 'asc'
        },
        take: 8
    })

    const normalizedQuery = trimmedQuery.toLocaleLowerCase()

    return venues.sort((a, b) => {
        const aName = a.venuename.toLocaleLowerCase()
        const bName = b.venuename.toLocaleLowerCase()
        const aExact = aName === normalizedQuery ? 0 : 1
        const bExact = bName === normalizedQuery ? 0 : 1
        const aStarts = aName.startsWith(normalizedQuery) ? 0 : 1
        const bStarts = bName.startsWith(normalizedQuery) ? 0 : 1

        return aExact - bExact || aStarts - bStarts || aName.localeCompare(bName)
    })
}
