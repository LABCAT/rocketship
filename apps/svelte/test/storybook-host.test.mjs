import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const repoRoot = dirname(dirname(appRoot))
const storiesDir = join(appRoot, 'src', 'stories')
const read = (path) => readFileSync(path, 'utf8')
const readJson = (path) => JSON.parse(read(path))

const sveltePkg = readJson(join(appRoot, 'package.json'))
const rootPkg = readJson(join(repoRoot, 'package.json'))
const astroPkg = readJson(join(repoRoot, 'apps', 'astro', 'package.json'))
const mainTs = read(join(appRoot, '.storybook', 'main.ts'))

test('apps/svelte is a private Storybook 10 host package', () => {
  assert.equal(sveltePkg.name, '@rocketship/svelte-storybook')
  assert.equal(sveltePkg.private, true)

  const dev = { ...sveltePkg.devDependencies }
  assert.match(dev.storybook, /^(\^|~)?10\./, 'Storybook 10 is required')
  assert.ok(dev['@storybook/svelte-vite'], '@storybook/svelte-vite is required')
  assert.ok(dev['@storybook/addon-a11y'], 'the a11y addon is required')
  assert.ok(dev.sass, 'sass is required')
  assert.ok(dev.vite, 'vite is required')
  assert.ok(
    sveltePkg.dependencies['@labcat2020/rocketship-svelte'],
    'the host depends on the Svelte library',
  )
})

test('the Svelte host uses the svelte-vite framework, a11y addon, and stories glob', () => {
  assert.match(mainTs, /@storybook\/svelte-vite/, 'framework must be @storybook/svelte-vite')
  assert.match(mainTs, /'@storybook\/addon-a11y'/, 'the a11y addon must be registered')
  assert.match(
    mainTs,
    /'\.\.\/src\/\*\*\/\*\.stories\.\*'/,
    'stories glob must be ../src/**/*.stories.*',
  )
})

test('root scripts run the Svelte host on port 6007', () => {
  assert.equal(
    rootPkg.scripts['storybook:svelte'],
    'pnpm --filter @rocketship/svelte-storybook storybook',
  )
  assert.equal(
    rootPkg.scripts['build:storybook:svelte'],
    'pnpm --filter @rocketship/svelte-storybook build-storybook',
  )

  assert.match(sveltePkg.scripts.dev, /-p 6007\b/, 'dev must use port 6007')
  assert.match(sveltePkg.scripts['build-storybook'], /storybook build/)
})

test('the story enables a11y and renders a component from the stories folder', () => {
  const story = read(join(appRoot, 'src', 'stories', 'GettingStarted.stories.ts'))
  assert.match(story, /from '\.\/components\//, 'the story must import a local component')
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the story must enable a11y checks')
})

test('no two story files claim the same title and story name', () => {
  const files = readdirSync(storiesDir).filter((name) => /\.stories\.ts$/.test(name))
  const owners = new Map()

  for (const file of files) {
    const source = read(join(storiesDir, file))
    const title = source.match(/title:\s*'([^']+)'/)?.[1]
    if (!title) continue
    for (const [, name] of source.matchAll(/export const (\w+):/g)) {
      const key = `${title}::${name}`
      const files = owners.get(key) ?? []
      files.push(file)
      owners.set(key, files)
    }
  }

  for (const [key, files] of owners) {
    const [title, name] = key.split('::')
    assert.equal(
      files.length,
      1,
      `Storybook derives story ids from the title and export name, so "${title}" / "${name}" must be declared once; found in ${files.join(', ')}`,
    )
  }
})

test('the Table variants share one story file with a11y enabled', () => {
  const tableStories = readdirSync(storiesDir).filter((name) => /^Table.*\.stories\.ts$/.test(name))
  assert.deepEqual(
    tableStories,
    ['Table.stories.ts'],
    'all Table variants belong in Table.stories.ts',
  )

  const story = read(join(storiesDir, 'Table.stories.ts'))
  assert.match(story, /title:\s*'Components\/Table'/)
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Table stories must enable a11y')
  for (const variant of ['Default', 'Striped', 'Compact', 'Hover', 'Combined', 'Overflow']) {
    assert.match(
      story,
      new RegExp(`export const ${variant}: Story =`),
      `Table.stories.ts must export the ${variant} variant`,
    )
  }
})

