import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: Request) {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userDir = formData.get('userDir') as string | null

    if (!file || !userDir) {
        return NextResponse.json({ error: 'Missing file or userDir' }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_SIZE) {
        return NextResponse.json({ error: 'Max image size is 5MB.' }, { status: 400 })
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Only .jpg, .png, and .webp formats are supported.' }, { status: 400 })
    }

    const safeDir = userDir.replace(/[^a-zA-Z0-9_-]/g, '')
    const normalizedDir = safeDir || 'user'
    const extension = path.extname(file.name || '') || '.png'
    const fileName = `avatar${extension}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', normalizedDir)

    await fs.mkdir(uploadDir, { recursive: true })

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, fileName)
    await fs.writeFile(filePath, fileBuffer)

    return NextResponse.json({ url: `/uploads/${normalizedDir}/${fileName}` })
}
