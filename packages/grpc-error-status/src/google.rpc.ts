import errorDetails from '../proto/google/rpc/error_details_pb'

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
]

export const googleDeserializeMap = deserializeKeys.reduce(
  (result, key) => ({
    ...result,
    // @ts-expect-error
    [`google.rpc.${key}`]: errorDetails[key].deserializeBinary,
  }),
  {}
)

export const getGoogleDeserializeBinary = (
  typeName: string
): ((data: Uint8Array) => any) | undefined => {
  if (typeName.startsWith('google.rpc.')) {
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return errorDetails[typeName.replace('google.rpc.', '')]?.deserializeBinary
  }

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return errorDetails[typeName]?.deserializeBinary
}

export const getGoogleErrorDetailsTypeName = (detail: unknown): string | undefined =>
  Object.keys(errorDetails).reduce((result: string | undefined, key) => {
    // @ts-expect-error
    if (errorDetails[key] instanceof Function && detail instanceof errorDetails[key]) {
      return `google.rpc.${key}`
    }

    return result
  }, undefined)

export { errorDetails }
