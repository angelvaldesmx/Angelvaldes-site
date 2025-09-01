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
  //   3. Ocultar Navbar al Hacer Scroll (Sticky Navbar)
  // ----------------------------------------------------
  // Se ha deshabilitado esta función para que el navbar sea siempre visible
  // de acuerdo a la solicitud del usuario en dispositivos móviles
  /*
  const navbar = document.querySelector('.navbar-fixed');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.innerWidth >= 768) { // Solo aplica en desktop
      if (window.scrollY > lastScrollY && window.scrollY > 200) {
        navbar.classList.add('hide');
      } else {
        navbar.classList.remove('hide');
      }
      lastScrollY = window.scrollY;
    }
  });
  */

  // ----------------------------------------------------
  //   4. Cargar y Rellenar Contenido Dinámicamente desde JSON
  // ----------------------------------------------------

  const articlesContainer = document.querySelector('.blog-header-container');
  const featuredArticlesContainer = document.querySelector('.blog-right');
  const weeklyBlogsList = document.getElementById('weekly-blogs-list');
  const monthlyBlogsList = document.getElementById('monthly-blogs-list');
  const modal = document.getElementById('article-modal');
  const closeModalBtn = document.querySelector('.modal-close');

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
            <a href="#" class="read-more-link" data-article-id="${article.id}">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-down-right" viewBox="0 0 24 24">
                <path d="M15 10l5 5-5 5" />
                <path d="M4 4v7a4 4 0 004 4h12" />
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
          <div class="blog-right-page-title">${article.title}</div>
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

  const loadData = async () => {
    try {
      const response = await fetch('data.json');
      const data = await response.json();

      renderArticles(data.articles);
      renderFeatured(data.featuredArticles);
      renderLinks(data.weeklyBlogs, weeklyBlogsList);
      renderLinks(data.monthlyBlogs, monthlyBlogsList);

      const allArticles = [...data.articles, ...data.featuredArticles];
      const readMoreLinks = document.querySelectorAll('.read-more-link');
      
      readMoreLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const articleId = e.target.closest('.read-more-link').dataset.articleId;
          const article = allArticles.find(art => art.id === articleId);

          if (article) {
            document.getElementById('modal-article-title').textContent = article.title;
            document.getElementById('modal-article-image').src = article.image;
            document.getElementById('modal-article-text').textContent = article.fullText;
            modal.style.display = 'block';
          }
        });
      });

      if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }

      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });

    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  };

  loadData();

});