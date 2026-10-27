import type { Meta, StoryObj } from '@storybook/html'
import PopoverDefault from './components/PopoverDefault.astro'
import '@labcat2020/rocketship/components/Button'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Popover'

const meta: Meta<typeof PopoverDefault> = {
  title: 'Components/Popover',
  component: PopoverDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof PopoverDefault>

export const Default: Story = {}
