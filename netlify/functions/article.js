import fs from "fs";
import path from "path";

export async function handler(event) {
  // 🔍 Debug para ver la ruta completa
  console.log("EVENT PATH:", event.path);

  // Extrae el slug del final de la URL
  const parts = event.path.split("/");
  const slug = parts[parts.length - 1]; // último segmento

  if (!slug) {
    return { statusCode: 400, body: "❌ Slug no proporcionado" };
  }

  // Ruta al JSON en la raíz del proyecto
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

  // Retorna HTML del artículo
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body: `
      <html>
        <head>
          <title>${article.titulo}</title>
        </head>
        <body>
          <h1>${article.titulo}</h1>
          <p>${article.contenido}</p>
        </body>
      </html>
    `,
  };
}