import '@labcat2020/rocketship/styles'

export default {
  parameters: {
    layout: 'fullscreen',
    // Same order as apps/astro/.storybook/preview.ts (decision 147), so both hosts read the
    // same way. Groups the Svelte host has no stories for are simply unused, and its own
    // Svelte/GettingStarted docs group sorts last by default.
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
