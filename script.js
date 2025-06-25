// script.js

document.addEventListener('DOMContentLoaded', () => {
  const introOverlay = document.getElementById('intro-overlay');
  const testimonios = document.querySelectorAll('.testimonio-item');
  const statusMsg = document.getElementById('status');
  const form = document.getElementById('kit-form');

  // === Manejo overlay intro ===
  if (introOverlay) {
    // Mostrar overlay con clase visible (controla animación)
    introOverlay.classList.add('visible');

    // Desaparece automáticamente después de 3.5 segundos + 1s animación
    setTimeout(() => {
      introOverlay.classList.remove('visible');
      // Opcional: ocultar del DOM para liberar recursos
      setTimeout(() => {
        introOverlay.style.display = 'none';
      }, 1000);
    }, 3500);
  }

  // === Rotador de testimonios ===
  let currentTestimonio = 0;

  if (testimonios.length > 0) {
    // Mostrar solo el primero al inicio
    testimonios.forEach((el, i) => {
      if (i !== 0) el.style.opacity = 0;
      else el.style.opacity = 1;
    });

    setInterval(() => {
      // Ocultar el actual
      testimonios[currentTestimonio].style.transition = 'opacity 1s ease';
      testimonios[currentTestimonio].style.opacity = 0;

      // Calcular siguiente índice
      currentTestimonio = (currentTestimonio + 1) % testimonios.length;

      // Mostrar el siguiente
      testimonios[currentTestimonio].style.transition = 'opacity 1s ease';
      testimonios[currentTestimonio].style.opacity = 1;
    }, 6000);
  }

  // === Formulario con espacio para Firebase y validación básica ===

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const nombre = form.nombre ? form.nombre.value.trim() : '';
    const status = statusMsg;

    // Validación básica
    if (!email) {
      status.textContent = 'Por favor, ingresa tu correo electrónico.';
      status.style.color = 'red';
      return;
    }
    if (nombre === '') {
      status.textContent = 'Por favor, ingresa tu nombre.';
      status.style.color = 'red';
      return;
    }

    status.textContent = 'Enviando...';
    status.style.color = '#6654b7';

    try {
      // --- Aquí va el código para conectar con Firebase ---
      // Ejemplo ficticio (debes reemplazarlo con tu config y función):

      /*
      await firebase.firestore().collection('kit-requests').add({
        nombre: nombre,
        email: email,
        fecha: new Date().toISOString()
      });
      */

      // Luego llamar backend en Termux para enviar PDF con clave única (por implementar)

      // Simulando éxito:
      setTimeout(() => {
        status.textContent = `¡Gracias, ${nombre}! Revisa tu correo para la clave.`;
        status.style.color = 'green';
        form.reset();
      }, 1500);
    } catch (error) {
      console.error(error);
      status.textContent = 'Error al enviar la solicitud. Intenta de nuevo más tarde.';
      status.style.color = 'red';
    }
  });
});
// === Comentarios emocionales ===
const comentarioForm = document.getElementById('form-comentario');
const comentarioTextarea = document.getElementById('comentario');
const comentarioStatus = document.getElementById('comentario-status');
const comentariosLista = document.getElementById('comentarios-lista');

// Reemplaza esto con conexión a Firebase si lo deseas
comentarioForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = comentarioTextarea.value.trim();

  if (texto === '') {
    comentarioStatus.textContent = 'Por favor, escribe algo antes de enviar.';
    comentarioStatus.style.color = 'red';
    return;
  }

  // Simulación de envío y renderizado
  const nuevoComentario = document.createElement('div');
  nuevoComentario.className = 'comentario-visible';
  nuevoComentario.innerHTML = `<p>“${texto}”</p><small>— Anónimo</small>`;
  comentariosLista.prepend(nuevoComentario);

  comentarioTextarea.value = '';
  comentarioStatus.textContent = 'Gracias por compartir 💜';
  comentarioStatus.style.color = 'green';
});

// === Botón de compartir ===
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
