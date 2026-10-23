import type { Meta, StoryObj } from '@storybook/svelte'
import CardWithMedia from './components/CardWithMedia.svelte'
import '@labcat2020/rocketship/styles'

const meta = {
  title: 'Components/Card',
  component: CardWithMedia,
  parameters: {
    a11y: { disable: false },
  },
} satisfies Meta<typeof CardWithMedia>

export default meta
type Story = StoryObj<typeof CardWithMedia>

export const WithMedia: Story = {}
