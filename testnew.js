document.addEventListener('DOMContentLoaded', async () => {
    const PYTHON_API_URL = 'https://encortonewspy.onrender.com';

    // Función para construir los ítems del carrusel
    function buildCarouselItems(newsData) {
        const canvas = document.querySelector('.seq-canvas');
        const pagination = document.querySelector('.seq-pagination');
        canvas.innerHTML = '';
        pagination.innerHTML = '';

        // Creamos una lista para las 10 noticias del carrusel, priorizando 'notitrends' y 'almomento'
        let carouselNews = [];
        const notiTrends = newsData.notitrends || [];
        const alMomento = newsData.almomento || [];
        
        // Tomar hasta 5 noticias de 'notitrends'
        carouselNews = carouselNews.concat(notiTrends.slice(0, 5));
        
        // Llenar el resto del carrusel con noticias de 'almomento' y otras categorías
        let remaining = 10 - carouselNews.length;
        if (remaining > 0) {
            carouselNews = carouselNews.concat(alMomento.slice(0, remaining));
            
            remaining = 10 - carouselNews.length;
            if (remaining > 0) {
                const otherNews = [
                    ...(newsData.mexico || []),
                    ...(newsData.internacional || []),
                    ...(newsData.deportes || [])
                ].sort(() => 0.5 - Math.random()); // Mezclamos las noticias de otras categorías
                carouselNews = carouselNews.concat(otherNews.slice(0, remaining));
            }
        }
        
        // Aseguramos que solo tengamos 10 noticias
        carouselNews = carouselNews.slice(0, 10);

        carouselNews.forEach((item, index) => {
            // Crear el elemento de la lista (<li>) para el carrusel
            const li = document.createElement('li');
            if (index === 0) {
                li.classList.add('seq-in');
            }
            li.setAttribute('id', `step${index + 1}`);

            // Enlace para la ventana modal (con atributos de datos)
            const articleLink = document.createElement('a');
            articleLink.href = '#modal'; // Enlace ficticio para el modal
            articleLink.classList.add('news-link');
            articleLink.setAttribute('aria-label', `Leer más sobre: ${item.title}`);
            articleLink.setAttribute('data-article-title', item.title);
            articleLink.setAttribute('data-article-summary', item.summary);
            articleLink.setAttribute('data-article-image', item.image);
            articleLink.setAttribute('data-article-source-name', item.source.name);
            articleLink.setAttribute('data-article-source-icon', item.source.icon);
            articleLink.setAttribute('data-article-link', item.link);
            
            // Contenedor de la imagen (div.seq-model)
            const modelDiv = document.createElement('div');
            modelDiv.classList.add('seq-model');
            const img = document.createElement('img');
            img.setAttribute('data-seq', '');
            img.src = item.image;
            img.alt = item.title;
            modelDiv.appendChild(img);

            // Contenedor del título y resumen (div.seq-title)
            const titleDiv = document.createElement('div');
            titleDiv.classList.add('seq-title');
            
            const h2 = document.createElement('h2');
            h2.setAttribute('data-seq', '');
            h2.textContent = item.title;
            
            const h3 = document.createElement('h3');
            h3.setAttribute('data-seq', '');
            h3.textContent = item.summary;

            // Agregar los elementos a la plantilla
            titleDiv.appendChild(h2);
            titleDiv.appendChild(h3);
            
            articleLink.appendChild(modelDiv);
            articleLink.appendChild(titleDiv);

            li.appendChild(articleLink);
            canvas.appendChild(li);

            // Crear los elementos de paginación
            const paginationLi = document.createElement('li');
            const paginationA = document.createElement('a');
            paginationA.href = `#step${index + 1}`;
            paginationA.setAttribute('rel', `step${index + 1}`);
            paginationA.title = `Ir a la noticia ${index + 1}`;
            const paginationImg = document.createElement('img');
            paginationImg.src = item.source.icon; // Usamos el ícono de la fuente para la paginación
            paginationImg.alt = `Icono de ${item.source.name}`;
            
            paginationA.appendChild(paginationImg);
            paginationLi.appendChild(paginationA);
            pagination.appendChild(paginationLi);
        });
    }

    // Función principal para obtener y procesar los datos
    async function fetchAllNewsAndBuildCarousel() {
        const apiCalls = [
            { name: 'carrusel', promise: axios.get(`${PYTHON_API_URL}/api/carrusel_news`) },
            { name: 'almomento', promise: axios.get(`${PYTHON_API_URL}/api/almomento_news`) },
            { name: 'notitrends', promise: axios.get(`${PYTHON_API_URL}/api/notitrends_news`) },
            { name: 'mexico', promise: axios.get(`${PYTHON_API_URL}/api/mexico_news`) },
            { name: 'internacional', promise: axios.get(`${PYTHON_API_URL}/api/internacional_news`) },
            { name: 'deportes', promise: axios.get(`${PYTHON_API_URL}/api/deportes_news`) },
        ];
        
        try {
            const results = await Promise.allSettled(apiCalls.map(call => call.promise));
            const newsData = {};
            let isDataReady = false;

            results.forEach((result, index) => {
                const apiName = apiCalls[index].name;
                if (result.status === 'fulfilled') {
                    const data = result.value.data;
                    const key = data ? Object.keys(data)[0] : apiName;
                    const value = data ? data[key] : [];
                    newsData[apiName] = value;
                    if ((Array.isArray(value) && value.length > 0)) {
                        isDataReady = true;
                    }
                } else {
                    console.error(`❌ La llamada a '${apiName}' falló. Motivo:`, result.reason?.message || result.reason);
                    newsData[apiName] = [];
                }
            });

            if (isDataReady) {
                buildCarouselItems(newsData);
                // Inicializar Sequence.js después de que los elementos se han agregado al DOM
                const mySequence = document.getElementById('sequence');
                const options = {
                    // Puedes agregar opciones personalizadas aquí
                };
                new Sequence(mySequence, options);
            } else {
                console.error("No se pudieron cargar los datos de las noticias.");
            }
        } catch (error) {
            console.error("Hubo un error al procesar las peticiones:", error);
        }
    }

    fetchAllNewsAndBuildCarousel();
});