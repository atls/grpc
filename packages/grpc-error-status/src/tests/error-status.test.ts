import type { ServiceError }     from '@grpc/grpc-js'

import assert                    from 'node:assert/strict'
import { createRequire }         from 'node:module'
import { describe }              from 'node:test'
import { it }                    from 'node:test'

import { Metadata }              from '@grpc/grpc-js'

import { BadRequest }            from '../index.js'
import { Code }                  from '../index.js'
import { ErrorStatus }           from '../index.js'
import { getErrorStatusDetails } from '../index.js'

type BinaryMessage = {
  serializeBinary: () => Uint8Array
}

type GoogleRpcAnyMessage = {
  getTypeName: () => string
  getTypeUrl: () => string
  pack: (bytes: Uint8Array, typeName: string, typeNamePrefix?: string) => void
}

type GoogleRpcAny = {
  prototype: GoogleRpcAnyMessage
  new (): GoogleRpcAnyMessage
}

type GoogleRpcBadRequest = BinaryMessage & {
  addFieldViolations: (violation: BinaryMessage) => void
}

type GoogleRpcBadRequestMessage = GoogleRpcBadRequest & {
  toObject: () => {
    fieldViolationsList: Array<{
      field: string
      description: string
    }>
  }
}

type GoogleRpcBadRequestConstructor = {
  FieldViolation: new () => BinaryMessage & {
    setDescription: (description: string) => void
    setField: (field: string) => void
  }
  new (): GoogleRpcBadRequest
}

type GoogleRpcStatus = BinaryMessage & {
  addDetails: (detail: InstanceType<GoogleRpcAny>) => void
  setCode: (code: number) => void
  setMessage: (message: string) => void
}

type GoogleRpcStatusConstructor = new () => GoogleRpcStatus

const require = createRequire(import.meta.url)
const { Any } = require('google-protobuf/google/protobuf/any_pb') as {
  Any: GoogleRpcAny
}
const { Status } = require('../../proto/google/rpc/status_pb.js') as {
  Status: GoogleRpcStatusConstructor
}

const createValidationError = (): ServiceError => {
  const metadata = new Metadata()
  const violation = new (BadRequest as unknown as GoogleRpcBadRequestConstructor).FieldViolation()
  const badRequest = new (BadRequest as unknown as GoogleRpcBadRequestConstructor)()
  const detail = new Any()
  const status = new Status()

  violation.setField('id')
  violation.setDescription('id must be an email')
  badRequest.addFieldViolations(violation)
  detail.pack(badRequest.serializeBinary(), 'google.rpc.BadRequest')
  status.setCode(Code.INVALID_ARGUMENT)
  status.setMessage('Request validation failed')
  status.addDetails(detail)
  metadata.add('grpc-status-details-bin', Buffer.from(status.serializeBinary()))

  return Object.assign(new Error('3 INVALID_ARGUMENT: Request validation failed'), {
    code: Code.INVALID_ARGUMENT,
    details: 'Request validation failed',
    metadata,
  }) as unknown as ServiceError
}

describe('ErrorStatus', () => {
  it('exports the public package entrypoint', async () => {
    const entrypoint = await import('../index.js')

    assert.equal(typeof entrypoint.ErrorStatus, 'function')
    assert.equal(typeof entrypoint.BadRequest, 'function')
    assert.equal(entrypoint.Code.INVALID_ARGUMENT, 3)
  })

  it('preserves google rpc validation details', () => {
    const errorStatus = ErrorStatus.fromServiceError(createValidationError())

    assert.deepEqual(errorStatus.toObject(), {
      status: 'INVALID_ARGUMENT',
      code: Code.INVALID_ARGUMENT,
      message: 'Request validation failed',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.BadRequest',
          fieldViolationsList: [
            {
              field: 'id',
              description: 'id must be an email',
            },
          ],
        },
      ],
    })
  })

  it('preserves details when any returns a full type url as type name', () => {
    const originalGetTypeName = Any.prototype.getTypeName

    try {
      Any.prototype.getTypeName = function getTypeName() {
        return this.getTypeUrl()
      }

      const [detail] = getErrorStatusDetails(createValidationError())
      const detailMessage = detail.detail as unknown as GoogleRpcBadRequestMessage

      assert.deepEqual(detailMessage.toObject(), {
        fieldViolationsList: [
          {
            field: 'id',
            description: 'id must be an email',
          },
        ],
      })
    } finally {
      Any.prototype.getTypeName = originalGetTypeName
    }
  })
})
