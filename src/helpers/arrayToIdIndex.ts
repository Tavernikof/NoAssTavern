export const arrayToIdIndex = <I extends { [key in K]: number | string }, K extends string = 'id'>(arr: readonly I[], key: K = 'id' as K) => {
  return arr.reduce((dict, item) => {
    dict[item[key]] = item;
    return dict;
  }, {} as { [key in string | number]: I }) as { [key in typeof arr[number][K]]: I };
};

export default arrayToIdIndex;
