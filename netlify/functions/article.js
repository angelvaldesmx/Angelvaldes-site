import fs from "fs";
import path from "path";

export async function handler(event) {
  console.log("EVENT PATH:", event.path);

  // Quita "/blog/" del path y toma lo que queda como slug
  const slug = event.path.replace(/^\/blog\//, "");

  if (!slug) {
    return { statusCode: 400, body: "❌ Slug no proporcionado" };
  }

  const filePath = path.resolve("articulos.json");

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.error("Error leyendo JSON:", err);
    return { statusCode: 500, body: "❌ Error leyendo los artículos" };
  }

  const allArticles = [
    ...data.destacados,
    ...data.recientes,
    ...data.semanales,
    ...data.mensuales,
  ];

  const article = allArticles.find((a) => a.slug === slug);

  if (!article) {
    return { statusCode: 404, body: "❌ Artículo no encontrado" };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `
      <html>
        <head><title>${article.titulo}</title></head>
        <body>
          <h1>${article.titulo}</h1>
          <p>${article.contenido}</p>
        </body>
      </html>
    `,
  };
}