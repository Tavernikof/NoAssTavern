export const sortByCreatedAt = <I extends { createdAt: string }>(array: I[], desc?: boolean): I[] => {
  const parsedDates = new Map<string, number>();
  array.forEach(item => {
    if (!parsedDates.has(item.createdAt)) {
      parsedDates.set(item.createdAt, Number(new Date(item.createdAt)));
    }
  });

  return array.sort(({ createdAt: createdAt1 }, { createdAt: createdAt2 }) => {
    const date1 = parsedDates.get(createdAt1);
    const date2 = parsedDates.get(createdAt2);
    if (!date1 || !date2) return 0;
    return date1 === date2 ? 0 : (desc ? date1 - date2 : date2 - date1);
  });
};