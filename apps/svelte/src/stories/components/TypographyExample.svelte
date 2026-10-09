<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Typography from '@labcat2020/rocketship-svelte/components/Typography'

  type Props = {
    aspect?: 'headings' | 'text'
  }

  let { aspect = 'headings' }: Props = $props()
</script>

<Container as="main" size="content" padded>
  <Typography as="article">
    {#if aspect === 'headings'}
      <h1>h1 Heading one</h1>
      <p>
        Headings step down the scale from <code>h1</code> to <code>h6</code>, each with its own
        size, weight, and spacing.
      </p>
      <h2>h2 Heading two</h2>
      <p>A second-level heading starts a new section of the document.</p>
      <h3>h3 Heading three</h3>
      <p>A third-level heading groups content within a section.</p>
      <h4>h4 Heading four</h4>
      <p>A fourth-level heading labels a smaller block.</p>
      <h5>h5 Heading five</h5>
      <p>A fifth-level heading sits close to body size.</p>
      <h6>h6 Heading six</h6>
      <p>A sixth-level heading is set in uppercase as a subtle label.</p>
    {:else}
      <h1>Body text</h1>
      <p>
        Paragraphs, lists, links, and inline elements share one type scale. Read the
        <a href="https://example.com/terms">terms</a> or send a note to
        <a href="mailto:legal@example.com">legal@example.com</a>.
      </p>
      <p class="intro-text">
        Intro text leads a page with a larger, more open measure before the body copy begins.
      </p>
      <hr />
      <p>
        Inline emphasis uses <em>italics</em> and <strong>bold</strong>, with <code>inline code</code>
        for identifiers such as <var>tenant_id</var>.
      </p>
      <ul>
        <li>Unordered items share the same spacing as body copy.</li>
        <li>Nested content keeps a clear hierarchy.</li>
      </ul>
      <ol>
        <li>Ordered items count from one.</li>
        <li>The second item follows in sequence.</li>
      </ol>
      <blockquote>
        <p>Block quotations and body copy read clearly at the content column measure.</p>
      </blockquote>
      <table>
        <caption>Token to visual scale</caption>
        <thead>
          <tr>
            <th scope="col">Element</th>
            <th scope="col">Size</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Paragraph</td>
            <td>16px</td>
          </tr>
          <tr>
            <td>Intro text</td>
            <td>19px</td>
          </tr>
        </tbody>
      </table>
    {/if}
  </Typography>
</Container>
