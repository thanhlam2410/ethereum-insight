let MongoClient = require("mongodb").MongoClient;

async function connect(opts) {
    try {
        let host = opts.host || "localhost";
        let port = opts.port || "27017";
        let authentication = opts.authentication || false;
        let database = opts.database || "";

        if (!database) {
            return Promise.reject(new Error("unknown_database"));
        }

        let url = "mongodb://";
        if (authentication) {
            let username = opts.username || "";
            let password = opts.password || "";

            if (!username || !password) {
                return Promise.reject(new Error("username_or_password_cannot_be_empty"));
            }

            url += username + ":" + password + "@" + host + ":" + port + "/" + database;
        } else {
            url += host + ":" + port + "/" + database;
        }

        let conn = await MongoClient.connect(url);
        return new MongoConnection(conn, database);
    } catch (ex) {
        return Promise.reject(ex);
    }
}

class MongoConnection {
    constructor(conn, name) {
        this.database = conn;
        this.dbName = name || "";
    }

    isConnected() {
        return this.database !== null;
    }

    disconnect() {
        if (this.database) {
            this.database.close();
            this.database = null;
        }
    }

    getCollection(name) {
        if (!this.isConnected() || !this.dbName) {
            throw new Error("db_is_not_connected");
        }

        return this.database.db(this.dbName).collection(name);
    }

    insertOne(tablename, data, callback) {
        let collection = this.getCollection(tablename);
        collection.insertOne(data, function (err, result) {
            if (err) {
                return callback(err);
            }

            callback(null, {
                success: true
            });
        });
    }

    insertMany(tablename, data, callback) {
        let collection = this.getCollection(tablename);
        collection.insertMany(data, function (err, result) {
            if (err) {
                return callback(err);
            }

            callback(null, {
                success: true
            });
        });
    }

    selectOne(tablename, predicate, callback) {
        let collection = this.getCollection(tablename);
        collection.findOne(predicate, (function (err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        }));
    }

    selectMany(tablename, predicate, sortPredicate, callback) {
        let collection = this.getCollection(tablename);
        collection.find(predicate).sort(sortPredicate).toArray(function (err, result) {
            if (err) {
                return callback(err);
            }

            callback({
                payload: result
            })
        });
    }

    selectWithLimit(tablename, predicate, limit, page, sortPredicate, callback) {
        let collection = this.getCollection(tablename);
        let skipCount = (page - 1) * limit;
        let self = this;
        collection.find(predicate).sort(sortPredicate).limit(limit).skip(skipCount).toArray(function (err, result) {
            if (err) {
                return callback(err);
            }

            return callback(null, {
                page: page,
                count: count,
                hasNext: (page * limit) < total,
                payload: result
            });
        });
    }

    count(tablename, condition, callback) {
        let collection = this.getCollection(tablename);
        collection.count(condition, function (err, count) {
            if (err) {
                return callback(err);
            }

            callback(null, count);
        });
    };

    updateOne(tablename, condition, data, callback) {
        let collection = this.getCollection(tablename);
        collection.updateOne(condition, {
            $set: data
        }, (function (err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        }));
    }

    updateMany(tablename, condition, data, callback) {
        let collection = this.getCollection(tablename);
        collection.updateMany(condition, data, (function (err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, result);
            }
        }));
    }

    removeOne(tablename, condition, callback) {
        let collection = this.getCollection(tablename);
        collection.deleteOne(condition, function (err, result) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, {
                    success: true
                });
            }
        });
    }

    removeMany(tablename, condition, callback) {
        let collection = this.getCollection(tablename);
        collection.deleteMany(condition, function (err, numberOfRemovedDocs) {
            if (err) {
                return callback(err);
            } else {
                return callback(null, numberOfRemovedDocs);
            }
        });
    }
}

class Query {
    constructor(collection) {
        this.collection = collection;
        this.condition = {};
        this.sort = {};
        this.count = 10;
        this.page = 1;
        this.data = null;
    }
}

function buildQuery(collection) {
    return new Query(collection);
}

module.exports = {
    buildQuery,
    MongoConnection,
    connect
};