import type { Meta, StoryObj } from '@storybook/html'
import DialogDefault from './components/DialogDefault.astro'
import '@labcat2020/rocketship/components/Button'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Dialog'

const meta: Meta<typeof DialogDefault> = {
  title: 'Components/Dialog',
  component: DialogDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof DialogDefault>

export const Default: Story = {}
