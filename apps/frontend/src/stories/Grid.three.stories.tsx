import type { Meta, StoryObj } from '@storybook/html'
import GridThree from './components/GridThree.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'

const meta: Meta<typeof GridThree> = {
  title: 'Base/Grid',
  component: GridThree,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof GridThree>

export const ThreeColumns: Story = {}
