import type { Meta, StoryObj } from '@storybook/html'
import ColorsDocument from './components/ColorsDocument.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof ColorsDocument> = {
  title: 'Foundations/Colors',
  component: ColorsDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ColorsDocument>

export const Colors: Story = {}
