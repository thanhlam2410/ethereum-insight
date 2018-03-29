let blocks = require("./blocks");
let storage = require("./storage");

async function runMasterProcess() {
    try {
        let storage = require("./storage");
        let config = require("../config");
        await storage.connect();
        await blocks.load();
        blocks.syncBlockData();
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    runMasterProcess
}