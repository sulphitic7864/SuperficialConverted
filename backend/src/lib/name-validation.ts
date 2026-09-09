export function isFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2 && parts.every((part) => part.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ'-]/g, '').length >= 2);
}