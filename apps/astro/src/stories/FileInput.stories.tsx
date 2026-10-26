import type { Meta, StoryObj } from '@storybook/html'
import FileInputStates from './components/FileInputStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/FileInput'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FileInputStates> = {
  title: 'Components/File Input',
  component: FileInputStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FileInputStates>

export const States: Story = {}
