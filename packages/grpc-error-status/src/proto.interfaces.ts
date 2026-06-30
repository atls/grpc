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

export type BadRequestObject = ErrorDetailsProto.BadRequest.AsObject

export type BadRequestFieldViolation = ErrorDetailsProto.BadRequest.FieldViolation

export type BadRequestFieldViolationObject = ErrorDetailsProto.BadRequest.FieldViolation.AsObject

export type DebugInfoObject = ErrorDetailsProto.DebugInfo.AsObject

export type ErrorInfoObject = ErrorDetailsProto.ErrorInfo.AsObject

export type HelpObject = ErrorDetailsProto.Help.AsObject

export type HelpLink = ErrorDetailsProto.Help.Link

export type HelpLinkObject = ErrorDetailsProto.Help.Link.AsObject

export type LocalizedMessageObject = ErrorDetailsProto.LocalizedMessage.AsObject

export type PreconditionFailureObject = ErrorDetailsProto.PreconditionFailure.AsObject

export type PreconditionFailureViolation = ErrorDetailsProto.PreconditionFailure.Violation

export type PreconditionFailureViolationObject =
  ErrorDetailsProto.PreconditionFailure.Violation.AsObject

export type QuotaFailureObject = ErrorDetailsProto.QuotaFailure.AsObject

export type QuotaFailureViolation = ErrorDetailsProto.QuotaFailure.Violation

export type QuotaFailureViolationObject = ErrorDetailsProto.QuotaFailure.Violation.AsObject

export type RequestInfoObject = ErrorDetailsProto.RequestInfo.AsObject

export type ResourceInfoObject = ErrorDetailsProto.ResourceInfo.AsObject

export type RetryInfoObject = ErrorDetailsProto.RetryInfo.AsObject

export type StatusObject = StatusProto.Status.AsObject
