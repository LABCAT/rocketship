import type { Meta, StoryObj } from '@storybook/html'
import TableStriped from './components/TableStriped.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'

const meta: Meta<typeof TableStriped> = {
  title: 'Components/Table',
  component: TableStriped,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof TableStriped>

export const Striped: Story = {}
