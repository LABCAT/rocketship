import type { Meta, StoryObj } from '@storybook/html'
import TableDefault from './components/TableDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'

const meta: Meta<typeof TableDefault> = {
  title: 'Components/Table',
  component: TableDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof TableDefault>

export const Default: Story = {}
