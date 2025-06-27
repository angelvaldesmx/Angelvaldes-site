import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    // Solo permitimos POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
    }

    const { email, firstName, lastName } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: 'Email is required',
      };
    }

    // Generar clave única simple (puedes mejorarla)
    const clave = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Configuraciones desde variables de entorno
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
    const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
    const MAILCHIMP_SERVER_PREFIX = MAILCHIMP_API_KEY.split('-')[1]; // ej: 'us4'

    // URL de la API de Mailchimp para agregar o actualizar miembros
    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    // Data para Mailchimp
    const data = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
        CLAVE: clave,
      },
    };

    // Petición a Mailchimp
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify(errorData),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Contacto agregado', clave }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
  }
