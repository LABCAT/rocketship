<script lang="ts">
  import Button from '@labcat2020/rocketship-svelte/components/Button'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Typography from '@labcat2020/rocketship-svelte/components/Typography'

  type Size = 'small' | 'medium' | 'large'
  type Variant = 'primary' | 'secondary' | 'ghost'

  const rows: { title: string; description: string; size: Size }[] = [
    { title: 'Small', description: 'Compact height and label size', size: 'small' },
    { title: 'Medium', description: 'Default size for most actions', size: 'medium' },
    { title: 'Large', description: 'Emphasis and touch-friendly targets', size: 'large' },
  ]

  const variants: { variant: Variant; label: string }[] = [
    { variant: 'primary', label: 'Primary' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'ghost', label: 'Ghost' },
  ]
</script>

<Container as="main" size="content" padded>
  {#each rows as row (row.size)}
    <Typography as="section">
      <h3>{row.title} size</h3>
      <p>{row.description}</p>
      <p>
        {#each variants as variant (variant.variant)}
          <Button
            size={row.size}
            variant={variant.variant}
            aria-label={`${variant.label}, ${row.title.toLowerCase()} size`}
          >
            {variant.label} ({row.title.toLowerCase()})
          </Button>
        {/each}
      </p>
    </Typography>
  {/each}
</Container>
