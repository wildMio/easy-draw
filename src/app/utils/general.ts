export const notNil = <T>(val: T): val is Exclude<T, null | undefined> =>
  val !== null && val !== undefined;
