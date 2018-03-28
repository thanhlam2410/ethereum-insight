let jsonrpc = require("./jsonrpc");
let blocks = require("./blocks");
let cluster = require("cluster");

function runMasterProcess() {
    let storage = require("./storage");
    let config = require("../config");
    storage.connectDatabase(config.database);

    spawnWorker();
}

function spawnWorker() {
    let worker = cluster.fork();
    worker.on("disconnect", onWorkerDisconnect);
    worker.on("message", onWorkerMessage);
}

function onWorkerDisconnect() {
    console("worker disconnected");
}

function onWorkerMessage(data) {
    console.log(data);
}

function fetchLatestBlock() {
    jsonrpc.getBlockNumber().then(res => {
        blocks.parseBlock(res.data);
    }).catch(err => {
        console.log(err);
    })
}

module.exports = {
    runMasterProcess
}