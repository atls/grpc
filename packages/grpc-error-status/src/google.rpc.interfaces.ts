import type { Message } from 'google-protobuf'

export type DeserializeBinary<T extends Message = Message> = (data: Uint8Array) => T
