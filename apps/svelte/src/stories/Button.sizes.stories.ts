import type { Meta, StoryObj } from '@storybook/svelte'
import ButtonSizesExample from './components/ButtonSizesExample.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Button',
  component: ButtonSizesExample,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof ButtonSizesExample>

export default meta
type Story = StoryObj<typeof ButtonSizesExample>

export const Sizes: Story = {}
