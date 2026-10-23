import type { Meta, StoryObj } from '@storybook/svelte'
import TextareaDefault from './components/TextareaDefault.svelte'
import TextareaSizes from './components/TextareaSizes.svelte'
import TextareaStates from './components/TextareaStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Textarea',
  component: TextareaDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof TextareaDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({ Component: TextareaSizes }),
}

export const States: Story = {
  render: () => ({ Component: TextareaStates }),
}
