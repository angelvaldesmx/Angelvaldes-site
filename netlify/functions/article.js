import fs from "fs";
import path from "path";

export async function handler(event) {
  console.log("EVENT PATH:", event.path);

  // 🔹 Extrae el slug desde el path
  const slug = event.path.replace(/^\/blog\//, "");

  if (!slug) {
    return { statusCode: 400, body: "❌ Slug no proporcionado" };
  }

  // 🔹 JSON de artículos en la raíz del proyecto
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

  // 🔹 HTML final con meta tags
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="${article.descripcion || ""}">
          <title>${article.titulo}</title>
        </head>
        <body>
          <article>
            <h1>${article.titulo}</h1>
            <p>${article.contenido}</p>
          </article>
        </body>
      </html>
    `,
  };
}