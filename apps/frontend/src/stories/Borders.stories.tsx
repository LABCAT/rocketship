import type { Meta, StoryObj } from '@storybook/html'
import BordersDocument from './components/BordersDocument.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof BordersDocument> = {
  title: 'Foundations/BordersAndRadius',
  component: BordersDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof BordersDocument>

export const BordersAndRadius: Story = {}
