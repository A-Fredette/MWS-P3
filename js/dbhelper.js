/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Server URL
   */
  static get DATABASE_URL() {
    const port = 1337; //Server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Get restaurant data
   * If there is data in indexedDB, read it from there first
   * If there is no information stored in indexedDB, call server for data
   */
  static fetchRestaurants() {
    return new Promise((resolve, reject) => {
      //if the database is populated, read from the database
      countDatabase('restaurants')
      .then(result => {
        if (result > 0) {
          readDatabase('restaurants')
          .then(results => {
             resolve(results);
           });
         
        //if the database is empty, request data from server
        } else {
          fetch(`${DBHelper.DATABASE_URL}`,
          { method: 'GET'})
          .then(response => {
            console.log('restaurants from server');
            return response.json();
          }).then(data => {
            console.log(data);
            data.forEach(location => {
              writeDatabaseKP('restaurants', location); //writes restaurants into indexedDb
            });
            resolve(data);
          }).catch(error => console.log(error));
        }
      });
    });
  }

  /**
   * Get restaurants by ID
   */
  static fetchRestaurantById(id) {
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants()
        .then(restaurants => {
          const restaurant = restaurants.find(r => r.id == id);
          resolve(restaurant); // Got the restaurant
        }).catch(error => {
          console.log('Unable to find restaurant by ID with error ', error);
      });
    });
  }

  /**
   * Get restaurants by cuisine and neighborhood
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants()
      .then(restaurants => {
         let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
            results = restaurants.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = restaurants.filter(r => r.neighborhood == neighborhood);
          }
          resolve(results);
        }).catch(error => {
          console.log('Unable to find restaurants by neighborhood and cuisine ', error);
      });
    });   
  }

  /**
   * Get restaurants by cuisine
   */
  static fetchRestaurantByCuisine(cuisine) {
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants()
      .then(restaurants => {
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        resolve(results);
      }).catch(error => {
          console.log('Unable to find restaurant by cuisines with error ', error);
      });  
    });
  }

  /**
   * Get restaurants by neighborhood
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants()
        .then(restaurants => {
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          resolve(results);
        }).catch(error => {
          console.log('Unable to find restaurants by neighborhoods with error ', error);
      });
    });
  }

  /**
   * Get cuisines
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return new Promise((resolve, reject) => {
      DBHelper.fetchRestaurants()
      .then(restaurants => {
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        resolve(uniqueCuisines);
        }).catch(error => {
          console.log('Unable to fetch cuisines with error ', error);
      });
    });
  }

  /**
   * Get neighborhoods
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return new Promise((resolve, reject) => {
       DBHelper.fetchRestaurants()
      .then(restaurants => {
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
      resolve(uniqueNeighborhoods);
    }).catch(error => {
        console.log('Unable to fetch neighborhoods with error ', error);
        reject(error);
    });
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.photograph) {
      return (`img/${restaurant.photograph}.jpg`);
    }
    else {
      return (`img/10.jpg`);
    }
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Restaurant image URL.
   */
   static updateFavStatus(id, status) {
    console.log('favorite status changed to:', status);

    fetch(`${DBHelper.DATABASE_URL}/${id}/?isfavorite=${status}`, {
      method: 'PUT'
    })
    .then((response) => {
      promiseDB.then(function(db) {
        const tx = db.transaction('restaurants', 'readwrite');
        const restaurantStore = tx.objectStore('restaurants');
        restaurantStore.get(id)
        .then((restuarant) => {
          console.log('restaurant retrieved from idb', restuarant);
          restuarant.isfavorite = status;
          restaurantStore.put(restuarant);
        });
      });
    });
  }

 /**
   * Fetch reviews by ID
   */
  static fetchReviewsByRestaurantId(id) {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`,
      { method: 'GET'})
      .then(response => response.json())
      .then(reviews => {
        console.log('reviews by ID:', reviews);
        reviews.forEach(review => {
          console.log('writing to review DB: ', review);
          writeDatabaseKP('reviews', review);
        });
        resolve(reviews);
      })
      .catch(error => {
        console.log('Error: ', error);
        reject(error);
      });
    });
  }

  /**
   * Delete review by review ID
   */
  static deleteReviewById(id) {
    fetch(`http://localhost:1337/reviews/${id}`,
    { method: 'delete'})
    .then(response => {
      console.log('review deleted', response);
    })
    .catch(error => {
      console.log('Error: ', error);
    });
  }


 /**
   * Get all reviews form the server
   */
  static getAllReviews() {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:1337/reviews/`,
      { method: 'GET'})
      .then(response => response.json())
      .then(reviews => {
        console.log('reviews by ID:', reviews);
        resolve(reviews);
      })
      .catch(error => {
        console.log('Error: ', error);
        reject(error);
      });
    });
  }

  /**
   * If online: Post a review to the server & update indexed
   * If offline: Call function to store review in local storage to be sent to server when online
   * @param review: object with restaurant_id, name, rating and comments
   */
  static postReview(review) {
    let reviewSend = {
        "restaurant_id": parseInt(review.restaurant_id),
        "name": review.name,
        "rating": parseInt(review.rating),
        "comments": review.comments
      };

    //check for online/offline status
    if (navigator.onLine) { 
      console.log('we are online => sending review to server!');

      fetch(`http://localhost:1337/reviews/`, {
        method: 'POST',
        body: JSON.stringify(reviewSend)
      }).then(response => { 
        console.log('Review POST success: ', response);
        DBHelper.writeReviewToIDB(reviewSend, reviewSend.restaurant_id);
        //TODO: Review is not writing when written after loading and offline to online review
      }).catch(error => { console.log('Error writing review to the server', error);
      });

    } else { //if offline, send the review object to be stored until online
      DBHelper.offlineReviewHandling(reviewSend);
    }
  }

  /**
   * Fetch reviews from server and update them in indexedDb
   */
  static writeReviewToIDB(id) {
    console.log('Writing in IDB');
    DBHelper.fetchReviewsByRestaurantId(id)
    .then(reviews => {
      reviews.forEach(review => {
        writeDatabaseKP('reviews', review);
      });
    });
  }

   /**
   * Keep review in local storage until it is ready to be retrieved
   * @param review: object with restaurant_id, name, rating and comments
   */
  static offlineReviewHandling(review) {
    console.log('Offline: storing review locally');
    localStorage.setItem('data', JSON.stringify(review));

    window.addEventListener('online', (e) => { //send the data when we're back online
      console.log('Came online => updating server');
      let reviewSend = JSON.parse(localStorage.getItem('data'));

      console.log('Parsed reviewed data: ', reviewSend);
      DBHelper.postReview(reviewSend);

      localStorage.removeItem('data');
      console.log('localStorage item removed');
    });
  }
}

