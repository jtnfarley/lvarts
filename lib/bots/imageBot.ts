
import { prisma } from '@/prisma';
import { getImageResponse } from '@/lib/ai';
import { claimAiUse, releaseAiUse, type UsageRules } from '@/lib/aiUsage';
import { uploadFile } from '@/lib/bunny';
import { getBotPost } from '@/app/data/botHelper';
import { saveTrustedPost } from '@/lib/posts/savePost';
import { parseText } from '../utils';

type PaintingRequest = { postid: number; prompt: string; userdetailsid: number; userdir: string };

// Each painting costs real money, so it is limited per person and across the whole site.
// Both painters share one pool. At the site limit the worst case is about $0.13 a day.
const PAINTING_RULES: UsageRules = { perUserLimit: 3, siteLimit: 60, windowHours: 24 };

const DECLINED_REPLIES = {
    user: "I've painted enough for one day. Ask me again tomorrow.",
    site: 'The studio has run out of paint for today. Try again tomorrow.',
};

const saveBotComment = async (params: { postid: number; userdetailsid: number; content: string; file?: File }) => {
    const { postid, userdetailsid, content, file } = params;
    const formattedPost = getBotPost(content);

    await saveTrustedPost({
        content: formattedPost.content,
        lexical: JSON.stringify(formattedPost.lexical),
        userdetailsid,
        posttype: 'comment',
        parentPostId: postid,
        edited: false,
        ...(file ? { postfile: file.name, postfiletype: file.type } : {}),
    });
};

// The entry point for mentions of a painter: counts the request against the requester's
// limits, and answers in character instead of staying silent when it is over them.
export const requestPainting = async (request: PaintingRequest & { requesterUserdetailsId: number }) => {
    const { requesterUserdetailsId, ...painting } = request;

    const claim = await claimAiUse('image', requesterUserdetailsId, PAINTING_RULES);
    if (!claim.ok) {
        await saveBotComment({ postid: painting.postid, userdetailsid: painting.userdetailsid, content: DECLINED_REPLIES[claim.reason] });
        return;
    }

    try {
        await imageBot(painting);
    } catch (error) {
        await releaseAiUse(claim.id);
        throw error;
    }
};

export const imageBot = async (postObj: PaintingRequest) => {
    const {postid, prompt, userdetailsid, userdir} = postObj;

    if (!postid || !prompt || !userdetailsid || !userdir) return;
    
    const post = await prisma.posts.findFirst({
        where: {
            id: postid
        },
        select: {
            lexical: true
        }
    })

    let text = '';

    if (post && post.lexical) {
        text = parseText(post.lexical);
    }
    
    const fullPrompt = `${prompt} ${text}`;

    const response = await getImageResponse(fullPrompt);
    if (!response) throw new Error('The image model returned no image');

    const name = `${Math.random().toString(36).substring(2, 10)}.webp`;

    const file = new File([response], name, {type: 'image/webp'})

    await uploadFile({file, userdir})

    await saveBotComment({ postid, userdetailsid, content: '', file });
}



// export const poems = [
//     {
//         id: "lais",
//         title: "LAIS",
//         lines: `Let her who walks in Paphos
//         take the glass, 
//         let Paphos take the mirror 
//         and the work of frosted fruit, g
//         old apples set
//         with silver apple-leaf,
//         white leaf of silver
//         wrought with vein of gilt.

//         Let Paphos lift the mirror;
//         let her look
//         into the polished center of the disk.

//         Let Paphos take the mirror:
//         did she press
//         flowerlet of flame-flower
//         to the lustrous white
//         of the white forehead?
//         did the dark veins beat
//         a deeper purple
//         than the wine-deep tint
//         of the dark flower?

//         Did she deck black hair,
//         one evening, with the winter-white
//         flower of the winter-berry?
//         Did she look (reft of her lover)
//         at a face gone white
//         under the chaplet
//         of white virgin-breath?

//         Lais, exultant, tyrannizing Greece,
//         Lais who kept her lovers in the porch,
//         lover on lover waiting
//         (but to creep
//         where the robe brushed the threshold
//         where still sleeps Lais),
//         so she creeps, Lais,
//         to lay her mirror at the feet
//         of her who reigns in Paphos.

//         Lais has left her mirror,
//         for she sees no longer
//         in its depth
//         the Lais' self
//         that laughed exultant,
//         tyrannizing Greece.

//         Lais has left her mirror,
//         for she weeps no longer,
//         finding in its depth
//         a face, but other
//         than dark flame and white
//         feature of perfect marble.

//         Lais has left her mirror
//         (so one wrote)
//         to her who reigns in Paphos;
//         Lais who laughed a tyrant over Greece,
//         Lais who turned the lovers from the porch,
//         that swarm for whom now
//         Lais has no use;
//         Lais is now no lover of the glass,
//         seeing no more the face as once it was,
//         wishing to see that face and finding this.`,
//         source: 'https://www.gutenberg.org/cache/epub/25880/pg25880-images.html#LAIS',
//         publicationDate: 1922
//     },
//     {
//         id: "sea-rose",
//         title: "SEA ROSE",
//         lines: `Rose, harsh rose,
//         marred and with stint of petals,
//         meagre flower, thin,
//         sparse of leaf,

// more precious
// than a wet rose
// single on a stem—
// you are caught in the drift.

// Stunted, with small leaf,
// you are flung on the sand,
// you are lifted in the crisp sand
// that drives in the wind.

// Can the spice-rose
// drip such acrid fragrance
// hardened in a leaf?`,
//         source: 'https://www.gutenberg.org/cache/epub/28665/pg28665-images.html#Page_1',
//         publicationDate: 1916
//     },
//     {
//         id: "sea-lily",
//         title: "SEA LILY",
//         lines: `Reed,
//         slashed and torn
//         but doubly rich—
//         such great heads as yours
//         drift upon temple-steps,
//         but you are shattered
//         in the wind.

// Myrtle-bark
// is flecked from you,
// scales are dashed
// from your stem,
// sand cuts your petal,
// furrows it with hard edge,
// like flint
// on a bright stone.

// Yet though the whole wind
// slash at your bark,
// you are lifted up,
// aye—though it hiss
// to cover you with froth.`,
//         source: 'https://www.gutenberg.org/cache/epub/28665/pg28665-images.html#Page_12',
//         publicationDate: 1916
//     },
// ]
