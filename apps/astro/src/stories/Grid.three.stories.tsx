import type { Meta, StoryObj } from '@storybook/html'
import GridThree from './components/GridThree.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'

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
