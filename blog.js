document.addEventListener('DOMContentLoaded', async () => {
  // -----------------------------
  // 1. Sidebar deslizable
  // -----------------------------
  const slideMenuButton = document.querySelector('.slide-menu-button');
  const slideMenu = document.getElementById('slide-menu');
  const slideMenuClose = document.querySelector('.slide-menu-close');
  const navLinks = document.querySelectorAll('.blog-menu');

  slideMenuButton.addEventListener('click', () => slideMenu.classList.toggle('is-active'));
  slideMenuClose.addEventListener('click', () => slideMenu.classList.remove('is-active'));
  navLinks.forEach(link => link.addEventListener('click', () => slideMenu.classList.remove('is-active')));

  // -----------------------------
  // 2. Modo oscuro
  // -----------------------------
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });
  }

  // -----------------------------
  // 3. Contenedores
  // -----------------------------
  const featuredContainer = document.querySelector('.featured-blogs');
  const recentContainer = document.querySelector('.recent-blogs');

  const blogListModal = document.getElementById("blogListModal");
  const listModalTitle = document.getElementById("listModalTitle");
  const modalList = document.getElementById("modalList");
  const closeListBtn = blogListModal.querySelector(".close");

  const blogContentModal = document.getElementById("blogContentModal");
  const contentTitle = document.getElementById("contentTitle");
  const contentBody = document.getElementById("contentBody");
  const closeContentBtn = blogContentModal?.querySelector(".closeContent");

  const modal = document.getElementById('article-modal');
  const modalTitle = document.getElementById('modal-article-title');
  const modalImage = document.getElementById('modal-article-image');
  const modalText = document.getElementById('modal-article-text');
  const modalAdsContainer = document.getElementById('modal-ads-container');

  let allArticles = [];
  let previousHash = '';

  // -----------------------------
  // 4. Renderizar artículos
  // -----------------------------
  const renderArticles = (articles, container) => {
    container.innerHTML = '';
    articles.forEach(article => {
      const html = `
        <div class="blog-card">
          <img src="${article.image}" alt="${article.title}" loading="lazy">
          <h3>${article.title}</h3>
          <p>${article.subtitle}</p>
          <a href="#articulo-${article.id}" class="read-more-link" data-article-id="${article.id}">Leer más</a>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', html);
    });
  };

  // -----------------------------
  // 5. Abrir modal de artículo
  // -----------------------------
  const openArticleModal = (articleId) => {
    const article = allArticles.find(a => a.id === parseInt(articleId, 10));
    if (!article) return;

    if (!window.location.hash.startsWith('#articulo-')) previousHash = window.location.hash || '';

    modalTitle.textContent = article.title;
    modalImage.src = article.image || '';
    modalText.textContent = article.fullText || article.subtitle || '';

    // Renderizar anuncios del modal
    if (modalAdsContainer) {
      const modalAds = ['Herramienta de Productividad', 'Hosting Creativo', 'Plugin SEO', 'Webinar Gratuito', 'Agencia de Diseño'];
      modalAdsContainer.innerHTML = modalAds.map(ad => `<div class="modal-ad">${ad}</div>`).join('');
    }

    modal.style.display = 'flex';
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#articulo-')) {
      const articleId = hash.split('-')[1];
      openArticleModal(articleId);
    } else {
      modal.style.display = 'none';
    }
  };

  // -----------------------------
  // 6. Abrir listas (Semanales/Mensuales)
  // -----------------------------
  const openListModal = (title, blogs) => {
    listModalTitle.textContent = title;
    modalList.innerHTML = "";

    blogs.forEach((blog, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<a data-index="${index}" href="#">${blog.title}</a>`;
      li.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        openContentModal(blog);
      });
      modalList.appendChild(li);
    });

    blogListModal.style.display = "flex";
  };

  const openContentModal = (blog) => {
    contentTitle.textContent = blog.title;
    contentBody.innerHTML = blog.content
      ? blog.content
      : `<p>Visita: <a href="${blog.url || '#'}" target="_blank">${blog.url || '#'}</a></p>`;
    blogContentModal.style.display = "flex";
  };

  // -----------------------------
  // 7. Cargar datos JSON y filtrar automáticamente
  // -----------------------------
  try {
    const response = await fetch('data.json');
    const data = await response.json();

    allArticles = [...(data.articles || [])];

    // Destacados: los 3 más recientes con imagen y isFeatured
    const featuredArticles = allArticles
      .filter(a => a.isFeatured && a.image)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    // Recientes: 5 más recientes que no estén en destacados
    const recentArticles = allArticles
      .filter(a => !a.isFeatured)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    renderArticles(featuredArticles, featuredContainer);
    renderArticles(recentArticles, recentContainer);

    // Blogs semanales y mensuales
    const weeklyBlogs = allArticles.filter(a => a.isWeekly);
    const monthlyBlogs = allArticles.filter(a => a.isMonthly);

    // Abrir listas desde botones
    ["openWeekly","openWeeklySidebar"].forEach(id => {
      document.getElementById(id).addEventListener("click", e => {
        e.preventDefault();
        openListModal("Blogs Semanales", weeklyBlogs);
      });
    });

    ["openMonthly","openMonthlySidebar"].forEach(id => {
      document.getElementById(id).addEventListener("click", e => {
        e.preventDefault();
        openListModal("Blogs Mensuales", monthlyBlogs);
      });
    });

    // Delegación click para artículos
    document.body.addEventListener('click', e => {
      const link = e.target.closest('.read-more-link');
      if (link) {
        e.preventDefault();
        const articleId = link.dataset.articleId;
        window.location.hash = `#articulo-${articleId}`;
      }
    });

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

  } catch (err) {
    console.error('Error al cargar JSON:', err);
  }

  // -----------------------------
  // 8. Cerrar modales
  // -----------------------------
  const closeModal = () => {
    if (previousHash) {
      window.location.hash = previousHash;
      previousHash = '';
    } else window.location.hash = '';
  };

  const closeModalBtn = modal.querySelector('.modal-close');

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
    if (e.target === blogListModal) blogListModal.style.display = "none";
    if (e.target === blogContentModal) blogContentModal.style.display = "none";
  });

  if (closeListBtn) closeListBtn.addEventListener("click", () => blogListModal.style.display = "none");
  if (closeContentBtn) closeContentBtn.addEventListener("click", () => blogContentModal.style.display = "none");
});