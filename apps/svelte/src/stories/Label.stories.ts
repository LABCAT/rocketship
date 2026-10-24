import type { Meta, StoryObj } from '@storybook/svelte'
import LabelVariants from './components/LabelVariants.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Label',
  component: LabelVariants,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof LabelVariants>

export default meta
type Story = StoryObj<typeof LabelVariants>

export const Variants: Story = {}
