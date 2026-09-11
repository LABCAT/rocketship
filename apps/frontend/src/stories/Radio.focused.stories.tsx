import type { Meta, StoryObj } from '@storybook/html'
import RadioFocused from './components/RadioFocused.astro'
import '@labcat/rocketship/components/Radio'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof RadioFocused> = {
  title: 'Components/Radio',
  component: RadioFocused,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RadioFocused>

export const Focused: Story = {}
