import '@rocketship/base/styles'

const preview = {
  parameters: {
    darkMode: {
      current: 'light',
      stylePreview: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview

