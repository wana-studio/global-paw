import { CollectionConfig } from 'payload'
import { isSupabaseOwner, isAuthenticatedWithSupabase } from '../access/supabase'

export const Messages: CollectionConfig = {
  slug: 'messages',
  access: {
    read: isSupabaseOwner,
    create: isAuthenticatedWithSupabase,
    update: isSupabaseOwner,
    delete: isSupabaseOwner,
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Assistant', value: 'assistant' },
        { label: 'System', value: 'system' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
  ],
  timestamps: true,
}
