let promiseDB = idb.open('restaurant-review-data', 1, function(upgradeDb) { // creates database
  let restaurants = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
  restaurants.createIndex('by neighborhood', 'neighborhood');
  restaurants.createIndex('by cusisine', 'cuisine_type');
});

/**
  * Write DB with key pre-set
  */
writeDatabaseKP = (database, value) => {
  promiseDB.then(function(db) {
  const tx = db.transaction(database, 'readwrite');
  const neighborhoodStore = tx.objectStore(database);
  neighborhoodStore.put(value);
  return tx.complete; //promise that fullfills if and when the transaction completes and rejects if it fails
  }).then(function(result){
    return;
    //console.log('value added');
  });
};

updateDatabase = (database, key) => {
  promiseDB.then(function(db) {
  const tx = db.transaction(database, 'readwrite');
  const neighborhoodStore = tx.objectStore(database);
  });
};

 /**
   * Get all information from a database
   */
readDatabase = (database) => {
  return new Promise((resolve, reject) => {
    promiseDB.then(function(db) {
      const tx = db.transaction(database, 'readonly');
      const restaurantInfo = tx.objectStore(database);
      let data = restaurantInfo.getAll();
      resolve(data);
    });
  }).catch(error => console.log(error));
};

/**
  * Count the database
  */
countDatabase = (database) => {
  return new Promise((resolve, reject) => {
     promiseDB.then(function(db) {
     const tx = db.transaction(database, 'readonly');
     const restaurantInfo = tx.objectStore(database);
     let data = restaurantInfo.count();
     resolve(data);
    });
 }).catch(error => console.log(error));
};
