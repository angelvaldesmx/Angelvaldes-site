document.addEventListener('DOMContentLoaded', () => {
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
  const modal = document.getElementById('article-modal');
  const closeModalBtn = document.querySelector('.modal-close');
  const modalTitle = document.getElementById('modal-article-title');
  const modalImage = document.getElementById('modal-article-image');
  const modalText = document.getElementById('modal-article-text');
  const modalAdsContainer = document.getElementById('modal-ads-container');

  // Modales para listas (Semanales/Mensuales)
  const blogListModal = document.getElementById("blogListModal");
  const listModalTitle = document.getElementById("listModalTitle");
  const modalList = document.getElementById("modalList");
  const closeListBtn = blogListModal.querySelector(".close");

  // Modal de contenido individual (dentro de Semanales/Mensuales)
  const blogContentModal = document.getElementById("blogContentModal");
  const contentTitle = document.getElementById("contentTitle");
  const contentBody = document.getElementById("contentBody");
  const closeContentBtn = blogContentModal.querySelector(".closeContent");

  let allArticles = [];
  let previousHash = '';

  // -----------------------------
  // 4. Renderizar artículos
  // -----------------------------
  const renderArticles = (articles) => {
    featuredContainer.innerHTML = '';
    recentContainer.innerHTML = '';

    articles.forEach((article, index) => {
      const articleHTML = `
        <div class="blog-card">
          <img src="${article.image}" alt="${article.title}" loading="lazy">
          <h3>${article.title}</h3>
          <p>${article.subtitle}</p>
          <a href="#articulo-${article.id}" class="read-more-link" data-article-id="${article.id}">Leer más</a>
        </div>
      `;
      if (index % 2 === 0) featuredContainer.insertAdjacentHTML('beforeend', articleHTML);
      else recentContainer.insertAdjacentHTML('beforeend', articleHTML);
    });
  };

  // -----------------------------
  // 5. Renderizar anuncios
  // -----------------------------
  const mainAds = [
    'Curso de Creatividad',
    'Software de Productividad',
    'Ebook Gratis de Marketing',
    'Herramienta SEO',
    'Hosting para Blog',
    'Tutorial de Diseño',
    'Plugin WordPress',
    'Newsletter Semanal'
  ];

  const modalAds = [
    'Herramienta de Productividad',
    'Hosting Creativo',
    'Plugin SEO',
    'Webinar Gratuito',
    'Agencia de Diseño'
  ];

  const renderMainAds = () => {
    const allColumns = [featuredContainer, recentContainer];
    let adIndex = 0;

    allColumns.forEach(col => {
      const cards = Array.from(col.children);
      cards.forEach((card, i) => {
        if (adIndex < mainAds.length && i % 2 === 0) {
          const adHTML = `<div class="ad-container">${mainAds[adIndex++]}</div>`;
          card.insertAdjacentHTML('afterend', adHTML);
        }
      });
    });
  };

  const renderModalAds = () => {
    if (!modalAdsContainer) return;
    modalAdsContainer.innerHTML = modalAds.map(ad => `<div class="modal-ad">${ad}</div>`).join('');
  };

  // -----------------------------
  // 6. Modal de artículo
  // -----------------------------
  const openArticleModal = (articleId) => {
    const article = allArticles.find(a => a.id === parseInt(articleId, 10));
    if (!article) return;

    if (!window.location.hash.startsWith('#articulo-')) {
      previousHash = window.location.hash || '';
    }

    modalTitle.textContent = article.title;
    modalImage.src = article.image || '';
    modalText.textContent = article.fullText || article.subtitle || '';
    renderModalAds();
    modal.style.display = 'block';
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
  // 7. Abrir listas (Semanales/Mensuales)
  // -----------------------------
  function openListModal(title, blogs) {
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
  }

  function openContentModal(blog) {
    contentTitle.textContent = blog.title;
    // Si el JSON no trae `content`, usamos url como enlace o fallback
    contentBody.innerHTML = blog.content 
      ? blog.content 
      : `<p>Visita: <a href="${blog.url}" target="_blank">${blog.url}</a></p>`;
    blogContentModal.style.display = "flex";
  }

  // -----------------------------
  // 8. Cargar JSON
  // -----------------------------
  const loadData = async () => {
    try {
      const response = await fetch('data.json');
      const data = await response.json();

      allArticles = [...data.articles, ...data.featuredArticles];

      renderArticles(allArticles);
      renderMainAds();

      // Eventos para abrir modales de listas
      document.getElementById("openWeekly").addEventListener("click", (e) => {
        e.preventDefault();
        openListModal("Blogs Semanales", data.weeklyBlogs);
      });
      document.getElementById("openMonthly").addEventListener("click", (e) => {
        e.preventDefault();
        openListModal("Blogs Mensuales", data.monthlyBlogs);
      });
      // También desde el sidebar
      document.getElementById("openWeeklySidebar").addEventListener("click", (e) => {
        e.preventDefault();
        openListModal("Blogs Semanales", data.weeklyBlogs);
      });
      document.getElementById("openMonthlySidebar").addEventListener("click", (e) => {
        e.preventDefault();
        openListModal("Blogs Mensuales", data.monthlyBlogs);
      });

      // Delegación de click para artículos
      document.body.addEventListener('click', (e) => {
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
      console.error('Error al cargar datos JSON:', err);
    }
  };

  loadData();

  // -----------------------------
  // 9. Cerrar modales
  // -----------------------------
  const closeModal = () => {
    if (previousHash) {
      window.location.hash = previousHash;
      previousHash = '';
    } else {
      window.location.hash = '';
    }
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
    if (e.target === blogListModal) blogListModal.style.display = "none";
    if (e.target === blogContentModal) blogContentModal.style.display = "none";
  });

  if (closeListBtn) closeListBtn.addEventListener("click", () => (blogListModal.style.display = "none"));
  if (closeContentBtn) closeContentBtn.addEventListener("click", () => (blogContentModal.style.display = "none"));
});