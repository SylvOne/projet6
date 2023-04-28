
// Gestion du scroll du carousel
let intervale;

function scrollDroite(id){
    intervale = setInterval(function(){ document.getElementById(id).scrollLeft += 1 }  , 5);
  };
  
  function scrollGauche(id){
    intervale = setInterval(function(){ document.getElementById(id).scrollLeft -= 1 }  , 5);
  };
  
  function clearScroll(){
    clearInterval(intervale);
  };
  

  // Fonction générique permettant de récupérer les données des différents Endpoints
  async function getMovies(endpoint, sectionId, onlyFirst = false, bestMovies = false ) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des films: ${response.statusText}`);
      }
  
      const data = await response.json();
      const movies = onlyFirst ? data.results.slice(0, 1) : bestMovies ? data.results.slice(1, 8) : data.results.slice(0, 7);
  
      if (onlyFirst) {
        const movieDetails = await fetchMovieDetails(movies[0].id);
        movies[0].description = movieDetails.description;
      }
  
      displayMovies(sectionId, movies, onlyFirst);
    } catch (error) {
      console.error(`Erreur lors de la récupération des films: ${error}`);
    }
  }
  
  //Fonction permettant l'affichage des films et l'ajout des différents évènement aux éléments
  function displayMovies(sectionId, movies, onlyFirst = false) {
    const container = document.querySelector(`#${sectionId} .row__inner`);
    container.innerHTML = movies
      .map(movie => `
        <div class="${onlyFirst ? 'gui-card-best-movie' : 'gui-card'}" data-id="${movie.id}">
          <div class="gui-card__media">
            <img class="gui-card__img" src="${movie.image_url}" alt="${movie.title}" />
            ${onlyFirst ? `<button id="btn-best-movie">En savoir plus</button><p class="gui-card__title">${movie.description}</p>` : ''}
          </div>
          <div class="gui-card__details">
            ${!onlyFirst ? `<div class="gui-card__title">${movie.title}</div>` : ''}
          </div>
        </div>
      `)
      .join('');
  
    const movieCards = container.querySelectorAll(onlyFirst ? '.gui-card-best-movie' : '.gui-card');
    movieCards.forEach(card =>
      card.addEventListener('click', async (event) => {
        if (onlyFirst && event.target.id === 'btn-best-movie') {
          return;
        }
        const movieId = card.dataset.id;
        const movie = await fetchMovieDetails(movieId);
        showModal(movie);
      }),
    );
  
    if (onlyFirst) {
      const movieButton = document.getElementById('btn-best-movie');
      movieButton.addEventListener('click', async () => {
        const movieId = movieButton.closest('.gui-card-best-movie').dataset.id;
        const movie = await fetchMovieDetails(movieId);
        showModal(movie);
      });
    }
  }
  
  // Fonction permettant de récupérer les données détaillées de chaque film
  async function fetchMovieDetails(id) {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/titles/${id}`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des détails du film: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails du film: ${error}`);
    }
  }
  
  


// Fonction pour afficher les détails d'un film dans une fenêtre modale
function showModal(movie) {
  const modal = document.querySelector('#modal');
  modal.style.display = 'block';
  const modalContent = modal.querySelector('.modal-content');
  modalContent.innerHTML = `
      <span class="close">&times;</span>
      <div class="movie-details">
          <img src="${movie.image_url}" alt="${movie.title}">
          <div class="details">
              <h2>${movie.title ? movie.title : "Non mentionné"}</h2>
              <p>Genre : <span class="genre">${movie.genres ? movie.genres : "Non mentionné"}</span></p>
              <p>Date de sortie : <span class="release-date">${movie.date_published ? movie.date_published : "Non mentionné"}</span></p>
              <p>Rated : <span class="rated">${movie.rated === "Not rated or unkown rating" ? "Non mentionné" : movie.rated}</span></p>
              <p>Score IMDb : <span class="imdb-score">${movie.imdb_score ? movie.imdb_score : "Non mentionné"}</span></p>
              <p>Réalisateur : <span class="director">${movie.directors ? movie.directors : "Non mentionné"}</span></p>
              <p>Acteurs : <span class="actors">${movie.actors.join(', ') ? movie.actors.join(', ') : "Non mentionné"}</span></p>
              <p>Durée : <span class="duration">${movie.duration ? movie.duration : "Non mentionné"}</span></p>
              <p>Pays d'origine : <span class="country">${movie.countries ? movie.countries : "Non mentionné"}</span></p>
              <p>Résultat au Box Office : <span class="box-office">${movie.worldwide_gross_income ? movie.worldwide_gross_income :"Non mentionné"}</span></p>
              <p>Résumé : <span class="summary">${movie.description ? movie.description : "Non mentionné"}</span></p>
          </div>
      </div>
  `;
  const closeModalBtn = modalContent.querySelector('.close');
  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', event => {
      if (event.target == modal) {
          modal.style.display = 'none';
      }
  });
}

//Déclarations des endpoints:
const bestMoviesEndpoint = 'http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page_size=8';
const bestMusicEndpoint = 'http://localhost:8000/api/v1/titles/?genre=Music&sort_by=-imdb_score&page_size=8';
const bestFictionEndpoint = 'http://localhost:8000/api/v1/titles/?genre=Sci-Fi&sort_by=-imdb_score&page_size=8';
const bestBiographyEndpoint = 'http://localhost:8000/api/v1/titles/?genre=Biography&sort_by=-imdb_score&page_size=8';

// Appel des fonctions
getMovies(bestMoviesEndpoint, 'best-movie', true);
getMovies(bestMoviesEndpoint, 'best-rated', false, true);
getMovies(bestMusicEndpoint, 'best-music');
getMovies(bestFictionEndpoint, 'best-fiction');
getMovies(bestBiographyEndpoint, 'best-biography');