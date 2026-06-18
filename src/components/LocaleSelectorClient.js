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

export default function LocaleSelectorClient({className}) {
  // server snapshot = "vi", client snapshot = đọc cookie thật
  // React biết 2 cái khác nhau → dùng client value, không warning
  const lang = useSyncExternalStore(
    () => () => {}, // không cần subscribe (cookie không tự thay đổi)
    () => getLocaleCookie(),  // client
    () => "vi"                // server
  );

  const router = useRouter();

  const handleChangeLang = (locale) => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <div className={`hidden text-base font-semibold group text-primary md:block md:cursor-pointer ${className}`}>
      <span className="inline-block uppercase">{lang}</span>
      <div className="hidden md:block absolute bg-white w-[210px] rounded-3xl top-[80%] right-0 shadow-lg py-[10px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-250 delay-200">
        <p className={`block py-2 pl-4 hover:font-medium hover:text-primary ${lang === "vi" ? "text-primary font-medium" : "text-black font-normal"}`}
          onClick={() => handleChangeLang("vi")}>Tiếng Việt</p>
        <p className={`block py-2 pl-4 hover:font-medium hover:text-primary ${lang === "en" ? "text-primary font-medium" : "text-black font-normal"}`}
          onClick={() => handleChangeLang("en")}>Tiếng Anh</p>
      </div>
    </div>
  );
}