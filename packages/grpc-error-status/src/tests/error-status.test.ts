import type { ServiceError }               from '@grpc/grpc-js'

import type { GoogleRpcAnyMessage }        from './interfaces.js'
import type { GoogleRpcBadRequestMessage } from './interfaces.js'

import assert                              from 'node:assert/strict'
import { describe }                        from 'node:test'
import { it }                              from 'node:test'

import { Metadata }                        from '@grpc/grpc-js'

import { Any }                             from '../index.js'
import { BadRequest }                      from '../index.js'
import { Code }                            from '../index.js'
import { ErrorInfo }                       from '../index.js'
import { ErrorStatus }                     from '../index.js'
import { Status }                          from '../index.js'
import { getErrorStatusDetails }           from '../index.js'

const validationObject: BadRequest.AsObject = {
  fieldViolationsList: [],
}

const statusObject: Status.AsObject = {
  code: Code.INVALID_ARGUMENT,
  message: 'Request validation failed',
  detailsList: [],
}

const createValidationError = (): ServiceError => {
  const metadata = new Metadata()
  const violation = new BadRequest.FieldViolation()
  const badRequest = new BadRequest()
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

const createCustomTypeValidationError = (): ServiceError => {
  const metadata = new Metadata()
  const violation = new BadRequest.FieldViolation()
  const badRequest = new BadRequest()
  const detail = new Any()
  const status = new Status()

  violation.setField('id')
  violation.setDescription('id must be an email')
  badRequest.addFieldViolations(violation)
  detail.pack(badRequest.serializeBinary(), 'custom.BadRequest', 'type.googleapis.com')
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

  it('preserves generated namespace type exports', () => {
    assert.deepEqual(validationObject.fieldViolationsList, [])
    assert.equal(statusObject.code, Code.INVALID_ARGUMENT)
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
      Any.prototype.getTypeName = function getTypeName(this: GoogleRpcAnyMessage) {
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

  it('preserves google rpc error info details', () => {
    const errorInfo = new ErrorInfo()
    const errorStatus = new ErrorStatus(Code.PERMISSION_DENIED, 'Permission denied')

    errorInfo.setReason('ACCESS_DENIED')
    errorInfo.setDomain('auth')
    errorInfo.getMetadataMap().set('service', 'example')

    errorStatus.addDetail(errorInfo)

    const restored = ErrorStatus.fromServiceError(errorStatus.toServiceError())

    assert.deepEqual(restored.toObject(), {
      status: 'PERMISSION_DENIED',
      code: Code.PERMISSION_DENIED,
      message: 'Permission denied',
      details: [
        {
          '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
          reason: 'ACCESS_DENIED',
          domain: 'auth',
          metadataMap: [['service', 'example']],
        },
      ],
    })
  })

  it('uses custom deserializers registered under full type urls', () => {
    const [detail] = getErrorStatusDetails(createCustomTypeValidationError(), {
      'type.googleapis.com/custom.BadRequest': BadRequest.deserializeBinary,
    })
    const detailMessage = detail.detail as unknown as GoogleRpcBadRequestMessage

    assert.deepEqual(detailMessage.toObject(), {
      fieldViolationsList: [
        {
          field: 'id',
          description: 'id must be an email',
        },
      ],
    })
  })
})
