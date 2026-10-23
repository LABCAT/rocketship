<script lang="ts">
  import Table from '@labcat2020/rocketship-svelte/components/Table'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
</script>

<Container as="main" size="content" padded>
  <Table>
    <thead>
      <tr>
        <th scope="col">Service</th>
        <th scope="col">Environment</th>
        <th scope="col">Status</th>
        <th scope="col">Duration</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>checkout-api</td>
        <td>Production</td>
        <td>Succeeded</td>
        <td>1m 42s</td>
      </tr>
      <tr>
        <td>pricing-worker</td>
        <td>Production</td>
        <td>Succeeded</td>
        <td>2m 08s</td>
      </tr>
      <tr>
        <td>search-indexer</td>
        <td>Staging</td>
        <td>Rolled back</td>
        <td>4m 55s</td>
      </tr>
      <tr>
        <td>notifications</td>
        <td>Staging</td>
        <td>Succeeded</td>
        <td>58s</td>
      </tr>
    </tbody>
  </Table>
</Container>
