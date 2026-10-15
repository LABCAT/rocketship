import type { Meta, StoryObj } from '@storybook/svelte'
import FieldDefault from './components/FieldDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Field',
  component: FieldDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FieldDefault>

export default meta
type Story = StoryObj<typeof FieldDefault>

export const Default: Story = {}
