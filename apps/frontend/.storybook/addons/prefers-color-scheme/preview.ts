const KEY = 'prefersColorScheme'
const originalMedia = new WeakMap<CSSMediaRule, string>()

function getOriginal(rule: CSSMediaRule): string {
  let o = originalMedia.get(rule)
  if (o === undefined) {
    o = rule.media.mediaText
    originalMedia.set(rule, o)
  }
  return o
}

function walkRules(rules: CSSRuleList, fn: (r: CSSMediaRule) => void) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSMediaRule) {
      fn(rule)
      walkRules(rule.cssRules, fn)
    }
  }
}

function apply(scheme: 'light' | 'dark') {
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (sheet.cssRules) walkRules(sheet.cssRules, (rule) => {
          const text = getOriginal(rule)
          if (!text.includes('prefers-color-scheme')) return
          const next =
            scheme === 'dark'
              ? text.replace(/\(prefers-color-scheme:\s*dark\)/g, 'all').replace(/\(prefers-color-scheme:\s*light\)/g, 'not all')
              : text.replace(/\(prefers-color-scheme:\s*light\)/g, 'all').replace(/\(prefers-color-scheme:\s*dark\)/g, 'not all')
          if (next !== rule.media.mediaText) rule.media.mediaText = next
        })
      } catch {
        /* CORS */
      }
    }
  } catch {
    /* CORS */
  }
}

export const globalTypes = {
  [KEY]: {
    description: 'Emulate prefers-color-scheme media query',
    toolbar: {
      title: 'Color scheme',
      icon: 'paintbrush',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
      dynamicTitle: true,
    },
  },
}

export const initialGlobals = { [KEY]: 'light' }

export const decorators = [
  (Story: () => unknown, context: { globals: Record<string, string> }) => {
    const scheme = (context.globals[KEY] || 'light') as 'light' | 'dark'
    ;(typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : (f: () => void) => setTimeout(f, 0))(() => apply(scheme))
    return Story()
  },
]
