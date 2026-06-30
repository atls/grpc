export type BinaryMessage = {
  serializeBinary: () => Uint8Array
}

export type GoogleRpcAnyMessage = {
  getTypeName: () => string
  getTypeUrl: () => string
  pack: (bytes: Uint8Array, typeName: string, typeNamePrefix?: string) => void
}

export type GoogleRpcAny = {
  prototype: GoogleRpcAnyMessage
  new (): GoogleRpcAnyMessage
}

export type GoogleRpcBadRequest = BinaryMessage & {
  addFieldViolations: (violation: BinaryMessage) => void
}

export type GoogleRpcBadRequestMessage = GoogleRpcBadRequest & {
  toObject: () => {
    fieldViolationsList: Array<{
      field: string
      description: string
    }>
  }
}

export type GoogleRpcBadRequestConstructor = {
  FieldViolation: new () => BinaryMessage & {
    setDescription: (description: string) => void
    setField: (field: string) => void
  }
  new (): GoogleRpcBadRequest
}

export type GoogleRpcStatus = BinaryMessage & {
  addDetails: (detail: InstanceType<GoogleRpcAny>) => void
  setCode: (code: number) => void
  setMessage: (message: string) => void
}

export type GoogleRpcStatusConstructor = new () => GoogleRpcStatus
