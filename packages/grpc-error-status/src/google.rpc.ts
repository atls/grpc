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
    [`google.rpc.${key}`]: errorDetails[key].deserializeBinary,
  }),
  {}
)

export const getGoogleDeserializeBinary = (typeName: string) => {
  if (typeName.startsWith('google.rpc.')) {
    return errorDetails[typeName.replace('google.rpc.', '')]?.deserializeBinary
  }

  return errorDetails[typeName]?.deserializeBinary
}

export const getGoogleErrorDetailsTypeName = (detail): string | undefined =>
  Object.keys(errorDetails).reduce((result: string | undefined, key) => {
    if (errorDetails[key] instanceof Function && detail instanceof errorDetails[key]) {
      return `google.rpc.${key}`
    }

    return result
  }, undefined)

export { errorDetails }
