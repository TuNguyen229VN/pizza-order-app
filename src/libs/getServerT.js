import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export async function getServerT(namespace = "Validation") {
    const cookieStore = await cookies();
    const locale = cookieStore.get("locale")?.value || "vi";
    return getTranslations({ locale, namespace });
}