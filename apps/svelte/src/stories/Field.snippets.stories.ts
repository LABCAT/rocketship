import type { Meta, StoryObj } from '@storybook/svelte'
import FieldSlots from './components/FieldSlots.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Field',
  component: FieldSlots,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FieldSlots>

export default meta
type Story = StoryObj<typeof FieldSlots>

export const Snippets: Story = {}
