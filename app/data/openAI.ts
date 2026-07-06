'use server'

import OpenAI from 'openai';
import sharp from 'sharp';
import Anthropic from "@anthropic-ai/sdk";

interface AIImageRequest {
    model: string,
    prompt: string
}

export const getTextResponse = async (prompt:string, tools?:string[], temperature?:number) => {
    const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });

    const message = await client.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        temperature,
        messages: [
            {
            role: "user",
            content: prompt
            }
        ]
    });
    const block = message.content[0];
    return block.type === 'text' ? block.text : '';
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

    if (response?.data?.length && response.data[0].b64_json) {
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
        const optimizedImageBytes = new Uint8Array(optimizedImageBuffer);

        return new Blob([optimizedImageBytes], { type: 'image/webp' });
    }
}
