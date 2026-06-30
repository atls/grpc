import type { Message }            from 'google-protobuf'

import type * as CodeProto         from '../proto/google/rpc/code_pb.js'
import type * as ErrorDetailsProto from '../proto/google/rpc/error_details_pb.js'
import type * as StatusProto       from '../proto/google/rpc/status_pb.js'

export type GoogleRpcCodeProto = typeof CodeProto

export type GoogleRpcErrorDetailsProto = typeof ErrorDetailsProto

export type GoogleRpcStatusProto = typeof StatusProto

export type GoogleRpcStatus = InstanceType<typeof StatusProto.Status>

export type GoogleRpcAny = NonNullable<Parameters<GoogleRpcStatus['addDetails']>[0]>

export type GoogleRpcAnyConstructor = new () => GoogleRpcAny

export type GoogleRpcStatusConstructor = typeof StatusProto.Status

export type GoogleRpcDetailConstructor = (new () => Message) & {
  deserializeBinary: (data: Uint8Array) => Message
}
