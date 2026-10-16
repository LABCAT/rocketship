import type { Meta, StoryObj } from '@storybook/svelte'
import TableDefault from './components/TableDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Table',
  component: TableDefault,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TableDefault>

export default meta
type Story = StoryObj<typeof TableDefault>

export const Default: Story = {}
