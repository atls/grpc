import type * as CodeProto         from '../proto/google/rpc/code_pb.js'
import type * as ErrorDetailsProto from '../proto/google/rpc/error_details_pb.js'
import type * as StatusProto       from '../proto/google/rpc/status_pb.js'

import { createRequire }           from 'node:module'

const require = createRequire(import.meta.url)
const code = require('../proto/google/rpc/code_pb.js') as typeof CodeProto
const errorDetails = require('../proto/google/rpc/error_details_pb.js') as typeof ErrorDetailsProto
const status = require('../proto/google/rpc/status_pb.js') as typeof StatusProto

export const { Code } = code
export const { Status } = status
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
export * from './error-status.js'
export * from './error-status.constants.js'
export * from './google.rpc.js'
export * from './status-details.js'
