export default function sitemap() {
  const baseUrl = "https://pizzateo.vercel.app";

  const routes = [
    "",
    "/combo-order",
    "/cart",
    "/rewards",
  ];

  const locales = ["vi", "en"];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: route === "" ? 1 : 0.8,
    }))
  );
}