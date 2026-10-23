import type { Meta, StoryObj } from '@storybook/svelte'
import InputDefault from './components/InputDefault.svelte'
import InputSizes from './components/InputSizes.svelte'
import InputStates from './components/InputStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Input',
  component: InputDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof InputDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({ Component: InputSizes }),
}

export const States: Story = {
  render: () => ({ Component: InputStates }),
}
