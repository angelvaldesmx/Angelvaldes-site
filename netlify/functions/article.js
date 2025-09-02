import fs from "fs";
import path from "path";

export async function handler(event, context) {
  // 🔍 Debug para ver slug
  console.log("EVENT:", JSON.stringify(event, null, 2));

  // Captura el slug de pathParameters
  const slug = event.pathParameters?.slug;

  if (!slug) {
    return { statusCode: 400, body: "❌ Slug no proporcionado" };
  }

  // 📂 Ruta al JSON en la raíz del proyecto
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
        <head>
          <title>${article.title}</title>
        </head>
        <body>
          <h1>${article.title}</h1>
          <p>${article.content}</p>
        </body>
      </html>
    `,
  };
}