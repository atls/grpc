import type { Message }           from 'google-protobuf'

import type { DeserializeBinary } from './google.rpc.interfaces.js'

export type ErrorStatusDetail<T extends Message = Message> = {
  '@type': string
  detail: T
}

export type DeserializeMap<T extends Message = Message> = Partial<
  Record<string, DeserializeBinary<T>>
>

export type DeserializeMapResult<TMap extends DeserializeMap> = ReturnType<
  NonNullable<TMap[keyof TMap]>
>
