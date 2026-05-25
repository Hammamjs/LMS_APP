import { config } from 'dotenv';
config();

import { hash } from 'bcrypt';
import axios from 'axios';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, Level } from '@prisma/client';

// -------------------------
// Prisma setup
// -------------------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// -------------------------
// Helpers
// -------------------------

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');

const randomFrom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomLevelSafe = (): Level => {
  const values = Object.values(Level);
  return values[Math.floor(Math.random() * values.length)];
};

const pickDynamicItems = (arr: string[], seed: string): string[] => {
  return [...arr]
    .sort(() => (seed.length % 2 === 0 ? 1 : -1))
    .slice(0, Math.min(3, arr.length));
};

// -------------------------
// Templates
// -------------------------

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

// -------------------------
// YouTube Types & API Contracts (لحل مشاكل الـ any)
// -------------------------

interface YouTubeThumbnail {
  url: string;
}

interface YouTubeThumbnails {
  high?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
}

interface PlaylistItem {
  snippet: {
    title: string;
    description?: string;
    channelId: string;
    thumbnails?: YouTubeThumbnails;
    resourceId?: {
      videoId?: string;
    };
  };
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description?: string;
    thumbnails?: YouTubeThumbnails;
  };
}

interface PlaylistInfo {
  snippet: {
    title: string;
    description?: string;
    thumbnails?: YouTubeThumbnails;
  };
}

// واجهات استجابة مخصصة لـ Axios لمنع الـ any
interface YouTubePlaylistsResponse {
  items?: PlaylistInfo[];
}

interface YouTubePlaylistItemsResponse {
  items?: PlaylistItem[];
}

interface YouTubeChannelsResponse {
  items?: YouTubeChannel[];
}

// -------------------------
// Course Creator
// -------------------------

async function createCourseFromPlaylist(playlistId: string, category: string) {
  const playlistInfoRes = await axios.get<YouTubePlaylistsResponse>(
    'https://www.googleapis.com/youtube/v3/playlists',
    {
      params: {
        part: 'snippet',
        id: playlistId,
        key: process.env.YOUTUBE_API_KEY,
      },
    },
  );

  const playlistSnippet = playlistInfoRes.data.items?.[0]?.snippet;
  if (!playlistSnippet)
    throw new Error(`Playlist ${playlistId} not found on YouTube`);

  const courseTitle = playlistSnippet.title;
  const courseDescription =
    playlistSnippet.description || 'No description available';

  const playlistItemsRes = await axios.get<YouTubePlaylistItemsResponse>(
    'https://www.googleapis.com/youtube/v3/playlistItems',
    {
      params: {
        part: 'snippet',
        playlistId,
        maxResults: 15,
        key: process.env.YOUTUBE_API_KEY,
      },
    },
  );

  const items: PlaylistItem[] = playlistItemsRes.data.items ?? [];
  if (!items.length) throw new Error('Empty playlist items');

  const firstItem = items[0].snippet;

  // 3. جلب بيانات القناة (المدرس)
  const channelRes = await axios.get<YouTubeChannelsResponse>(
    'https://www.googleapis.com/youtube/v3/channels',
    {
      params: {
        part: 'snippet',
        id: firstItem.channelId,
        key: process.env.YOUTUBE_API_KEY,
      },
    },
  );

  const channel: YouTubeChannel | undefined = channelRes.data.items?.[0];
  if (!channel) throw new Error('Channel not found');

  // -------------------------
  // Instructor (Safe Upsert)
  // -------------------------
  const instructorEmail = `${slugify(channel.snippet.title)}-${channel.id.slice(0, 5)}@youtube.local`;

  const instructorBio =
    channel.snippet.description?.trim() ||
    `Professional educator and content creator specializing in ${category}. Join my courses to boost your practical skills with real-world projects.`;

  const hashedPassword = await hash('password12345', 10);

  const instructor = await prisma.user.upsert({
    where: { id: channel.id },
    update: {},
    create: {
      id: channel.id,
      username: channel.snippet.title,
      email: instructorEmail,
      password: hashedPassword,
      role: Role.Instructor,
      bio: instructorBio,
      avatar: channel.snippet.thumbnails?.high?.url ?? null,
    },
  });

  // -------------------------
  // Course Creation
  // -------------------------
  const generatedSlug = `${slugify(courseTitle)}-${Math.floor(Math.random() * 10000)}`;

  const lessons = items.flatMap((item, index) => {
    const videoId = item.snippet.resourceId?.videoId;
    if (!videoId) return [];

    return [
      {
        title: item.snippet.title,
        description:
          item.snippet.description?.slice(0, 500) ??
          'No lesson description provided.',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        order: index + 1,
        duration: Math.floor(Math.random() * 1800),
      },
    ];
  });

  const generatedOriginalPrice = Math.floor(Math.random() * 300 + 100);

  // 2. Roll a random percentage off (e.g., between 15% and 60% off)
  const randomDiscountPercent = Math.floor(Math.random() * 45 + 15); // 15 to 60

  // 3. Calculate the actual final target dollar price based on that percentage
  const generatedDiscountPrice = Math.floor(
    generatedOriginalPrice * (1 - randomDiscountPercent / 100),
  );

  // 4. Create the course using the coupled prices
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

      // 💡 THE FIX: Use the coupled pricing values here
      originalPrice: generatedOriginalPrice,
      discountPrice: generatedDiscountPrice,

      duration: items.length * 600,

      level: randomLevelSafe(),
      category,

      image:
        playlistSnippet.thumbnails?.high?.url ??
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
} as const;

// -------------------------
// Playlists
// -------------------------
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

// -------------------------
// Main Executer
// -------------------------
async function main() {
  console.log('🚀 Starting Database Seeding...');
  for (const p of playlists) {
    try {
      await createCourseFromPlaylist(p.playlistId, p.category);
    } catch (err: unknown) {
      // إصلاح خطأ الـ ESLint الخاص بالـ unsafe error type value
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(
        `❌ Seed error for playlist ${p.playlistId}:`,
        errorMessage,
      );
    }
  }
}

main()
  .catch((err: unknown) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('💥 Fatal Seed Error:', errorMessage);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('🔌 Database Connections Disconnected Cleanly.');
  });
