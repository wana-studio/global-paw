import { CollectionConfig } from 'payload'

export const AISuggestions: CollectionConfig = {
  slug: 'ai-suggestions',
  admin: {
    useAsTitle: 'prompt',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'prompt',
      type: 'text',
      localized: true,
      required: true,
    },
  ],
}
