import type { Block } from 'payload'

import { contentLexicalEditor } from '../lexical/editors'

export const contentBlock: Block = {
  slug: 'content',
  labels: {
    singular: 'Content',
    plural: 'Content blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: contentLexicalEditor,
    },
  ],
}
