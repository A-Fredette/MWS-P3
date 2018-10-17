let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
  fetchNeighborhoods();
  fetchCuisines();
});


 /**
 * LAZY LOADING!!!
 */
window.addEventListener('load', (event) => { 

  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  }

  //set a title for iFrame (accessibility)
  document.getElementsByTagName('iframe')[0].setAttribute('title', 'Google Map');

});

/**
 * Register service worker.
 */
 registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('../service-worker.js')
  .then(registration => {
    console.log('Service Worker Registered', registration);
  }).catch(error => {
    console.log('Service Worker Registration Failed', error);
  });
 };

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods()
  .then(results => {
    self.neighborhoods = results;
    fillNeighborhoodsHTML();
    }).catch(error => console.log(error));
  };

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines()
  .then(results => {
    self.cuisines = results;
    fillCuisinesHTML();
  }).catch(error => console.log(error));
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood)
  .then(results => {
    resetRestaurants(restaurants);
    fillRestaurantsHTML();
  }).catch(error => console.log(error));
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  DBHelper.fetchRestaurants()
  .then(results => {
    self.restaurants = results;
    self.restaurants.forEach(restaurant => {
      ul.append(createRestaurantHTML(restaurant));
    });
  addMarkersToMap();
  }).catch(error => console.log(error));
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  let servedImage = `${DBHelper.imageUrlForRestaurant(restaurant)}`;
  let image400 = servedImage.replace('.jpg', '-400.jpg');
  let image250 = servedImage.replace('.jpg', '-250.jpg');

  const li = document.createElement('li');

  const favoriteButton = document.createElement('button');
  favoriteButton.innerHTML = '♥';
  favoriteButton.classList.add('favoriteButton');
  if (restaurant.isfavorite) {
    favoriteButton.classList.add('favorited');
  }

  favoriteButton.onclick = function() {
    const favStatus = !restaurant.isfavorite;
    DBHelper.updateFavStatus(restaurant.id, favStatus);
    restaurant.isfavorite = favStatus;
    favoriteButton.classList.toggle('favorited');
  };

  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  image.src = 'https://via.placeholder.com/350x150';
  image.setAttribute('data-src', servedImage);
  image.setAttribute('data-srcset', image400+' 400w, ' +image250+' 250w'  );
  image.setAttribute('sizes', "(max-width: 320px) 280px, (max-width: 480px) 440px, 800px");

  image.alt = restaurant.name + " Restaurant";
  li.append(image);
  addTabIndex(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);
  addTabIndex(name);

  li.append(favoriteButton);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);
  addTabIndex(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  addTabIndex(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);
  addTabIndex(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

/**
 * Add tab index to a given element
 */
addTabIndex = (element) => {
  element.tabIndex = 0;
};
