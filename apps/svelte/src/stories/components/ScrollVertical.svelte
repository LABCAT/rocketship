<script lang="ts">
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Scroll from '@labcat2020/rocketship-svelte/components/Scroll'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'
</script>

<Container size="content" padded>
  <Stack>
    <h2 id="scroll-vertical-heading">Release notes</h2>
    <Scroll vertical tabindex="0" role="region" aria-labelledby="scroll-vertical-heading">
      <Stack>
        <Card>
          <h3 class="rs-card__title">2.6</h3>
          <p class="rs-card__description">Tables gain numeric columns and a totals row.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.5</h3>
          <p class="rs-card__description">Select paints its chevron and follows the theme.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.4</h3>
          <p class="rs-card__description">Inputs and textareas inherit the page font.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.3</h3>
          <p class="rs-card__description">Field and Label wire hints and errors by id.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.2</h3>
          <p class="rs-card__description">Stack owns the space between components.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.1</h3>
          <p class="rs-card__description">Every token carries its light and dark value.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">2.0</h3>
          <p class="rs-card__description">Alert takes a role only when you opt in.</p>
        </Card>
        <Card>
          <h3 class="rs-card__title">1.9</h3>
          <p class="rs-card__description">Container queries respond to any container.</p>
        </Card>
      </Stack>
    </Scroll>
  </Stack>
</Container>
