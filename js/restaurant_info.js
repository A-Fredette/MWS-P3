let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if ('initialization error: ', error) { // Got an error!
      console.error(error);
    }
  });
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    fetchReviewsByRestaurantId(id);
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurantById(id)
      .then(restaurant => {
        self.restaurant = restaurant;
        fillRestaurantHTML();
        self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      });
    });
  }
}; 

/**
 * Gets the reviews by ID from the server / indexedDB
 */
fetchReviewsByRestaurantId = (id) => {
  console.log('Reviews REQUESTED!');

  readDatabase('reviews') //check for reviews in idb
  .then(results => {
    console.log('all reviews from IDB: ', results);
    let reviews = results.filter(review => review.restaurant_id === parseInt(id));

    console.log('Filtered reviews from idb: ', reviews);

    if (reviews.length > 0)  {
      console.log('Filled from indexedDB');
      fillReviewsHTML(reviews);
    } else { //if no reviews in indexedDB, GET server request and update indexedDB
      console.log('No IDB reviews, calling server');
      DBHelper.fetchReviewsByRestaurantId(id)
     .then(reviews => {
        console.log('reviews from server: ', reviews);
        fillReviewsHTML(reviews);
      });
    } 
  });
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazy';
  image.alt = restaurant.name + " Restaurant";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {

    const row = document.createElement('tr');
    row.tabIndex = 0;

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  title.tabIndex = 0;

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review, onlineStatus = true) => {
  const li = document.createElement('li');

  //class for styling if offline
  if (!onlineStatus) { li.classList.add('offline'); }

  const name = document.createElement('p');
  let reviewIndex = 20;
  name.innerHTML = review.name;
  li.appendChild(name);
  addTabIndex(name);

  const date = document.createElement('p');
  const reviewDate = new Date(review.createdAt);

  const day = reviewDate.getDate();
  const month = reviewDate.getMonth() + 1; //Months are zero based
  const year = reviewDate.getFullYear();

  date.innerHTML = "Date: " + day + "-" + month + "-" + year;
  li.appendChild(date);
  addTabIndex(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);
  addTabIndex(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  addTabIndex(comments);

  return li;
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Add tab index to a given element
 */
addTabIndex = (element) => {
  element.tabIndex = 0;
};

 /**
  *Utility function for genereating a GUID
  * @returns {string}
  */
GUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random()*16|0,
         v = c === 'x' ? r : (r&0x3|0x8);
     return v.toString(16).toUpperCase();
  });
};

/**
 * Organize review data and send to front and back ends 
 */
submitReview = () => {
  event.preventDefault();

  let restaurant_id = getParameterByName('id'),
      name = document.forms[0].elements[0].value,
      rating = document.forms[0].elements[1].value,
      comments = document.forms[0].elements[2].value.substring(0, 300), //300 character max
      createdAt = new Date(),
      id = GUID();

  const review = [name, rating, comments, restaurant_id];

  //review info to be sent to front and back ends
  let reviewInfo = {
    restaurant_id: restaurant_id,
    rating: parseInt(review[1]),
    name: review[0],
    comments: review[2],
    createdAt: new Date()
  };

  //post review DOM
  const ul = document.getElementById('reviews-list');

  if (!navigator.onLine)  {
    ul.appendChild(createReviewHTML(reviewInfo, false));
  } else {
     ul.appendChild(createReviewHTML(reviewInfo));
  }

  //send to server
  DBHelper.postReview(reviewInfo);
  document.querySelector('.review-form').reset();
};


