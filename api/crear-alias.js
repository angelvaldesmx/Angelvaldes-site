// /pages/api/crear-alias.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { aliasPrefix = '' } = req.body; // prefijo opcional

  try {
    const response = await fetch('https://app.simplelogin.io/api/v2/aliases', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SIMPLELOGIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        domain_id: 256857,               // ID correcto de tu subdominio
        mailbox_ids: [6672639],         // ID correcto del mailbox (noreply@)
        name: aliasPrefix || undefined  // Evita null, SimpleLogin prefiere undefined
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
