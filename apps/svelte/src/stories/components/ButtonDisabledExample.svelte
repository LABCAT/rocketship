<script lang="ts">
  import Button from '@labcat2020/rocketship-svelte/components/Button'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
</script>

<Container as="main" size="content" padded>
  <Button disabled>Disabled primary</Button>
  <Button variant="secondary" disabled>Disabled secondary</Button>
  <Button variant="ghost" disabled>Disabled ghost</Button>
  <Button as="a" href="/docs" disabled>Disabled link</Button>
</Container>
