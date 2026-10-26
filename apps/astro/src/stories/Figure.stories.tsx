import type { Meta, StoryObj } from '@storybook/html'
import FigureDefault from './components/FigureDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Figure'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FigureDefault> = {
  title: 'Components/Figure',
  component: FigureDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FigureDefault>

export const Default: Story = {}
