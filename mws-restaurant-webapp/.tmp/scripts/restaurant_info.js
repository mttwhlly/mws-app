let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  //fetchNeighborhoods();
  //fetchCuisines();
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      // fix for `Error: Map container is already initialized.`
      var container = L.DomUtil.get('map');
      if (container != null) {
        container._leaflet_id = null;
      }
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token=pk.eyJ1IjoibXR0d2hsbHkiLCJhIjoiY2prZngzcGF1MGRhcTNwbzlhYTlza2NicyJ9.Cw82KbQTNdjYdobD3HTK-w', {
        mapboxToken: 'pk.eyJ1IjoibXR0d2hsbHkiLCJhIjoiY2prZngzcGF1MGRhcTNwbzlhYTlza2NicyJ9.Cw82KbQTNdjYdobD3HTK-w',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};*/

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
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
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviews(restaurant.id).then(reviews => fillReviewsHTML(reviews));
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key.trim();
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key].trim();
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  //console.log('fill reviews running')
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  console.log('adding reviews to html: ' + reviews);
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  // create the reviews
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = `Name: ${review.name}`;
  li.appendChild(name);

  const date = document.createElement('p');
  let d = new Date(review.createdAt).toDateString(); //`${review.date}`;
  date.innerHTML = 'Date: ' + d; //`Date: ${review.date}.toLocaleString()}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);
  return li;
};

/**
 * Deal with review form submissions
 */
// Form validation & submission

addReview = () => {
  event.preventDefault();
  // Getting the data from the form
  let restaurantId = getParameterByName('id');
  let name = document.getElementById('name').value;
  let rating;
  let comments = document.getElementById('msg').value;
  rating = document.querySelector('.star input:checked').value;
  const review = [restaurantId, name, rating, comments];

  // Add data to DOM
  const formReview = {
    restaurant_id: parseInt(review[0]),
    name: review[1],
    rating: parseInt(review[2]),
    comments: review[3].substring(0, 300),
    createdAt: new Date()
  };
  // Send review to backend
  DBHelper.addReview(formReview);
  addReviewHTML(formReview);
  document.getElementsByTagName('form').reset();
};

addReviewHTML = review => {
  if (document.getElementById('no-review')) {
    document.getElementById('no-review').remove();
  }
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  //insert the new review on top
  ul.insertBefore(createReviewHTML(review), ul.firstChild);
  container.appendChild(ul);
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.className = 'restaurantCrumb';
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
//# sourceMappingURL=restaurant_info.js.map
