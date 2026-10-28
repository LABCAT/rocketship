import type { Meta, StoryObj } from '@storybook/svelte'
import RadioStates from './components/RadioStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Radio',
  component: RadioStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof RadioStates>

export default meta
type Story = StoryObj<typeof RadioStates>

export const States: Story = {}
