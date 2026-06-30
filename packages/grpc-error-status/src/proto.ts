import type { GoogleRpcAnyConstructor }    from './proto.interfaces.js'
import type { GoogleRpcCodeProto }         from './proto.interfaces.js'
import type { GoogleRpcErrorDetailsProto } from './proto.interfaces.js'
import type { GoogleRpcStatusProto }       from './proto.interfaces.js'

import { createRequire }                   from 'node:module'

const require = createRequire(import.meta.url)

export const { Any } = require('google-protobuf/google/protobuf/any_pb') as {
  Any: GoogleRpcAnyConstructor
}

export const { Code } = require('../proto/google/rpc/code_pb.js') as GoogleRpcCodeProto

export const { Status } = require('../proto/google/rpc/status_pb.js') as GoogleRpcStatusProto

export const errorDetails =
  require('../proto/google/rpc/error_details_pb.js') as GoogleRpcErrorDetailsProto

export const {
  BadRequest,
  DebugInfo,
  ErrorInfo,
  Help,
  LocalizedMessage,
  PreconditionFailure,
  QuotaFailure,
  RequestInfo,
  ResourceInfo,
  RetryInfo,
} = errorDetails
