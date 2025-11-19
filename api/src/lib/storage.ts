import { createClient } from '@supabase/supabase-js'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Upload file to Supabase Storage
export async function uploadFileToSupabase(
    file: Express.Multer.File,
    challengeId: string
): Promise<{ path: string; publicUrl: string }> {
    const bucket = 'challenge-files'

    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.find(b => b.name === bucket)) {
        await supabaseAdmin.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
        })
    }

    // Generate unique file path
    const fileExt = path.extname(file.originalname)
    const fileName = `${challengeId}/${Date.now()}-${file.originalname}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        })

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(fileName)

    return {
        path: fileName,
        publicUrl: urlData.publicUrl
    }
}

// Delete file from Supabase Storage
export async function deleteFileFromSupabase(filePath: string): Promise<void> {
    const bucket = 'challenge-files'

    const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath])

    if (error) {
        console.error('Failed to delete file:', error.message)
    }
}

// Get signed URL for private file (if needed)
export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const bucket = 'challenge-files'

    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn)

    if (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`)
    }

    return data.signedUrl
}
