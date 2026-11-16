export const MAX_POST_IMAGES = 10

const MAX_FILENAME_LENGTH = 200

// Filenames come from the browser and become CDN paths, so reject anything that could
// climb out of the author's folder.
const isSafeFilename = (name: unknown): name is string =>
    typeof name === 'string' &&
    name.length > 0 &&
    name.length <= MAX_FILENAME_LENGTH &&
    !name.includes('/') &&
    !name.includes('\\') &&
    !name.includes('..')

// Validates the ordered image list a client sends. The first file is the post's cover
// (posts.postfile); the rest go in postimages.
export const parsePostFiles = (value: unknown): { cover: string | null; extras: string[] } => {
    if (!Array.isArray(value)) throw new Error('postfiles must be an array')
    if (value.length > MAX_POST_IMAGES) throw new Error(`A post can have at most ${MAX_POST_IMAGES} images`)

    const names = value.filter(isSafeFilename)
    if (names.length !== value.length) throw new Error('Invalid image filename')
    if (new Set(names).size !== names.length) throw new Error('Duplicate image filename')

    return { cover: names[0] ?? null, extras: names.slice(1) }
}
