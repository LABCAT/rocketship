<script lang="ts">
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Grid from '@labcat2020/rocketship-svelte/components/Grid'
</script>

<Container as="main" padded>
  <Grid columns={4}>
    <Card>
      <p class="rs-card__title">Four columns</p>
      <p class="rs-card__description">Four-column grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Four columns</p>
      <p class="rs-card__description">Four-column grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Four columns</p>
      <p class="rs-card__description">Four-column grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Four columns</p>
      <p class="rs-card__description">Four-column grid.</p>
    </Card>
  </Grid>
</Container>
