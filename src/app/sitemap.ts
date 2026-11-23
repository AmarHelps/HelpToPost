import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/helptopost", "/privacy", "/terms", "/data-deletion"].map((p) => ({ url: `${site.url}${p}` }));
}
