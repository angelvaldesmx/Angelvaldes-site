import fs from "fs";
import path from "path";

export async function handler(event) {
  console.log("EVENT PATH:", event.path);

  // 🔹 Extrae el slug desde la ruta: /blog/<slug>
  const slug = event.path.replace(/^\/blog\//, "");

  if (!slug) {
    return { statusCode: 400, body: "❌ Slug no proporcionado" };
  }

  // 🔹 Ruta al JSON de artículos
  const filePath = path.resolve("./articulos.json");

  let data;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error("Error leyendo JSON:", err);
    return { statusCode: 500, body: "❌ Error leyendo los artículos" };
  }

  // 🔹 Combina todas las categorías
  const allArticles = [
    ...(data.destacados || []),
    ...(data.recientes || []),
    ...(data.semanales || []),
    ...(data.mensuales || []),
  ];

  // 🔹 Busca el artículo por slug
  const article = allArticles.find((a) => a.slug === slug);

  if (!article) {
    return { statusCode: 404, body: "❌ Artículo no encontrado" };
  }

  // 🔹 Genera HTML seguro evitando undefined
  const title = article.title || "Sin título";
  const description = article.summary || "";
  const content = article.content || "";
  const author = article.author || "Desconocido";
  const date = article.date || "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${description}">
          <meta name="author" content="${author}">
          <title>${title}</title>
        </head>
        <body>
          <article>
            <h1>${title}</h1>
            <p><em>Publicado el ${date} por ${author}</em></p>
            <p>${content}</p>
          </article>
        </body>
      </html>
    `,
  };
}