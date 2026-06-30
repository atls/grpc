import type { ServiceError }             from '@grpc/grpc-js'
import type { Message }                  from 'google-protobuf'

import type * as CodeProto               from '../proto/google/rpc/code_pb.js'
import type * as StatusProto             from '../proto/google/rpc/status_pb.js'
import type { DeserializeBinary }        from './google.rpc.js'

import { createRequire }                 from 'node:module'

import { Metadata }                      from '@grpc/grpc-js'

import { GRPC_ERROR_DETAILS_KEY }        from './error-status.constants.js'
import { getGoogleErrorDetailsTypeName } from './google.rpc.js'
import { getErrorStatusDetails }         from './status-details.js'
import { isObject }                      from './utils.js'

const createdRequire = createRequire(import.meta.url)

type GoogleRpcAny = NonNullable<
  Parameters<InstanceType<typeof StatusProto.Status>['addDetails']>[0]
>

type GoogleRpcAnyConstructor = new () => GoogleRpcAny

const { Any } = createdRequire('google-protobuf/google/protobuf/any_pb') as {
  Any: GoogleRpcAnyConstructor
}
const { Code } = createdRequire('../proto/google/rpc/code_pb.js') as typeof CodeProto
const { Status } = createdRequire('../proto/google/rpc/status_pb.js') as typeof StatusProto

export class ErrorStatus<T extends Message> {
  private status: InstanceType<typeof Status>

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

  toObject(): {
    status: keyof typeof Code | 'UNKNOWN'
    code: number
    message: string
    details: Array<unknown>
  } {
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

  private addUnpackedDetails(details: Array<{ '@type': string; detail: T }>): this {
    this.details.push(...details)

    return this
  }
}
