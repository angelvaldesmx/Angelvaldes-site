const fetch = require('node-fetch');
const admin = require('firebase-admin');

// === Inicializar Firebase Admin con credenciales desde ENV ===
if (!admin.apps.length) {
  const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(credentials)
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  const { email, firstName, lastName } = JSON.parse(event.body);
  const clave = generarClaveUnica();

  // === Enviar a Mailchimp ===
  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName || '',
      CLAVE: clave
    }
  };

  try {
    const response = await fetch("https://<dc>.api.mailchimp.com/3.0/lists/<list-id>/members", {
      method: "POST",
      headers: {
        Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();

    if (response.status >= 400) {
      return {
        statusCode: response.status,
        body: JSON.stringify(json)
      };
    }

    // === Guardar clave en Firestore ===
    await db.collection("claves-kit").doc(clave).set({
      email,
      nombre: firstName,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Suscripción exitosa", clave })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno del servidor", detalle: error.message })
    };
  }
};

// === Generador de clave única ===
function generarClaveUnica() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let clave = '';
  for (let i = 0; i < 6; i++) {
    clave += chars[Math.floor(Math.random() * chars.length)];
  }
  return clave;
    }
