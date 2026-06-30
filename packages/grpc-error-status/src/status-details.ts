import type { ServiceError }          from '@grpc/grpc-js'
import type { Message }               from 'google-protobuf'

import type { DeserializeBinary }     from './google.rpc.js'

import { createRequire }              from 'node:module'

import { GRPC_ERROR_DETAILS_KEY }     from './error-status.constants.js'
import { getGoogleDeserializeBinary } from './google.rpc.js'

const require = createRequire(import.meta.url)

type GoogleRpcStatus = {
  getDetailsList: () => Array<GoogleRpcAny>
}

type GoogleRpcStatusConstructor = {
  deserializeBinary: (bytes: Uint8Array) => GoogleRpcStatus
}

const { Status } = require('../proto/google/rpc/status_pb.js') as {
  Status: GoogleRpcStatusConstructor
}

export type ErrorStatusDetail<T extends Message = Message> = {
  '@type': string
  detail: T
}

export type DeserializeMap<T extends Message = Message> = Partial<
  Record<string, DeserializeBinary<T>>
>

type DeserializeMapResult<TMap extends DeserializeMap> = ReturnType<NonNullable<TMap[keyof TMap]>>

type GoogleRpcAny = {
  getTypeName: () => string
  getTypeUrl: () => string
  getValue_asU8: () => Uint8Array
  unpack: <T extends Message>(deserialize: DeserializeBinary<T>, typeName: string) => T | null
}

const normalizeTypeName = (typeName: string): string => typeName.split('/').at(-1) ?? typeName

const resolveTypeName = (detail: GoogleRpcAny): string =>
  normalizeTypeName(detail.getTypeName() || detail.getTypeUrl())

const resolveDeserializeBinary = <TMap extends DeserializeMap>(
  typeName: string,
  deserializeMap: TMap
): DeserializeBinary | undefined =>
  getGoogleDeserializeBinary(typeName) ||
  deserializeMap[typeName] ||
  deserializeMap[normalizeTypeName(typeName)]

export const getErrorStatusDetails = <TMap extends DeserializeMap>(
  error: ServiceError,
  deserializeMap: TMap = {} as TMap
): Array<ErrorStatusDetail<DeserializeMapResult<TMap>>> => {
  const buffer = error.metadata.get(GRPC_ERROR_DETAILS_KEY)[0]

  if (!buffer || typeof buffer === 'string') {
    return []
  }

  const details = Status.deserializeBinary(buffer).getDetailsList()

  return details.reduce<Array<ErrorStatusDetail<DeserializeMapResult<TMap>>>>((result, detail) => {
    const typeName = resolveTypeName(detail)
    const deserialize = resolveDeserializeBinary(typeName, deserializeMap)

    if (!deserialize) {
      return result
    }

    const message = detail.unpack(deserialize, typeName) ?? deserialize(detail.getValue_asU8())

    result.push({
      '@type': detail.getTypeUrl(),
      detail: message as DeserializeMapResult<TMap>,
    })

    return result
  }, [])
}
