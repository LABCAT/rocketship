import type { Meta, StoryObj } from '@storybook/svelte'
import AccordionMultiple from './components/AccordionMultiple.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Accordion',
  component: AccordionMultiple,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof AccordionMultiple>

export default meta
type Story = StoryObj<typeof AccordionMultiple>

export const Multiple: Story = {}
