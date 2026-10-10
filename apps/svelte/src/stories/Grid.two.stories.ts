import type { Meta, StoryObj } from '@storybook/svelte'
import GridTwo from './components/GridTwo.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Grid',
  component: GridTwo,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GridTwo>

export default meta
type Story = StoryObj<typeof GridTwo>

export const TwoColumns: Story = {}
