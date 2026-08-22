import type { Meta, StoryObj } from '@storybook/html'
import CardDefault from './components/CardDefault.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof CardDefault> = {
  title: 'Components/Card',
  component: CardDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof CardDefault>

export const Default: Story = {}
