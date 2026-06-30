import type { DeserializeBinary }          from './google.rpc.interfaces.js'
import type { GoogleRpcDetailConstructor } from './proto.interfaces.js'

import { errorDetails }                    from './proto.js'

const normalizeTypeName = (typeName: string): string => typeName.split('/').at(-1) ?? typeName

const isGoogleRpcDetailConstructor = (
  constructor: unknown
): constructor is GoogleRpcDetailConstructor =>
  constructor instanceof Function &&
  typeof (constructor as { deserializeBinary?: unknown }).deserializeBinary === 'function'

const getDetailConstructor = (typeName: string): GoogleRpcDetailConstructor | undefined => {
  const normalizedTypeName = normalizeTypeName(typeName)
  const key = normalizedTypeName.startsWith('google.rpc.')
    ? normalizedTypeName.replace('google.rpc.', '')
    : normalizedTypeName
  const constructor = errorDetails[key as keyof typeof errorDetails]

  if (isGoogleRpcDetailConstructor(constructor)) {
    return constructor
  }

  return undefined
}

export const googleDeserializeMap = Object.entries(errorDetails).reduce<
  Record<string, DeserializeBinary>
>((result, [key, constructor]) => {
  if (!isGoogleRpcDetailConstructor(constructor)) {
    return result
  }

  return {
    ...result,
    [`google.rpc.${key}`]: constructor.deserializeBinary,
    [key]: constructor.deserializeBinary,
  }
}, {})

export const getGoogleDeserializeBinary = (typeName: string): DeserializeBinary | undefined => {
  const constructor = getDetailConstructor(typeName)

  return constructor?.deserializeBinary
}

export const getGoogleErrorDetailsTypeName = (detail: unknown): string | undefined =>
  Object.keys(errorDetails).reduce((result: string | undefined, key) => {
    const constructor = errorDetails[key as keyof typeof errorDetails]

    if (isGoogleRpcDetailConstructor(constructor) && detail instanceof constructor) {
      return `google.rpc.${key}`
    }

    return result
  }, undefined)

export { errorDetails }
