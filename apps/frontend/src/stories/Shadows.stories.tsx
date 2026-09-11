import type { Meta, StoryObj } from '@storybook/html'
import ShadowsDocument from './components/ShadowsDocument.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof ShadowsDocument> = {
  title: 'Foundations/Shadows',
  component: ShadowsDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof ShadowsDocument>

export const Shadows: Story = {}
