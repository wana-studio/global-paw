import { CollectionConfig } from 'payload'
import { isSupabaseOwner, isAuthenticatedWithSupabase } from '../access/supabase'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: isSupabaseOwner,
    create: isAuthenticatedWithSupabase,
    update: isSupabaseOwner,
    delete: isSupabaseOwner,
  },
  fields: [
    {
      name: 'appUser',
      type: 'relationship',
      relationTo: 'app-users',
      required: true,
      index: true,
      admin: {
        description: 'The app user who owns this conversation',
      },
    },
    {
      name: 'title',
      type: 'text',
      defaultValue: 'New Chat',
    },
  ],
}
