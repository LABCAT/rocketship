import type { Meta, StoryObj } from '@storybook/svelte'
import FieldsetDefault from './components/FieldsetDefault.svelte'
import FieldsetDisabled from './components/FieldsetDisabled.svelte'
import FieldsetLegend from './components/FieldsetLegend.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Fieldset',
  component: FieldsetDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof FieldsetDefault>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = {
  render: () => ({ Component: FieldsetDisabled }),
}

export const Legend: Story = {
  render: () => ({ Component: FieldsetLegend }),
}
