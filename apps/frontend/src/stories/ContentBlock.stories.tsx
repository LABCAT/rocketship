import type { Meta, StoryObj } from '@storybook/html'
import ContentBlock from '@rocketship/base/components/ContentBlock'
import '@rocketship/base/components/BlockTitle'
import '@rocketship/base/components/Container'
import '@rocketship/base/components/Typography'

const meta = {
  title: 'Components/ContentBlock',
  component: ContentBlock,
  parameters: {
    a11y: { disable: false },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ContentBlock>

export default meta
type Story = StoryObj<typeof ContentBlock>

const richBodyHtml = `<p class="intro-text">This is the kind of HTML Lexical emits under a block title: intro emphasis, headings below h2 (page title and block title stay outside), lists, links, and nested quotes.</p>
<h3>Checklist before launch</h3>
<p>Editors can stress <strong>critical terms</strong>, use <em>tone</em>, and drop <a href="https://www.w3.org/">external references</a> or <a href="mailto:ops@example.com">mailto links</a>.</p>
<ul>
<li>Verify spacing between the block title and first paragraph at the content column width.</li>
<li>Confirm list markers and link focus rings match the active theme.</li>
</ul>
<h3>Rollout sequence</h3>
<ol>
<li>Ship tokens and container widths in <code>@rocketship/base</code>.</li>
<li>Map Payload blocks to these Astro components.</li>
<li>Preview representative HTML in Storybook, then publish.</li>
</ol>
<blockquote><p>Inline blockquotes inside the body should still read clearly next to lists and headings.</p></blockquote>
<p>Closing copy ties the section back to the page without repeating the block title.</p>`

export const Default: Story = {
  args: {
    title: 'Orbital operations manual',
    html: richBodyHtml,
  },
}

export const ShortNotice: Story = {
  args: {
    title: 'Service notice',
    html: '<p><strong>Maintenance window:</strong> Sunday 02:00–04:00 UTC. <em>No action required</em> for read-only traffic.</p><p>Questions? <a href="mailto:support@example.com">support@example.com</a></p>',
  },
}
