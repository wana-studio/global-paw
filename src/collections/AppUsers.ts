import { CollectionConfig } from 'payload'
import { isAppUserOwner, isAuthenticatedWithSupabase } from '../access/supabase'

export const AppUsers: CollectionConfig = {
  slug: 'app-users',
  admin: {
    useAsTitle: 'email',
    description: 'Chrome extension users (synced from Supabase Auth)',
  },
  access: {
    read: isAppUserOwner,
    create: isAuthenticatedWithSupabase,
    update: isAppUserOwner,
    delete: () => false, // Users cannot delete themselves via API
  },
  fields: [
    {
      name: 'supabaseId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'The auth.users.id from Supabase',
        readOnly: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'selectedBackground',
      type: 'relationship',
      relationTo: 'wallpapers',
    },
    {
      name: 'selectedLanguage',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Arabic', value: 'ar' },
        { label: 'Persian', value: 'fa' },
      ],
    },
    {
      name: 'selectedTheme',
      type: 'select',
      defaultValue: 'system',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System', value: 'system' },
      ],
    },
  ],
}
