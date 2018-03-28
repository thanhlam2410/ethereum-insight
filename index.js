let config = require("./config");
let cluster = require("cluster");

if (cluster.isMaster) {
    console.log("master process");
    let express = require("express")();
    let hook = require("./src/hook");
    let masterProcess = require("./src/master");

    masterProcess.runMasterProcess();
    hook.route(express);
    express.listen(config.port);
    console.log("application runs on " + config.port);
} else {
    console.log("worker process");
    let workerProcess = require("./src/worker");
    workerProcess.runWorkerProcess();
}