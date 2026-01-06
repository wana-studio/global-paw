import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
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
    locales: ['en', 'ar', 'fa'], // Added fa based on user name/context (MrMajidi/dastyar sounds Persian), safe to add. User explicitly mentioned multilingual.
    defaultLocale: 'en',
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
  plugins: [],
})
