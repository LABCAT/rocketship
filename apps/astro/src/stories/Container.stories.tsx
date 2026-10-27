import type { Meta, StoryObj } from '@storybook/html'
import ContainerDefault from './components/ContainerDefault.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof ContainerDefault> = {
  title: 'Base/Container',
  component: ContainerDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ContainerDefault>

export const Default: Story = {}
