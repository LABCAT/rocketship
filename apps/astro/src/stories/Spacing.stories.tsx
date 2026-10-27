import type { Meta, StoryObj } from '@storybook/html'
import SpacingDocument from './components/SpacingDocument.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof SpacingDocument> = {
  title: 'Foundations/Spacing',
  component: SpacingDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SpacingDocument>

export const Spacing: Story = {}
