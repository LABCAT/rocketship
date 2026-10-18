<script lang="ts">
  import Container from '@labcat2020/rocketship-svelte/components/Container'
  import Disclosure from '@labcat2020/rocketship-svelte/components/Disclosure'
</script>

<Container as="main" size="content" padded>
  <Disclosure summary="What is a deployment window?">
    A deployment window is the range of time when changes are allowed to reach production. Builds
    queued outside the window wait for the next one.
  </Disclosure>

  <Disclosure summary="How do I roll back a release?">
    Open the release, choose Roll back, and pick the build you want to restore. The previous build
    is redeployed and the incident timeline records who triggered it.
  </Disclosure>

  <Disclosure summary="Where do I see build logs?" open>
    Every build keeps its full log for ninety days. Open a build from the deployments list and
    select Logs to follow it live.
  </Disclosure>
</Container>
