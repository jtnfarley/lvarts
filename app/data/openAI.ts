'use server'

import OpenAI from 'openai';
import sharp from 'sharp';

interface AIRequest {
    model: string,
    input: string,
    tools?: any[]
}

interface AIImageRequest {
    model: string,
    prompt: string
}

export const getTextResponse = async (prompt:string, tools?:string[]) => {
    const client = new OpenAI();

    const request = {
        model: "gpt-5.4-nano",
        input: prompt
    } as AIRequest

    let aiTools = [];

    if (tools && tools.length) {
        for (const tool in tools) {
            aiTools.push({type: tool});
        }

        request.tools = aiTools;
    }

    const response = await client.responses.create(request);

    return response.output_text;
}

export const getImageResponse = async (prompt:string) => {
    const client = new OpenAI();

    const request = {
        model: 'gpt-image-1-mini',
        prompt,
        size: '1024x1024',
        quality: 'low'
    } as AIImageRequest

    const response = await client.images.generate(request);

    if (response && response.data && response.data.length && response.data[0].b64_json) {
        const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64');
        const optimizedImageBuffer = await sharp(imageBuffer)
            .resize({
                width: 800,
                height: 800,
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({
                quality: 70,
                effort: 6
            })
            .toBuffer();

        return new Blob([optimizedImageBuffer], { type: 'image/webp' });
    }
}
