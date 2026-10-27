import type { Meta, StoryObj } from '@storybook/html'
import TooltipDefault from './components/TooltipDefault.astro'
import '@labcat2020/rocketship/components/Button'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Tooltip'

const meta: Meta<typeof TooltipDefault> = {
  title: 'Components/Tooltip',
  component: TooltipDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof TooltipDefault>

export const Default: Story = {}
