<script lang="ts">
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Grid from '@labcat2020/rocketship-svelte/components/Grid'
</script>

<Container as="main" padded>
  <Grid columns={2}>
    <Card>
      <p class="rs-card__title">Two columns</p>
      <p class="rs-card__description">Default grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Two columns</p>
      <p class="rs-card__description">Default grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Two columns</p>
      <p class="rs-card__description">Default grid.</p>
    </Card>
    <Card>
      <p class="rs-card__title">Two columns</p>
      <p class="rs-card__description">Default grid.</p>
    </Card>
  </Grid>
</Container>
