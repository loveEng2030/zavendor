export const CATEGORIES = [
  { value: "dairy", label: "ألبان", emoji: "🥛" },
  { value: "ghee", label: "سمن وزيوت", emoji: "🫙" },
  { value: "cheese", label: "أجبان", emoji: "🧀" },
  { value: "cleaning", label: "منظفات", emoji: "🧴" },
  { value: "groceries", label: "بقالة", emoji: "🛒" },
  { value: "snacks", label: "سناكس وحلويات", emoji: "🍫" },
  { value: "drinks", label: "مشروبات", emoji: "🥤" },
  { value: "bakery", label: "مخبوزات", emoji: "🍞" },
  { value: "frozen", label: "مجمدات", emoji: "🧊" },
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
