import { enUS, type MessageKey } from "./catalogs/en-US";
import { zhCN } from "./catalogs/zh-CN";
import { localeSignal, type Locale } from "./locale";

export type { MessageKey } from "./catalogs/en-US";
export type MessageParams = Record<string, string | number>;

const catalogs: Record<Locale, Record<MessageKey, string>> = {
  "en-US": enUS,
  "zh-CN": zhCN,
};

export function formatMessage(
  template: string,
  params?: MessageParams,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: MessageParams,
): string {
  const template = catalogs[locale]?.[key] ?? enUS[key] ?? key;
  return formatMessage(template, params);
}

export function t(key: MessageKey, params?: MessageParams): string {
  return translate(localeSignal(), key, params);
}
