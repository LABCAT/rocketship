import type { Meta, StoryObj } from '@storybook/svelte'
import GridThree from './components/GridThree.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Base/Grid',
  component: GridThree,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GridThree>

export default meta
type Story = StoryObj<typeof GridThree>

export const ThreeColumns: Story = {}
