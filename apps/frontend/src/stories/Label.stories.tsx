import type { Meta, StoryObj } from '@storybook/html'
import LabelMarkers from './components/LabelMarkers.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Field'
import '@labcat2020/rocketship/components/Label'
import '@labcat2020/rocketship/components/Stack'

const meta: Meta<typeof LabelMarkers> = {
  title: 'Components/Label',
  component: LabelMarkers,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof LabelMarkers>

export const Markers: Story = {}
