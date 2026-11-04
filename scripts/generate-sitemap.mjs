// Runs before `vite dev` and `vite build` (predev/prebuild hooks).
// Writes public/sitemap.xml for the site's pages and syncs the Sitemap: line in public/robots.txt.
// Mahsulotlarning alohida sahifasi yo'q (katalog filtri URL hash orqali), shuning uchun faqat sahifalar.

import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

const BASE_URL = (process.env.SITE_URL || "https://chorrom.uz").replace(/\/+$/, "");

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/katalog", changefreq: "weekly", priority: "0.9" },
  { path: "/kalkulyator", changefreq: "monthly", priority: "0.9" },
  { path: "/nega-biz", changefreq: "monthly", priority: "0.7" },
  { path: "/ishlarimiz", changefreq: "weekly", priority: "0.7" },
  { path: "/muddatli-tolov", changefreq: "monthly", priority: "0.7" },
  { path: "/shourum", changefreq: "monthly", priority: "0.7" },
  { path: "/jamoa", changefreq: "monthly", priority: "0.6" },
];

const lastmod = new Date().toISOString().slice(0, 10);

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n"),
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);

const robotsPath = resolve("public/robots.txt");
if (existsSync(robotsPath)) {
  const body = readFileSync(robotsPath, "utf8")
    .split("\n")
    .filter((l) => !/^\s*Sitemap:/i.test(l))
    .join("\n")
    .replace(/\n+$/, "");
  writeFileSync(robotsPath, `${body}\n\nSitemap: ${BASE_URL}/sitemap.xml\n`);
}

console.log(`sitemap.xml written for ${BASE_URL} (${entries.length} entries)`);
