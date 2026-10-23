import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

/** Storybook host only — the Vite builder merges this config so `.svelte` files compile. */
export default defineConfig({
  plugins: [svelte()],
})
