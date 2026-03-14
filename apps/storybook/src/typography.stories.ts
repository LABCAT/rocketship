import type { Meta, StoryObj } from '@storybook/html'

const meta: Meta = {
  title: 'Rocketship/Typography',
  parameters: {
    a11y: {
      disable: false,
    },
  },
}

export default meta
type Story = StoryObj

export const FullTypographySet: Story = {
  render: () => `
    <div class="rs-storybook-page">
      <div class="rs-storybook-card">
        <div class="rs-typography">
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>
          <p class="intro-text">Intro text style for prominent lead paragraphs.</p>
          <p>
            Standard paragraph text with an <a href="https://example.com">inline link</a> for link styling.
          </p>
          <ul>
            <li>Unordered list item one</li>
            <li>Unordered list item two</li>
          </ul>
          <ol>
            <li>Ordered level 1
              <ol>
                <li>Ordered level 2
                  <ol>
                    <li>Ordered level 3</li>
                  </ol>
                </li>
              </ol>
            </li>
          </ol>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mars</td>
                <td>Ready</td>
              </tr>
              <tr>
                <td>Saturn</td>
                <td>In Progress</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
}
