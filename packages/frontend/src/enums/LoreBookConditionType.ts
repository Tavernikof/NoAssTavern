export enum LoreBookConditionType {
  any = "any",
  all = "all",
  notAny = "notAny",
  notAll = "notAll",
}

export const loreBookConditionOptions: { value: LoreBookConditionType, label: string }[] = [
  { value: LoreBookConditionType.any, label: "Any" },
  { value: LoreBookConditionType.all, label: "All" },
  { value: LoreBookConditionType.notAny, label: "Not any" },
  { value: LoreBookConditionType.notAll, label: "Not all" },
];