import type { Meta, StoryObj } from '@storybook/svelte'
import FileInputStates from './components/FileInputStates.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/File Input',
  component: FileInputStates,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FileInputStates>

export default meta
type Story = StoryObj<typeof FileInputStates>

export const States: Story = {}
