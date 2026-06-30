/* eslint-disable @typescript-eslint/no-shadow */
import type { BadRequestFieldViolation }           from './proto.interfaces.js'
import type { BadRequestFieldViolationObject }     from './proto.interfaces.js'
import type { BadRequestObject }                   from './proto.interfaces.js'
import type { DebugInfoObject }                    from './proto.interfaces.js'
import type { ErrorInfoObject }                    from './proto.interfaces.js'
import type { HelpLink }                           from './proto.interfaces.js'
import type { HelpLinkObject }                     from './proto.interfaces.js'
import type { HelpObject }                         from './proto.interfaces.js'
import type { LocalizedMessageObject }             from './proto.interfaces.js'
import type { PreconditionFailureObject }          from './proto.interfaces.js'
import type { PreconditionFailureViolation }       from './proto.interfaces.js'
import type { PreconditionFailureViolationObject } from './proto.interfaces.js'
import type { QuotaFailureObject }                 from './proto.interfaces.js'
import type { QuotaFailureViolation }              from './proto.interfaces.js'
import type { QuotaFailureViolationObject }        from './proto.interfaces.js'
import type { RequestInfoObject }                  from './proto.interfaces.js'
import type { ResourceInfoObject }                 from './proto.interfaces.js'
import type { RetryInfoObject }                    from './proto.interfaces.js'
import type { StatusObject }                       from './proto.interfaces.js'

export *      from './error-status.js'
export *      from './error-status.constants.js'
export type * from './error-status.interfaces.js'
export *      from './google.rpc.js'
export type * from './google.rpc.interfaces.js'
export {
  Any,
  BadRequest,
  Code,
  DebugInfo,
  ErrorInfo,
  Help,
  LocalizedMessage,
  PreconditionFailure,
  QuotaFailure,
  RequestInfo,
  ResourceInfo,
  RetryInfo,
  Status,
} from './proto.js'
export type * from './proto.interfaces.js'
export *      from './status-details.js'
export type * from './status-details.interfaces.js'

export namespace BadRequest {
  export type AsObject = BadRequestObject

  export type FieldViolation = BadRequestFieldViolation

  export namespace FieldViolation {
    export type AsObject = BadRequestFieldViolationObject
  }
}

export namespace DebugInfo {
  export type AsObject = DebugInfoObject
}

export namespace ErrorInfo {
  export type AsObject = ErrorInfoObject
}

export namespace Help {
  export type AsObject = HelpObject

  export type Link = HelpLink

  export namespace Link {
    export type AsObject = HelpLinkObject
  }
}

export namespace LocalizedMessage {
  export type AsObject = LocalizedMessageObject
}

export namespace PreconditionFailure {
  export type AsObject = PreconditionFailureObject

  export type Violation = PreconditionFailureViolation

  export namespace Violation {
    export type AsObject = PreconditionFailureViolationObject
  }
}

export namespace QuotaFailure {
  export type AsObject = QuotaFailureObject

  export type Violation = QuotaFailureViolation

  export namespace Violation {
    export type AsObject = QuotaFailureViolationObject
  }
}

export namespace RequestInfo {
  export type AsObject = RequestInfoObject
}

export namespace ResourceInfo {
  export type AsObject = ResourceInfoObject
}

export namespace RetryInfo {
  export type AsObject = RetryInfoObject
}

export namespace Status {
  export type AsObject = StatusObject
}
