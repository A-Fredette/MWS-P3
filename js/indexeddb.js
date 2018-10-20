let promiseDB = idb.open('restaurant-review-data', 2, function(upgradeDb) { // creates database

  switch(upgradeDb.oldVersion) {
    case 0:

    case 1:
      let restaurants = upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      restaurants.createIndex('by neighborhood', 'neighborhood');
      restaurants.createIndex('by cusisine', 'cuisine_type');

    case 2:
      let reviews = upgradeDb.createObjectStore('reviews', { 'keyPath': 'id' });
      reviews.createIndex('restaurant_id','restaurant_id');
  }
});

  //TODO: Read reviews from IDB before calling server
  //TODO: Manage offline/online review behavior with IDB
  //TODO: CSS overhaul || offline/online
  //TODO: Performance optimization 

  //If online --> rest page loads --> reviews from idb (GET from server if idb empty)  --> review written --> POST server --> GET server --> PUT indexDB
  //if offline --> rest page loads --> reviews from idb (GET from server if idb empty) --> review written --> local storage --> (when online) --> POST server --> GET server --> PUT indexDB

//});

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

 /**
   * Get all information from an object store
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
   * Get information from an object store by key
   */
readDatabaseByKey = (database, key) => {
  return new Promise((resolve, reject) => {
    promiseDB.then(function(db) {
      const tx = db.transaction(database, 'readonly');
      const restaurantInfo = tx.objectStore(database);
      let data = restaurantInfo.get(key);
      console.log('db info read by key ', data);
      resolve(data);
    });
  }).catch(error => console.log(error));
};

 /**
   * Get information from an object store index by key
   */
readDatabaseIndexByKey = (database, indexName, key) => {
  return new Promise((resolve, reject) => {
    promiseDB.then(function(db) {
      const tx = db.transaction(database, 'readonly');
     const restaurantInfo = tx.objectStore(database).index(indexName);
      let data = restaurantInfo.get(key);
      console.log('db info read by key ', data);
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

/**
  * Count the database
  */
countIndex = (database, indexName) => {
  console.log('countIndex called');
  return new Promise((resolve, reject) => {
     promiseDB.then(function(db) {
     const tx = db.transaction(database, 'readonly');
     const restaurantInfo = tx.objectStore(database).index(indexName);
     let data = restaurantInfo.count();
     console.log('counted: ', data);
     resolve(data);
    });
 }).catch(error => console.log(error));
};
