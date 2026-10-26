import type { Meta, StoryObj } from '@storybook/html'
import DisclosureAccordion from './components/DisclosureAccordion.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Disclosure'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof DisclosureAccordion> = {
  title: 'Components/Disclosure',
  component: DisclosureAccordion,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof DisclosureAccordion>

export const Accordion: Story = {}
