import type { Meta, StoryObj } from '@storybook/html'
import RadioDefault from './components/RadioDefault.astro'
import '@labcat/rocketship/components/Radio'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof RadioDefault> = {
  title: 'Components/Radio',
  component: RadioDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RadioDefault>

export const Default: Story = {}
