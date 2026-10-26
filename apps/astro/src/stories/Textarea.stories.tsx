import type { Meta, StoryObj } from '@storybook/html'
import TextareaStates from './components/TextareaStates.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Textarea'

const meta: Meta<typeof TextareaStates> = {
  title: 'Components/Textarea',
  component: TextareaStates,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof TextareaStates>

export const States: Story = {}
