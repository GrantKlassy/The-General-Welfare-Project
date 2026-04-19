import en from "./en";
import es from "./es";
import zhHans from "./zh-Hans";
import vi from "./vi";
import fil from "./fil";
import ko from "./ko";
import ja from "./ja";
import ar from "./ar";
import ht from "./ht";

export type Locale =
  | "en"
  | "es"
  | "zh-Hans"
  | "vi"
  | "fil"
  | "ko"
  | "ja"
  | "ar"
  | "ht";

export const LOCALES = [
  { code: "en" as const, nativeName: "English" },
  { code: "es" as const, nativeName: "Español" },
  { code: "zh-Hans" as const, nativeName: "中文" },
  { code: "vi" as const, nativeName: "Tiếng Việt" },
  { code: "fil" as const, nativeName: "Filipino" },
  { code: "ko" as const, nativeName: "한국어" },
  { code: "ja" as const, nativeName: "日本語" },
  { code: "ar" as const, nativeName: "العربية" },
  { code: "ht" as const, nativeName: "Kreyòl Ayisyen" },
];

const translations: Record<Locale, Record<string, string>> = {
  en,
  es,
  "zh-Hans": zhHans,
  vi,
  fil,
  ko,
  ja,
  ar,
  ht,
};

export function t(locale: Locale, key: string): string {
  return translations[locale][key] ?? translations.en[key] ?? key;
}

export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return `/${locale}${path}`;
}
