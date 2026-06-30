import type { ServiceError }             from '@grpc/grpc-js'
import type { Message }                  from 'google-protobuf'

import type { ErrorStatusObject }        from './error-status.interfaces.js'
import type { ErrorStatusStoredDetail }  from './error-status.interfaces.js'
import type { DeserializeBinary }        from './google.rpc.interfaces.js'

import { Metadata }                      from '@grpc/grpc-js'

import { GRPC_ERROR_DETAILS_KEY }        from './error-status.constants.js'
import { Any }                           from './proto.js'
import { Code }                          from './proto.js'
import { Status }                        from './proto.js'
import { getGoogleErrorDetailsTypeName } from './google.rpc.js'
import { getErrorStatusDetails }         from './status-details.js'
import { isObject }                      from './utils.js'

export class ErrorStatus<T extends Message> {
  private status: InstanceType<typeof Status>

  private code: number

  private message: string

  private details: Array<ErrorStatusStoredDetail<T>> = []

  constructor(code: number, message: string) {
    this.code = code
    this.message = message
    this.status = new Status()
    this.status.setCode(code)
    this.status.setMessage(message)
  }

  static fromServiceError<TMap extends Record<string, DeserializeBinary>>(
    error: ServiceError,
    deserializeMap: TMap = {} as TMap
  ): ErrorStatus<ReturnType<TMap[keyof TMap]>> {
    const errorStatus = new ErrorStatus<ReturnType<TMap[keyof TMap]>>(
      error.code || Code.UNKNOWN,
      error.details || error.message
    )

    errorStatus.addUnpackedDetails(getErrorStatusDetails(error, deserializeMap))

    return errorStatus
  }

  toServiceError(metadata: Metadata = new Metadata()): ServiceError {
    metadata.add(GRPC_ERROR_DETAILS_KEY, Buffer.from(this.status.serializeBinary()))

    return {
      name: 'ServiceError',
      code: this.code,
      message: this.message,
      details: this.message,
      metadata,
    }
  }

  addDetail(detail: T, typeName?: string, typeNamePrefix?: string): this {
    const anyPb = new Any()

    anyPb.pack(
      detail.serializeBinary(),
      typeName || getGoogleErrorDetailsTypeName(detail) || 'unknown',
      typeNamePrefix
    )

    this.status.addDetails(anyPb)

    this.details.push({
      '@type': anyPb.getTypeUrl(),
      detail,
    })

    return this
  }

  toObject(): ErrorStatusObject {
    const [status] = Object.entries(Code).find(
      (entry) => String(entry[1]) === String(this.code)
    ) || ['UNKNOWN']

    return {
      status: status as keyof typeof Code | 'UNKNOWN',
      code: this.code,
      message: this.message,
      details: this.details.map((d) => {
        const data = d.detail.toObject()

        if (isObject(data)) {
          return {
            '@type': d['@type'],
            ...data,
          }
        }

        return data
      }),
    }
  }

  private addUnpackedDetails(details: Array<ErrorStatusStoredDetail<T>>): this {
    this.details.push(...details)

    return this
  }
}
