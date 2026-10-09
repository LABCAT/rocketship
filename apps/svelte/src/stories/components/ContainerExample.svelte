<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Typography from '@labcat2020/rocketship-svelte/components/Typography'

  type Props = {
    size?: 'default' | 'full' | 'wide' | 'content'
  }

  let { size = 'default' }: Props = $props()
</script>

<Container as="main" {size} padded>
  <Typography as="article">
    <h1>{size} container</h1>
    <p>
      The <code>{size}</code> modifier sets the max width through <code>--rs-container-width</code>.
      Gutters come from <code>--rs-container-gutter</code> and respect the device safe areas.
    </p>
    <p class="intro-text">
      Resize the viewport to see how the container recentres and how its children respond to the
      container query context.
    </p>
    <hr />
    <p>
      Content wraps at the container measure so paragraphs stay readable at every width, from a
      narrow phone to a wide desktop.
    </p>
  </Typography>
</Container>
