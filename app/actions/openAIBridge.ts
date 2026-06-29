'use server'

import { getTextResponse } from "@/app/data/openAI";

export const getAITextResponse = async (prompt:string, tools?:any[]):Promise<any> => {
    return await getTextResponse(prompt, tools);
}