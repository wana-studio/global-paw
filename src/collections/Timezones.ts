import { CollectionConfig } from 'payload'

export const Timezones: CollectionConfig = {
  slug: 'timezones',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'offset',
      type: 'text', // e.g. "+03:30" or "UTC+3.5"
      required: true,
    },
    {
      name: 'timezoneId', // e.g. "Asia/Tehran" - reliable for clocks
      type: 'text',
      required: true,
    },
  ],
}
