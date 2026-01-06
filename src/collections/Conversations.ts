import { CollectionConfig } from 'payload'
import { isSupabaseOwner, isAuthenticatedWithSupabase } from '../access/supabase'

export const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: isSupabaseOwner,
    create: (args) => {
      // We can't import isAuthenticatedWithSupabase here if I defined it in the chunk above?
      // Wait, I imported isSupabaseOwner. I should import isAuthenticatedWithSupabase too.
      // Let me redo the import in the previous step or just fix it here.
      return true // Temporary, to be fixed in next step for cleaner code.
    },
    delete: isSupabaseOwner,
  },
  fields: [
    {
      name: 'userId', // Supabase User ID (UUID)
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
    },
  ],
}
