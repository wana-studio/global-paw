import { CollectionConfig } from 'payload'

export const SearchSuggestions: CollectionConfig = {
  slug: 'search-suggestions',
  admin: {
    useAsTitle: 'keyword',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'keyword',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}
