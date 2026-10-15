import type { Meta, StoryObj } from '@storybook/svelte'
import FieldDisabled from './components/FieldDisabled.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Field',
  component: FieldDisabled,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FieldDisabled>

export default meta
type Story = StoryObj<typeof FieldDisabled>

export const Disabled: Story = {}
