import fs from "fs";
import path from "path";

// 🔹 Normaliza slugs para comparaciones y enlaces
const normalizeSlug = (str) =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")      // espacios → guiones
    .replace(/[^\w-]/g, "");   // elimina caracteres especiales

export async function handler(event) {
  console.log("EVENT PATH:", event.path);

  // 🔹 Extrae el slug desde la ruta: /blog/<slug>
  const slugRaw = event.path.replace(/^\/blog\//, "");
  if (!slugRaw) return { statusCode: 400, body: "❌ Slug no proporcionado" };

  const slug = normalizeSlug(slugRaw);

  // 🔹 Ruta correcta al JSON de artículos
  const filePath = path.resolve("./articulos.json");

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error leyendo JSON:", err);
    return { statusCode: 500, body: "❌ Error leyendo los artículos" };
  }

  // 🔹 Combina todas las categorías y añade artículos sin categoría
  const allArticles = [
    ...(data.destacados || []),
    ...(data.recientes || []),
    ...(data.semanales || []),
    ...(data.mensuales || []),
    ...(data.otros || []), // opcional: artículos sin categoría definida
  ];

  // 🔹 Buscar artículo por slug normalizado
  const article = allArticles.find(a => normalizeSlug(a.slug || "") === slug);
  if (!article) return { statusCode: 404, body: "❌ Artículo no encontrado" };

  const siteUrl = "https://www.tublog.com";
  const articleUrl = `${siteUrl}/blog/${normalizeSlug(article.slug)}`;
  const imageUrl = article.image || `${siteUrl}/img/default.jpg`;

  // 🔹 Función para renderizar tarjetas de artículos
  const renderCards = (articlesArray) =>
    (articlesArray || []).map(a => `
      <div class="blog-card">
        ${a.image ? `<img src="${a.image}" alt="${a.title}" loading="lazy">` : ''}
        <h3>${a.title}</h3>
        <p>${a.subtitle || ''}</p>
        <a href="/blog/${normalizeSlug(a.slug)}" class="read-more-link">Leer más</a>
      </div>
    `).join('');

  const destacadosHTML = renderCards(data.destacados || []);
  const recientesHTML = renderCards(data.recientes || []);

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.title} | Mi Blog Creativo</title>
<meta name="description" content="${article.subtitle || ''}">
<meta name="keywords" content="motivación, creatividad, emprendimiento, tecnología, arte, superación, blog">
<meta name="author" content="${article.author || 'Desconocido'}">

<!-- Open Graph -->
<meta property="og:title" content="${article.title}">
<meta property="og:description" content="${article.subtitle || ''}">
<meta property="og:type" content="article">
<meta property="og:url" content="${articleUrl}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:site_name" content="Mi Blog Creativo">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${article.title}">
<meta name="twitter:description" content="${article.subtitle || ''}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:site" content="@tuUsuarioTwitter">

<!-- CSS -->
<link rel="stylesheet" href="https://public.codepenassets.com/css/normalize-5.0.0.min.css">
<link rel="stylesheet" href="/blog.min.css">

<!-- JS -->
<script defer src="/blog.min.js"></script>

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${article.title}",
  "description": "${article.subtitle || ''}",
  "image": "${imageUrl}",
  "author": { "@type": "Person", "name": "${article.author || 'Desconocido'}" },
  "publisher": { "@type": "Organization", "name": "Mi Blog Creativo", "logo": { "@type": "ImageObject", "url": "${siteUrl}/img/logo.png" } },
  "datePublished": "${article.date || new Date().toISOString()}",
  "mainEntityOfPage": "${articleUrl}"
}
</script>
</head>
<body class="light-mode">

<div class="blog">

  <!-- Sidebar -->
  <div class="blog-part sidebar-column">
    <nav class="navbar-fixed">
      <div class="logo-container">
        <a href="/"><img src="${siteUrl}/img/logo.png" alt="Logo" class="logo" loading="lazy"></a>
        <span class="blog-title">Crea, Inspira, Evoluciona</span>
      </div>
      <button class="slide-menu-button" aria-controls="slide-menu" aria-expanded="false">
        <span class="line"></span><span class="line"></span><span class="line"></span>
      </button>
      <div class="navbar-links">
        <a href="#featured" class="blog-menu">Destacados</a>
        <a href="#recent" class="blog-menu">Recientes</a>
        <a href="#" id="openWeekly" class="blog-menu">Semanales</a>
        <a href="#" id="openMonthly" class="blog-menu">Mensuales</a>
      </div>
    </nav>

    <div class="slide-menu" id="slide-menu">
      <button class="slide-menu-close">&times;</button>
      <ul>
        <li><a href="#" id="openWeeklySidebar">🔥 Blogs Semanales</a></li>
        <li><a href="#" id="openMonthlySidebar">✨ Blogs Mensuales</a></li>
        <li><a href="#">Sobre Mí</a></li>
        <li><a href="#">Contacto</a></li>
        <li><a href="#">Podcast</a></li>
        <li><a href="#">Recursos Gratuitos</a></li>
        <li><button id="theme-toggle">Modo Oscuro</button></li>
      </ul>
      <div class="ad-container ad-menu-sidebar">
        <iframe src="${article.adTop || 'about:blank'}" loading="lazy"></iframe>
      </div>
    </div>

    <div class="ad-container top-banner">
      <iframe src="${article.adTop || 'about:blank'}" loading="lazy"></iframe>
    </div>
  </div>

  <!-- Artículos Destacados -->
  <div class="blog-part featured-column">
    <h2>Artículos Destacados</h2>
    <div class="ad-container"><iframe src="about:blank" loading="lazy"></iframe></div>
    <div class="blog-section featured-blogs" id="featured">
      ${destacadosHTML}
    </div>
    <div class="ad-container"><iframe src="about:blank" loading="lazy"></iframe></div>
  </div>

  <!-- Artículos Recientes -->
  <div class="blog-part recent-column">
    <h2>Artículos Recientes</h2>
    <div class="ad-container"><iframe src="about:blank" loading="lazy"></iframe></div>
    <div class="blog-section recent-blogs" id="recent">
      ${recientesHTML}
    </div>
    <div class="ad-container"><iframe src="about:blank" loading="lazy"></iframe></div>
  </div>
</div>

<!-- Modal Lista de Artículos -->
<div id="blogListModal" class="modal">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2 id="listModalTitle"></h2>
    <ul id="modalList"></ul>
  </div>
</div>

<!-- Modal Artículo -->
<div id="article-modal" class="modal">
  <div class="modal-content">
    <span class="modal-close">&times;</span>
    <h2 id="modal-article-title">${article.title}</h2>
    <div id="article-ads-container-top" class="ad-container">
      <iframe src="${article.adTop || 'about:blank'}" loading="lazy"></iframe>
    </div>
    <img id="modal-article-image" src="${imageUrl}" alt="${article.title}" loading="lazy" />
    <div id="modal-article-text">${article.content || ''}</div>
    <div id="modal-article-text-2"></div>
    <div id="modal-article-text-3"></div>
    <div id="article-ads-container-bottom" class="ad-container">
      <iframe src="${article.adBottom || 'about:blank'}" loading="lazy"></iframe>
    </div>
  </div>
</div>

</body>
</html>
    `,
  };
};