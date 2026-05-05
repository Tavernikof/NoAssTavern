export const createSorterByDate = <F extends string>(field: F) => {
  const cache = new Map<string | Date, number>();

  const parse = (value: string | Date) => {
    if (value instanceof Date) return Number(value);
    let parsed = cache.get(value);
    if (parsed === undefined) {
      parsed = Number(new Date(value));
      cache.set(value, parsed);
    }
    return parsed;
  };

  return <I extends Record<F, string | Date>>(v1: I, v2: I): number => {
    return parse(v2[field]) - parse(v1[field]);
  };
};

export const sortByCreatedAt = createSorterByDate("createdAt");
export const sortByUpdatedAt = createSorterByDate("updatedAt");