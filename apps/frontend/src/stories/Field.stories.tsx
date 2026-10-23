import type { Meta, StoryObj } from '@storybook/html'
import FieldDefault from './components/FieldDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof FieldDefault> = {
  title: 'Components/Field',
  component: FieldDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof FieldDefault>

export const Default: Story = {}
