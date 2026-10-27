import type { Meta, StoryObj } from '@storybook/svelte'
import SelectStates from './components/SelectStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Select',
  component: SelectStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof SelectStates>

export default meta
type Story = StoryObj<typeof SelectStates>

export const States: Story = {}
