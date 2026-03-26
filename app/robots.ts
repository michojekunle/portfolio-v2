import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep the admin UI and internal API routes out of indexes.
        disallow: ["/admin/", "/api/admin/"],
      },
    ],
    sitemap: "https://michaelojekunle.dev/sitemap.xml",
    host: "https://michaelojekunle.dev",
  };
}
