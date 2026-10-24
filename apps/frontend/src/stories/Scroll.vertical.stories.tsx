import type { Meta, StoryObj } from '@storybook/html'
import ScrollVertical from './components/ScrollVertical.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof ScrollVertical> = {
  title: 'Base/Scroll',
  component: ScrollVertical,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ScrollVertical>

export const Vertical: Story = {}
