<script lang="ts">
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
</script>

<Container as="main" size="content" padded>
  <Card>
    {#snippet media()}
      <svg
        role="img"
        aria-label="Card media placeholder"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
      >
        <path d="M4 5h16v14H4z" opacity="0.2" />
        <path d="M4 15l5-5 4 4 3-3 4 4v4H4z" />
      </svg>
    {/snippet}
    <p class="rs-card__title">Card with media</p>
    <p class="rs-card__description">The media band renders only when the media snippet is set.</p>
  </Card>
</Container>
