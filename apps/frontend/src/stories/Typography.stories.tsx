import type { Meta, StoryObj } from '@storybook/html'
import Typography from '@rocketship/base/components/Typography'

const meta: Meta<typeof Typography> = {
  title: 'Rocketship/Typography',
  component: Typography,
  parameters: {
    a11y: { disable: false },
  },
}

export default meta
type Story = StoryObj<typeof Typography>

const fullSetHtml = `
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
  <p class="intro-text">Intro text style for prominent lead paragraphs.</p>
  <p>Standard paragraph text with an <a href="https://example.com">inline link</a>.</p>
  <ul>
    <li>Unordered list item one</li>
    <li>Unordered list item two</li>
  </ul>
  <ol>
    <li>Ordered level 1</li>
    <li>Ordered level 2</li>
  </ol>
`

export const FullTypographySet: Story = {
  args: {
    html: fullSetHtml,
  },
}