test('the Figure variants share one story file with a11y enabled', () => {
  const figureStories = readdirSync(storiesDir).filter((name) =>
    /^Figure.*\.stories\.ts$/.test(name),
  )
  assert.deepEqual(
    figureStories,
    ['Figure.stories.ts'],
    'all Figure variants belong in Figure.stories.ts',
  )

  const story = read(join(storiesDir, 'Figure.stories.ts'))
  assert.match(story, /title:\s*'Components\/Figure'/)
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Figure stories must enable a11y')
  for (const variant of ['Default', 'Bordered', 'Caption', 'CaptionAlign']) {
    assert.match(
      story,
      new RegExp(`export const ${variant}: Story =`),
      `Figure.stories.ts must export the ${variant} variant`,
    )
  }
})

test('the Figure stories cover every caption state, including no caption at all', () => {
  const caption = read(join(storiesDir, 'components', 'FigureCaption.svelte'))
  const align = read(join(storiesDir, 'components', 'FigureCaptionAlign.svelte'))

  assert.match(caption, /captionSlot/, 'one Figure story must exercise the caption snippet')
  assert.match(
    caption,
    /<Figure\s*>/,
    'the caption story must include a Figure with no caption at all',
  )
  assert.match(align, /captionAlign="start"/, 'the align story must show the start alignment')
  assert.match(align, /captionAlign="center"/, 'the align story must show the center alignment')
})

test('the Astro host is left unchanged', () => {
  assert.equal(astroPkg.name, '@rocketship/frontend')
  assert.match(astroPkg.scripts.storybook, /6006\b/, 'the Astro host keeps port 6006')
  const astroMain = read(join(repoRoot, 'apps', 'astro', '.storybook', 'main.ts'))
  assert.match(astroMain, /@storybook-astro\/framework/, 'the Astro host keeps its framework')
})

test('the Checkbox and Radio stories mirror the Astro States and Set stories', () => {
  const expected = {
    Checkbox: ['Checkbox.set.stories.ts', 'Checkbox.stories.ts'],
    Radio: ['Radio.stories.ts'],
    RadioGroup: ['RadioGroup.stories.ts'],
  }

  for (const [component, expectedFiles] of Object.entries(expected)) {
    const files = readdirSync(storiesDir)
      .filter((name) => new RegExp(`^${component}[.a-z]*\\.stories\\.ts$`).test(name))
      .sort()
    assert.deepEqual(
      files,
      expectedFiles,
      `${component} has the same stories as the Astro original`,
    )

    for (const file of files) {
      const story = read(join(storiesDir, file))
      assert.match(
        story,
        new RegExp(`title:\\s*'Components/${component}'`),
        `${file} uses the Astro title`,
      )
      assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, `${file} must enable a11y`)
    }
  }

  assert.match(
    read(join(storiesDir, 'Checkbox.stories.ts')),
    /export const States: Story =/,
    'Checkbox exports States, as the Astro story does',
  )
  assert.match(
    read(join(storiesDir, 'Checkbox.set.stories.ts')),
    /export const Set: Story =/,
    'Checkbox exports Set, the one place indeterminate is demonstrated',
  )
  assert.match(
    read(join(storiesDir, 'Radio.stories.ts')),
    /export const States: Story =/,
    'Radio exports States, as the Astro story does',
  )
  assert.match(
    read(join(storiesDir, 'RadioGroup.stories.ts')),
    /export const States: Story =/,
    'RadioGroup exports States too, so the fieldset form is browsable',
  )
})

test('the Radio and Checkbox stories bind the value rather than hard-coding checked', () => {
  const radio = read(join(storiesDir, 'components', 'RadioStates.svelte'))
  assert.match(radio, /bind:group=/, 'a radio set is one bound value, not checked attributes')
  assert.ok(
    !/\bchecked\b/.test(radio),
    'a checked attribute on one radio would let two options look chosen',
  )

  const checkbox = read(join(storiesDir, 'components', 'CheckboxStates.svelte'))
  assert.match(checkbox, /bind:checked=/, 'the state story exercises the two-way checkbox binding')
})

