import type { Meta, StoryObj } from '@storybook/svelte'
import ScrollVertical from './components/ScrollVertical.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Scroll',
  component: ScrollVertical,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof ScrollVertical>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {}
