'use server'

import {prisma} from '@/lib/db/prisma';

import { getRandomString } from "@/lib/utils";

export const generateCodes = async (amount: number): Promise<Array<string> | undefined> => {
    const codes: string[] = [];

    for (let i = 0; i < amount; i++) {
        codes.push(getRandomString(10))
    }

    if (!codes.length) return;

    await prisma.invitationCodes.createMany({
        data: codes.map(code => ({ code })),
    });

    return codes;
}


export const verifyCode = async (code:string) => {
    const verified = await prisma.invitationCodes.findFirst({
        where: {
            code
        }
    })

    if (!verified) return false

    await prisma.invitationCodes.delete({
        where: {
            id: verified.id
        }
    })

    return true;
}