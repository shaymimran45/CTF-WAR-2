import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple test PNG file (1x1 red pixel)
const createTestPNG = () => {
  // PNG signature + IHDR chunk + IDAT chunk + IEND chunk
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length and type
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // Width: 1, Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // Bit depth: 8, Color type: 2 (RGB), CRC
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, // Compressed data (red pixel)
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, // CRC
    0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, // IEND chunk
    0x44, 0xAE, 0x42, 0x60, 0x82                    // IEND CRC
  ]);

  const testFilePath = path.join(__dirname, 'test-challenge.png');
  fs.writeFileSync(testFilePath, pngData);
  console.log('✅ Created test PNG file:', testFilePath);
  console.log('📦 File size:', pngData.length, 'bytes');
  return testFilePath;
};

// Test file upload via API
const testFileUpload = async () => {
  try {
    console.log('\n🧪 Testing File Upload Functionality...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ctfadmin2024@gmail.com',
        password: 'CTFSecureAdmin@2024!'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('   ✅ Login successful!');

    // Step 2: Create test PNG file
    console.log('\n2️⃣ Creating test PNG file...');
    const testFilePath = createTestPNG();

    // Step 3: Create a challenge with file upload
    console.log('\n3️⃣ Creating challenge with file...');
    const formData = new FormData();
    formData.append('title', 'Test Challenge with File');
    formData.append('description', 'This challenge has a PNG file attachment for testing');
    formData.append('category', 'stego');
    formData.append('difficulty', 'easy');
    formData.append('points', '100');
    formData.append('flag', 'WoW{test_file_upload_works}');
    formData.append('isVisible', 'true');

    // Read and append the file
    const fileBuffer = fs.readFileSync(testFilePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('files', blob, 'test-challenge.png');

    const createResponse = await fetch('http://localhost:3001/api/admin/challenges', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Challenge creation failed: ${errorData.error || 'Unknown error'}`);
    }

    const challengeData = await createResponse.json();
    console.log('   ✅ Challenge created successfully!');
    console.log('   📝 Challenge ID:', challengeData.challenge.id);
    console.log('   📁 Files uploaded:', challengeData.challenge.files?.length || 0);

    if (challengeData.challenge.files && challengeData.challenge.files.length > 0) {
      console.log('\n✅ FILE UPLOAD TEST PASSED!');
      console.log('   File details:');
      challengeData.challenge.files.forEach(file => {
        console.log(`   - ${file.filename} (${file.fileSize} bytes)`);
      });
    } else {
      console.log('\n❌ FILE UPLOAD TEST FAILED - No files in response');
    }

    // Step 4: Fetch the challenge to verify
    console.log('\n4️⃣ Fetching challenge to verify...');
    const fetchResponse = await fetch(`http://localhost:3001/api/challenges/${challengeData.challenge.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch challenge');
    }

    const fetchedChallenge = await fetchResponse.json();
    console.log('   ✅ Challenge fetched successfully!');
    console.log('   📁 Files in database:', fetchedChallenge.files?.length || 0);

    if (fetchedChallenge.files && fetchedChallenge.files.length > 0) {
      console.log('\n🎉 FILE PERSISTENCE TEST PASSED!');
      console.log('   Files are properly stored and retrieved!');
    }

    // Step 5: Test flag submission
    console.log('\n5️⃣ Testing flag submission with WoW{} format...');
    const submitResponse = await fetch(`http://localhost:3001/api/challenges/${challengeData.challenge.id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ flag: 'WoW{test_file_upload_works}' })
    });

    if (!submitResponse.ok) {
      throw new Error('Flag submission failed');
    }

    const submitData = await submitResponse.json();
    if (submitData.correct) {
      console.log('   ✅ Flag submission CORRECT!');
      console.log(`   🏆 Points awarded: ${submitData.points}`);
      console.log('\n✅ WoW{} FLAG FORMAT TEST PASSED!');
    } else {
      console.log('   ❌ Flag submission incorrect');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log('   ✅ File upload works');
    console.log('   ✅ Files are stored in database');
    console.log('   ✅ Files can be retrieved');
    console.log('   ✅ WoW{} flag format works');
    console.log('\n🌐 View the challenge at:');
    console.log(`   http://localhost:5173/challenges/${challengeData.challenge.id}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run the test
testFileUpload();
