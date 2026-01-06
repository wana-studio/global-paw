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
}
