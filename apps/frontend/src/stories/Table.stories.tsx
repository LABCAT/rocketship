import type { Meta, StoryObj } from '@storybook/html'
import TableDefault from './components/TableDefault.astro'
import '@labcat/rocketship/components/Table'
import '@labcat/rocketship/components/Container'
import '@labcat/rocketship/components/Typography'

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
