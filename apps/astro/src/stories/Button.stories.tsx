import type { Meta, StoryObj } from '@storybook/html'
import ButtonDefault from './components/ButtonDefault.astro'
import '@labcat2020/rocketship/components/Button'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof ButtonDefault> = {
  title: 'Base/Button',
  component: ButtonDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof ButtonDefault>

export const Default: Story = {}
