import type { Message }       from 'google-protobuf'

import type * as ErrorDetails from '../proto/google/rpc/error_details_pb.js'

import { createRequire }      from 'node:module'

const require = createRequire(import.meta.url)
const errorDetails = require('../proto/google/rpc/error_details_pb.js') as typeof ErrorDetails

export type DeserializeBinary<T extends Message = Message> = (data: Uint8Array) => T

const deserializeKeys = [
  'RetryInfo',
  'DebugInfo',
  'QuotaFailure',
  'PreconditionFailure',
  'BadRequest',
  'RequestInfo',
  'ResourceInfo',
  'Help',
  'LocalizedMessage',
] as const

const normalizeTypeName = (typeName: string): string => typeName.split('/').at(-1) ?? typeName

export const googleDeserializeMap = deserializeKeys.reduce<Record<string, DeserializeBinary>>(
  (result, key) => ({
    ...result,
    [`google.rpc.${key}`]: errorDetails[key].deserializeBinary,
    [key]: errorDetails[key].deserializeBinary,
  }),
  {}
)

export const getGoogleDeserializeBinary = (typeName: string): DeserializeBinary | undefined => {
  const normalizedTypeName = normalizeTypeName(typeName)
  const key = normalizedTypeName.startsWith('google.rpc.')
    ? normalizedTypeName.replace('google.rpc.', '')
    : normalizedTypeName

  if (deserializeKeys.includes(key as (typeof deserializeKeys)[number])) {
    return errorDetails[key as (typeof deserializeKeys)[number]].deserializeBinary
  }

  return undefined
}

export const getGoogleErrorDetailsTypeName = (detail: unknown): string | undefined =>
  Object.keys(errorDetails).reduce((result: string | undefined, key) => {
    const constructor = errorDetails[key as keyof typeof errorDetails]

    if (constructor instanceof Function && detail instanceof constructor) {
      return `google.rpc.${key}`
    }

    return result
  }, undefined)

export { errorDetails }
