import type { Meta, StoryObj } from '@storybook/html'
import GridTwo from './components/GridTwo.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'

const meta: Meta<typeof GridTwo> = {
  title: 'Base/Grid',
  component: GridTwo,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof GridTwo>

export const TwoColumns: Story = {}
