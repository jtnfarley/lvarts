// Trusted: these spend OpenRouter credits for whatever prompt the caller passes, with NO
// authorization. Only server code that has already decided the prompt is allowed may call
// them (the AI bots and the guarded actions in app/actions). They must never be exported
// from a 'use server' file, because every export of one is callable by any browser.
import sharp from 'sharp';
import { z } from 'zod';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';
const TEXT_TIMEOUT_MS = 30_000;
const IMAGE_TIMEOUT_MS = 60_000;

// Models are tried in order: OpenRouter moves to the next one when a model is rate limited or
// errors, which free models do often. Override a list with a comma-separated environment
// variable. Compare candidates on real prompts with `npm run try-models`.
const modelList = (envName: string, defaults: string[]): string[] => {
    const configured = process.env[envName]?.split(',').map((model) => model.trim()).filter(Boolean);
    return configured?.length ? configured : defaults;
};

// Free models first, then a cheap paid model as the safety net.
const FREE_THEN_PAID_MODELS = [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3.5-lightning:free',
    'mistralai/mistral-small-24b-instruct-2501',
];

const creativeModels = () => modelList('AI_CREATIVE_MODELS', FREE_THEN_PAID_MODELS);

// Same free-first chain. Free providers may keep prompts, so the support chat's messages can
// be retained by them; a reply that skips the STATUS line is treated as resolved.
const supportModels = () => modelList('AI_SUPPORT_MODELS', FREE_THEN_PAID_MODELS);

const imageModel = () => process.env.AI_IMAGE_MODEL?.trim() || 'openai/gpt-5-image-mini';

const postToOpenRouter = async <T>(path: string, body: unknown, schema: z.ZodType<T>, timeoutMs: number): Promise<T> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY environment variable');

    const response = await fetch(`${OPENROUTER_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
        throw new Error(`OpenRouter ${path} failed (${response.status}): ${(await response.text()).slice(0, 300)}`);
    }
    return schema.parse(await response.json());
};

const chatResponseSchema = z.object({
    choices: z.array(z.object({ message: z.object({ content: z.string().nullish() }) })).min(1),
});

type TextOptions = {
    temperature?: number;
    kind?: 'creative' | 'support';
};

export const getTextResponse = async (prompt: string, options: TextOptions = {}): Promise<string> => {
    const result = await postToOpenRouter('/chat/completions', {
        models: options.kind === 'support' ? supportModels() : creativeModels(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: options.temperature,
        // Reasoning models can spend the whole token budget thinking and return nothing.
        reasoning: { enabled: false },
    }, chatResponseSchema, TEXT_TIMEOUT_MS);

    const text = result.choices[0].message.content?.trim();
    if (!text) throw new Error('The AI model returned an empty reply');
    return text;
};

const imageResponseSchema = z.object({
    data: z.array(z.object({ b64_json: z.string().nullish() })),
});

export const getImageResponse = async (prompt: string) => {
    const result = await postToOpenRouter('/images', {
        model: imageModel(),
        prompt,
        quality: 'low',
        aspect_ratio: '1:1',
        output_format: 'webp',
    }, imageResponseSchema, IMAGE_TIMEOUT_MS);

    const base64Image = result.data[0]?.b64_json;
    if (!base64Image) return undefined;

    const optimizedImageBuffer = await sharp(Buffer.from(base64Image, 'base64'))
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

    return new Blob([new Uint8Array(optimizedImageBuffer)], { type: 'image/webp' });
};
