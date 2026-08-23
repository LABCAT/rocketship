import type { Meta, StoryObj } from '@storybook/html'
import ShadowsDocument from './components/ShadowsDocument.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof ShadowsDocument> = {
  title: 'Foundations',
  component: ShadowsDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ShadowsDocument>

export const Shadows: Story = {}
