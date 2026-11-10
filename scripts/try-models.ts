// Compares OpenRouter models on the app's real AI prompts so the defaults in lib/ai.ts are
// chosen by output quality, not guesswork. Costs a few cents at most.
//   npm run try-models -- model-a model-b ...        (text models)
//   npm run try-models -- --image google/gemini-2.5-flash-image
import { SUPPORT_KNOWLEDGE } from '../lib/supportKnowledge';

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY');

const post = 'Just finished a mural of a heron on the side of the old Bethlehem Steel warehouse. Wind made it hard but worth it.';

const supportPrompt = (message: string) => `You are the support assistant for Lehigh Valley Art & Music, a social platform for the local arts community.

Here is accurate information about how the site works. Use only this information when describing steps, buttons, toggles, or file-format requirements — do not invent UI elements or capabilities that aren't listed here. If the user's question isn't covered below, say you're not sure rather than guessing.

${SUPPORT_KNOWLEDGE}

Conversation so far:


User: ${message}

Respond in exactly this format:
STATUS: resolved|unknown|issue

<your reply>

- Use "issue" if the user is reporting something broken or not working.
- Use "unknown" if their question isn't covered by the information above and you can't confidently answer it.
- Use "resolved" only if you gave a complete answer grounded in the information above.`;

const cases = [
	{ name: 'aiify weird', prompt: `You are a weird person. Rewrite this post in a weird tone: ${post}. keep the response under 400 characters. if weird === 'weird', then get weird with it.` },
	{ name: 'aiify deadpan', prompt: `You are a deadpan person. Rewrite this post in a deadpan tone: ${post}. keep the response under 400 characters.` },
	{ name: 'hd poem', prompt: `You are the imagist poet H. D. Write a 6-line poem about ${post}` },
	{ name: 'support resolved', prompt: supportPrompt('How do I add an image to the gallery?'), expectStatus: 'resolved' },
	{ name: 'support issue', prompt: supportPrompt('My image upload keeps failing with an error'), expectStatus: 'issue' },
	{ name: 'support unknown', prompt: supportPrompt('Can I sell tickets to my show through the site?'), expectStatus: 'unknown' },
];

const post_ = async (path: string, body: unknown) => {
	const response = await fetch(`https://openrouter.ai/api/v1${path}`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(90_000),
	});
	const text = await response.text();
	return { status: response.status, text };
};

const tryText = async (model: string) => {
	console.log(`\n==================== ${model}`);
	for (const testCase of cases) {
		const started = Date.now();
		const { status, text } = await post_('/chat/completions', {
			model,
			max_tokens: 500,
			reasoning: { enabled: false },
			temperature: testCase.expectStatus ? 0 : 1,
			messages: [{ role: 'user', content: testCase.prompt }],
		});
		const seconds = ((Date.now() - started) / 1000).toFixed(1);
		if (status !== 200) {
			console.log(`--- ${testCase.name}: HTTP ${status} (${seconds}s) ${text.slice(0, 200)}`);
			continue;
		}
		const json = JSON.parse(text);
		const content: string = json.choices?.[0]?.message?.content ?? '';
		const cost = json.usage?.cost;
		let verdict = '';
		if (testCase.expectStatus) {
			const match = /^STATUS:\s*(resolved|unknown|issue)/i.exec(content.split('\n')[0]);
			verdict = match ? (match[1].toLowerCase() === testCase.expectStatus ? ' [status OK]' : ` [status ${match[1]}, wanted ${testCase.expectStatus}]`) : ' [NO STATUS LINE]';
		}
		console.log(`--- ${testCase.name}: ${seconds}s, ${content.length} chars, cost ${cost ?? '?'}${verdict}`);
		console.log(content.trim() || '(empty)');
	}
};

const tryImage = async (model: string) => {
	const prompt = `You are the painter Walter Emerson Baum. Create a painting about ${post}`;
	for (const [label, path, body] of [
		['/images', '/images', { model, prompt }],
		['chat modalities', '/chat/completions', { model, modalities: ['image', 'text'], messages: [{ role: 'user', content: prompt }] }],
	] as const) {
		const started = Date.now();
		const { status, text } = await post_(path, body);
		console.log(`${label}: HTTP ${status} in ${((Date.now() - started) / 1000).toFixed(1)}s`);
		console.log(text.length > 600 ? `${text.slice(0, 300)} ... [${text.length} chars]` : text);
		if (status === 200) return;
	}
};

const args = process.argv.slice(2);
const main = async () => {
	if (args[0] === '--image') {
		await tryImage(args[1]);
		return;
	}
	for (const model of args) await tryText(model);
};

main().then(() => process.exit(0), (error) => { console.error(error); process.exit(1); });
