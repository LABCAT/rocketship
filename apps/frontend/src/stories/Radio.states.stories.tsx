import type { Meta, StoryObj } from '@storybook/html'
import RadioStates from './components/RadioStates.astro'
import '@labcat/rocketship/components/Radio'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof RadioStates> = {
  title: 'Components/Radio',
  component: RadioStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RadioStates>

export const States: Story = {}
