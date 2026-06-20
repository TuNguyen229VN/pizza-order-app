export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://pizzateo.vercel.app/sitemap.xml",
    host: "https://pizzateo.vercel.app",
  };
}