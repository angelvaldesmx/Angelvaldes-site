// /api/crear-alias.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { aliasPrefix = '' } = req.body;

  try {
    const response = await fetch('https://app.simplelogin.io/api/aliases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SIMPLELOGIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: aliasPrefix || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json({
      alias: data.email,
      id: data.id,
      created_at: data.created_at
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Error al crear el alias',
      detalle: error.message
    });
  }
}
