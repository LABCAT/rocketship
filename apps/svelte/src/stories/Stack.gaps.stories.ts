import type { Meta, StoryObj } from '@storybook/svelte'
import StackGaps from './components/StackGaps.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Stack',
  component: StackGaps,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof StackGaps>

export default meta
type Story = StoryObj<typeof StackGaps>

export const Gaps: Story = {}
