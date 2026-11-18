import type { Meta, StoryObj } from '@storybook/html'
import PaginationDefault from './components/PaginationDefault.astro'
import '@labcat2020/rocketship/components/Pagination'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof PaginationDefault> = {
  title: 'Components/Pagination',
  component: PaginationDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof PaginationDefault>

export const Default: Story = {}
