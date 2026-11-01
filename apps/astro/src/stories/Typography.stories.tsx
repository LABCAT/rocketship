import type { Meta, StoryObj } from '@storybook/html'
import TypographyDefault from './components/TypographyDefault.astro'
import '@labcat2020/rocketship/components/Container'
import '@labcat2020/rocketship/components/Scroll'
import '@labcat2020/rocketship/components/Stack'
import '@labcat2020/rocketship/components/Table'
import '@labcat2020/rocketship/components/Typography'

const meta: Meta<typeof TypographyDefault> = {
  title: 'Base/Typography',
  component: TypographyDefault,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof TypographyDefault>

export const Default: Story = {}
