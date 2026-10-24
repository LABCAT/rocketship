import type { Meta, StoryObj } from '@storybook/html'
import ScrollDefault from './components/ScrollDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'

const meta: Meta<typeof ScrollDefault> = {
  title: 'Base/Scroll',
  component: ScrollDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ScrollDefault>

export const Default: Story = {}
