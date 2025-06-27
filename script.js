// === FIREBASE CONFIG ===
import { db } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// === Esperar a que cargue el DOM ===
document.addEventListener('DOMContentLoaded', () => {
  const introOverlay = document.getElementById('intro-overlay');
  const testimonios = document.querySelectorAll('.testimonio-item');
  const form = document.getElementById('kit-form');
  const statusMsg = document.getElementById('status');

  // === Intro animado ===
  if (introOverlay) {
    introOverlay.classList.add('visible');
    setTimeout(() => {
      introOverlay.classList.remove('visible');
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 1000);
    }, 3500);
  }

  // === Rotador de testimonios ===
  let currentTestimonio = 0;
  if (testimonios.length > 0) {
    testimonios.forEach((el, i) => el.style.opacity = i === 0 ? 1 : 0);
    setInterval(() => {
      testimonios[currentTestimonio].style.opacity = 0;
      currentTestimonio = (currentTestimonio + 1) % testimonios.length;
      testimonios[currentTestimonio].style.opacity = 1;
    }, 6000);
  }

  // === FORMULARIO: Enviar a Netlify y Mailchimp ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const nombre = form.nombre.value.trim();

    if (!email || nombre === '') {
      statusMsg.textContent = 'Por favor, completa ambos campos.';
      statusMsg.style.color = 'red';
      return;
    }

    statusMsg.textContent = 'Enviando...';
    statusMsg.style.color = '#6654b7';

    try {
      const response = await fetch('/.netlify/functions/addContactToMailchimp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName: nombre, lastName: '' })
      });

      const result = await response.json();

      if (response.ok) {
        statusMsg.textContent = `¡Gracias, ${nombre}! Revisa tu correo 📩`;
        statusMsg.style.color = 'green';
        form.reset();
      } else {
        statusMsg.textContent = `Error: ${result.detail || 'Intenta de nuevo'}`;
        statusMsg.style.color = 'red';
      }
    } catch (error) {
      console.error(error);
      statusMsg.textContent = 'Error al enviar. Intenta de nuevo más tarde.';
      statusMsg.style.color = 'red';
    }
  });

  // === COMENTARIOS EMOCIONALES ===
  const comentarioForm = document.getElementById('form-comentario');
  const comentarioTextarea = document.getElementById('comentario');
  const comentarioStatus = document.getElementById('comentario-status');
  const comentariosLista = document.getElementById('comentarios-lista');

  comentarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = comentarioTextarea.value.trim();

    if (texto === '') {
      comentarioStatus.textContent = 'Por favor, escribe algo antes de enviar.';
      comentarioStatus.style.color = 'red';
      return;
    }

    try {
      await addDoc(collection(db, "comentarios"), {
        texto,
        fecha: new Date()
      });
      comentarioTextarea.value = '';
      comentarioStatus.textContent = 'Gracias por compartir 💜';
      comentarioStatus.style.color = 'green';
    } catch (error) {
      console.error(error);
      comentarioStatus.textContent = 'Error al enviar el comentario.';
      comentarioStatus.style.color = 'red';
    }
  });

  const q = query(collection(db, "comentarios"), orderBy("fecha", "desc"));
  onSnapshot(q, (querySnapshot) => {
    comentariosLista.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const c = doc.data();
      const nuevoComentario = document.createElement('div');
      nuevoComentario.className = 'comentario vivo';
      nuevoComentario.innerHTML = `<p>“${c.texto}”</p><small>— Anónimo</small>`;
      comentariosLista.appendChild(nuevoComentario);
    });
  });

  // === BOTÓN DE COMPARTIR ===
  const btnCompartir = document.getElementById('btn-compartir');
  const compartirStatus = document.getElementById('compartir-status');

  const mensajeCompartir = {
    title: 'Kit Emocional Vol. 1',
    text: 'No estás solo. Este kit emocional puede ayudarte o acompañarte. Hecho desde el alma. Descárgalo aquí:',
    url: window.location.href
  };

  btnCompartir.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share(mensajeCompartir);
        compartirStatus.textContent = '¡Gracias por compartir! 🤍';
      } else {
        await navigator.clipboard.writeText(`${mensajeCompartir.text} ${mensajeCompartir.url}`);
        compartirStatus.textContent = 'Enlace copiado al portapapeles. ¡Gracias por compartir! 🫂';
      }
      compartirStatus.style.color = 'green';
    } catch (err) {
      compartirStatus.textContent = 'No se pudo compartir. Intenta copiar el enlace manualmente.';
      compartirStatus.style.color = 'red';
    }
  });
});
