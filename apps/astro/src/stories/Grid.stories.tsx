import type { Meta, StoryObj } from '@storybook/html'
import GridDefault from './components/GridDefault.astro'
import '@labcat2020/rocketship/components/Card'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Grid'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof GridDefault> = {
  title: 'Base/Grid',
  component: GridDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof GridDefault>

export const Default: Story = {}
