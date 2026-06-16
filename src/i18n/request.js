import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const SUPPORTED_LOCALES = ["vi", "en"];

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = store.get("locale")?.value;

  // validate locale hợp lệ, tránh load file không tồn tại
  const validLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "vi";

  return {
    locale: validLocale,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});