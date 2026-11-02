import type { Meta, StoryObj } from '@storybook/svelte'
import TableDefault from './components/TableDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof TableDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
