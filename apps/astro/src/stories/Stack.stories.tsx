import type { Meta, StoryObj } from '@storybook/html'
import StackDefault from './components/StackDefault.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof StackDefault> = {
  title: 'Base/Stack',
  component: StackDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof StackDefault>

export const Default: Story = {}
