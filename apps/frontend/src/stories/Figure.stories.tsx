import type { Meta, StoryObj } from '@storybook/html'
import FigureDocument from './components/FigureDocument.astro'
import '@labcat/rocketship/components/Figure'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof FigureDocument> = {
  title: 'Components/Figure',
  component: FigureDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof FigureDocument>

export const Default: Story = {}
