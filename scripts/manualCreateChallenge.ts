import 'dotenv/config'
import { createChallenge } from '../api/src/controllers/challengeController'
import type { AuthenticatedRequest } from '../api/src/lib/auth'
import type { Response, Express } from 'express'
import { Readable } from 'stream'

class MockResponse {
    statusCode = 200

    status(code: number): this {
        this.statusCode = code
        return this
    }

    json(payload: unknown): this {
        console.log('Response Status:', this.statusCode)
        console.dir(payload, { depth: null })
        return this
    }
}

async function main(): Promise<void> {
    const buffer = Buffer.from('Hello Supabase Storage!')
    const stream = Readable.from(buffer)

    const file: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'manual-test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: buffer.length,
        buffer,
        destination: '',
        filename: 'manual-test.txt',
        path: '',
        stream
    }

    const req = {
        body: {
            title: 'Manual Test Challenge',
            description: 'Created via manual script',
            category: 'web',
            difficulty: 'easy',
            points: '50',
            flag: 'WoW{manual_test}',
            isVisible: 'true'
        },
        files: [file],
        user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@example.com',
            username: 'admin',
            role: 'admin'
        }
    } as unknown as AuthenticatedRequest & { files: Express.Multer.File[] }

    const res = new MockResponse() as unknown as Response

    await createChallenge(req, res)
}

main().catch((error) => {
    console.error('Manual challenge creation failed:', error)
    process.exit(1)
})
