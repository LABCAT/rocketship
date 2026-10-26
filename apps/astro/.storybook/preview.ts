import '@labcat2020/rocketship/styles'
import { globalTypes, initialGlobals, decorators } from './addons/prefers-color-scheme/preview.ts'

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
          'Foundations',
          ['Colors', 'Spacing', 'BordersAndRadius', 'Shadows'],
          'Base',
          [
            'Container',
            ['Default', 'Content', 'Wide', 'FullWidth'],
            'Grid',
            ['TwoColumns', 'ThreeColumns', 'FourColumns'],
            'Stack',
            ['Default', 'Gaps'],
            'Scroll',
            ['Horizontal', 'Vertical'],
            'Typography',
            ['TermsStyleDocument'],
            'Button',
            ['Variants', 'Sizes'],
          ],
          'Components',
          [
            'Card',
            ['Default'],
            'Alert',
            'Checkbox',
            'Disclosure',
            ['Default', 'Accordion'],
            'Field',
            'Fieldset',
            'Figure',
            ['Default', 'Portrait'],
            'Input',
            'Label',
            'Radio',
            'Select',
            'Table',
            'Textarea',
            'Tooltip',
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
