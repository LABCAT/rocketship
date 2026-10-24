import type { Meta, StoryObj } from '@storybook/html'
import ScrollHorizontal from './components/ScrollHorizontal.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'

const meta: Meta<typeof ScrollHorizontal> = {
  title: 'Base/Scroll',
  component: ScrollHorizontal,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ScrollHorizontal>

export const Horizontal: Story = {}
