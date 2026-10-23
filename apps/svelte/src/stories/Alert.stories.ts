import type { Meta, StoryObj } from '@storybook/svelte'
import AlertVariants from './components/AlertVariants.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Alert',
  component: AlertVariants,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof AlertVariants>

export default meta
type Story = StoryObj<typeof AlertVariants>

export const Variants: Story = {}
