// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYG9zCf9NYasMQvwGZ8xS2hVPV2u8eRVA",
  authDomain: "angelvaldessitio.firebaseapp.com",
  projectId: "angelvaldessitio",
  storageBucket: "angelvaldessitio.firebasestorage.app",
  messagingSenderId: "383933947961",
  appId: "1:383933947961:web:499ffec0f2fdf67bccede8",
  measurementId: "G-5VD2H57PKX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth };