import type { CollectionConfig } from 'payload'

/**
 * CMS Admin Users - for Payload dashboard access only.
 * Chrome extension users are stored in AppUsers collection.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    description: 'CMS Administrators',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
    },
  ],
}
