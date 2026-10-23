import type { Meta, StoryObj } from '@storybook/svelte'
import ButtonDisabledExample from './components/ButtonDisabledExample.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Button',
  component: ButtonDisabledExample,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof ButtonDisabledExample>

export default meta
type Story = StoryObj<typeof ButtonDisabledExample>

export const Disabled: Story = {}
