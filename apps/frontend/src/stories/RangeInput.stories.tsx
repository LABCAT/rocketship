import type { Meta, StoryObj } from '@storybook/html'
import RangeInputDefault from './components/RangeInputDefault.astro'
import '@labcat/rocketship/components/RangeInput'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof RangeInputDefault> = {
  title: 'Components/RangeInput',
  component: RangeInputDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof RangeInputDefault>

export const Default: Story = {}
