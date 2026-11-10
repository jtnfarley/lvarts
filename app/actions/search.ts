'use server'

import { isLoggedIn } from '@/app/data/currentUser';
import { searchProfiles, type ProfileResult } from '@/lib/searchProfiles';

const SUGGESTION_LIMIT = 5;
const MAX_QUERY_LENGTH = 100;

export const suggestProfiles = async (query: string): Promise<ProfileResult[]> => {
    if (!(await isLoggedIn())) {
        return [];
    }

    return searchProfiles(query.slice(0, MAX_QUERY_LENGTH), SUGGESTION_LIMIT);
};
