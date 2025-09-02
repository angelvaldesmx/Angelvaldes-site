// netlify/functions/article.js
import fs from "fs";
import path from "path";

export async function handler(event, context) {
  const slug = context.pathParams?.slug;

  if (!slug) {
    return { statusCode: 400, body: "Slug no proporcionado" };
  }

  const filePath = path.join(process.cwd(), "articulos.json");

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Error leyendo los artículos" };
  }

  const allArticles = [
    ...data.destacados,
    ...data.recientes,
    ...data.semanales,
    ...data.mensuales
  ];

  const article = allArticles.find(a => a.slug === slug);

  if (!article) {
    return { statusCode: 404, body: "Artículo no encontrado" };
  }

  // Dividir contenido en párrafos
  const paragraphs = article.content.split('\n\n');
  const midIndex = Math.floor(paragraphs.length / 2); // punto medio para anuncio intermedio
  let contentHTML = '';

  paragraphs.forEach((p, i) => {
    contentHTML += `<p>${p}</p>`;
    if (article.adMid && i === midIndex - 1) {
      contentHTML += `<div class="ad-container mid"><iframe src="${article.adMid}" loading="lazy"></iframe></div>`;
    }
  });

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | Mi Blog Creativo</title>
  <meta name="description" content="${article.subtitle || article.content.slice(0,150)}">

  <!-- Estilos -->
  <link rel="stylesheet" href="/blog.min.css">
  <link rel="stylesheet" href="/main.css">

  <script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": article.subtitle || "",
    "image": article.image || "",
    "author": { "@type": "Person", "name": "Angel Valdes" },
    "url": `https://angelvaldesmx.qzz.io/blog/${article.slug}`,
    "mainEntityOfPage": { "@type":"WebPage", "@id": `https://angelvaldesmx.qzz.io/blog/${article.slug}` }
  })}
  </script>
</head>
<body class="${article.theme || 'light-mode'}">

  <header>
    <!-- Navbar opcional -->
  </header>

  <main id="article-content">
    <h1>${article.title}</h1>
    ${article.image ? `<img src="${article.image}" alt="${article.title}" loading="lazy">` : ''}

    <div id="article-ads-container-top" class="ad-container">
      ${article.adTop ? `<iframe src="${article.adTop}" loading="lazy"></iframe>` : ''}
    </div>

    ${contentHTML}

    <div id="article-ads-container-bottom" class="ad-container">
      ${article.adBottom ? `<iframe src="${article.adBottom}" loading="lazy"></iframe>` : ''}
    </div>
  </main>

  <footer>
    <!-- Footer opcional -->
  </footer>

  <script src="/blog.min.js"></script>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: html
  };
}