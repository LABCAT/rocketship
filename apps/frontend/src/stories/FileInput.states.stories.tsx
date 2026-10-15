import type { Meta, StoryObj } from '@storybook/html'
import FileInputStates from './components/FileInputStates.astro'
import '@labcat/rocketship/components/FileInput'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

const meta: Meta<typeof FileInputStates> = {
  title: 'Components/FileInput',
  component: FileInputStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FileInputStates>

export const States: Story = {}
