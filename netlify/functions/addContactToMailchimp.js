const fetch = require("node-fetch");
const mandrill = require("mandrill-api/mandrill");
const admin = require('firebase-admin');

const credentials = JSON.parse(
  Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

const db = admin.firestore();

exports.handler = async (event) => {
  const { email, firstName, lastName } = JSON.parse(event.body);
  const clave = generarClaveUnica();

  // === Preparar datos para Mailchimp ===
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
    const dc = process.env.MAILCHIMP_API_KEY.split("-")[1]; // extrae el datacenter del API key
    const mcResponse = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`, {
      method: "POST",
      headers: {
        Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const json = await mcResponse.json();

    if (mcResponse.status >= 400) {
      return {
        statusCode: mcResponse.status,
        body: JSON.stringify(json)
      };
    }

    // === Guardar clave en Firestore ===
    await db.collection("claves-kit").doc(clave).set({
      email,
      nombre: firstName,
      timestamp: new Date().toISOString()
    });

    // === Enviar correo con Mandrill ===
    const mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
    const message = {
      to: [{ email, name: firstName }],
      from_email: "noreply@angelvaldesmx.qzz.io",
      subject: "Tu clave para el Kit Emocional",
      html: `
        <p>Hola ${firstName},</p>
        <p>Gracias por abrir este espacio con nosotros. Aquí tienes tu clave única:</p>
        <h2 style="color:#6654b7;">${clave}</h2>
        <p>Ingresa tu clave en esta página para descargar el Kit Emocional:</p>
        <p><a href="https://angelvaldesmx.qzz.io/descarga-kit">https://angelvaldesmx.qzz.io/descarga-kit</a></p>
        <p>Con cariño,<br>— Ángel Valdés</p>
      `
    };

    await new Promise((resolve, reject) => {
      mandrillClient.messages.send({ message, async: false }, resolve, reject);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Suscripción completa y correo enviado", clave })
    };

  } catch (error) {
    console.error("Error interno:", error);
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
