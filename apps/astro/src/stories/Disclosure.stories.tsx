import type { Meta, StoryObj } from '@storybook/html'
import DisclosureDefault from './components/DisclosureDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Disclosure'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof DisclosureDefault> = {
  title: 'Components/Disclosure',
  component: DisclosureDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof DisclosureDefault>

export const Default: Story = {}
