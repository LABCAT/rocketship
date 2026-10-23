<script lang="ts">
  import Table from '@labcat2020/rocketship-svelte/components/Table'
  import Container from '@labcat2020/rocketship-svelte/components/Container'
</script>

<Container as="main" size="content" padded>
  <Table caption="Support tickets by queue, first response and resolution time">
    <thead>
      <tr>
        <th scope="col">Queue</th>
        <th scope="col">Open tickets</th>
        <th scope="col">First response</th>
        <th scope="col">Resolution</th>
        <th scope="col">Backlog age</th>
        <th scope="col">Escalations</th>
        <th scope="col">Owner</th>
        <th scope="col">Last reviewed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Billing and invoices</td>
        <td>18</td>
        <td>42 minutes</td>
        <td>6 hours</td>
        <td>2 days</td>
        <td>3</td>
        <td>Finance operations</td>
        <td>14 October 2026</td>
      </tr>
      <tr>
        <td>Account access</td>
        <td>7</td>
        <td>11 minutes</td>
        <td>1 hour</td>
        <td>9 hours</td>
        <td>1</td>
        <td>Identity team</td>
        <td>14 October 2026</td>
      </tr>
      <tr>
        <td>Platform incidents</td>
        <td>2</td>
        <td>4 minutes</td>
        <td>38 minutes</td>
        <td>6 hours</td>
        <td>0</td>
        <td>Reliability team</td>
        <td>15 October 2026</td>
      </tr>
    </tbody>
  </Table>
</Container>
