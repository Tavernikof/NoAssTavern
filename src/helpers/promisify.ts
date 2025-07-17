export const isPromise = (obj: any): obj is Promise<any> => {
  return !!obj && typeof obj.then === "function";
};

export const promisify = <V>(value: V): Promise<Awaited<V>> => {
  if (isPromise(value)) return value;
  return Promise.resolve(value);
};
