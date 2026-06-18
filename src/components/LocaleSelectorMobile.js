"use client";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

const SUPPORTED = ["vi", "en"];

function getLocaleCookie() {
  if (typeof document === "undefined") return "vi";
  const locale = document.cookie
    .split("; ")
    .find((row) => row.startsWith("locale="))
    ?.split("=")[1];
  return SUPPORTED.includes(locale) ? locale : "vi";
}

export default function LocaleSelectorMobile() {
  const lang = useSyncExternalStore(
    () => () => {},
    () => getLocaleCookie(),
    () => "vi"
  );

  const router = useRouter();

  const handleChangeLang = (locale) => {
    if (locale === lang) return;
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between p-3">
      <p>Ngôn ngữ / Language</p>
      <div className="flex items-center gap-3 text-sm font-medium">
        <span
          onClick={() => handleChangeLang("vi")}
          className={`cursor-pointer ${lang === "vi" ? "text-primary" : "text-gray-400"}`}
        >
          Tiếng Việt
        </span>
        <span className="text-gray-300">|</span>
        <span
          onClick={() => handleChangeLang("en")}
          className={`cursor-pointer ${lang === "en" ? "text-primary" : "text-gray-400"}`}
        >
          English
        </span>
      </div>
    </div>
  );
}