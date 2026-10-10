import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * Compiles `<style lang="scss">` blocks through the Vite Sass pipeline, so the
 * Svelte components resolve `@use '@labcat2020/rocketship/styles/mixins'`.
 */
export default {
  preprocess: vitePreprocess(),
}
