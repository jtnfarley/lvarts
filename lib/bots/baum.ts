
import { prisma } from '@/prisma';
import { getImageResponse } from '@/app/data/openAI';
import uploadFile from '@/app/actions/fileUploader';
import { getBotPost } from '@/app/data/botHelper';
import { savePost } from '@/app/data/posts';

export const baumBot = async (postid:number) => {
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
        const parsed = JSON.parse(post.lexical);
        text = parsed.root.children[0].children[0].text;
    }

    const prompt = `You are the painter Walter Emerson Baum who founded the Baum School of Art and the Allentown Art Museum. Create a  painting about ${text}`;

    const response = await getImageResponse(prompt);

    if (response) {

        const name = `${Math.random().toString(36).substring(2, 10)}.png`;

        const file = new File([response], name, {type: 'image/png'})

        await uploadFile({file, userdir: 'baum'})

        const formattedPost = getBotPost('');
        
        const postCreate = {
            content: formattedPost.content, 
            lexical: JSON.stringify(formattedPost.lexical), 
            userdetailsid: 13, 
            posttype: 'comment', 
            parentPostId: postid, 
            edited: false,
            postfile: file.name,
            postfiletype: file.type
        }

        await savePost(postCreate);
    }
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