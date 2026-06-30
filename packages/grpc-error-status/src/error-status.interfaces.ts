import type { Message } from 'google-protobuf'

import type { Code }    from './proto.js'

export type ErrorStatusObject = {
  status: keyof typeof Code | 'UNKNOWN'
  code: number
  message: string
  details: Array<unknown>
}

export type ErrorStatusStoredDetail<T extends Message> = {
  '@type': string
  detail: T
}
