import '@rocketship/base/styles'
import {
  globalTypes,
  initialGlobals,
  decorators,
} from './addons/prefers-color-scheme/preview'

export default {
  globalTypes,
  initialGlobals,
  decorators,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    options: {
      storySort: {
        method: 'configure',
        includeNames: true,
        order: [
          'Base',
          [
            'Container',
            ['Default', 'Content', 'Wide', 'FullWidth'],
            'Typography',
            ['TermsStyleDocument'],
            'Button',
            ['Variants', 'Sizes'],
          ],
          'Components',
          [
            'PageHeader',
            ['Default', 'TitleOnly'],
            'ContentBlock',
            ['Default', 'ShortNotice'],
            'QuoteBlock',
            ['Default', 'AttributionOnly', 'QuoteOnly'],
          ],
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}
