import type { Meta, StoryObj } from '@storybook/html'
import FileInputDefault from './components/FileInputDefault.astro'
import '@labcat/rocketship/components/FileInput'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof FileInputDefault> = {
  title: 'Components/FileInput',
  component: FileInputDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FileInputDefault>

export const Default: Story = {}
