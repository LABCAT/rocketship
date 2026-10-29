import type { Meta, StoryObj } from '@storybook/html'
import TypographyProse from './components/TypographyProse.astro'
import '@labcat2020/rocketship/components/Typography'
import '@labcat2020/rocketship/components/Container'

const meta: Meta<typeof TypographyProse> = {
  title: 'Base/Typography',
  component: TypographyProse,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof TypographyProse>

export const Prose: Story = {}
