import type { Meta, StoryObj } from '@storybook/html'
import ScrollBoth from './components/ScrollBoth.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof ScrollBoth> = {
  title: 'Base/Scroll',
  component: ScrollBoth,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ScrollBoth>

export const Both: Story = {}
