<script lang="ts">
  import Card from '@labcat2020/rocketship-svelte/components/Card'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Stack from '@labcat2020/rocketship-svelte/components/Stack'

  const gaps = [
    {
      gap: 'small',
      title: 'Small gap',
      lines: [
        '8px between items.',
        'For tightly related content.',
        'A label and its value, or a list of links.',
      ],
    },
    {
      gap: 'medium',
      title: 'Medium gap (default)',
      lines: [
        '16px between items.',
        'For most groups of components.',
        'Cards in a column, or the fields of a form.',
      ],
    },
    {
      gap: 'large',
      title: 'Large gap',
      lines: [
        '24px between items.',
        'For separate sections.',
        'Distinct groups that need room to breathe.',
      ],
    },
  ] as const
</script>

<Container size="content" padded>
  <Stack gap="large">
    {#each gaps as item (item.gap)}
      <Card>
        <Stack gap={item.gap}>
          <h2 class="rs-card__title">{item.title}</h2>
          {#each item.lines as line}
            <p class="rs-card__description">{line}</p>
          {/each}
        </Stack>
      </Card>
    {/each}
  </Stack>
</Container>
