document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------
  //   1. Funcionalidad del Menú Deslizable (Sidebar)
  // ----------------------------------------------------

  const slideMenuButton = document.querySelector('.slide-menu-button');
  const slideMenu = document.getElementById('slide-menu');
  const slideMenuClose = document.querySelector('.slide-menu-close');
  const navLinks = document.querySelectorAll('.nav-link');

  slideMenuButton.addEventListener('click', () => {
    slideMenu.classList.toggle('is-active');
  });

  slideMenuClose.addEventListener('click', () => {
    slideMenu.classList.remove('is-active');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      slideMenu.classList.remove('is-active');
    });
  });

  // ----------------------------------------------------
  //   2. Funcionalidad del Modo Oscuro
  // ----------------------------------------------------

  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark-mode');

      if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
      } else {
        localStorage.removeItem('theme');
      }
    });
  }

  // ----------------------------------------------------
  //   3. Cargar y Rellenar Contenido Dinámicamente desde JSON
  // ----------------------------------------------------

  const articlesContainer = document.querySelector('.blog-header-container');
  const featuredArticlesContainer = document.querySelector('.blog-right');
  const weeklyBlogsList = document.getElementById('weekly-blogs-list');
  const monthlyBlogsList = document.getElementById('monthly-blogs-list');
  const modal = document.getElementById('article-modal');
  const closeModalBtn = document.querySelector('.modal-close');
  const modalTitle = document.getElementById('modal-article-title');
  const modalImage = document.getElementById('modal-article-image');
  const modalText = document.getElementById('modal-article-text');

  let allArticles = [];

  const renderArticles = (articles) => {
    let articlesHtml = '';
    articles.forEach(article => {
      articlesHtml += `
        <div class="blog-header">
          <div class="blog-article header-article">
            <div class="blog-big__title">${article.title.split(' ')[0]}</div>
            <div class="blog-menu small-title date">${article.date}</div>
          </div>
          <div class="blog-article">
            <img src="${article.image}" alt="${article.title}" loading="lazy">
            <h2>${article.title}</h2>
            <div class="blog-detail">
              <span>Por ${article.author}</span>
              <span>${article.readTime}</span>
            </div>
            <p>${article.subtitle}</p>
            <a href="#articulo-${article.id}" class="read-more-link" data-article-id="${article.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-down-right" viewBox="0 0 24 24">
                <path d="M15 10l5 5-5 5" />
                <path d="M4 4v7a4 0 004 4h12" />
              </svg>
              Leer más
            </a>
          </div>
        </div>
      `;
    });
    articlesContainer.innerHTML += articlesHtml;
  };

  const renderFeatured = (articles) => {
    let featuredHtml = '';
    articles.forEach(article => {
      featuredHtml += `
        <div class="blog-right-container">
          <div class="blog-title-date">
            <div class="blog-right-page">${article.id}</div>
            <div class="date">${article.date}</div>
          </div>
          <a href="#articulo-${article.id}" class="blog-right-page-title" data-article-id="${article.id}">${article.title}</a>
          <div class="blog-right-page-subtitle">${article.subtitle}</div>
        </div>
      `;
    });
    featuredArticlesContainer.innerHTML = featuredHtml;
  };

  const renderLinks = (links, container) => {
    let linksHtml = '';
    links.forEach(link => {
      linksHtml += `<li><a href="${link.url}">${link.title}</a></li>`;
    });
    container.innerHTML = linksHtml;
  };

  const openArticleModal = (articleId) => {
    const article = allArticles.find(art => art.id === articleId);
    if (article) {
      modalTitle.textContent = article.title;
      modalImage.src = article.image;
      modalText.textContent = article.fullText;
      modal.style.display = 'block';
    }
  };

  const handleHashChange = () => {
    const hash = window.location.hash;
    if (hash.startsWith('#articulo-')) {
      const articleId = hash.substring(hash.indexOf('-') + 1);
      openArticleModal(articleId);
    } else {
      modal.style.display = 'none';
    }
  };

  const loadData = async () => {
    try {
      const response = await fetch('data.json');
      const data = await response.json();

      allArticles = [...data.articles, ...data.featuredArticles];

      renderArticles(data.articles);
      renderFeatured(data.featuredArticles);
      renderLinks(data.weeklyBlogs, weeklyBlogsList);
      renderLinks(data.monthlyBlogs, monthlyBlogsList);

      document.body.addEventListener('click', (e) => {
        if (e.target.closest('.read-more-link') || e.target.closest('.blog-right-page-title')) {
          e.preventDefault();
          const link = e.target.closest('.read-more-link') || e.target.closest('.blog-right-page-title');
          const articleId = link.dataset.articleId;
          window.location.hash = `#articulo-${articleId}`;
        }
      });

      window.addEventListener('hashchange', handleHashChange);
      handleHashChange();

    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };

  loadData();

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      window.location.hash = '';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.location.hash = '';
    }
  });

});