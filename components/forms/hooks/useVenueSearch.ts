'use client'

import { useEffect, useState } from "react";
import { searchVenues, type VenueSuggestion } from "@/app/actions/venues";
import { UseFormSetValue } from "react-hook-form";

export const useVenueSearch = (isScheduledPost: boolean, initialQuery: string, setValue: UseFormSetValue<any>) => {
    const [venueQuery, setVenueQuery] = useState(initialQuery);
    const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([]);
    const [isVenueSearchOpen, setIsVenueSearchOpen] = useState(false);
    const [isVenueSearching, setIsVenueSearching] = useState(false);

    useEffect(() => {
        const trimmedQuery = venueQuery.trim();

        if (!isScheduledPost || trimmedQuery.length < 2) {
            setVenueSuggestions([]);
            setIsVenueSearching(false);
            return;
        }

        let isCurrentSearch = true;
        setIsVenueSearching(true);

        const timeout = window.setTimeout(async () => {
            try {
                const venues = await searchVenues(trimmedQuery);
                if (isCurrentSearch) setVenueSuggestions(venues);
            } finally {
                if (isCurrentSearch) setIsVenueSearching(false);
            }
        }, 250);

        return () => {
            isCurrentSearch = false;
            window.clearTimeout(timeout);
        };
    }, [isScheduledPost, venueQuery]);

    const selectVenue = (venue: VenueSuggestion) => {
        setValue('venuename', venue.venuename, { shouldDirty: true });
        setValue('venueid', venue.id, { shouldDirty: true });
        setValue('address', venue.address ?? '', { shouldDirty: true });
        setVenueQuery(venue.venuename);
        setVenueSuggestions([]);
        setIsVenueSearchOpen(false);
    };

    const resetVenueSearch = () => {
        setVenueQuery('');
        setVenueSuggestions([]);
        setIsVenueSearchOpen(false);
    };

    return {
        venueQuery,
        setVenueQuery,
        venueSuggestions,
        isVenueSearchOpen,
        setIsVenueSearchOpen,
        isVenueSearching,
        selectVenue,
        resetVenueSearch,
    };
};
