// auth.js
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const tabLogin = document.getElementById('tab-login');
const tabRegistro = document.getElementById('tab-registro');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegistro.classList.remove('active');
  formLogin.classList.add('active');
  formRegistro.classList.remove('active');
});

tabRegistro.addEventListener('click', () => {
  tabRegistro.classList.add('active');
  tabLogin.classList.remove('active');
  formRegistro.classList.add('active');
  formLogin.classList.remove('active');
});

// Registro
formRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('pass').value;

  if (!nombre || !email || !pass) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCred.user, { displayName: nombre });
    alert("Cuenta creada. ¡Bienvenido!");
    window.location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
});

// Inicio sesión
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email-login').value.trim();
  const pass = document.getElementById('pass-login').value;

  if (!email || !pass) {
    alert("Por favor completa todos los campos");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert("Inicio de sesión exitoso");
    window.location.href = "index.html";
  } catch (err) {
    alert("Credenciales inválidas");
  }
});
