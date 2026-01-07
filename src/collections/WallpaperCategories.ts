import { CollectionConfig } from 'payload'

export const WallpaperCategories: CollectionConfig = {
  slug: 'wallpaper-categories',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title.toLowerCase().replace(/ /g, '-')
            }
            return value
          },
        ],
      },
    },
  ],
  endpoints: [
    {
      path: '/grouped',
      method: 'get',
      handler: async (req) => {
        const { payload } = req
        const locale = (req as any).locale || 'en'

        // 1. Fetch all categories
        const categories = await payload.find({
          collection: 'wallpaper-categories',
          locale,
          limit: 100,
        })

        // 2. Fetch all wallpapers and group them
        const wallpapers = await payload.find({
          collection: 'wallpapers',
          locale,
          limit: 1000,
          depth: 1, // Get media details
        })

        const grouped = categories.docs.map((category) => {
          return {
            ...category,
            wallpapers: wallpapers.docs.filter((wallpaper) => {
              const catId =
                typeof wallpaper.category === 'object' ? wallpaper.category.id : wallpaper.category
              return catId === category.id
            }),
          }
        })

        return Response.json(grouped)
      },
    },
  ],
}
