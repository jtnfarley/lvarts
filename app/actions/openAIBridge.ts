'use server'

import { getTextResponse } from "@/app/data/openAI";

export const getAITextResponse = async (prompt:string):Promise<string> => {
    return await getTextResponse(prompt);
}