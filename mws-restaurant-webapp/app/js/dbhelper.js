/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch restaurants.
   */
  static fetchRestaurants(callback, id) {
    let fetchURL;
    if (!id) {
      fetchURL = DBHelper.DATABASE_URL + '/restaurants';
    } else {
      fetchURL = DBHelper.DATABASE_URL + '/restaurants/' + id;
    }

    //let xhr = new XMLHttpRequest();

    fetch(fetchURL, {
        method: 'GET'
      })
      .then(response => {
        //console.log('fetch')
        return response.json();
      })
      .then(restaurants => {
        //console.log('restaurants JSON: ', restaurants);
        callback(null, restaurants);
      })
      .catch(error => {
        callback(`Unable to fulfill request. ${error}`, null);
      });
    /*
        xhr.open('GET', DBHelper.DATABASE_URL);
        xhr.onload = () => {
          if (xhr.status === 200) { // Got a success response from server!
            const json = JSON.parse(xhr.responseText);
            const restaurants = json.restaurants;
            callback(null, restaurants);
          } else { // Oops!. Got an error from server.
            const error = (`Request failed. Returned status of ${xhr.status}`);
            callback(error, null);
          }
        };
        xhr.send();
        */
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
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
    return (`/img/${restaurant.photograph}.jpg`);
  }
  /**
   * Put restaurant info into IndexedDB using IDB.js
   */

  static dBPromise() {
    return idb.open('restaurantDb', 1, (upgradeDB) => {
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          })
        case 1:
          upgradeDB.createObjectStore('reviews', {
            keyPath: 'id'
          })
      }
    });
  }
  /*
    static fetchRestaurants() {
      return this.dBPromise()
        .then(db => {
          const tr = db.transaction('restaurants');
          const restaurantStore = tr.objectStore('restaurants');
          return restaurantStore.getAll();
        })
        .then(restaurants => {
          if (restaurants.length !== 0) {
            return Promise.resolve(restaurants);
          }
          return this.cacheRestaurants();
        })
    }

    static cacheRestaurants() {
      return fetch(DBHelper.DATABASE_URL + '/restaurants')
        .then(response => response.json())
        .then(restaurants => {
          return this.dBPromise()
            .then(db => {
              const tr = db.transaction('restaurants', 'readwrite');
              const restaurantStore = tr.objectStore('restaurants');
              restaurants.forEach(restaurant => restaurantStore.put(restaurant));

              return tr.complete.then(() => Promise.resolve(restaurants));
            });
        });
    }*/


  static getStoredObjectById(table, idx, id) {
    return this.dBPromise()
      .then(function (db) {
        if (!db) return;

        const store = db.transaction(table).objectStore(table);
        const indexId = store.index(idx);
        return indexId.getAll(id);
      });
  }

  // fetch reviews
  static fetchReviews(id) {
    return fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(reviews => {
        this.dBPromise()
          .then(db => {
            if (!db) return;

            let tr = db.transaction('reviews', 'readwrite');
            const store = tr.objectStore('reviews');
            if (Array.isArray(reviews)) {
              reviews.forEach(function (review) {
                store.put(review);
              });
            } else {
              store.put(reviews);
            }
          });
        console.log('reviews are fetched: ', reviews);
        return Promise.resolve(reviews);
      })
      .catch(error => {
        return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
          .then((storedReviews) => {
            console.log('looking for offline stored reviews');
            return Promise.resolve(storedReviews);
          })
      });
  }
  /**
   * Update `is_favorite` in DB -- referenced: MWS Webinar Stage 3 Project Walk-Through Webinar by Elisa Romondia and Lorenzo Zaccagnini
   */

  static updateFave(restaurantID, isFavorite) {
    console.log('updated status: ' + isFavorite)

    console.log(`${this.DATABASE_URL}/restaurants/${restaurantID}/?is_favorite=${isFavorite}`)

    fetch(`${this.DATABASE_URL}/restaurants/${restaurantID}/?is_favorite=${isFavorite}`, {
        method: 'PUT'
      })
      .then(() => {
        this.dBPromise().then(db => {
          /*if (!db.ok) {
            throw new TypeError('Bad response status');
          } else {
            console.log(db)
          }*/
          const tr = db.transaction('restaurants', 'readwrite');
          const store = tr.objectStore('restaurants');
          store.get(restaurantID)
            .then(restaurant => {
              console.log('updated idb: ' + restaurant);
              restaurant.is_favorite = isFavorite;
              store.put(restaurant);
            });
        });
      });
  }

  /**
   * fetch restaurant reviews from REST server
   */

  static fetchServerReviews(id) {
    return fetch(`${DBHelper.DATABASE_URL}reviews/?restaurantid?=${id}`)
      .then(response => response.json())
      .then(reviews => {
        this.dBPromise()
          .then(db => {
            //if (!db) return;
            const tr = db.transaction('reviews', 'readwrite');
            const store = tr.objectStore('reviews');
            if (Array.isArray(reviews)) {
              reviews.forEach(function (review) {
                store.put(review);
              });
            } else {
              store.put(reviews);
            }
          });
        return Promise.resolve(reviews);
      })
      .catch(error => {
        return DBHelper.getDbReviews('reviews', 'restaurant', id)
          .then((dBReviews) => {
            return Promise.resolve(dBReviews);
          })
      })
  }

  static addReview(review) {
    let offlineReview = {
      name: 'addReview',
      data: review,
      objectType: 'review'
    };
    // check if offline
    if (!navigator.onLine && (offlineReview.name === 'addReview')) {
      DBHelper.storeAndSendReviews(offlineReview);
      return;
    }
    let reviewSend = {
      'name': review.name,
      'rating': parseInt(review.rating),
      'comments': review.comments,
      'restaurant_id': parseInt(review.restaurant_id)
    };
    let fetchOptions = {
      method: 'POST',
      body: JSON.stringify(reviewSend),
      headers: new Headers({
        'Content-Type': 'application/json; charset=utf-8'
      })
    };
    fetch(`http://localhost:1337/reviews`, fetchOptions).then((response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          return 'API called'
        }
      })
      .then((data) => console.log('fetch worked bruh'))
      .catch(error)
  }

  static storeAndSendReviews(offlineReview) {
    localStorage.setItem('data', JSON.stringify(offlineReview.data));
    window.addEventListener('online', (event) => {
      let data = JSON.parse(localStorage.getItem('data'));
      [...document.querySelectorAll('.reviewsOffline')]
      .forEach(el => {
        el.classList.remove('reviewsOffline')
        el.querySelector('.offlineLabel').remove();
      });
      if (data !== null) {
        if (offlineReview.name === 'addReview') {
          DBHelper.addReview(offlineReview.data);
        }
        localStorage.removeItem('data');
      }
    });
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng], {
      title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
    });
    marker.addTo(newMap);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}
