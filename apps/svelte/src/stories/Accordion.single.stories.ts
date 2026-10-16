import type { Meta, StoryObj } from '@storybook/svelte'
import AccordionSingle from './components/AccordionSingle.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Accordion',
  component: AccordionSingle,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof AccordionSingle>

export default meta
type Story = StoryObj<typeof AccordionSingle>

export const SingleOpen: Story = {}
