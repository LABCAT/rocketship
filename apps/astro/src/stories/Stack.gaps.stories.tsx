import type { Meta, StoryObj } from '@storybook/html'
import StackGaps from './components/StackGaps.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof StackGaps> = {
  title: 'Base/Stack',
  component: StackGaps,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof StackGaps>

export const Gaps: Story = {}
