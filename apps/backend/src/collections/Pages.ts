import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { contentBlock } from '../blocks/content'
import { quoteBlock } from '../blocks/quote'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'intro',
      type: 'textarea',
    },
    {
      name: 'blocks',
      type: 'blocks',
      labels: {
        singular: 'Block',
        plural: 'Blocks',
      },
      blocks: [contentBlock, quoteBlock],
    },
    slugField({
      position: 'sidebar',
      useAsSlug: 'title',
    }),
  ],
}
