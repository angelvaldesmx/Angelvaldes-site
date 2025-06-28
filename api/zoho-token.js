// archivo: /api/zoho-token.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorización no proporcionado' });
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    redirect_uri: process.env.ZOHO_REDIRECT_URI || 'https://angelvaldesmx.qzz.io/kit',
    code,
  });

  try {
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(), // CORRECCIÓN CLAVE: Debe ser un string
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: result });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
}
