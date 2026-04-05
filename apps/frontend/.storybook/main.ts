import type { StorybookConfig } from '@storybook-astro/framework'
import { pathToFileURL } from 'node:url'

function fixWindowsAstroComponentPathPlugin() {
  return {
    name: 'fix-windows-astro-component-path',
    enforce: 'pre' as const,
    configureServer(server: { ws: { on: (event: string, fn: (data: { component?: string }) => void) => void } }) {
      server.ws.on('astro:render:request', (data: { component?: string }) => {
        if (data.component && /^[A-Za-z]:[/\\]/.test(data.component)) {
          data.component = pathToFileURL(data.component).href
        }
      })
    },
  }
}

const config: StorybookConfig & {
  stories: string[]
  addons: string[]
  viteFinal: (config: import('vite').InlineConfig) => import('vite').InlineConfig | Promise<import('vite').InlineConfig>
} = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook-astro/framework',
    options: { integrations: [] },
  },
  viteFinal(config) {
    config.plugins = config.plugins || []
    config.plugins.push(fixWindowsAstroComponentPathPlugin())
    return config
  },
}

export default config
