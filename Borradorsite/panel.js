<script type="module">
  import { auth } from './firebase-config.js';
  import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const nombre = user.displayName || "Usuario";
      document.getElementById("usuario-nombre").innerText = `Bienvenido, ${nombre}`;
    }
  });

  function cerrarSesion() {
    signOut(auth).then(() => {
      location.reload();
    });
  }
</script>