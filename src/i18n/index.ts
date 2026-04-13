import en from "./en";
import es from "./es";
import zh from "./zh";
import vi from "./vi";

export type Locale = "en" | "es" | "zh" | "vi";

export const LOCALES = [
  { code: "en" as const, nativeName: "English" },
  { code: "es" as const, nativeName: "Español" },
  { code: "zh" as const, nativeName: "中文" },
  { code: "vi" as const, nativeName: "Tiếng Việt" },
];

const translations: Record<Locale, Record<string, string>> = { en, es, zh, vi };

export function t(locale: Locale, key: string): string {
  return translations[locale][key] ?? translations.en[key] ?? key;
}

export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
