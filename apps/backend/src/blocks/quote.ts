import type { Block } from 'payload'

import { quoteLexicalEditor } from '../lexical/editors'

export const quoteBlock: Block = {
  slug: 'quote',
  labels: {
    singular: 'Quote',
    plural: 'Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'richText',
      required: true,
      editor: quoteLexicalEditor,
    },
    {
      name: 'attribution',
      type: 'text',
    },
    {
      name: 'roleOrSource',
      type: 'text',
    },
  ],
}
