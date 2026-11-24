export const CATEGORIES = [
  { value: "beauty", label: "مستحضرات تجميل", emoji: "💄" },
  { value: "cleaning", label: "منظفات", emoji: "🧴" },
  { value: "paper", label: "ورقيات", emoji: "🧻" },
  { value: "other", label: "أخرى", emoji: "📦" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const getCategoryLabel = (value?: string | null) => {
  if (!value) return null;
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
};

export const getCategoryEmoji = (value?: string | null) => {
  if (!value) return "";
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? "";
};
