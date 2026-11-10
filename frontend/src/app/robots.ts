import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/api/", "/explorer/", "/"],
    },
    sitemap: "https://frontend-m5va.vercel.app/sitemap.xml",
  };
}

