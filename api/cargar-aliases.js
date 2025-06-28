import admin from "firebase-admin";
import fetch from "node-fetch";

let db;

async function initFirebase() {
  if (!admin.apps.length) {
    const response = await fetch("https://angelvaldes-site.vercel.app/api/firebase-json");
    const firebaseJson = await response.json();

    admin.initializeApp({
      credential: admin.credential.cert(firebaseJson),
    });

    db = admin.firestore();
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await initFirebase();

    const aliases = Array.from({ length: 150 }, (_, i) => {
      const num = (i + 1).toString().padStart(3, '0');
      return `emocion${num}@mail.angelvaldesmx.qzz.io`;
    });

    const batch = db.batch();
    const collectionRef = db.collection("aliases");

    aliases.forEach((email) => {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        email,
        usado: false,
        asignadoA: null,
        creadoEn: new Date().toISOString()
      });
    });

    await batch.commit();

    res.status(200).json({ mensaje: '✅ Aliases subidos correctamente' });
  } catch (error) {
    console.error("❌ Error al subir aliases:", error);
    res.status(500).json({ error: 'Error interno del servidor', detalle: error.message });
  }
}
