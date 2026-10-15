import type { Meta, StoryObj } from '@storybook/html'
import SelectSizes from './components/SelectSizes.astro'
import '@labcat/rocketship/components/Select'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof SelectSizes> = {
  title: 'Components/Select',
  component: SelectSizes,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof SelectSizes>

export const Sizes: Story = {}
