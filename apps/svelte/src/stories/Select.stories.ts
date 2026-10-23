import type { Meta, StoryObj } from '@storybook/svelte'
import SelectDefault from './components/SelectDefault.svelte'
import SelectSizes from './components/SelectSizes.svelte'
import SelectStates from './components/SelectStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Select',
  component: SelectDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof SelectDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({ Component: SelectSizes }),
}

export const States: Story = {
  render: () => ({ Component: SelectStates }),
}
