'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AdvancedMarker, Map as GoogleMap, Pin } from '@vis.gl/react-google-maps'

import type Post from '@/lib/models/post'
import { getPostTypeLabel } from '@/lib/scenePosts'

type MarkerPost = {
    id: string
    title: string
    postType?: string | null
    address: string
    formattedAddress: string
    town?: string | null
    venueName?: string | null
    lat: number
    lng: number
}

const defaultCenter = {
    lat: 40.6084,
    lng: -75.4902
}

export default function SceneMap(props:{posts:Post[], googleMapsApiKey:string | undefined}) {
    const { googleMapsApiKey, posts } = props
    const [markers, setMarkers] = useState<MarkerPost[]>([])

    useEffect(() => {
        let cancelled = false

        const geocodeLocation = async (address:string) => {
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': googleMapsApiKey || '',
                    'X-Goog-FieldMask': 'places.location,places.formattedAddress'
                },
                body: JSON.stringify({
                    textQuery: address
                })
            })

            if (!response.ok) {
                return null
            }

            const data = await response.json()
            const place = data?.places?.[0]

            if (!place?.location) {
                return null
            }

            return {
                formattedAddress: place.formattedAddress || address,
                lat: place.location.latitude,
                lng: place.location.longitude
            }
        }

        const loadMarkers = async () => {
            if (!googleMapsApiKey) {
                setMarkers([])
                return
            }

            const postsWithLocations = posts.filter((post) => post.venue?.address || post.address)
            const locationCache = new Map<string, Awaited<ReturnType<typeof geocodeLocation>>>()

            await Promise.all(
                postsWithLocations.map(async (post) => {
                    const address = (post.venue?.address ?? post.address)?.trim()

                    if (!address || locationCache.has(address)) {
                        return
                    }

                    const geocodedLocation = await geocodeLocation(address)
                    locationCache.set(address, geocodedLocation)
                })
            )

            const nextMarkers = postsWithLocations.flatMap((post) => {
                const address = (post.venue?.address ?? post.address)?.trim()

                if (!address) {
                    return []
                }

                const geocodedLocation = locationCache.get(address)

                if (!geocodedLocation) {
                    return []
                }

                return [{
                    id: post.id,
                    title: post.headline || post.eventTitle || post.content.slice(0, 60),
                    postType: post.postType,
                    address,
                    formattedAddress: geocodedLocation.formattedAddress,
                    town: post.town ?? post.venue?.neighborhood,
                    venueName: post.venue?.venueName ?? post.venueName,
                    lat: geocodedLocation.lat,
                    lng: geocodedLocation.lng
                }]
            })

            if (!cancelled) {
                setMarkers(nextMarkers)
            }
        }

        loadMarkers()

        return () => {
            cancelled = true
        }
    }, [googleMapsApiKey, posts])

    const mapCenter = useMemo(() => {
        if (!markers.length) {
            return defaultCenter
        }

        return {
            lat: markers[0].lat,
            lng: markers[0].lng
        }
    }, [markers])

    if (!googleMapsApiKey) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                Add a Google Maps API key to render the scene map.
            </div>
        )
    }

    if (!markers.length) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
                Posts with a map address will appear here.
            </div>
        )
    }

    return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-gray-200">
                <GoogleMap
                    style={{ height: '420px', width: '100%' }}
                    defaultZoom={11}
                    center={mapCenter}
                    mapId='DEMO_MAP_ID'
                >
                    {markers.map((marker) => (
                        <AdvancedMarker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }}>
                            <Pin background={'#ff7f25'} glyphColor={'#fff'} borderColor={'#7a3200'} />
                        </AdvancedMarker>
                    ))}
                </GoogleMap>
            </div>
            <div className="custom-scrollbar max-h-[420px] space-y-3 overflow-y-auto pe-2">
                {markers.map((marker) => (
                    <div key={marker.id} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                            {getPostTypeLabel(marker.postType)}
                        </div>
                        <Link href={`/post/${marker.id}`} className="block text-lg font-semibold text-slate-900 hover:text-orange-700">
                            {marker.title}
                        </Link>
                        <div className="mt-1 text-sm text-gray-600">{marker.formattedAddress}</div>
                        <div className="mt-2 text-xs uppercase tracking-wide text-gray-500">
                            {[marker.venueName, marker.town].filter(Boolean).join(' | ')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
