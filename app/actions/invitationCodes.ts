'use server'

import { getRandomString } from "@/lib/utils";

export const generateCodes = async (amount: number): Promise<Array<string> | undefined> => {
    if (amount <= 0) return;

    return Array.from({ length: amount }, () => getRandomString(10));
}


export const verifyCode = async (code:string) => {
    return Boolean(code && code.trim().length > 0);
}
