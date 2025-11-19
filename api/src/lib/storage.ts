import { createClient } from '@supabase/supabase-js'
import path from 'path'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Initializing Supabase client...')
console.log('SUPABASE_URL:', supabaseUrl)
console.log('SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

console.log('✅ Supabase client initialized')

// Upload file to Supabase Storage
export async function uploadFileToSupabase(
    file: Express.Multer.File,
    challengeId: string
): Promise<{ path: string; publicUrl: string }> {
    console.log('📤 Starting file upload to Supabase...')
    console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? `${file.buffer.length} bytes` : 'NO BUFFER',
        challengeId
    })

    const bucket = 'challenge-files'

    // Create bucket if it doesn't exist
    console.log('🪣 Checking if bucket exists...')
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    if (listError) {
        console.error('❌ Error listing buckets:', listError)
        throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    console.log('Available buckets:', buckets?.map(b => b.name))
    if (!buckets?.find(b => b.name === bucket)) {
        console.log('🆕 Creating bucket:', bucket)
        const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
        })
        if (createError) {
            console.error('❌ Error creating bucket:', createError)
            throw new Error(`Failed to create bucket: ${createError.message}`)
        }
        console.log('✅ Bucket created successfully')
    }

    // Generate unique file path
    const fileExt = path.extname(file.originalname)
    const fileName = `${challengeId}/${Date.now()}-${file.originalname}`
    console.log('📁 Upload path:', fileName)

    // Upload to Supabase Storage
    console.log('⬆️ Uploading file to Supabase...')
    const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        })

    if (error) {
        console.error('❌ Upload error:', error)
        throw new Error(`Failed to upload file: ${error.message}`)
    }
    console.log('✅ File uploaded successfully:', data)

    // Get public URL
    console.log('🔗 Getting public URL...')
    const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(fileName)

    console.log('✅ Public URL generated:', urlData.publicUrl)
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
