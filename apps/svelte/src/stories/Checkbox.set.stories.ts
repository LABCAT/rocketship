import type { Meta, StoryObj } from '@storybook/svelte'
import CheckboxSet from './components/CheckboxSet.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Checkbox',
  component: CheckboxSet,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof CheckboxSet>

export default meta
type Story = StoryObj<typeof CheckboxSet>

export const Set: Story = {}
