import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, errorResponse, successResponse } from '@/lib/auth';
import { addMediaFile } from '@/lib/data';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const folder = (formData.get('folder') as string) || 'general';
    const projectId = (formData.get('projectId') as string) || undefined;

    const results = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: images and videos.` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 100MB.` },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop() || 'bin';
      const uniqueName = `${uuidv4()}.${ext}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
      const filePath = join(uploadDir, uniqueName);

      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });

      // Write file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const url = `/uploads/${folder}/${uniqueName}`;
      let thumbnailUrl: string | undefined;

      // Generate thumbnail for images
      if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
        try {
          const thumbName = `thumb_${uniqueName}`;
          const thumbPath = join(uploadDir, thumbName);
          await sharp(buffer)
            .resize(400, 300, { fit: 'cover' })
            .jpeg({ quality: 80 })
            .toFile(thumbPath);
          thumbnailUrl = `/uploads/${folder}/${thumbName}`;
        } catch (thumbErr) {
          console.warn('Thumbnail generation failed:', thumbErr);
        }
      }

      const mediaFile = await addMediaFile({
        filename: uniqueName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        thumbnailUrl,
        folder,
        projectId,
      });

      results.push(mediaFile);
    }

    return NextResponse.json(
      results.length === 1 ? results[0] : results,
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/upload error:', err);
    return errorResponse('Failed to upload files');
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
