import type { ServiceError }             from '@grpc/grpc-js'
import type { Message }                  from 'google-protobuf'

import { Metadata }                      from '@grpc/grpc-js'
import { Any }                           from 'google-protobuf/google/protobuf/any_pb'

import { Code }                          from '../proto/google/rpc/code_pb'
import { Status }                        from '../proto/google/rpc/status_pb'
import { GRPC_ERROR_DETAILS_KEY }        from './error-status.constants'
import { getGoogleErrorDetailsTypeName } from './google.rpc'
import { getGoogleDeserializeBinary }    from './google.rpc'
import { isObject }                      from './utils'

export class ErrorStatus<T extends Message> {
  private status: Status

  private code: number

  private message: string

  private details: Array<{ '@type': string; detail: T }> = []

  constructor(code: number, message: string) {
    this.code = code
    this.message = message
    this.status = new Status()
    this.status.setCode(code)
    this.status.setMessage(message)
  }

  static fromServiceError<TMap extends Record<string, (bytes: Uint8Array) => any>>(
    error: ServiceError,
    deserializeMap: TMap = {} as TMap
  ): ErrorStatus<ReturnType<TMap[keyof TMap]>> {
    const errorStatus = new ErrorStatus<ReturnType<TMap[keyof TMap]>>(
      error.code || Code.UNKNOWN,
      error.details || error.message
    )

    const buffer = error.metadata?.get(GRPC_ERROR_DETAILS_KEY)?.[0]

    if (buffer && typeof buffer !== 'string') {
      const details = Status.deserializeBinary(buffer)
        .getDetailsList()
        .reduce<Array<{ '@type': string; detail: any }>>((result, detail) => {
          const typeName = detail.getTypeName()
          const deserialize = getGoogleDeserializeBinary(typeName) || deserializeMap[typeName]

          if (deserialize) {
            const message = detail.unpack(deserialize, typeName)

            if (message) {
              result.push({
                '@type': detail.getTypeUrl(),
                detail: message,
              })
            }
          }

          return result
        }, [])

      errorStatus.addUnpackedDetails(details)
    }

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

  toObject(): {
    status: string
    code: number
    message: string
    details: Array<Record<string, any>>
  } {
    const [status] = Object.entries(Code).find((entry) => entry[1] === (this.code as Code)) || [
      'UNKNOWN',
    ]

    return {
      status,
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

  private addUnpackedDetails(details: Array<{ '@type': string; detail: T }>): this {
    this.details.push(...details)

    return this
  }
}
