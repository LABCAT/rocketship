import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { renderTokenMap, tokenMapPath } from '../scripts/build-tokens.mjs'

test('token-map.scss matches the tokens JSON', () => {
  assert.equal(
    readFileSync(tokenMapPath, 'utf8'),
    renderTokenMap(),
    'Run `pnpm --filter @labcat2020/rocketship tokens` after editing src/tokens.',
  )
})
