let lokijs = require("lokijs");
let config = require("../config").memcache;
let db = null;

function connect() {
    let db = new lokijs("../db/cache.db", {
        autoload: true,
        autosave: true,
        autosaveInterval: 30 * 1000,
        verbose: config.debug,
        serializationMethod: "destructured"
    });
}

function getCollection(name) {
    let collection = db.getCollection(name);
    if (collection) {
        return collection;
    }

    return db.addCollection(name);
}

function insert(collectionName, data) {
    let collection = getCollection(collectionName);
    collection.insert(data);
}

function read(collectionName, condition) {
    let collection = getCollection(collectionName);
    let result = collection.find(condition);
    return result;
}

function update(collectionName, condition, updater) {
    let collection = getCollection(collectionName);
    let result = collection.findAndUpdate(condition, updater);
    return result;
}

function remove(collectionName, condition) {
    let collection = getCollection(collectionName);
    collection.remove(condition);
}

module.exports = {
    connect,
    insert,
    read,
    update,
    remove
}