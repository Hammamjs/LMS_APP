"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const bcrypt_1 = require("bcrypt");
const axios_1 = __importDefault(require("axios"));
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const slugify = (text) => text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomLevelSafe = () => {
    const values = Object.values(client_1.Level);
    return values[Math.floor(Math.random() * values.length)];
};
const pickDynamicItems = (arr, seed) => {
    return [...arr]
        .sort(() => (seed.length % 2 === 0 ? 1 : -1))
        .slice(0, Math.min(3, arr.length));
};
const template = {
    requirements: [
        'No experience required',
        'Basic computer knowledge',
        'Internet access',
    ],
    whatYouLearn: ['Core concepts', 'Practical skills', 'Real projects'],
    targetAudience: ['Beginners', 'Students', 'Self learners'],
    languages: ['English'],
};
async function createCourseFromPlaylist(playlistId, category) {
    const playlistInfoRes = await axios_1.default.get('https://www.googleapis.com/youtube/v3/playlists', {
        params: {
            part: 'snippet',
            id: playlistId,
            key: process.env.YOUTUBE_API_KEY,
        },
    });
    const playlistSnippet = playlistInfoRes.data.items?.[0]?.snippet;
    if (!playlistSnippet)
        throw new Error(`Playlist ${playlistId} not found on YouTube`);
    const courseTitle = playlistSnippet.title;
    const courseDescription = playlistSnippet.description || 'No description available';
    const playlistItemsRes = await axios_1.default.get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
            part: 'snippet',
            playlistId,
            maxResults: 15,
            key: process.env.YOUTUBE_API_KEY,
        },
    });
    const items = playlistItemsRes.data.items ?? [];
    if (!items.length)
        throw new Error('Empty playlist items');
    const firstItem = items[0].snippet;
    const channelRes = await axios_1.default.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
            part: 'snippet',
            id: firstItem.channelId,
            key: process.env.YOUTUBE_API_KEY,
        },
    });
    const channel = channelRes.data.items?.[0];
    if (!channel)
        throw new Error('Channel not found');
    const instructorEmail = `${slugify(channel.snippet.title)}-${channel.id.slice(0, 5)}@youtube.local`;
    const instructorBio = channel.snippet.description?.trim() ||
        `Professional educator and content creator specializing in ${category}. Join my courses to boost your practical skills with real-world projects.`;
    const hashedPassword = await (0, bcrypt_1.hash)('password12345', 10);
    const instructor = await prisma.user.upsert({
        where: { id: channel.id },
        update: {},
        create: {
            id: channel.id,
            username: channel.snippet.title,
            email: instructorEmail,
            password: hashedPassword,
            role: client_1.Role.Instructor,
            bio: instructorBio,
            avatar: channel.snippet.thumbnails?.high?.url ?? null,
        },
    });
    const generatedSlug = `${slugify(courseTitle)}-${Math.floor(Math.random() * 10000)}`;
    const lessons = items.flatMap((item, index) => {
        const videoId = item.snippet.resourceId?.videoId;
        if (!videoId)
            return [];
        return [
            {
                title: item.snippet.title,
                description: item.snippet.description?.slice(0, 500) ??
                    'No lesson description provided.',
                url: `https://www.youtube.com/watch?v=${videoId}`,
                order: index + 1,
                duration: Math.floor(Math.random() * 1800),
            },
        ];
    });
    const generatedOriginalPrice = Math.floor(Math.random() * 300 + 100);
    const randomDiscountPercent = Math.floor(Math.random() * 45 + 15);
    const generatedDiscountPrice = Math.floor(generatedOriginalPrice * (1 - randomDiscountPercent / 100));
    const course = await prisma.course.create({
        data: {
            title: courseTitle,
            subtitle: `Complete masterclass on ${courseTitle}`,
            description: courseDescription,
            requirements: pickDynamicItems(template.requirements, courseTitle),
            whatYouLearn: pickDynamicItems(template.whatYouLearn, courseTitle),
            targetAudience: pickDynamicItems(template.targetAudience, courseTitle),
            language: randomFrom(template.languages),
            slug: generatedSlug,
            originalPrice: generatedOriginalPrice,
            discountPrice: generatedDiscountPrice,
            duration: items.length * 600,
            level: randomLevelSafe(),
            category,
            image: playlistSnippet.thumbnails?.high?.url ??
                playlistSnippet.thumbnails?.medium?.url ??
                `https://placehold.co/600x400?text=${encodeURIComponent(courseTitle)}`,
            instructorId: instructor.id,
            lessons: {
                create: lessons,
            },
        },
        include: {
            lessons: true,
            instructor: true,
        },
    });
    console.log('✅ Seed Success:');
    console.log(`Course Title : ${course.title}`);
    console.log(`Lessons Count: ${course.lessons.length}`);
    console.log(`Instructor   : ${instructor.username}`);
    console.log('-----------------------------------');
}
const category = {
    web: 'Web Development',
    security: 'Security',
    problem: 'Psv',
    math: 'Mathmatics',
    mobile: 'Mobile Development',
    system: 'System Design',
    marketing: 'Marketing',
};
const playlists = [
    {
        category: category.security,
        playlistId: 'PLv7cogHXoVhXvHPzIl1dWtBiYUAL8baHj',
    },
    {
        category: category.security,
        playlistId: 'PLlgLmuG_Kgba6K93PuVuf9aP_UFnm7mCl',
    },
    {
        category: category.security,
        playlistId: 'PLEocw3gLFc8X_a8hGWGaBnSkPFJmbb8QP',
    },
    {
        category: category.security,
        playlistId: 'PL9ooVrP1hQOGPQVeapGsJCktzIO4DtI4_',
    },
    {
        category: category.security,
        playlistId: 'PLBf0hzazHTGMjSlPmJ73Cydh9vCqxukCu',
    },
    {
        category: category.security,
        playlistId: 'PLlrxD0HtieHhXnVUQM42aKRPrirbUIDdh',
    },
    {
        category: category.math,
        playlistId: 'PLF797E961509B4EB5',
    },
    {
        category: category.math,
        playlistId: 'PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr',
    },
    {
        category: category.math,
        playlistId: 'PL590CCC2BC5AF3BC1',
    },
    {
        category: category.math,
        playlistId: 'PLSQl0a2vh4HAxgGKXD5Oc_eELflPEddPx',
    },
    {
        category: category.math,
        playlistId: 'PLDesaqWTN6ESsmwELdrzhcGiRhk5DjwLP',
    },
    {
        category: category.math,
        playlistId: 'PLgIi4lM74yW0ChmzTdT1w5ruCnqP0bv3J',
    },
];
async function main() {
    console.log('🚀 Starting Database Seeding...');
    for (const p of playlists) {
        try {
            await createCourseFromPlaylist(p.playlistId, p.category);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`❌ Seed error for playlist ${p.playlistId}:`, errorMessage);
        }
    }
}
main()
    .catch((err) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('💥 Fatal Seed Error:', errorMessage);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Database Connections Disconnected Cleanly.');
});
//# sourceMappingURL=seed.js.map