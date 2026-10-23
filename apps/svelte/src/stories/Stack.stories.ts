import type { Meta, StoryObj } from '@storybook/svelte'
import StackDefault from './components/StackDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Stack',
  component: StackDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof StackDefault>

export default meta
type Story = StoryObj<typeof StackDefault>

export const Default: Story = {}
