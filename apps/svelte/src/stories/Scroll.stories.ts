import type { Meta, StoryObj } from '@storybook/svelte'
import ScrollHorizontal from './components/ScrollHorizontal.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Scroll',
  component: ScrollHorizontal,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof ScrollHorizontal>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {}
