import type { Meta, StoryObj } from '@storybook/html'
import GridTwo from './components/GridTwo.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'

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
