import OpenAI from 'openai';

interface AIRequest {
    model: string,
    input: string,
    tools?: any[]
}

interface AIImageRequest {
    model: string,
    prompt: string
}

export const getTextResponse = async (prompt:string, model:string, tools?:string[]) => {
    const client = new OpenAI();

    const request = {
        model,
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
        const image_base64 = await fetch(`data:image/jpeg;base64,${response.data[0].b64_json}`);
        const image_bytes = image_base64.blob();

        return image_bytes;
    }
}