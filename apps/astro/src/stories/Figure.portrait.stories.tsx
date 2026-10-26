import type { Meta, StoryObj } from '@storybook/html'
import FigurePortrait from './components/FigurePortrait.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Figure'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FigurePortrait> = {
  title: 'Components/Figure',
  component: FigurePortrait,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FigurePortrait>

export const Portrait: Story = {}