test('the RadioGroup story groups fieldsets with one checked, one disabled and one in error', () => {
  const states = read(join(storiesDir, 'components', 'RadioGroupStates.svelte'))

  assert.match(states, /<Container size="content" padded>/)
  assert.ok(
    (states.match(/<RadioGroup\b/g) ?? []).length === 3,
    'the story shows three groups: enabled, disabled and in error',
  )
  assert.match(states, /<RadioGroup bind:group=\{delivery\}>/, 'the first group is bound')
  assert.match(states, /<RadioGroup disabled>/, 'the disabled group carries the native attribute')
  assert.match(
    states,
    /<RadioGroup invalid aria-describedby="group-contact-error">/,
    'the invalid group keeps its error on the fieldset and points at it',
  )
  assert.match(states, /class="rs-fieldset__error"/, "a group's error belongs to the fieldset")
  assert.match(states, /<Radio\b/, 'each option is a Radio, so the group supplies the name')
  assert.ok(
    !/\bname="(?:delivery|wrap|contact)"/.test(states),
    'the group names its radios, so the story never repeats a name',
  )
  assert.match(states, /<Label for="/, 'every radio has a Label pointing at it')
  assert.ok(
    !/<style[\s>]/.test(states) && !/class="(?!rs-)/.test(states),
    'RadioGroupStates must not carry story-only styles or non-Rocketship classes',
  )
})

test('the Checkbox States story shows rows in an inline Field, with an error, a hint and a disabled pair', () => {
  const states = read(join(storiesDir, 'components', 'CheckboxStates.svelte'))

  assert.match(
    states,
    /<Container size="content" padded>/,
    'the story sits in one content Container',
  )
  assert.match(states, /<Stack gap="large">/, 'rows are spaced by Stack, never by Container')
  assert.match(states, /<Field inline>/, 'a choice row is an inline Field')
  assert.ok(
    !/<Field[^>]*label=/.test(states),
    'the Label is written by the consumer, so an inline row passes no label prop',
  )
  assert.match(states, /<Checkbox\b/, 'the story renders the reviewed Checkbox component')
  assert.match(states, /<Label for="/, 'every control has a Label pointing at it')
  assert.match(
    states,
    /Fields marked \* are required\./,
    'a story with a required asterisk explains it once',
  )
  assert.match(states, /\brequired\b/, 'the story shows a required state')
  assert.match(states, /checked/, 'the story shows a checked state')
  assert.match(states, /disabled/, 'the story shows a disabled state')
  assert.match(states, /aria-invalid="true"/, 'errors are announced from aria-invalid')
  assert.match(
    states,
    /class="rs-field__error"/,
    'an error row writes the Field error element itself',
  )
  assert.match(
    states,
    /class="rs-field__hint"/,
    'a row with a hint writes the Field hint element itself',
  )
  assert.doesNotMatch(
    states,
    /indeterminate/,
    'indeterminate belongs to the Set story, where the DOM property is set after mount',
  )
  assert.ok(
    !/<style[\s>]/.test(states) && !/class="(?!rs-)/.test(states),
    'CheckboxStates must not carry story-only styles or non-Rocketship classes',
  )
})

test('the Checkbox Set story sets indeterminate through the DOM property, never a prop', () => {
  const set = read(join(storiesDir, 'components', 'CheckboxSet.svelte'))

  assert.match(set, /<Container size="content" padded>/, 'the story sits in one content Container')
  assert.match(set, /<Fieldset>/, 'a set of related checkboxes is a fieldset')
  assert.match(set, /\{#snippet legend\(\)\}/, 'the legend comes from the legend snippet')
  assert.match(set, /<Stack gap="small">/, 'options sit closer together than the groups')
  assert.ok(
    (set.match(/<Field inline>/g) ?? []).length === 5,
    'every option is an inline Field row',
  )
  assert.match(set, /<Checkbox\b/, 'the story renders the reviewed Checkbox component')
  assert.match(set, /<Label for="/, 'every checkbox has a Label pointing at it')
  assert.match(set, /class="rs-field__hint"/, 'a row with a hint writes the Field hint element')

  assert.match(
    set,
    /document\.getElementById\('notify-all'\)/,
    'indeterminate is set on the element, the only way a native checkbox can express it',
  )
  assert.match(set, /\.indeterminate = true/, 'the story sets the DOM property')
  assert.match(
    set,
    /instanceof HTMLInputElement/,
    'the story narrows the element before setting the property',
  )
  assert.doesNotMatch(
    set,
    /indeterminate=|bind:this|indeterminate\?:/,
    'indeterminate is never a prop, an attribute or a component binding',
  )
  assert.match(set, /bind:group=\{topics\}/, 'the set story binds one array of ticked values')
  assert.match(
    set,
    /onMount\(/,
    'the story sets the property after mount, when the control is in the DOM',
  )
  assert.ok(
    !/<style[\s>]/.test(set) && !/class="(?!rs-)/.test(set),
    'CheckboxSet must not carry story-only styles or non-Rocketship classes',
  )
})

test('the Radio States story groups fieldsets with one checked, one disabled and one in error', () => {
  const states = read(join(storiesDir, 'components', 'RadioStates.svelte'))

  assert.match(states, /<Container size="content" padded>/)
  assert.match(
    states,
    /<Stack gap="xlarge">/,
    'consecutive fieldsets go in an xlarge Stack, so groups sit further apart than their parts',
  )
  assert.ok(
    (states.match(/<Fieldset\b/g) ?? []).length === 3,
    'the story shows three groups: enabled, disabled and in error',
  )
  assert.match(states, /\{#snippet legend\(\)\}/, 'the legend comes from the legend snippet')
  assert.match(states, /<Fieldset disabled>/, 'the disabled group carries the native attribute')
  assert.match(
    states,
    /class="rs-fieldset__error"/,
    "a group's error belongs to the fieldset, never to a Field",
  )
  assert.match(
    states,
    /<Fieldset aria-describedby="contact-error">/,
    'the fieldset points at its own error text',
  )
  assert.match(states, /<Stack gap="small">/, 'options sit closer together than the groups')
  assert.match(states, /<Field inline>/, 'each option is an inline Field row')
  assert.match(states, /<Radio\b/, 'the story renders the reviewed Radio component')
  assert.match(states, /<Label for="/, 'every radio has a Label pointing at it')
  assert.match(
    states,
    /let delivery = \$state\('standard'\)/,
    'the first option is the initial value of the bound group',
  )
  assert.match(
    states,
    /bind:group=\{delivery\}/,
    'the story binds one variable per group, so checking a radio moves the selection',
  )
  assert.ok(
    (states.match(/aria-invalid="true"/g) ?? []).length === 3,
    'every radio in the invalid group announces the error',
  )
  assert.ok(
    !/<style[\s>]/.test(states) && !/class="(?!rs-)/.test(states),
    'RadioStates must not carry story-only styles or non-Rocketship classes',
  )
})

test('the Checkbox and Radio stories document the indeterminate rule and the choice row', () => {
  const readme = read(join(repoRoot, 'packages', 'svelte', 'README.md'))

  assert.match(readme, /### `Checkbox` and `Radio`/, 'the README documents the choice controls')
  assert.match(
    readme,
    /indeterminate/,
    'the README explains that indeterminate is script-only, never a prop',
  )
  assert.match(readme, /<Field inline>/, 'the README documents the choice row composition')
})

test('the Field title lives in exactly one story file', () => {
  const storiesDir = join(appRoot, 'src', 'stories')
  const files = readdirSync(storiesDir).filter((name) => /\.stories\.ts$/.test(name))

  const owners = files.filter((file) =>
    /title:\s*'Components\/Field'/.test(read(join(storiesDir, file))),
  )
  assert.deepEqual(owners, ['Field.stories.ts'], 'Components/Field must be declared once')
})

test('the Field stories live in one file exporting Default, Disabled and Snippets', () => {
  const source = read(join(appRoot, 'src', 'stories', 'Field.stories.ts'))
  assert.match(source, /title:\s*'Components\/Field'/, 'Field keeps its Components/Field title')

  for (const name of ['Default', 'Disabled', 'Snippets']) {
    assert.match(
      source,
      new RegExp(`export const ${name}: Story`),
      `Field.stories.ts must export the ${name} story`,
    )
  }

  const files = readdirSync(join(appRoot, 'src', 'stories'))
  assert.ok(
    !files.includes('Field.disabled.stories.ts') && !files.includes('Field.snippets.stories.ts'),
    'the extra Field story files must be collapsed into Field.stories.ts',
  )
})

test('the Input and Textarea variants each share one story file with a11y enabled', () => {
  for (const [component, variants] of [
    ['Input', ['Default', 'Sizes', 'States']],
    ['Textarea', ['Default', 'Sizes', 'States']],
  ]) {
    const files = readdirSync(storiesDir).filter((name) =>
      new RegExp(`^${component}.*\\.stories\\.ts$`).test(name),
    )
    assert.deepEqual(
      files,
      [`${component}.stories.ts`],
      `all ${component} variants belong in ${component}.stories.ts`,
    )

    const source = read(join(storiesDir, `${component}.stories.ts`))
    assert.match(source, new RegExp(`title:\\s*'Components/${component}'`))
    assert.match(
      source,
      /a11y:\s*\{\s*disable:\s*false\s*\}/,
      `the ${component} stories must enable a11y`,
    )
    for (const variant of variants) {
      assert.match(
        source,
        new RegExp(`export const ${variant}: Story =`),
        `${component}.stories.ts must export the ${variant} variant`,
      )
    }
  }
})

test('the Input and Textarea stories compose Field and Label rather than a bare control', () => {
  for (const component of ['Input', 'Textarea']) {
    const defaultStory = read(join(storiesDir, 'components', `${component}Default.svelte`))
    assert.match(
      defaultStory,
      /<Field\b/,
      `the ${component} default story must show the Field composition`,
    )
    assert.match(
      defaultStory,
      /<Label\b|label="/,
      `the ${component} default story must give its controls a label`,
    )
    assert.match(
      defaultStory,
      /bind:value=/,
      `the ${component} default story must exercise bind:value`,
    )
  }
})

test('the Select story mirrors the Astro States story with a11y enabled', () => {
  const selectStories = readdirSync(storiesDir).filter((name) =>
    /^Select.*\.stories\.ts$/.test(name),
  )
  assert.deepEqual(
    selectStories,
    ['Select.stories.ts'],
    'Select has one story file, as the Astro original does',
  )

  const story = read(join(storiesDir, 'Select.stories.ts'))
  assert.match(story, /title:\s*'Components\/Select'/, 'the Svelte title matches the Astro title')
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Select story must enable a11y')
  assert.match(story, /export const States: Story =/, 'the story exports States, as Astro does')

  for (const missing of ['Default', 'Sizes']) {
    assert.ok(
      !new RegExp(`export const ${missing}: Story =`).test(story),
      `States is not an aspect, so ${missing} must not be a Select story`,
    )
  }
})

test('the Select story covers the required, error, disabled and list-box states', () => {
  const states = read(join(storiesDir, 'components', 'SelectStates.svelte'))

  assert.match(states, /<Field\b/, 'Select is composed with Field, which owns the wiring')
  assert.match(states, /<Stack\b/, 'the states are spaced by Stack, never by Container')
  assert.match(
    states,
    /Fields marked \* are required\./,
    'a story with a required asterisk explains it once',
  )
  assert.match(states, /required/, 'the story shows a required state')
  assert.match(states, /<optgroup\b/, 'the story shows grouping through the children snippet')
  assert.match(states, /error=/, 'the error state comes from the Field error text')
  assert.match(states, /disabled/, 'the story shows a disabled control')
  assert.match(states, /\bmultiple\b/, 'the story shows a multiple list box')
  assert.match(states, /size=\{4\}/, 'the list box renders several rows, so it drops the chevron')
  assert.doesNotMatch(states, /placeholder=/, 'the reviewed component has no placeholder prop')
  assert.doesNotMatch(states, /invalid(?=[\s/>])/, 'the reviewed component has no invalid prop')
  assert.doesNotMatch(
    states,
    /\bsize="(sm|md|lg)"/,
    'the reviewed component has one size, so no size variant appears',
  )
  assert.ok(
    !/<style[\s>]/.test(states) && !/class="(?!rs-)/.test(states),
    'SelectStates must not carry story-only styles or non-Rocketship classes',
  )
})

test('the Fieldset story mirrors the Astro story: one Default example per decision 29', () => {
  const fieldsetStories = readdirSync(storiesDir).filter((name) =>
    /^Fieldset.*\.stories\.ts$/.test(name),
  )
  assert.deepEqual(
    fieldsetStories,
    ['Fieldset.stories.ts'],
    'all Fieldset examples belong in Fieldset.stories.ts',
  )

  const story = read(join(storiesDir, 'Fieldset.stories.ts'))
  assert.match(story, /title:\s*'Components\/Fieldset'/)
  assert.match(story, /a11y:\s*\{\s*disable:\s*false\s*\}/, 'the Fieldset story must enable a11y')
  // Decision 29: disabled is a state, not an aspect, so it sits inside Default rather than in a
  // Disabled file. Asserting the absence keeps a second file from coming back.
  for (const name of ['Disabled', 'Legend']) {
    assert.doesNotMatch(
      story,
      new RegExp(`export const ${name}: Story`),
      `Fieldset has no ${name} story: the state sits inside Default`,
    )
  }
})

test('the Alert and Stack stories mirror the Astro story structure', () => {
  const alert = read(join(storiesDir, 'components', 'AlertVariants.svelte'))
  const stackDefault = read(join(storiesDir, 'components', 'StackDefault.svelte'))
  const stackGaps = read(join(storiesDir, 'components', 'StackGaps.svelte'))

  assert.match(alert, /<Container size="content" padded>/, 'alerts go in one content Container')
  assert.match(alert, /<Stack>/, 'alerts are stacked rather than spaced with nested Containers')
  assert.doesNotMatch(
    alert,
    /<Alert[^>]*title=/,
    'Alert takes no title prop; the story writes the heading itself',
  )
  for (const variant of ['info', 'success', 'warning', 'error']) {
    assert.ok(
      variant === 'info' ? /<Alert>/.test(alert) : alert.includes(`variant="${variant}"`),
      `the Alert story must show the ${variant} variant`,
    )
  }
  assert.ok(
    alert.includes('<h2 class="rs-alert__title">'),
    'the story writes a real heading on the consumer-owned title class',
  )
  assert.ok(
    alert.includes('<p class="rs-alert__description">'),
    'the story writes a block element on the consumer-owned description class',
  )

  assert.match(stackDefault, /<Container size="content" padded>/, 'Stack sits in one Container')
  assert.match(stackDefault, /<Stack>/, 'the default Stack story shows the default gap')

  assert.match(stackGaps, /<Container size="content" padded>/)
  assert.match(stackGaps, /<Stack gap="large">/, 'the gaps story separates the groups')
  for (const gap of ['small', 'medium', 'large', 'xlarge']) {
    assert.ok(stackGaps.includes(`'${gap}'`), `the gaps story must document the ${gap} gap`)
  }

  for (const [name, source] of [
    ['AlertVariants', alert],
    ['StackDefault', stackDefault],
    ['StackGaps', stackGaps],
  ]) {
    assert.ok(
      !/<style[\s>]/.test(source) && !/class="(?!rs-)/.test(source),
      `${name} must not carry story-only styles or non-Rocketship classes`,
    )
  }
})

test('the Fieldset story groups real controls, pairs a locked group with an enabled one, and uses the legend snippet', () => {
  const story = read(join(storiesDir, 'components', 'FieldsetDefault.svelte'))

  assert.match(
    story,
    /<Container size="content" padded>/,
    'the story sits in one content Container',
  )
  assert.match(
    story,
    /<Stack gap="xlarge">/,
    'consecutive fieldsets go in an xlarge Stack, so groups sit further apart than their parts',
  )
  assert.match(story, /<Fieldset>/, 'the enabled group renders a plain Fieldset')
  assert.match(
    story,
    /\{#snippet legend\(\)\}/,
    'the legend comes from the legend snippet, mirroring the Astro named slot',
  )
  assert.match(story, /<Field\b/, 'the story groups Field controls')
  assert.match(story, /bind:value=/, 'the story exercises bind:value')

  assert.match(
    story,
    /<Fieldset disabled>/,
    'the disabled group carries the native attribute, with no per-control prop',
  )
  for (const country of ['billing', 'shipping']) {
    assert.ok(
      story.includes(`name="${country}-name"`),
      `the story must submit a ${country} name, so the disabled group can be seen to drop out`,
    )
  }
})

test('the Stack stories share the Base/Stack title with one story per gap aspect', () => {
  const files = readdirSync(storiesDir).filter((name) => /^Stack.*\.stories\.ts$/.test(name))
  assert.deepEqual(files.sort(), ['Stack.gaps.stories.ts', 'Stack.stories.ts'])

  for (const file of files) {
    const source = read(join(storiesDir, file))
    assert.match(source, /title:\s*'Base\/Stack'/, `${file} keeps the Base/Stack title`)
    assert.match(source, /a11y:\s*\{\s*disable:\s*false\s*\}/, `${file} must enable a11y`)
  }

  assert.match(
    read(join(storiesDir, 'Stack.stories.ts')),
    /export const Default: Story =/,
    'the single-example Stack story exports Default',
  )
  assert.match(
    read(join(storiesDir, 'Stack.gaps.stories.ts')),
    /export const Gaps: Story =/,
    'the comparison Stack story exports Gaps',
  )
})
