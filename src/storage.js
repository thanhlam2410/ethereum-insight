let memdb = require("./memdb");
let mongodb = require("./mongodb");

const COLLECTIONS = {
    Temp: "temp"
}

function insert(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.collection || !query.data) {
            return reject(new Error("invalid_input"));
        }

        if (!lodash.isObject(query.data)) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.insertOne(query.collection, query.data, function (err, result) {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
}

function insertMany(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.collection || !query.data) {
            return reject(new Error("invalid_input"));
        }

        if (!lodash.isArray(query.data)) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.insertMany(query.collection, query.data, function (err, result) {
            if (err) {
                return reject(err);
            }

            result.data = data;
            resolve(result);
        });
    });
}

function get(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.condition || !query.collection) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.selectOne(query.collection, query.condition, function (err, data) {
            if (err) {
                return reject(err);
            }

            if (data) {
                delete data._id;
            }

            resolve(data);
        });
    });
}

function getMany(query, paging) {
    return new Promise(function (resolve, reject) {
        if (!query) {
            return reject(new Error("invalid_input"));
        }

        if (query.condition === null ||
            !query.collection) {
            return reject(new Error("invalid_input"));
        }

        if (!query.sort) {
            query.sort = {};
        }

        if (!lodash.isNumber(query.count) || query.count <= 0) {
            query.count = 10;
        }

        if (!lodash.isNumber(query.page) || query.page <= 0) {
            query.page = 1;
        }

        if (paging) {
            mongodbClient.selectWithLimit(
                query.collection,
                query.condition,
                query.count,
                query.page,
                query.sort,
                function (err, result) {
                    if (err) {
                        return reject(err);
                    }

                    lodash.forEach(result.payload, function (item) {
                        delete item._id;
                    });

                    resolve(result);
                }
            );
        } else {
            mongodbClient.selectMany(query.collection, query.condition, query.sort, function (err, result) {
                if (err) {
                    return reject(err);
                }

                lodash.forEach(result, function (item) {
                    delete item._id;
                });

                resolve(result);
            });
        }
    });
}

function update(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.condition || !query.collection || !query.data) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.updateMany(query.collection, query.condition, query.data, function (err, result) {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
}

function remove(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.condition || !query.collection) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.deleteMany(query.collection, query.condition, function (err, result) {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
}

function count(query) {
    return new Promise(function (resolve, reject) {
        if (!query || !query.condition || !query.collection) {
            return reject(new Error("invalid_input"));
        }

        mongodbClient.count(query.collection, query.condition, function (err, count) {
            if (err) {
                return reject(err);
            }

            resolve(count);
        });
    });
}

async function getHighestBlock(blockNumber) {
    let data = memdb.read("temp", {
        "name": "currentHeight"
    });


}

module.exports = {
    connectDatabase: mongodb.connect,
    getHighestBlock
}