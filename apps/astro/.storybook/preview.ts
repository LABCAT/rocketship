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
            ['Default', 'Sizes'],
            'Grid',
            ['Default', 'ThreeColumns', 'FourColumns'],
            'Stack',
            ['Default', 'Gaps'],
            'Scroll',
            ['Horizontal', 'Vertical'],
            'Typography',
            ['Default', 'Prose'],
            'Button',
            ['Default', 'Sizes'],
          ],
          'Forms',
          [
            'Field',
            'Fieldset',
            'Label',
            'Input',
            'Textarea',
            'Select',
            'Checkbox',
            ['States', 'Set'],
            'Radio',
            'File Input',
            'Range Input',
          ],
          'Components',
          [
            'Card',
            'Table',
            ['Default', 'Striped'],
            'Figure',
            ['Default', 'Portrait'],
            'Alert',
            'Disclosure',
            ['Default', 'Accordion'],
            'Dialog',
            'Popover',
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
