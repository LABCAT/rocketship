import type { Meta, StoryObj } from '@storybook/svelte'
import RadioGroupStates from './components/RadioGroupStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroupStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof RadioGroupStates>

export default meta
type Story = StoryObj<typeof RadioGroupStates>

export const States: Story = {}
