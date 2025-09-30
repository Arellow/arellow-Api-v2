export function mapEnumValue(enumMap: Record<string, string>, key: string | null): string | null {
  if (!key) return null;
  return enumMap[key] || key;
}