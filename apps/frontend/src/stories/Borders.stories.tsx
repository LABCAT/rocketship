import type { Meta, StoryObj } from '@storybook/html'
import BordersDocument from './components/BordersDocument.astro'
import '@labcat/rocketship/components/Card'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Grid'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof BordersDocument> = {
  title: 'Foundations',
  component: BordersDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BordersDocument>

export const BordersAndRadius: Story = {}
