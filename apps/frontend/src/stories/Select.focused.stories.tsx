import type { Meta, StoryObj } from '@storybook/html'
import SelectFocused from './components/SelectFocused.astro'
import '@labcat/rocketship/components/Select'
import '@labcat/rocketship/components/Container'

const meta: Meta<typeof SelectFocused> = {
  title: 'Components/Select',
  component: SelectFocused,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof SelectFocused>

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const select = canvasElement.querySelector('select')
    select?.focus()
  },
}
