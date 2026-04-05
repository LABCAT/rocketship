import type { Meta, StoryObj } from '@storybook/html'
import TypographyDocument from './components/TypographyDocument.astro'
import '@rocketship/base/components/Typography'
import '@rocketship/base/components/Container'

const meta: Meta<typeof TypographyDocument> = {
  title: 'Base/Typography',
  component: TypographyDocument,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof TypographyDocument>

export const TermsStyleDocument: Story = {}
