document.addEventListener('DOMContentLoaded', async () => {
  // -----------------------------
  // VARIABLES PRINCIPALES
  // -----------------------------
  const body = document.body;
  const slideMenu = document.getElementById('slide-menu');
  const themeToggle = document.getElementById('theme-toggle');

  const featuredContainer = document.querySelector('.featured-blogs');
  const recentContainer = document.querySelector('.recent-blogs');

  const blogListModal = document.getElementById("blogListModal");
  const listModalTitle = document.getElementById("listModalTitle");
  const modalList = document.getElementById("modalList");

  const blogContentModal = document.getElementById("blogContentModal");
  const contentTitle = document.getElementById("contentTitle");
  const contentBody = document.getElementById("contentBody");

  const articleModal = document.getElementById('article-modal');
  const modalArticleTitle = document.getElementById('modal-article-title');
  const modalArticleImage = document.getElementById('modal-article-image');
  const modalArticleText1 = document.getElementById('modal-article-text');
  const modalArticleText2 = document.getElementById('modal-article-text-2');
  const modalArticleText3 = document.getElementById('modal-article-text-3');

  let allArticles = [];

  // -----------------------------
  // FUNCIONES AUXILIARES
  // -----------------------------
  async function fetchArticles() {
    try {
      const res = await fetch('/articulos.json');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error cargando JSON:', err);
      return { destacados: [], recientes: [], semanales: [], mensuales: [] };
    }
  }

  function createArticleElement(article) {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <a href="/articulos/${article.slug}">
        ${article.image ? `<img src="${article.image}" alt="${article.title}">` : ''}
        <div class="news-content"><h4>${article.title}</h4></div>
      </a>`;
    div.querySelector('a').addEventListener('click', e => {
      e.preventDefault();
      openArticleModal(article);
      history.pushState({slug: article.slug}, article.title, `/articulos/${article.slug}`);
    });
    return div;
  }

  function openArticleModal(article) {
    modalArticleTitle.textContent = article.title;
    modalArticleImage.src = article.image || '';
    const paragraphs = article.content.split('\n\n');
    modalArticleText1.innerHTML = paragraphs[0] || '';
    modalArticleText2.innerHTML = paragraphs[1] || '';
    modalArticleText3.innerHTML = paragraphs[2] || '';
    articleModal.classList.add('show');
    updateMetaTags(article);
  }

  function openListModal(title, list){
    listModalTitle.textContent = title;
    modalList.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `/articulos/${item.slug}`;
      a.textContent = item.title;
      a.addEventListener('click', e => {
        e.preventDefault();
        openContentModal(item);
        history.pushState({slug:item.slug}, item.title, `/articulos/${item.slug}`);
      });
      li.appendChild(a);
      modalList.appendChild(li);
    });
    blogListModal.classList.add('show');
  }

  function openContentModal(article) {
    contentTitle.textContent = article.title;
    contentBody.innerHTML = article.content;
    blogContentModal.classList.add('show');
  }

  function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  }

  function updateMetaTags(article){
    // Elimina metas dinámicas previas
    document.querySelectorAll('.dynamic-meta').forEach(m=>m.remove());

    const metas = [
      {name:'description', content:article.summary || ''},
      {name:'keywords', content:article.title},
      {property:'og:title', content:article.title},
      {property:'og:description', content:article.summary},
      {property:'og:image', content:article.image},
      {property:'og:url', content:window.location.href},
      {property:'og:type', content:'article'}
    ];

    metas.forEach(m=>{
      const meta = document.createElement('meta');
      if(m.name) meta.name = m.name;
      if(m.property) meta.setAttribute('property', m.property);
      meta.content = m.content;
      meta.className = 'dynamic-meta';
      document.head.appendChild(meta);
    });

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.className = 'dynamic-meta';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "image": [article.image],
      "datePublished": article.pubDate || new Date().toISOString(),
      "author": {"@type":"Person","name":article.source || "Autor"},
      "description": article.summary || "",
      "mainEntityOfPage": {"@type":"WebPage","@id":window.location.href}
    });
    document.head.appendChild(script);
  }

  function ajustarAds(){
    document.querySelectorAll('.ad-container').forEach(ad=>{
      ad.style.fontSize = window.innerWidth < 768 ? '12px' : window.innerWidth < 1030 ? '14px' : '16px';
    });
  }

  // -----------------------------
  // INICIALIZACIÓN
  // -----------------------------
  // Theme
  if(localStorage.getItem('theme') === 'dark') body.classList.add('dark-mode');
  themeToggle?.addEventListener('click', ()=>{
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  });

  // Sidebar
  document.querySelectorAll('.slide-menu-button').forEach(btn => btn.addEventListener('click', ()=>slideMenu.classList.toggle('show')));
  document.querySelectorAll('.slide-menu-close').forEach(btn => btn.addEventListener('click', ()=>slideMenu.classList.remove('show')));

  // Modals click fuera
  document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', e => { if(e.target === modal) modal.classList.remove('show'); }));
  document.querySelectorAll('.close, .closeContent, .modal-close').forEach(btn => btn.addEventListener('click', closeModals));

  // Ajuste ads
  window.addEventListener('resize', ajustarAds);
  window.addEventListener('load', ajustarAds);

  // Fetch artículos
  const data = await fetchArticles();
  allArticles = [...data.destacados, ...data.recientes, ...data.semanales, ...data.mensuales];

  data.destacados.forEach(a=>featuredContainer.appendChild(createArticleElement(a)));
  data.recientes.forEach(a=>recentContainer.appendChild(createArticleElement(a)));

  ["openWeekly","openWeeklySidebar"].forEach(id=>document.getElementById(id)?.addEventListener('click', e=>{ e.preventDefault(); openListModal("Blogs Semanales", data.semanales); }));
  ["openMonthly","openMonthlySidebar"].forEach(id=>document.getElementById(id)?.addEventListener('click', e=>{ e.preventDefault(); openListModal("Blogs Mensuales", data.mensuales); }));

  // Delegación click en enlaces read-more
  document.body.addEventListener('click', e => {
    const link = e.target.closest('.read-more-link');
    if(link){
      e.preventDefault();
      const article = allArticles.find(a => a.id == link.dataset.articleId);
      if(article) openArticleModal(article);
      history.pushState({slug: article.slug}, article.title, `/articulos/${article.slug}`);
    }
  });

  // History popstate / hashchange
  window.addEventListener('popstate', ()=>{
    const slug = history.state?.slug;
    if(slug){
      const article = allArticles.find(a => a.slug == slug);
      if(article) openArticleModal(article);
      else closeModals();
    } else closeModals();
  });
});