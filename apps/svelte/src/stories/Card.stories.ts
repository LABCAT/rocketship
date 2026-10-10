import type { Meta, StoryObj } from '@storybook/svelte'
import CardDefault from './components/CardDefault.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Card',
  component: CardDefault,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof CardDefault>

export default meta
type Story = StoryObj<typeof CardDefault>

export const Default: Story = {}
