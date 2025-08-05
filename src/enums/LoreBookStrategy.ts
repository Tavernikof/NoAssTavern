export enum LoreBookStrategy {
  constant = "constant",
  normal = "normal",
  vectorized = "vectorized"
}

export const loreBookStrategyOptions: { value: LoreBookStrategy, label: string }[] = [
  { value: LoreBookStrategy.constant, label: "🔵 Constant" },
  { value: LoreBookStrategy.normal, label: "🟢 Normal" },
  { value: LoreBookStrategy.vectorized, label: "🔗 Vectorized" },
];