import type { Meta, StoryObj } from '@storybook/html'
import ColorsDocument from './components/ColorsDocument.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof ColorsDocument> = {
  title: 'Foundations',
  component: ColorsDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ColorsDocument>

export const Colors: Story = {}
