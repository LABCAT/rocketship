import type { Meta, StoryObj } from '@storybook/svelte'
import GridFour from './components/GridFour.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Grid',
  component: GridFour,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GridFour>

export default meta
type Story = StoryObj<typeof GridFour>

export const FourColumns: Story = {}
