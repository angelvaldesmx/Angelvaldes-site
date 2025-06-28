export default function handler(req, res) {
  try {
    const firebaseJson = JSON.parse(process.env.FIREBASE_JSON);
    res.status(200).json(firebaseJson);
  } catch (error) {
    res.status(500).json({ error: "Invalid FIREBASE_JSON", detail: error.message });
  }
                          }
