import type { ServiceError }          from '@grpc/grpc-js'

import type { DeserializeMap }        from './status-details.interfaces.js'
import type { DeserializeMapResult }  from './status-details.interfaces.js'
import type { ErrorStatusDetail }     from './status-details.interfaces.js'

import { GRPC_ERROR_DETAILS_KEY }     from './error-status.constants.js'
import { Status }                     from './proto.js'
import { getGoogleDeserializeBinary } from './google.rpc.js'

const normalizeTypeName = (typeName: string): string => typeName.split('/').at(-1) ?? typeName

const resolveDeserializeBinary = <TMap extends DeserializeMap>(
  typeNames: Array<string>,
  deserializeMap: TMap
): NonNullable<TMap[keyof TMap]> | ReturnType<typeof getGoogleDeserializeBinary> =>
  typeNames.reduce<NonNullable<TMap[keyof TMap]> | ReturnType<typeof getGoogleDeserializeBinary>>(
    (deserialize, typeName) =>
      deserialize ||
      getGoogleDeserializeBinary(typeName) ||
      deserializeMap[typeName] ||
      deserializeMap[normalizeTypeName(typeName)],
    undefined
  )

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
    const typeName = detail.getTypeName() || detail.getTypeUrl()
    const typeUrl = detail.getTypeUrl()
    const deserialize = resolveDeserializeBinary([typeName, typeUrl], deserializeMap)

    if (!deserialize) {
      return result
    }

    const unpackTypeName = normalizeTypeName(typeName)
    const message =
      detail.unpack(deserialize, unpackTypeName) ?? deserialize(detail.getValue_asU8())

    result.push({
      '@type': detail.getTypeUrl(),
      detail: message as DeserializeMapResult<TMap>,
    })

    return result
  }, [])
}
