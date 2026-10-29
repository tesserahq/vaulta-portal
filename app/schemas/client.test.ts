import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { clientSchema } from './client'

describe('clientSchema', () => {
  it('accepts lowercase client IDs with internal hyphens', () => {
    assert.deepEqual(clientSchema.parse({ name: 'Production', client_id: 'production-app-1' }), {
      name: 'Production',
      client_id: 'production-app-1',
    })
  })

  it('rejects uppercase IDs, leading or trailing hyphens, and empty names', () => {
    for (const client_id of ['Production', '-production', 'production-', '']) {
      assert.equal(clientSchema.safeParse({ name: 'Production', client_id }).success, false)
    }

    assert.equal(clientSchema.safeParse({ name: '', client_id: 'production' }).success, false)
  })
})
