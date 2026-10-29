import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { bytesForHuman } from './convert-bytes'

describe('bytesForHuman', () => {
  it('keeps values below one kibibyte in bytes', () => {
    assert.equal(bytesForHuman(1023), '1023 B')
  })

  it('converts exact unit boundaries to the next unit', () => {
    assert.equal(bytesForHuman(1024), '1 KB')
    assert.equal(bytesForHuman(1024 ** 2), '1 MB')
  })

  it('uses the requested decimal precision', () => {
    assert.equal(bytesForHuman(1536, 1), '1.5 KB')
  })
})
