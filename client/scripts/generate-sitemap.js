const fs = require('fs');
const path = require('path');

// Basic sitemap generator — update pages array as your routes grow.
const siteUrl = process.env.SITE_URL || 'https://expertene.tech';
const pages = [
  '/',
  '/about',
  '/about/founding-team',
  '/about/features',
  '/about/quick-start',
  '/about/best-practices',
  '/about/faq',
  '/about/support',
  '/terms-and-conditions',
  '/privacy',
  '/auth',
];

const urls = pages.map((p) => `  <url>\n    <loc>${siteUrl}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml);
console.log('sitemap.xml written to', path.join(outDir, 'sitemap.xml'));
