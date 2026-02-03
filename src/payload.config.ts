import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { WallpaperCategories } from './collections/WallpaperCategories'
import { Wallpapers } from './collections/Wallpapers'
import { Cities } from './collections/Cities'
import { CalendarEvents } from './collections/CalendarEvents'
import { SearchSuggestions } from './collections/SearchSuggestions'
import { AISuggestions } from './collections/AISuggestions'
import { Timezones } from './collections/Timezones'
import { Conversations } from './collections/Conversations'
import { Messages } from './collections/Messages'
import { Users } from './collections/Users'
import { AppUsers } from './collections/AppUsers'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  cors: {
    origins: '*',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    AppUsers,
    Media,
    WallpaperCategories,
    Wallpapers,
    Cities,
    CalendarEvents,
    SearchSuggestions,
    AISuggestions,
    Timezones,
    Conversations,
    Messages,
  ],
  localization: {
    locales: ['en', 'ar'],
    defaultLocale: 'ar',
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || '',
        forcePathStyle: true, // Required for Supabase S3-compatible storage
      },
    }),
  ],
})
