// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isObject = (value: any): boolean =>
  value !== undefined && typeof value === 'object' && value.constructor === Object
