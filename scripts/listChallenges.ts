import 'dotenv/config'
import prisma from '../api/src/lib/prisma'

async function main(): Promise<void> {
    const challenges = await prisma.challenge.findMany({
        include: {
            files: true
        }
    })

    if (challenges.length === 0) {
        console.log('No challenges found')
        return
    }

    for (const challenge of challenges) {
        console.log(`- ${challenge.title} (${challenge.id})`)
        console.log(`  Files: ${challenge.files?.length ?? 0}`)
        if (challenge.files) {
            for (const file of challenge.files) {
                console.log(`    • ${file.filename} -> ${file.filePath}`)
            }
        }
    }
}

main().catch((err) => {
    console.error('Error listing challenges:', err)
    process.exit(1)
})
