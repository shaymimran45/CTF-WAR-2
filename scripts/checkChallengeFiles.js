import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data, error } = await supabase
    .from('challenge_files')
    .select('id, challenge_id, filename, file_path, file_size, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching challenge_files:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No challenge files found in Supabase.')
    return
  }

  console.log('Latest challenge files:')
  for (const row of data) {
    console.log(`- ${row.filename} (${row.file_size} bytes) uploaded at ${row.uploaded_at}`)
    console.log(`  Challenge ID: ${row.challenge_id}`)
    console.log(`  Storage path: ${row.file_path}`)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
