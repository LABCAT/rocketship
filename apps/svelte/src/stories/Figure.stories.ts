import type { Meta, StoryObj } from '@storybook/svelte'
import FigureDefault from './components/FigureDefault.svelte'
import FigureBordered from './components/FigureBordered.svelte'
import FigureCaption from './components/FigureCaption.svelte'
import FigureCaptionAlign from './components/FigureCaptionAlign.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Figure',
  component: FigureDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FigureDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Bordered: Story = {
  render: () => ({ Component: FigureBordered }),
}

export const Caption: Story = {
  render: () => ({ Component: FigureCaption }),
}

export const CaptionAlign: Story = {
  render: () => ({ Component: FigureCaptionAlign }),
}
