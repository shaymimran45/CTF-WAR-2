# Supabase Storage Integration - Complete Guide

## Overview
All file uploads now use Supabase Storage instead of local filesystem. This ensures file persistence in production environments like Render.

## What Changed

### 1. Storage Helper (`api/src/lib/storage.ts`)
Created Supabase Storage helper functions:
- **`uploadFileToSupabase(file, challengeId)`** - Uploads files to 'challenge-files' bucket
- **`deleteFileFromSupabase(filePath)`** - Deletes files from bucket
- **`getSignedUrl(filePath, expiresIn)`** - Generates temporary signed URLs

**Features:**
- Auto-creates 'challenge-files' bucket if missing
- Public bucket for direct file access
- 10MB file size limit
- Files organized by challenge ID: `{challengeId}/{timestamp}-{filename}`

### 2. Multer Configuration (`api/src/routes/index.ts`)
Changed from `diskStorage` to `memoryStorage`:
```typescript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})
```

Files now stored in memory as buffers, then uploaded to Supabase.

### 3. Challenge Controller Updates (`api/src/controllers/challengeController.ts`)

#### `createChallenge()`
- Uses `uploadFileToSupabase()` for each file
- Stores Supabase public URL in database `filePath` column
- Parallel uploads with `Promise.all()`

#### `addFilesToChallenge()`
- Same Supabase upload logic
- Returns updated challenge with file metadata

#### `downloadFile()`
- Redirects to Supabase public URL (stored in `filePath`)
- No local filesystem access

#### `deleteChallenge()`
- Extracts file paths from public URLs
- Calls `deleteFileFromSupabase()` for cleanup
- Deletes challenge after files removed

#### `deleteChallengeFile()`
- Extracts path from public URL
- Deletes from Supabase Storage
- Removes database record

## Environment Variables Required
Ensure these are set in `.env` and Render:
```
SUPABASE_URL=https://vfhilobaycsxwbjojgjc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema
The `challenge_files` table stores:
- `filename` - Original filename
- `filePath` - **Supabase public URL** (not local path)
- `fileSize` - File size in bytes
- `challengeId` - Reference to challenge

## Supabase Storage Bucket
**Bucket Name:** `challenge-files`
**Configuration:**
- Public access enabled
- 10MB max file size
- Auto-created on first upload

**File Structure:**
```
challenge-files/
  ├── {challengeId}/
  │   ├── {timestamp}-file1.png
  │   ├── {timestamp}-file2.zip
  │   └── ...
```

## Testing

### 1. Upload Test
1. Login as admin: `ctfadmin2024@gmail.com` / `CTFSecureAdmin@2024!`
2. Go to Admin Panel
3. Click "Add New Challenge"
4. Fill form and upload file (PNG, ZIP, etc.)
5. Click "Create Challenge"

### 2. Verify Storage
- Go to Supabase Dashboard → Storage → challenge-files
- Check that file appears in bucket

### 3. Download Test
1. View challenge in main challenges page
2. Click download button on file
3. File should download from Supabase URL

### 4. Delete Test
1. In Admin Panel, click trash icon on file
2. File should be removed from both database and Supabase Storage

## Production Deployment (Render)

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Environment Variables
Add in Render dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- All other existing variables

**No need to configure uploads directory** - all files in Supabase!

## File Flow

### Upload Flow
1. User uploads file via form
2. Multer stores in memory (buffer)
3. `uploadFileToSupabase()` uploads to Supabase
4. Public URL returned: `https://vfhilobaycsxwbjojgjc.supabase.co/storage/v1/object/public/challenge-files/{challengeId}/{timestamp}-{filename}`
5. URL stored in database `challenge_files.filePath`

### Download Flow
1. User clicks download button
2. Request to `/api/files/:id`
3. `downloadFile()` queries database for file
4. Redirects to Supabase public URL
5. Browser downloads directly from Supabase

### Delete Flow
1. Admin deletes challenge or file
2. Extract path from public URL using regex
3. Call `deleteFileFromSupabase(path)`
4. Remove database record

## Troubleshooting

### Files not uploading
- Check `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
- Check Supabase Storage enabled in project
- Check file size < 10MB

### Files not downloading
- Check `filePath` contains public URL (not local path)
- Check bucket is public
- Check file exists in Supabase Storage

### Bucket not created
- First upload auto-creates bucket
- Manually create in Supabase: Storage → New Bucket → "challenge-files" (public)

## Security Notes
- Service role key has admin access - keep secret
- Public bucket allows anyone with URL to download
- Consider signed URLs for private files
- 10MB limit prevents abuse

## Migration from Local Storage
If you have existing challenges with local files:
1. Files in old `uploads/` folder won't work in production
2. Re-upload files via Admin Panel
3. Old local files can be deleted

## Next Steps
- Test file upload end-to-end
- Deploy to Render
- Verify files persist after restart
- Check download links work
