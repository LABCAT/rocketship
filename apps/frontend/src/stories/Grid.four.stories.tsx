import type { Meta, StoryObj } from '@storybook/html'
import GridFour from './components/GridFour.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'

const meta: Meta<typeof GridFour> = {
  title: 'Base/Grid',
  component: GridFour,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof GridFour>

export const FourColumns: Story = {}
