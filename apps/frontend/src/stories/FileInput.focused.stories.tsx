import type { Meta, StoryObj } from '@storybook/html'
import FileInputFocused from './components/FileInputFocused.astro'
import '@labcat/rocketship/components/FileInput'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof FileInputFocused> = {
  title: 'Components/FileInput',
  component: FileInputFocused,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FileInputFocused>

export const Focused: Story = {}
