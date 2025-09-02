// netlify/functions/article.js
import fs from "fs";
import path from "path";

export async function handler(event, context) {
  const slug = event.queryStringParameters.slug;
  const filePath = path.join(process.cwd(), "articulos.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const allArticles = [...data.destacados, ...data.recientes, ...data.semanales, ...data.mensuales];
  const article = allArticles.find(a => a.slug === slug);

  if (!article) {
    return { statusCode: 404, body: "Artículo no encontrado" };
  }

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>${article.title} | Mi Blog Creativo</title>
    <meta name="description" content="${article.subtitle || article.content.slice(0,150)}">
    <script type="application/ld+json">
      ${JSON.stringify({
        "@context":"https://schema.org",
        "@type":"BlogPosting",
        "headline": article.title,
        "description": article.subtitle || "",
        "image": article.image || "",
        "author": { "@type": "Person", "name": "Angel Valdes" },
        "url": `https://angelvaldesmx.qzz.io/blog/${article.slug}`,
        "mainEntityOfPage": { "@type":"WebPage", "@id": `https://angelvaldesmx.qzz.io/blog/${article.slug}` }
      })}
    </script>
  </head>
  <body>
    <div id="article-content">
      <h1>${article.title}</h1>
      ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
      <p>${article.content.replace(/\n\n/g,'</p><p>')}</p>
    </div>
    <script src="/blog.js"></script>
  </body>
  </html>
  `;

  return { statusCode: 200, headers: { "Content-Type": "text/html" }, body: html };
}